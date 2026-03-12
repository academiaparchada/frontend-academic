// src/pages/CheckoutCurso.jsx - INICIO DEL ARCHIVO
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PasswordInput } from '../components/PasswordInput';
import { ErrorModal } from '../components/ErrorModal'; // NUEVO
import { SuccessModal } from '../components/SuccessModal'; // NUEVO
import { WarningModal } from '../components/WarningModal'; // NUEVO
import { ConfirmModal } from '../components/ConfirmModal'; // NUEVO
import { LoadingModal } from '../components/LoadingModal'; // NUEVO
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

  // NUEVO: Estados para modals
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showWarningModal, setShowWarningModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [modalData, setModalData] = useState({
    title: '',
    message: '',
    errors: []
  });
  const [confirmModalData, setConfirmModalData] = useState({
    title: '',
    message: '',
    onConfirm: null
  });

  const DASHBOARD_ESTUDIANTE_PATH = '/estudiante/dashboard';

  useEffect(() => {
    verificarAutenticacion();
    cargarCurso();
  }, [cursoId]);

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
  };

  // NUEVO: Validación mejorada con modal
  const validarFormulario = () => {
    const validationErrors = [];

    if (!tokenValido) {
      if (!datosUsuario.email || !datosUsuario.email.includes('@')) {
        validationErrors.push('El correo electrónico no es válido');
      }

      if (!datosUsuario.nombre || !datosUsuario.nombre.trim()) {
        validationErrors.push('El nombre es obligatorio');
      }

      if (!datosUsuario.apellido || !datosUsuario.apellido.trim()) {
        validationErrors.push('El apellido es obligatorio');
      }

      if (!datosUsuario.telefono || !datosUsuario.telefono.trim()) {
        validationErrors.push('El teléfono es obligatorio');
      }

      if (!datosUsuario.timezone) {
        validationErrors.push('Debes seleccionar una zona horaria');
      }

      if (!datosUsuario.password || datosUsuario.password.length < 6) {
        validationErrors.push('La contraseña debe tener al menos 6 caracteres');
      }

      if (datosUsuario.password && datosUsuario.confirmarPassword !== datosUsuario.password) {
        validationErrors.push('Las contraseñas no coinciden');
      }
    }

    if (validationErrors.length > 0) {
      setModalData({
        title: 'Errores en el Formulario',
        message: 'Por favor corrige los siguientes errores antes de continuar:',
        errors: validationErrors
      });
      setShowErrorModal(true);
      return false;
    }

    return true;
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

  // NUEVO: Mostrar confirmación antes de pagar
  const mostrarConfirmacionPago = (metodoPago) => {
    const precio = formatearPrecioSeguro();
    
    setConfirmModalData({
      title: '¿Confirmar Compra?',
      message: `Estás a punto de proceder al pago de ${precio} por el curso "${curso?.titulo}". Serás redirigido a ${metodoPago} para completar la transacción de forma segura.`,
      onConfirm: metodoPago === 'Mercado Pago' ? procesarMercadoPago : procesarWompi
    });
    setShowConfirmModal(true);
  };

  const handleComprarMercadoPago = async (e) => {
    e.preventDefault();

    if (bloquearCompra) {
      mostrarErrorBloqueo();
      return;
    }

    if (!validarFormulario()) {
      return;
    }

    analyticsService.event('add_payment_info', {
      payment_type: 'mercadopago',
      checkout_type: 'curso',
      curso_id: String(cursoId)
    });

    mostrarConfirmacionPago('Mercado Pago');
  };

  const procesarMercadoPago = async () => {
    setShowConfirmModal(false);
    setShowLoadingModal(true);
    setProcesando(true);

    try {
      const datosCompra = buildDatosCompra();
      const resultado = await comprasService.iniciarPagoMercadoPago(datosCompra);

      if (resultado.success) {
        const initPoint = resultado.data?.init_point || resultado.data?.sandbox_init_point;
        if (initPoint) {
          setTimeout(() => {
            window.location.href = initPoint;
          }, 1000);
        } else {
          setShowLoadingModal(false);
          setModalData({
            title: 'Error de Pago',
            message: 'No se pudo obtener el enlace de pago de Mercado Pago.',
            errors: []
          });
          setShowErrorModal(true);
          setProcesando(false);
        }
      } else {
        setShowLoadingModal(false);
        manejarErrorCompra(resultado);
        setProcesando(false);
      }
    } catch (error) {
      console.error('Error en proceso:', error);
      setShowLoadingModal(false);
      setModalData({
        title: 'Error de Conexión',
        message: 'No se pudo conectar con el servidor de pagos. Por favor, intenta nuevamente.',
        errors: []
      });
      setShowErrorModal(true);
      setProcesando(false);
    }
  };

  const handleComprarWompi = async (e) => {
    e.preventDefault();

    if (bloquearCompra) {
      mostrarErrorBloqueo();
      return;
    }

    if (!validarFormulario()) {
      return;
    }

    analyticsService.event('add_payment_info', {
      payment_type: 'wompi',
      checkout_type: 'curso',
      curso_id: String(cursoId)
    });

    mostrarConfirmacionPago('Wompi');
  };

  const procesarWompi = async () => {
    setShowConfirmModal(false);
    setShowLoadingModal(true);
    setProcesandoWompi(true);

    try {
      const datosCompra = buildDatosCompra();
      const resultado = await wompiService.crearCheckout(datosCompra);

      if (!resultado.success) {
        setShowLoadingModal(false);
        manejarErrorCompra(resultado);
        setProcesandoWompi(false);
        return;
      }

      await openWompiWidget(resultado.data);
      setShowLoadingModal(false);
      setProcesandoWompi(false);
    } catch (error) {
      console.error('❌ Error Wompi:', error);
      setShowLoadingModal(false);
      setModalData({
        title: 'Error con Wompi',
        message: 'No se pudo abrir el sistema de pago de Wompi. Por favor, intenta nuevamente.',
        errors: []
      });
      setShowErrorModal(true);
      setProcesandoWompi(false);
    }
  };

  // NUEVO: Función centralizada para manejar errores de compra
  const manejarErrorCompra = (resultado) => {
    const motivo = inferirMotivoBloqueo(resultado.message);

    if (motivo === 'inscrito') {
      setBloquearCompra(true);
      setMotivoBloqueo('inscrito');
      setModalData({
        title: 'Ya Estás Inscrito',
        message: 'Ya estás inscrito en este curso. Puedes acceder a él desde tu dashboard.',
        errors: []
      });
      setShowWarningModal(true);
    } else if (motivo === 'cupo') {
      setBloquearCompra(true);
      setMotivoBloqueo('cupo');
      setModalData({
        title: 'Cupo Agotado',
        message: 'Este curso ha alcanzado su capacidad máxima. Te recomendamos explorar otros cursos disponibles.',
        errors: []
      });
      setShowWarningModal(true);
    } else {
      setModalData({
        title: 'Error al Procesar',
        message: resultado.message || 'Ocurrió un error al procesar tu compra. Por favor, intenta nuevamente.',
        errors: []
      });
      setShowErrorModal(true);
    }
  };

  const mostrarErrorBloqueo = () => {
    if (motivoBloqueo === 'inscrito') {
      setModalData({
        title: 'Ya Estás Inscrito',
        message: 'Ya estás inscrito en este curso. Ve al dashboard para acceder.',
        errors: []
      });
      setShowWarningModal(true);
    } else if (motivoBloqueo === 'cupo') {
      setModalData({
        title: 'Cupo Agotado',
        message: 'Este curso ya alcanzó su capacidad máxima.',
        errors: []
      });
      setShowWarningModal(true);
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
      <div className="mis-clases-header">
        <div>
          <h1>Comprar Curso</h1>
        </div>

        <div className="header-buttons">
          <button className="btn-volver" onClick={() => navigate(-1)}>
            ← Volver
          </button>
        </div>
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
                  />
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
                    />
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
                    />
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
                  />
                </div>

                <div className="form-group">
                  <label>Zona Horaria *</label>
                  <select
                    name="timezone"
                    value={datosUsuario.timezone}
                    onChange={handleChangeUsuario}
                    disabled={procesando || procesandoWompi}
                  >
                    {getAllTimeZoneOptions().map((tz) => (
                      <option key={tz.value} value={tz.value}>
                        {tz.label}
                      </option>
                    ))}
                  </select>
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
                      placeholder="Mínimo 6 caracteres"
                      required={true}
                      minLength={6}
                    />
                  </div>

                  <div className="form-group">
                    <label>Confirmar Contraseña *</label>
                    <PasswordInput
                      name="confirmarPassword"
                      value={datosUsuario.confirmarPassword}
                      onChange={handleChangeUsuario}
                      disabled={procesando || procesandoWompi}
                      placeholder="Repite la contraseña"
                      required={true}
                    />
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

      {/* ==================== MODALS ==================== */}
      {/* AQUÍ VAN TODOS LOS MODALS - DESPUÉS DE TODO EL CONTENIDO */}
      
      {/* Modal de Error */}
      <ErrorModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title={modalData.title}
        message={modalData.message}
        errors={modalData.errors}
        buttonText="Entendido"
      />

      {/* Modal de Advertencia */}
      <WarningModal
        isOpen={showWarningModal}
        onClose={() => {
          setShowWarningModal(false);
          if (motivoBloqueo === 'inscrito') {
            handleIrAlDashboard();
          } else if (motivoBloqueo === 'cupo') {
            navigate('/cursos');
          }
        }}
        title={modalData.title}
        message={modalData.message}
        buttonText={motivoBloqueo === 'inscrito' ? 'Ir al Dashboard' : 'Ver Otros Cursos'}
      />

      {/* Modal de Confirmación de Pago */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={confirmModalData.onConfirm}
        title={confirmModalData.title}
        message={confirmModalData.message}
        confirmText="Sí, Proceder al Pago"
        cancelText="Cancelar"
        type="info"
      />

      {/* Modal de Carga/Procesamiento */}
      <LoadingModal
        isOpen={showLoadingModal}
        title="Procesando Pago"
        message="Estamos preparando tu transacción"
      />
    </div>
  );
};

export default CheckoutCurso;

