// src/pages/CheckoutCurso.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PasswordInput } from '../components/PasswordInput';
import comprasService from '../services/compras_service';
import '../styles/Checkout.css';

const CheckoutCurso = () => {
  const { cursoId } = useParams();
  const navigate = useNavigate();
  
  const [curso, setCurso] = useState(null);
  const [loading, setLoading] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  
  const [tokenValido, setTokenValido] = useState(false);
  const [verificandoToken, setVerificandoToken] = useState(true);

  const [datosUsuario, setDatosUsuario] = useState({
    email: '',
    nombre: '',
    apellido: '',
    telefono: '',
    password: '',
    confirmarPassword: ''
  });

  const [errores, setErrores] = useState({});

  useEffect(() => {
    verificarAutenticacion();
    cargarCurso();
  }, [cursoId]);

  const verificarAutenticacion = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');

      if (token && user) {
        try {
          const response = await fetch('https://academiaparchada.onrender.com/api/compras/estudiante', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
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
    const response = await fetch(`https://academiaparchada.onrender.com/api/cursos/${cursoId}`);
    const data = await response.json();

    console.log('📚 RESPUESTA COMPLETA DE LA API:', JSON.stringify(data, null, 2));

    if (response.ok && data.success && data.data && data.data.curso) {
      console.log('✅ Curso cargado exitosamente');
      console.log('💰 Precio:', data.data.curso.precio);
      setCurso(data.data.curso); // ⬅️ AQUÍ EL CAMBIO
    } else {
      console.error('❌ Error en respuesta:', data.message);
      setError(data.message || 'No se pudo cargar el curso');
    }
  } catch (err) {
    console.error('❌ Error al cargar curso:', err);
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

      if (!datosUsuario.nombre || datosUsuario.nombre.trim() === '') {
        nuevosErrores.nombre = 'El nombre es obligatorio';
      }

      if (!datosUsuario.apellido || datosUsuario.apellido.trim() === '') {
        nuevosErrores.apellido = 'El apellido es obligatorio';
      }

      if (!datosUsuario.telefono) {
        nuevosErrores.telefono = 'El teléfono es obligatorio';
      }

      if (!datosUsuario.password || datosUsuario.password.length < 6) {
        nuevosErrores.password = 'La contraseña debe tener al menos 6 caracteres';
      }

      if (datosUsuario.password !== datosUsuario.confirmarPassword) {
        nuevosErrores.confirmarPassword = 'Las contraseñas no coinciden';
      }
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleComprar = async (e) => {
    e.preventDefault();

    if (!validarFormulario()) {
      setMensaje({ tipo: 'error', texto: 'Por favor corrige los errores del formulario' });
      return;
    }

    setProcesando(true);
    setMensaje({ tipo: '', texto: '' });

    try {
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
          telefono: datosUsuario.telefono.trim()
        };
      }

      const resultado = await comprasService.iniciarPagoMercadoPago(datosCompra);

      if (resultado.success) {
        setMensaje({ 
          tipo: 'exito', 
          texto: '✅ Redirigiendo a Mercado Pago...' 
        });

        setTimeout(() => {
          const initPoint = resultado.data.init_point || resultado.data.sandbox_init_point;
          
          if (initPoint) {
            window.location.href = initPoint;
          } else {
            setMensaje({ 
              tipo: 'error', 
              texto: 'Error: No se pudo obtener el enlace de pago' 
            });
            setProcesando(false);
          }
        }, 1500);

      } else {
        setMensaje({ 
          tipo: 'error', 
          texto: resultado.message || 'Error al procesar el pago' 
        });
        setProcesando(false);
      }

    } catch (error) {
      console.error('❌ Error en proceso:', error);
      setMensaje({ 
        tipo: 'error', 
        texto: 'Error al procesar el pago. Intenta de nuevo.' 
      });
      setProcesando(false);
    }
  };

  const handleCambiarALogin = () => {
    navigate(`/login?redirect=/checkout/curso/${cursoId}`);
  };

  // Función helper para obtener el precio de forma segura
  const obtenerPrecio = () => {
    if (!curso) return null;
    
    // Intentar obtener precio de diferentes propiedades posibles
    const precio = curso.precio || curso.price || curso.valor || 0;
    
    console.log('🔍 Obteniendo precio:', precio);
    return precio;
  };

  const formatearPrecioSeguro = () => {
    const precio = obtenerPrecio();
    
    if (precio === null || precio === undefined) {
      console.warn('⚠️ Precio no disponible');
      return 'Precio no disponible';
    }
    
    if (precio === 0) {
      console.warn('⚠️ Precio es 0');
      return 'Gratis';
    }
    
    try {
      return comprasService.formatearPrecio(precio);
    } catch (error) {
      console.error('❌ Error formateando precio:', error);
      return `$ ${precio}`;
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

  return (
    <div className="checkout-container">
      <div className="checkout-header">
        <button className="btn-volver" onClick={() => navigate('/cursos')}>
          ← Volver
        </button>
        <h1>Finalizar Compra</h1>
      </div>

      <div className="checkout-content">
        <div className="checkout-resumen">
          <h2>Resumen del Curso</h2>
          <div className="curso-info-checkout">
            <h3>{curso.nombre || curso.title || 'Curso'}</h3>
            {curso.descripcion && (
              <p className="curso-descripcion">{curso.descripcion}</p>
            )}

            <div className="detalles-grid">
              {curso.duracion_horas && (
                <div className="detalle-item">
                  <span className="detalle-label">⏱️ Duración:</span>
                  <span className="detalle-valor">{curso.duracion_horas} horas</span>
                </div>
              )}
              {curso.profesor && (
                <div className="detalle-item">
                  <span className="detalle-label">👨‍🏫 Profesor:</span>
                  <span className="detalle-valor">
                    {curso.profesor.nombre} {curso.profesor.apellido}
                  </span>
                </div>
              )}
            </div>

            <div className="precio-total">
              <span>Total a pagar:</span>
              <strong>{formatearPrecioSeguro()}</strong>
            </div>

            <div className="info-box">
              <p><strong>💳 Métodos de pago disponibles:</strong></p>
              <p className="info-small">
                Tarjetas de crédito/débito, PSE, efectivo y más opciones con Mercado Pago
              </p>
            </div>
          </div>
        </div>

        <div className="checkout-formulario">
          <h2>{tokenValido ? 'Confirmar Compra' : 'Completa tu Registro'}</h2>
          <p className="form-ayuda">
            {tokenValido 
              ? 'Serás redirigido a Mercado Pago para completar el pago de forma segura.'
              : 'Crea tu cuenta para continuar con la compra.'
            }
          </p>

          <form onSubmit={handleComprar}>
            {mensaje.texto && (
              <div className={`mensaje ${mensaje.tipo}`}>
                {mensaje.texto}
              </div>
            )}

            {!tokenValido && (
              <>
                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={datosUsuario.email}
                    onChange={handleChangeUsuario}
                    disabled={procesando}
                    className={errores.email ? 'input-error' : ''}
                    placeholder="tu@email.com"
                  />
                  {errores.email && <span className="error">{errores.email}</span>}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Nombre *</label>
                    <input
                      type="text"
                      name="nombre"
                      value={datosUsuario.nombre}
                      onChange={handleChangeUsuario}
                      disabled={procesando}
                      className={errores.nombre ? 'input-error' : ''}
                      placeholder="Juan"
                    />
                    {errores.nombre && <span className="error">{errores.nombre}</span>}
                  </div>

                  <div className="form-group">
                    <label>Apellido *</label>
                    <input
                      type="text"
                      name="apellido"
                      value={datosUsuario.apellido}
                      onChange={handleChangeUsuario}
                      disabled={procesando}
                      className={errores.apellido ? 'input-error' : ''}
                      placeholder="Pérez"
                    />
                    {errores.apellido && <span className="error">{errores.apellido}</span>}
                  </div>
                </div>

                <div className="form-group">
                  <label>Teléfono *</label>
                  <input
                    type="tel"
                    name="telefono"
                    value={datosUsuario.telefono}
                    onChange={handleChangeUsuario}
                    disabled={procesando}
                    className={errores.telefono ? 'input-error' : ''}
                    placeholder="3001234567"
                  />
                  {errores.telefono && <span className="error">{errores.telefono}</span>}
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Contraseña *</label>
                    <PasswordInput
                      name="password"
                      value={datosUsuario.password}
                      onChange={handleChangeUsuario}
                      disabled={procesando}
                      className={errores.password ? 'input-error' : ''}
                      placeholder="Mínimo 6 caracteres"
                      required={true}
                      minLength={6}
                    />
                    {errores.password && <span className="error">{errores.password}</span>}
                  </div>

                  <div className="form-group">
                    <label>Confirmar Contraseña *</label>
                    <PasswordInput
                      name="confirmarPassword"
                      value={datosUsuario.confirmarPassword}
                      onChange={handleChangeUsuario}
                      disabled={procesando}
                      className={errores.confirmarPassword ? 'input-error' : ''}
                      placeholder="Repite la contraseña"
                      required={true}
                    />
                    {errores.confirmarPassword && (
                      <span className="error">{errores.confirmarPassword}</span>
                    )}
                  </div>
                </div>
              </>
            )}

            <button 
              type="submit" 
              className="btn-comprar-final"
              disabled={procesando}
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

            <p className="aviso-pago">
              🔒 Pago seguro procesado por Mercado Pago
            </p>

            {!tokenValido && (
              <div className="ya-tienes-cuenta">
                <p>
                  ¿Ya tienes cuenta?
                  <button 
                    type="button"
                    className="btn-link" 
                    onClick={handleCambiarALogin}
                    disabled={procesando}
                  >
                    Inicia sesión aquí
                  </button>
                </p>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default CheckoutCurso;
