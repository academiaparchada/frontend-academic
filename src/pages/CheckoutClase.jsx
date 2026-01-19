import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PasswordInput } from '../components/PasswordInput';
import comprasService from '../services/compras_service';
import wompiService from '../services/wompi_service';
import { openWompiWidget } from '../utils/wompi_widget';
import { getBrowserTimeZone, TIMEZONES_LATAM } from '../utils/timezone';
import '../styles/Checkout.css';

const CheckoutClase = () => {
  const { claseId } = useParams();
  const navigate = useNavigate();
  
  const [clase, setClase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [procesandoWompi, setProcesandoWompi] = useState(false);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  
  const token = localStorage.getItem('token');
  const [esNuevoUsuario, setEsNuevoUsuario] = useState(!token);

  const [archivoAdjunto, setArchivoAdjunto] = useState(null);
  const [errorArchivo, setErrorArchivo] = useState('');

  const [datosClase, setDatosClase] = useState({
    fecha_hora: '',
    descripcion_estudiante: ''
  });

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

  useEffect(() => {
    cargarClase();
  }, [claseId]);

  const cargarClase = async () => {
    try {
      setLoading(true);
      const response = await fetch(`https://academiaparchada.onrender.com/api/clases-personalizadas/${claseId}`);
      const data = await response.json();
      
      if (response.ok && data.success) {
        let claseData = null;
        
        if (data.data?.clase) {
          claseData = data.data.clase;
        } else if (data.data?.clase_personalizada) {
          claseData = data.data.clase_personalizada;
        } else if (data.data) {
          claseData = data.data;
        }
        
        if (claseData) {
          setClase(claseData);
        } else {
          setError('No se pudo cargar la información de la clase');
        }
      } else {
        setError(data.message || 'Error al cargar la clase');
      }
    } catch (err) {
      console.error('❌ Error al cargar clase:', err);
      setError('Error al cargar la clase');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeClase = (e) => {
    const { name, value } = e.target;
    setDatosClase(prev => ({
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

  const handleArchivoChange = (e) => {
    const archivo = e.target.files[0];
    setErrorArchivo('');

    if (!archivo) {
      setArchivoAdjunto(null);
      return;
    }

    const validacion = comprasService.validarArchivo(archivo);
    if (!validacion.valido) {
      setErrorArchivo(validacion.mensaje);
      setArchivoAdjunto(null);
      e.target.value = '';
      return;
    }

    setArchivoAdjunto(archivo);
  };

  const handleEliminarArchivo = () => {
    setArchivoAdjunto(null);
    setErrorArchivo('');
    const fileInput = document.getElementById('documento-input');
    if (fileInput) {
      fileInput.value = '';
    }
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!datosClase.fecha_hora) {
      nuevosErrores.fecha_hora = 'La fecha y hora son obligatorias';
    } else {
      const fechaSeleccionada = new Date(datosClase.fecha_hora);
      const ahora = new Date();
      
      if (fechaSeleccionada <= ahora) {
        nuevosErrores.fecha_hora = 'La fecha debe ser futura';
      }
    }

    if (!datosClase.descripcion_estudiante || datosClase.descripcion_estudiante.trim().length < 10) {
      nuevosErrores.descripcion_estudiante = 'Describe qué necesitas (mínimo 10 caracteres)';
    }

    if (esNuevoUsuario) {
      if (!datosUsuario.email || !datosUsuario.email.includes('@')) {
        nuevosErrores.email = 'Email inválido';
      }

      if (!datosUsuario.nombre.trim()) {
        nuevosErrores.nombre = 'El nombre es obligatorio';
      }

      if (!datosUsuario.apellido.trim()) {
        nuevosErrores.apellido = 'El apellido es obligatorio';
      }

      if (!datosUsuario.telefono.trim()) {
        nuevosErrores.telefono = 'El teléfono es obligatorio';
      }

      if (!datosUsuario.timezone) {
        nuevosErrores.timezone = 'La zona horaria es obligatoria';
      }

      if (datosUsuario.password.length < 6) {
        nuevosErrores.password = 'La contraseña debe tener al menos 6 caracteres';
      }

      if (datosUsuario.password !== datosUsuario.confirmarPassword) {
        nuevosErrores.confirmarPassword = 'Las contraseñas no coinciden';
      }
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const buildDatosCompra = () => {
    const datosCompra = {
      tipo_compra: 'clase_personalizada',
      clase_personalizada_id: claseId,
      fecha_hora: comprasService.convertirFechaAISO(datosClase.fecha_hora),
      descripcion_estudiante: datosClase.descripcion_estudiante,
      estudiante_timezone: datosUsuario.timezone || 'America/Bogota'
    };

    if (esNuevoUsuario) {
      datosCompra.estudiante = {
        email: datosUsuario.email,
        password: datosUsuario.password,
        nombre: datosUsuario.nombre,
        apellido: datosUsuario.apellido,
        telefono: datosUsuario.telefono,
        timezone: datosUsuario.timezone
      };
    }

    return datosCompra;
  };

  const handleComprarMercadoPago = async (e) => {
    e.preventDefault();

    if (!validarFormulario()) {
      setMensaje({ tipo: 'error', texto: 'Por favor corrige los errores del formulario' });
      return;
    }

    setProcesando(true);
    setMensaje({ tipo: '', texto: '' });

    try {
      const datosCompra = buildDatosCompra();

      let resultado;

      if (archivoAdjunto) {
        resultado = await comprasService.iniciarPagoMercadoPagoConArchivo(datosCompra, archivoAdjunto);
      } else {
        resultado = await comprasService.iniciarPagoMercadoPago(datosCompra);
      }

      if (resultado.success) {
        setMensaje({ tipo: 'exito', texto: '✅ Redirigiendo a Mercado Pago...' });

        setTimeout(() => {
          const initPoint = resultado.data.init_point || resultado.data.sandbox_init_point;
          comprasService.redirigirACheckout(initPoint);
        }, 1000);

      } else {
        setMensaje({ tipo: 'error', texto: resultado.message || 'Error al procesar el pago' });
        setProcesando(false);
      }

    } catch (error) {
      console.error('❌ Error en el proceso de compra:', error);
      setMensaje({ tipo: 'error', texto: 'Error al procesar el pago. Intenta de nuevo.' });
      setProcesando(false);
    }
  };

  const handleComprarWompi = async (e) => {
    e.preventDefault();

    if (!validarFormulario()) {
      setMensaje({ tipo: 'error', texto: 'Por favor corrige los errores del formulario' });
      return;
    }

    setProcesandoWompi(true);
    setMensaje({ tipo: '', texto: '' });

    try {
      const datosCompra = buildDatosCompra();

      let resultado;

      if (archivoAdjunto) {
        resultado = await wompiService.crearCheckoutConArchivo(datosCompra, archivoAdjunto);
      } else {
        resultado = await wompiService.crearCheckout(datosCompra);
      }

      if (!resultado.success) {
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

  if (loading) {
    return (
      <div className="checkout-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Cargando información...</p>
        </div>
      </div>
    );
  }

  if (error || !clase) {
    return (
      <div className="checkout-container">
        <div className="error-mensaje">
          <h3>❌ Error</h3>
          <p>{error || 'Clase no encontrada'}</p>
          <button onClick={() => navigate('/clases-personalizadas')}>
            Volver a Clases
          </button>
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
        <h1>Comprar Clase Personalizada</h1>
      </div>

      <div className="checkout-content">
        <div className="checkout-resumen">
          <h2>📝 Resumen de Compra</h2>
          
          <div className="curso-info-checkout">
            <h3>Clase de {clase.asignatura?.nombre}</h3>
            
            <div className="detalles-grid">
              <div className="detalle-item">
                <span className="detalle-label">⏱️ Duración:</span>
                <span className="detalle-valor">{clase.duracion_horas} hora(s)</span>
              </div>

              <div className="detalle-item">
                <span className="detalle-label">👥 Tipo:</span>
                <span className="detalle-valor">Individual</span>
              </div>

              <div className="detalle-item">
                <span className="detalle-label">🎯 Modalidad:</span>
                <span className="detalle-valor">Virtual</span>
              </div>
            </div>

            <div className="info-box">
              <p>
                ✨ <strong>Profesor asignado automáticamente</strong>
              </p>
              <p className="info-small">
                El sistema asignará el mejor profesor disponible según tu horario
              </p>
            </div>

            <div className="precio-total">
              <span>Total a Pagar:</span>
              <strong>{comprasService.formatearPrecio(clase.precio)}</strong>
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

            <h2>📅 Detalles de la Clase</h2>

            <div className="form-group">
              <label>Fecha y Hora *</label>
              <input
                type="datetime-local"
                name="fecha_hora"
                value={datosClase.fecha_hora}
                onChange={handleChangeClase}
                disabled={procesando || procesandoWompi}
                className={errores.fecha_hora ? 'input-error' : ''}
                min={new Date().toISOString().slice(0, 16)}
              />
              {errores.fecha_hora && (
                <span className="error">{errores.fecha_hora}</span>
              )}
              <span className="help-text">
                Selecciona cuándo quieres tomar la clase
              </span>
            </div>

            <div className="form-group">
              <label>¿Qué necesitas aprender? *</label>
              <textarea
                name="descripcion_estudiante"
                value={datosClase.descripcion_estudiante}
                onChange={handleChangeClase}
                placeholder="Ej: Necesito ayuda con derivadas parciales y aplicaciones..."
                rows="4"
                disabled={procesando || procesandoWompi}
                className={errores.descripcion_estudiante ? 'input-error' : ''}
              ></textarea>
              {errores.descripcion_estudiante && (
                <span className="error">{errores.descripcion_estudiante}</span>
              )}
              <span className="help-text">
                Describe los temas que quieres ver en la clase (mínimo 10 caracteres)
              </span>
            </div>

            <div className="form-group">
              <label>📎 Adjuntar Documento (Opcional)</label>
              <div className="file-upload-container">
                {!archivoAdjunto ? (
                  <div className="file-upload-area">
                    <input
                      type="file"
                      id="documento-input"
                      onChange={handleArchivoChange}
                      disabled={procesando || procesandoWompi}
                      accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.zip,.rar,.7z"
                      className="file-input-hidden"
                    />
                    <label htmlFor="documento-input" className="file-upload-label">
                      <span className="upload-icon">📄</span>
                      <span className="upload-text">Click para seleccionar archivo</span>
                      <span className="upload-hint">
                        PDF, DOC, IMG, ZIP (máx. 25MB)
                      </span>
                    </label>
                  </div>
                ) : (
                  <div className="file-selected">
                    <div className="file-info">
                      <span className="file-icon">📎</span>
                      <div className="file-details">
                        <span className="file-name">{archivoAdjunto.name}</span>
                        <span className="file-size">
                          {comprasService.formatearTamanoArchivo(archivoAdjunto.size)}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleEliminarArchivo}
                      className="btn-eliminar-archivo"
                      disabled={procesando || procesandoWompi}
                    >
                      ✖
                    </button>
                  </div>
                )}
              </div>
              {errorArchivo && (
                <span className="error">{errorArchivo}</span>
              )}
              <span className="help-text">
                Puedes adjuntar ejercicios, guías o material de estudio para que el profesor lo revise
              </span>
            </div>

            {esNuevoUsuario && (
              <>
                <h2>👤 Tus Datos</h2>
                <p className="form-ayuda">
                  Crea tu cuenta para acceder a tu clase
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
                    {TIMEZONES_LATAM.map((tz) => (
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
                      onClick={() => navigate('/login')}
                      className="btn-link"
                      disabled={procesando || procesandoWompi}
                    >
                      Inicia sesión
                    </button>
                  </p>
                </div>
              </>
            )}

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
              🔒 Pago seguro. Recibirás confirmación y datos del profesor por email.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CheckoutClase;
