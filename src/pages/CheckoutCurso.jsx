import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PasswordInput } from '../components/PasswordInput';
import comprasService from '../services/compras_service';
import wompiService from '../services/wompi_service';
import { openWompiWidget } from '../utils/wompi_widget';
import { getBrowserTimeZone, getAllTimeZoneOptions } from '../utils/timezone';
import analyticsService from '../services/analytics_service';
import '../styles/Checkout.css';


const CheckoutCurso = () => {
  const { cursoId } = useParams();
  const navigate = useNavigate();


  const [curso, setCurso] = useState(null);
  const [loading, setLoading] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [procesandoWompi, setProcesandoWompi] = useState(false);
  const [error, setError] = useState(null);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });


  const [tokenValido, setTokenValido] = useState(false);
  const [verificandoToken, setVerificandoToken] = useState(true);


  const [bloquearCompra, setBloquearCompra] = useState(false);
  const [motivoBloqueo, setMotivoBloqueo] = useState('');


  const [datosUsuario, setDatosUsuario] = useState({
    email: '',
    nombre: '',
    apellido: '',
    telefono: '',
    timezone: getBrowserTimeZone(),
    password: '',
    confirmarPassword: ''
  });


  const [errores, setErrores] = useState({});


  const DASHBOARD_ESTUDIANTE_PATH = '/estudiante/dashboard';


  useEffect(() => {
    verificarAutenticacion();
    cargarCurso();
  }, [cursoId]);

  // ✅ GA4: begin_checkout cuando ya cargó el curso (1 vez por cursoId)
  useEffect(() => {
    if (!loading && curso && !error) {
      analyticsService.event('begin_checkout', {
        checkout_type: 'curso',
        curso_id: String(cursoId)
      });
    }
  }, [loading, curso, error, cursoId]);


  const verificarAutenticacion = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');


      if (token && user) {
        try {
          const response = await fetch('https://academiaparchada.onrender.com/api/compras/estudiante', {
            headers: { Authorization: `Bearer ${token}` }
          });


          if (response.ok) {
            setTokenValido(true);
          } else {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setTokenValido(false);
          }
        } catch (err) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setTokenValido(false);
        }
      } else {
        setTokenValido(false);
      }
    } catch (error) {
      console.error('Error verificando autenticación:', error);
      setTokenValido(false);
    } finally {
      setVerificandoToken(false);
    }
  };


  const cargarCurso = async () => {
    try {
      setLoading(true);
      setError(null);


      const response = await fetch(`https://academiaparchada.onrender.com/api/cursos/${cursoId}`);
      const data = await response.json();


      if (response.ok && data.success && data.data && data.data.curso) {
        setCurso(data.data.curso);
      } else {
        setError(data.message || 'No se pudo cargar el curso');
      }
    } catch (err) {
      console.error('Error al cargar curso:', err);
      setError('Error al cargar el curso');
    } finally {
      setLoading(false);
    }
  };


  const handleChangeUsuario = (e) => {
    const { name, value } = e.target;
    setDatosUsuario(prev => ({
      ...prev,
      [name]: value
    }));


    if (errores[name]) {
      setErrores(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };


  const validarFormulario = () => {
    const nuevosErrores = {};


    if (!tokenValido) {
      if (!datosUsuario.email || !datosUsuario.email.includes('@')) {
        nuevosErrores.email = 'Email inválido';
      }


      if (!datosUsuario.nombre || !datosUsuario.nombre.trim()) {
        nuevosErrores.nombre = 'El nombre es obligatorio';
      }


      if (!datosUsuario.apellido || !datosUsuario.apellido.trim()) {
        nuevosErrores.apellido = 'El apellido es obligatorio';
      }


      if (!datosUsuario.telefono || !datosUsuario.telefono.trim()) {
        nuevosErrores.telefono = 'El teléfono es obligatorio';
      }


      if (!datosUsuario.timezone) {
        nuevosErrores.timezone = 'La zona horaria es obligatoria';
      }


      if (!datosUsuario.password || datosUsuario.password.length < 6) {
        nuevosErrores.password = 'La contraseña debe tener al menos 6 caracteres';
      }


      if (datosUsuario.password && datosUsuario.confirmarPassword !== datosUsuario.password) {
        nuevosErrores.confirmarPassword = 'Las contraseñas no coinciden';
      }
    }


    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };


  const inferirMotivoBloqueo = (msg = '') => {
    const m = String(msg).toLowerCase();


    if (m.includes('ya estás inscrito') || m.includes('ya estas inscrito') || m.includes('inscrit')) {
      return 'inscrito';
    }


    if (m.includes('capacidad máxima') || m.includes('capacidad maxima') || m.includes('no hay cupos') || m.includes('cupo')) {
      return 'cupo';
    }


    return '';
  };


  const handleIrAlDashboard = () => {
    navigate(DASHBOARD_ESTUDIANTE_PATH);
  };


  const buildDatosCompra = () => {
    const datosCompra = {
      tipo_compra: 'curso',
      curso_id: cursoId
    };


    if (!tokenValido) {
      datosCompra.estudiante = {
        email: datosUsuario.email.trim(),
        password: datosUsuario.password,
        nombre: datosUsuario.nombre.trim(),
        apellido: datosUsuario.apellido.trim(),
        telefono: datosUsuario.telefono.trim(),
        timezone: datosUsuario.timezone
      };
    }


    return datosCompra;
  };


  const handleComprarMercadoPago = async (e) => {
    e.preventDefault();


    if (bloquearCompra) {
      if (motivoBloqueo === 'inscrito') {
        setMensaje({ tipo: 'error', texto: 'Ya estás inscrito en este curso. Ve al dashboard del estudiante.' });
      } else if (motivoBloqueo === 'cupo') {
        setMensaje({ tipo: 'error', texto: 'Cupo agotado. Este curso ya alcanzó su capacidad máxima.' });
      } else {
        setMensaje({ tipo: 'error', texto: 'No se puede iniciar la compra en este momento.' });
      }
      return;
    }


    if (!validarFormulario()) {
      setMensaje({ tipo: 'error', texto: 'Por favor corrige los errores del formulario' });
      return;
    }

    // ✅ GA4: usuario eligió medio de pago
    analyticsService.event('add_payment_info', {
      payment_type: 'mercadopago',
      checkout_type: 'curso',
      curso_id: String(cursoId)
    });


    setProcesando(true);
    setMensaje({ tipo: '', texto: '' });


    try {
      const datosCompra = buildDatosCompra();


      const resultado = await comprasService.iniciarPagoMercadoPago(datosCompra);


      if (resultado.success) {
        setMensaje({ tipo: 'exito', texto: 'Redirigiendo a Mercado Pago...' });


        setTimeout(() => {
          const initPoint = resultado.data?.init_point || resultado.data?.sandbox_init_point;
          if (initPoint) {
            window.location.href = initPoint;
          } else {
            setMensaje({ tipo: 'error', texto: 'Error: No se pudo obtener el enlace de pago' });
            setProcesando(false);
          }
        }, 1500);


      } else {
        const motivo = inferirMotivoBloqueo(resultado.message);


        if (motivo === 'inscrito') {
          setBloquearCompra(true);
          setMotivoBloqueo('inscrito');
        } else if (motivo === 'cupo') {
          setBloquearCompra(true);
          setMotivoBloqueo('cupo');
        }


        setMensaje({ tipo: 'error', texto: resultado.message || 'Error al procesar el pago' });
        setProcesando(false);
      }
    } catch (error) {
      console.error('Error en proceso:', error);
      setMensaje({ tipo: 'error', texto: 'Error al procesar el pago. Intenta de nuevo.' });
      setProcesando(false);
    }
  };


  const handleComprarWompi = async (e) => {
    e.preventDefault();


    if (bloquearCompra) {
      if (motivoBloqueo === 'inscrito') {
        setMensaje({ tipo: 'error', texto: 'Ya estás inscrito en este curso. Ve al dashboard del estudiante.' });
      } else if (motivoBloqueo === 'cupo') {
        setMensaje({ tipo: 'error', texto: 'Cupo agotado. Este curso ya alcanzó su capacidad máxima.' });
      } else {
        setMensaje({ tipo: 'error', texto: 'No se puede iniciar la compra en este momento.' });
      }
      return;
    }


    if (!validarFormulario()) {
      setMensaje({ tipo: 'error', texto: 'Por favor corrige los errores del formulario' });
      return;
    }

    // ✅ GA4: usuario eligió medio de pago
    analyticsService.event('add_payment_info', {
      payment_type: 'wompi',
      checkout_type: 'curso',
      curso_id: String(cursoId)
    });


    setProcesandoWompi(true);
    setMensaje({ tipo: '', texto: '' });


    try {
      const datosCompra = buildDatosCompra();


      const resultado = await wompiService.crearCheckout(datosCompra);


      if (!resultado.success) {
        const motivo = inferirMotivoBloqueo(resultado.message);


        if (motivo === 'inscrito') {
          setBloquearCompra(true);
          setMotivoBloqueo('inscrito');
        } else if (motivo === 'cupo') {
          setBloquearCompra(true);
          setMotivoBloqueo('cupo');
        }


        setMensaje({ tipo: 'error', texto: resultado.message || 'Error al iniciar pago con Wompi' });
        setProcesandoWompi(false);
        return;
      }


      setMensaje({ tipo: 'exito', texto: '✅ Abriendo Wompi...' });


      await openWompiWidget(resultado.data);


      setProcesandoWompi(false);
    } catch (error) {
      console.error('❌ Error Wompi:', error);
      setMensaje({ tipo: 'error', texto: 'Error al abrir el widget de Wompi' });
      setProcesandoWompi(false);
    }
  };


  const handleCambiarALogin = () => {
    navigate(`/login?redirect=/checkout/curso/${cursoId}`);
  };


  const obtenerPrecio = () => {
    if (!curso) return null;
    const precio = curso.precio ?? curso.price ?? curso.valor ?? 0;
    return precio;
  };


  const formatearPrecioSeguro = () => {
    const precio = obtenerPrecio();


    if (precio === null || precio === undefined) {
      return 'Precio no disponible';
    }


    if (precio === 0) {
      return 'Gratis';
    }


    try {
      return comprasService.formatearPrecio(precio);
    } catch (error) {
      console.error('Error formateando precio:', error);
      return precio;
    }
  };


  if (loading || verificandoToken) {
    return (
      <div className="checkout-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Cargando información...</p>
        </div>
      </div>
    );
  }


  if (error || !curso) {
    return (
      <div className="checkout-container">
        <div className="error-mensaje">
          <h3>❌ Error</h3>
          <p>{error || 'Curso no encontrado'}</p>
          <button onClick={() => navigate('/cursos')}>
            Volver a Cursos
          </button>
        </div>
      </div>
    );
  }


  if (bloquearCompra) {
    return (
      <div className="checkout-container">
        <div className="error-mensaje">
          <h3>⚠️ No Disponible</h3>
          {motivoBloqueo === 'inscrito' && (
            <>
              <p>Ya estás inscrito en este curso.</p>
              <button onClick={handleIrAlDashboard} className="btn-primary">
                Ir al Dashboard
              </button>
            </>
          )}
          {motivoBloqueo === 'cupo' && (
            <>
              <p>Este curso alcanzó su capacidad máxima.</p>
              <button onClick={() => navigate('/cursos')} className="btn-secondary">
                Ver Otros Cursos
              </button>
            </>
          )}
          {!motivoBloqueo && (
            <>
              <p>No se puede procesar la compra en este momento.</p>
              <button onClick={() => navigate('/cursos')} className="btn-secondary">
                Volver a Cursos
              </button>
            </>
          )}
        </div>
      </div>
    );
  }


  return (
    <div className="checkout-container">
      <div className="checkout-header">
        <button className="btn-volver" onClick={() => navigate(-1)}>
          ← Volver
        </button>
        <h1>Comprar Curso</h1>
      </div>


      <div className="checkout-content">
        <div className="checkout-resumen">
          <h2>📚 Resumen de Compra</h2>


          <div className="curso-info-checkout">
            <h3>{curso.titulo}</h3>


            {curso.descripcion && (
              <p className="descripcion-curso">{curso.descripcion}</p>
            )}


            <div className="detalles-grid">
              {curso.duracion_semanas && (
                <div className="detalle-item">
                  <span className="detalle-label">⏱️ Duración:</span>
                  <span className="detalle-valor">{curso.duracion_semanas} semanas</span>
                </div>
              )}


              {curso.capacidad_maxima && (
                <div className="detalle-item">
                  <span className="detalle-label">👥 Capacidad:</span>
                  <span className="detalle-valor">{curso.capacidad_maxima} estudiantes</span>
                </div>
              )}


              {curso.modalidad && (
                <div className="detalle-item">
                  <span className="detalle-label">🎯 Modalidad:</span>
                  <span className="detalle-valor">{curso.modalidad}</span>
                </div>
              )}
            </div>


            <div className="precio-total">
              <span>Total a Pagar:</span>
              <strong>{formatearPrecioSeguro()}</strong>
            </div>


            <div className="info-box">
              <h4>✅ Incluye:</h4>
              <ul>
                <li>📹 Acceso completo al material del curso</li>
                <li>👨‍🏫 Soporte directo del profesor</li>
                <li>📝 Certificado de finalización</li>
                <li>♾️ Acceso de por vida</li>
              </ul>
            </div>
          </div>
        </div>


        <div className="checkout-formulario">
          <form onSubmit={(e) => e.preventDefault()}>
            {mensaje.texto && (
              <div className={`mensaje ${mensaje.tipo}`}>
                {mensaje.texto}
              </div>
            )}


            {!tokenValido && (
              <>
                <h2>👤 Tus Datos</h2>
                <p className="form-ayuda">
                  Crea tu cuenta para acceder al curso
                </p>


                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={datosUsuario.email}
                    onChange={handleChangeUsuario}
                    placeholder="tu@email.com"
                    disabled={procesando || procesandoWompi}
                    className={errores.email ? 'input-error' : ''}
                  />
                  {errores.email && (
                    <span className="error">{errores.email}</span>
                  )}
                </div>


                <div className="form-row">
                  <div className="form-group">
                    <label>Nombre *</label>
                    <input
                      type="text"
                      name="nombre"
                      value={datosUsuario.nombre}
                      onChange={handleChangeUsuario}
                      placeholder="Juan"
                      disabled={procesando || procesandoWompi}
                      className={errores.nombre ? 'input-error' : ''}
                    />
                    {errores.nombre && (
                      <span className="error">{errores.nombre}</span>
                    )}
                  </div>


                  <div className="form-group">
                    <label>Apellido *</label>
                    <input
                      type="text"
                      name="apellido"
                      value={datosUsuario.apellido}
                      onChange={handleChangeUsuario}
                      placeholder="Pérez"
                      disabled={procesando || procesandoWompi}
                      className={errores.apellido ? 'input-error' : ''}
                    />
                    {errores.apellido && (
                      <span className="error">{errores.apellido}</span>
                    )}
                  </div>
                </div>


                <div className="form-group">
                  <label>Teléfono *</label>
                  <input
                    type="tel"
                    name="telefono"
                    value={datosUsuario.telefono}
                    onChange={handleChangeUsuario}
                    placeholder="3001234567"
                    disabled={procesando || procesandoWompi}
                    className={errores.telefono ? 'input-error' : ''}
                  />
                  {errores.telefono && (
                    <span className="error">{errores.telefono}</span>
                  )}
                </div>


                <div className="form-group">
                  <label>Zona Horaria *</label>
                  <select
                    name="timezone"
                    value={datosUsuario.timezone}
                    onChange={handleChangeUsuario}
                    disabled={procesando || procesandoWompi}
                    className={errores.timezone ? 'input-error' : ''}
                  >
                    {getAllTimeZoneOptions().map((tz) => (
                      <option key={tz.value} value={tz.value}>
                        {tz.label}
                      </option>
                  ))}
                  </select>
                  {errores.timezone && (
                    <span className="error">{errores.timezone}</span>
                  )}
                  <span className="help-text">
                    Se detectó automáticamente tu zona horaria actual
                  </span>
                </div>


                <div className="form-row">
                  <div className="form-group">
                    <label>Contraseña *</label>
                    <PasswordInput
                      name="password"
                      value={datosUsuario.password}
                      onChange={handleChangeUsuario}
                      disabled={procesando || procesandoWompi}
                      className={errores.password ? 'input-error' : ''}
                      placeholder="Mínimo 6 caracteres"
                      required={true}
                      minLength={6}
                    />
                    {errores.password && (
                      <span className="error">{errores.password}</span>
                    )}
                  </div>


                  <div className="form-group">
                    <label>Confirmar Contraseña *</label>
                    <PasswordInput
                      name="confirmarPassword"
                      value={datosUsuario.confirmarPassword}
                      onChange={handleChangeUsuario}
                      disabled={procesando || procesandoWompi}
                      className={errores.confirmarPassword ? 'input-error' : ''}
                      placeholder="Repite la contraseña"
                      required={true}
                    />
                    {errores.confirmarPassword && (
                      <span className="error">{errores.confirmarPassword}</span>
                    )}
                  </div>
                </div>


                <div className="ya-tienes-cuenta">
                  <p>
                    ¿Ya tienes cuenta? 
                    <button 
                      type="button" 
                      onClick={handleCambiarALogin}
                      className="btn-link"
                      disabled={procesando || procesandoWompi}
                    >
                      Inicia sesión
                    </button>
                  </p>
                </div>
              </>
            )}


            {tokenValido && (
              <>
                <h2>✅ Estás Listo</h2>
                <p className="form-ayuda">
                  Serás redirigido al proveedor de pago para completar la compra de forma segura.
                </p>
              </>
            )}


            <div className="info-pago">
              <h4>💳 Métodos de pago disponibles</h4>
              <p>Tarjetas de crédito/débito, PSE, efectivo y más opciones</p>
            </div>


            <button 
              type="button"
              onClick={handleComprarMercadoPago}
              className="btn-comprar-final"
              disabled={procesando || procesandoWompi}
            >
              {procesando ? (
                <>
                  <div className="spinner-small"></div>
                  Procesando...
                </>
              ) : (
                <>💳 Pagar con Mercado Pago</>
              )}
            </button>


            <button 
              type="button"
              onClick={handleComprarWompi}
              className="btn-comprar-final"
              disabled={procesando || procesandoWompi}
              style={{ marginTop: 10, background: '#4CAF50' }}
            >
              {procesandoWompi ? (
                <>
                  <div className="spinner-small"></div>
                  Abriendo Wompi...
                </>
              ) : (
                <>💰 Pagar con Wompi</>
              )}
            </button>


            <p className="aviso-pago">
              🔒 Pago seguro y protegido. Acceso inmediato después del pago.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};


export default CheckoutCurso;
