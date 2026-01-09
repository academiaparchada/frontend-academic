// src/pages/CheckoutPaquete.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PasswordInput } from '../components/PasswordInput';
import comprasService from '../services/compras_service';
import '../styles/Checkout.css';

const CheckoutPaquete = () => {
  const { claseId } = useParams();
  const navigate = useNavigate();
  
  const [clase, setClase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  
  const token = localStorage.getItem('token');
  const [esNuevoUsuario, setEsNuevoUsuario] = useState(!token);

  const [cantidadHoras, setCantidadHoras] = useState(3);

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
    cargarClase();
  }, [claseId]);

  const cargarClase = async () => {
    try {
      setLoading(true);
      const response = await fetch(`https://academiaparchada.onrender.com/api/clases-personalizadas/${claseId}`);
      const data = await response.json();
      
      if (response.ok && data.success) {
        setClase(data.data);
      } else {
        setError(data.message || 'Error al cargar la clase');
      }
    } catch (err) {
      console.error('Error al cargar clase:', err);
      setError('Error al cargar la clase');
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

  const calcularPrecioTotal = () => {
    if (!clase) return 0;
    return clase.precio * cantidadHoras;
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    if (cantidadHoras < 1 || cantidadHoras > 20) {
      nuevosErrores.cantidad = 'Debes seleccionar entre 1 y 20 horas';
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

  const handleComprar = async (e) => {
    e.preventDefault();

    if (!validarFormulario()) {
      setMensaje({ tipo: 'error', texto: 'Por favor corrige los errores del formulario' });
      return;
    }

    if (cantidadHoras < 1) {
      setMensaje({ tipo: 'error', texto: 'Debes seleccionar al menos 1 hora' });
      return;
    }

    setProcesando(true);
    setMensaje({ tipo: '', texto: '' });

    try {
      const datosCompra = {
        tipo_compra: 'paquete_horas',
        clase_personalizada_id: claseId,
        cantidad_horas: cantidadHoras
      };

      if (esNuevoUsuario) {
        datosCompra.estudiante = {
          email: datosUsuario.email,
          password: datosUsuario.password,
          nombre: datosUsuario.nombre,
          apellido: datosUsuario.apellido,
          telefono: datosUsuario.telefono
        };
      }

      console.log('📤 Iniciando pago con Mercado Pago:', datosCompra);

      const resultado = await comprasService.iniciarPagoMercadoPago(datosCompra);

      if (resultado.success) {
        console.log('✅ Preferencia creada, redirigiendo a Mercado Pago...');
        
        setMensaje({ 
          tipo: 'exito', 
          texto: '✅ Redirigiendo a Mercado Pago...' 
        });

        setTimeout(() => {
          const initPoint = resultado.data.init_point || resultado.data.sandbox_init_point;
          comprasService.redirigirACheckout(initPoint);
        }, 1000);

      } else {
        console.error('❌ Error al crear preferencia:', resultado.message);
        setMensaje({ 
          tipo: 'error', 
          texto: resultado.message || 'Error al procesar el pago' 
        });
        setProcesando(false);
      }

    } catch (error) {
      console.error('❌ Error en el proceso de compra:', error);
      setMensaje({ 
        tipo: 'error', 
        texto: 'Error al procesar el pago. Intenta de nuevo.' 
      });
      setProcesando(false);
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
        <h1>Comprar Paquete de Horas</h1>
      </div>

      <div className="checkout-content">
        <div className="checkout-resumen">
          <h2>📦 Resumen de Compra</h2>
          
          <div className="curso-info-checkout">
            <h3>Paquete de {clase.asignatura?.nombre}</h3>
            
            <div className="info-box">
              <p>
                ✨ <strong>Máxima Flexibilidad</strong>
              </p>
              <p className="info-small">
                Compra horas y agenda tus clases cuando quieras
              </p>
            </div>

            <div className="selector-horas">
              <label>Cantidad de Horas:</label>
              <div className="horas-controles">
                <button 
                  type="button"
                  onClick={() => setCantidadHoras(Math.max(1, cantidadHoras - 1))}
                  disabled={cantidadHoras <= 1 || procesando}
                >
                  -
                </button>
                <input 
                  type="number" 
                  value={cantidadHoras}
                  onChange={(e) => setCantidadHoras(parseInt(e.target.value) || 1)}
                  min="1"
                  max="20"
                  disabled={procesando}
                />
                <button 
                  type="button"
                  onClick={() => setCantidadHoras(Math.min(20, cantidadHoras + 1))}
                  disabled={cantidadHoras >= 20 || procesando}
                >
                  +
                </button>
              </div>
              {errores.cantidad && (
                <span className="error">{errores.cantidad}</span>
              )}
            </div>

            <div className="detalles-grid">
              <div className="detalle-item">
                <span className="detalle-label">💰 Precio por hora:</span>
                <span className="detalle-valor">
                  {comprasService.formatearPrecio(clase.precio)}
                </span>
              </div>

              <div className="detalle-item">
                <span className="detalle-label">⏱️ Total horas:</span>
                <span className="detalle-valor">{cantidadHoras}</span>
              </div>

              <div className="detalle-item">
                <span className="detalle-label">📚 Asignatura:</span>
                <span className="detalle-valor">{clase.asignatura?.nombre}</span>
              </div>
            </div>

            <div className="precio-total">
              <span>Total a Pagar:</span>
              <strong>{comprasService.formatearPrecio(calcularPrecioTotal())}</strong>
            </div>

            <div className="ventajas-paquete">
              <h4>✅ Ventajas del Paquete:</h4>
              <ul>
                <li>📅 Agenda tus clases cuando quieras</li>
                <li>⏰ Distribuye las horas como prefieras</li>
                <li>👨‍🏫 Profesor asignado automáticamente</li>
                <li>💪 Sin fechas de vencimiento</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="checkout-formulario">
          <form onSubmit={handleComprar}>
            {mensaje.texto && (
              <div className={`mensaje ${mensaje.tipo}`}>
                {mensaje.texto}
              </div>
            )}

            {esNuevoUsuario ? (
              <>
                <h2>👤 Tus Datos</h2>
                <p className="form-ayuda">
                  Crea tu cuenta para gestionar tu paquete de horas
                </p>

                <div className="form-group">
                  <label>Email *</label>
                  <input
                    type="email"
                    name="email"
                    value={datosUsuario.email}
                    onChange={handleChangeUsuario}
                    placeholder="tu@email.com"
                    disabled={procesando}
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
                      disabled={procesando}
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
                      disabled={procesando}
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
                    placeholder="+573001234567"
                    disabled={procesando}
                    className={errores.telefono ? 'input-error' : ''}
                  />
                  {errores.telefono && (
                    <span className="error">{errores.telefono}</span>
                  )}
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
                      disabled={procesando}
                      className={errores.confirmarPassword ? 'input-error' : ''}
                      placeholder="Repite tu contraseña"
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
                    >
                      Inicia sesión
                    </button>
                  </p>
                </div>
              </>
            ) : (
              <>
                <h2>✅ Estás Listo</h2>
                <p className="form-ayuda">
                  Después de comprar, podrás agendar tus clases desde tu panel
                </p>
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
                <>💳 Comprar {cantidadHoras} Hora(s) - {comprasService.formatearPrecio(calcularPrecioTotal())}</>
              )}
            </button>

            <p className="aviso-pago">
              🔒 Pago seguro. Podrás agendar tus clases inmediatamente después.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPaquete;
