// src/pages/CheckoutClase.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { PasswordInput } from '../components/PasswordInput';
import { ErrorModal } from '../components/ErrorModal'; // NUEVO
import { WarningModal } from '../components/WarningModal'; // NUEVO
import { ConfirmModal } from '../components/ConfirmModal'; // NUEVO
import { LoadingModal } from '../components/LoadingModal'; // NUEVO
import comprasService from '../services/compras_service';
import wompiService from '../services/wompi_service';
import { openWompiWidget } from '../utils/wompi_widget';
import { getBrowserTimeZone, getAllTimeZoneOptions } from '../utils/timezone';
import analyticsService from '../services/analytics_service';
import '../styles/Checkout.css';

const CheckoutClase = () => {
  const { claseId } = useParams();
  const navigate = useNavigate();
  
  const [clase, setClase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [procesando, setProcesando] = useState(false);
  const [procesandoWompi, setProcesandoWompi] = useState(false);
  const [error, setError] = useState('');
  
  const token = localStorage.getItem('token');
  const [esNuevoUsuario, setEsNuevoUsuario] = useState(!token);

  const [archivoAdjunto, setArchivoAdjunto] = useState(null);
  const [errorArchivo, setErrorArchivo] = useState('');

  // Estados para disponibilidad
  const [fechaSeleccionada, setFechaSeleccionada] = useState('');
  const [disponibilidad, setDisponibilidad] = useState(null);
  const [loadingDisponibilidad, setLoadingDisponibilidad] = useState(false);
  const [franjaSeleccionada, setFranjaSeleccionada] = useState(null);

  const [datosClase, setDatosClase] = useState({
    descripcion_estudiante: ''
  });

  const [datosUsuario, setDatosUsuario] = useState({
    email: '',
    nombre: '',
    apellido: '',
    telefono: '',
    timezone: localStorage.getItem('timezone') || getBrowserTimeZone(),
    password: '',
    confirmarPassword: ''
  });

  const [errores, setErrores] = useState({});

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

  useEffect(() => {
    cargarClase();
  }, [claseId]);

  useEffect(() => {
    if (!loading && clase && !error) {
      analyticsService.event('begin_checkout', {
        checkout_type: 'clase_personalizada',
        clase_personalizada_id: String(claseId)
      });
    }
  }, [loading, clase, error, claseId]);

  // Auto-consultar disponibilidad cuando cambia la fecha
  useEffect(() => {
    if (fechaSeleccionada && clase) {
      consultarDisponibilidad();
    }
  }, [fechaSeleccionada]);

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

  const consultarDisponibilidad = async () => {
    setLoadingDisponibilidad(true);
    setDisponibilidad(null);
    setFranjaSeleccionada(null);

    try {
      const response = await fetch(
        `https://academiaparchada.onrender.com/api/disponibilidad/franjas?` +
        `fecha=${fechaSeleccionada}&` +
        `asignatura_id=${clase.asignatura_id}&` +
        `duracion_horas=${clase.duracion_horas}&` +
        `timezone=${datosUsuario.timezone || 'America/Bogota'}`
      );

      const data = await response.json();

      if (response.ok && data.success) {
        setDisponibilidad(data.data);

        if (data.data.total === 0) {
          // NUEVO: Usar modal en lugar de mensaje
          setModalData({
            title: 'Sin Horarios Disponibles',
            message: 'No hay horarios disponibles para esta fecha. Por favor, intenta con otra fecha.',
            errors: []
          });
          setShowWarningModal(true);
        }
      } else {
        // NUEVO: Usar modal
        setModalData({
          title: 'Error de Consulta',
          message: data.message || 'Error al consultar disponibilidad. Por favor, intenta de nuevo.',
          errors: []
        });
        setShowErrorModal(true);
      }
    } catch (err) {
      console.error('❌ Error al consultar disponibilidad:', err);
      // NUEVO: Usar modal
      setModalData({
        title: 'Error de Conexión',
        message: 'No se pudo consultar la disponibilidad. Verifica tu conexión e intenta de nuevo.',
        errors: []
      });
      setShowErrorModal(true);
    } finally {
      setLoadingDisponibilidad(false);
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

  // MODIFICADO: Validar con modal
  const validarFormulario = () => {
    const nuevosErrores = {};
    const validationErrors = [];

    // Validar fecha seleccionada
    if (!fechaSeleccionada) {
      nuevosErrores.fecha = 'Debes seleccionar una fecha';
      validationErrors.push('Debes seleccionar una fecha');
    }

    // Validar franja seleccionada
    if (!franjaSeleccionada) {
      nuevosErrores.franja = 'Debes seleccionar un horario disponible';
      validationErrors.push('Debes seleccionar un horario disponible');
    }

    // Validar descripción
    if (!datosClase.descripcion_estudiante || datosClase.descripcion_estudiante.trim().length < 10) {
      nuevosErrores.descripcion_estudiante = 'Describe qué necesitas (mínimo 10 caracteres)';
      validationErrors.push('Describe qué necesitas aprender (mínimo 10 caracteres)');
    }

    // Validar datos de usuario nuevo
    if (esNuevoUsuario) {
      if (!datosUsuario.email || !datosUsuario.email.includes('@')) {
        nuevosErrores.email = 'Email inválido';
        validationErrors.push('El correo electrónico no es válido');
      }

      if (!datosUsuario.nombre.trim()) {
        nuevosErrores.nombre = 'El nombre es obligatorio';
        validationErrors.push('El nombre es obligatorio');
      }

      if (!datosUsuario.apellido.trim()) {
        nuevosErrores.apellido = 'El apellido es obligatorio';
        validationErrors.push('El apellido es obligatorio');
      }

      if (!datosUsuario.telefono.trim()) {
        nuevosErrores.telefono = 'El teléfono es obligatorio';
        validationErrors.push('El teléfono es obligatorio');
      }

      if (!datosUsuario.timezone) {
        nuevosErrores.timezone = 'La zona horaria es obligatoria';
        validationErrors.push('Debes seleccionar una zona horaria');
      }

      if (datosUsuario.password.length < 6) {
        nuevosErrores.password = 'La contraseña debe tener al menos 6 caracteres';
        validationErrors.push('La contraseña debe tener al menos 6 caracteres');
      }

      if (datosUsuario.password !== datosUsuario.confirmarPassword) {
        nuevosErrores.confirmarPassword = 'Las contraseñas no coinciden';
        validationErrors.push('Las contraseñas no coinciden');
      }
    }

    setErrores(nuevosErrores);

    // NUEVO: Mostrar modal si hay errores
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

  const buildDatosCompra = () => {
    const datosCompra = {
      tipo_compra: 'clase_personalizada',
      clase_personalizada_id: claseId,
      fecha_hora: franjaSeleccionada.fecha_hora_inicio_iso,
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

  // NUEVO: Mostrar confirmación antes de pagar
  const mostrarConfirmacionPago = (metodoPago) => {
    const precio = comprasService.formatearPrecio(clase.precio);
    const fechaFormateada = new Date(franjaSeleccionada.fecha_hora_inicio_iso).toLocaleString('es-CO', {
      dateStyle: 'long',
      timeStyle: 'short'
    });
    
    setConfirmModalData({
      title: '¿Confirmar Compra?',
      message: `Estás a punto de proceder al pago de ${precio} por una clase personalizada el ${fechaFormateada} con ${franjaSeleccionada.profesor.nombre} ${franjaSeleccionada.profesor.apellido}. Serás redirigido a ${metodoPago} para completar la transacción de forma segura.`,
      onConfirm: metodoPago === 'Mercado Pago' ? procesarMercadoPago : procesarWompi
    });
    setShowConfirmModal(true);
  };

  const handleComprarMercadoPago = async (e) => {
    e.preventDefault();

    if (!validarFormulario()) {
      return;
    }

    analyticsService.event('add_payment_info', {
      payment_type: 'mercadopago',
      checkout_type: 'clase_personalizada',
      clase_personalizada_id: String(claseId)
    });

    mostrarConfirmacionPago('Mercado Pago');
  };

  const procesarMercadoPago = async () => {
    setShowConfirmModal(false);
    setShowLoadingModal(true);
    setProcesando(true);

    try {
      const datosCompra = buildDatosCompra();

      let resultado;

      if (archivoAdjunto) {
        resultado = await comprasService.iniciarPagoMercadoPagoConArchivo(datosCompra, archivoAdjunto);
      } else {
        resultado = await comprasService.iniciarPagoMercadoPago(datosCompra);
      }

      if (resultado.success) {
        setTimeout(() => {
          const initPoint = resultado.data.init_point || resultado.data.sandbox_init_point;
          comprasService.redirigirACheckout(initPoint);
        }, 1000);
      } else {
        setShowLoadingModal(false);
        setModalData({
          title: 'Error al Procesar',
          message: resultado.message || 'Error al procesar el pago. Por favor, intenta nuevamente.',
          errors: []
        });
        setShowErrorModal(true);
        setProcesando(false);
      }
    } catch (error) {
      console.error('❌ Error en el proceso de compra:', error);
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

    if (!validarFormulario()) {
      return;
    }

    analyticsService.event('add_payment_info', {
      payment_type: 'wompi',
      checkout_type: 'clase_personalizada',
      clase_personalizada_id: String(claseId)
    });

    mostrarConfirmacionPago('Wompi');
  };

  const procesarWompi = async () => {
    setShowConfirmModal(false);
    setShowLoadingModal(true);
    setProcesandoWompi(true);

    try {
      const datosCompra = buildDatosCompra();

      let resultado;

      if (archivoAdjunto) {
        resultado = await wompiService.crearCheckoutConArchivo(datosCompra, archivoAdjunto);
      } else {
        resultado = await wompiService.crearCheckout(datosCompra);
      }

      if (!resultado.success) {
        setShowLoadingModal(false);
        setModalData({
          title: 'Error con Wompi',
          message: resultado.message || 'Error al iniciar pago con Wompi. Por favor, intenta nuevamente.',
          errors: []
        });
        setShowErrorModal(true);
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
      <div className="mis-clases-header">
        <div>
          <h1>Comprar Clase Personalizada</h1>
        </div>

        <div className="header-buttons">
          <button className="btn-volver" onClick={() => navigate(-1)}>
            ← Volver
          </button>
        </div>
      </div>

      <div className="checkout-content">
        <div className="checkout-resumen">
          <h2>📝 Resumen de Compra</h2>
          
          <div className="curso-info-checkout">
            <h3>Clase de {clase.asignatura?.nombre}</h3>

            {(clase.descripcion_asignatura || clase.asignatura?.descripcion) && (
              <div className="descripcion-completa-checkout">
                <h4>Descripción</h4>
                <p>{clase.descripcion_asignatura || clase.asignatura?.descripcion}</p>
              </div>
            )}
            
            <div className="detalles-grid">
              <div className="detalle-item">
                <span className="detalle-label">⏱️ Duración:</span>
                <span className="detalle-valor">{clase.duracion_horas} hora(s)</span>
              </div>

              <div className="detalle-item">
                <span className="detalle-label">👥 Tipo:</span>
                <span className="detalle-valor">Individual</span>
              </div>
            </div>

            {franjaSeleccionada && (
              <div className="info-box" style={{ background: '#d4edda', borderLeftColor: '#28a745' }}>
                <p>
                  ✅ <strong>Horario seleccionado</strong>
                </p>
                <p className="info-small">
                  📅 {fechaSeleccionada} de {(franjaSeleccionada.inicio_estudiante || franjaSeleccionada.hora_inicio).substring(0, 5)} a {(franjaSeleccionada.fin_estudiante || franjaSeleccionada.hora_fin).substring(0, 5)}
                </p>
                <p className="info-small">
                  👨‍🏫 Profesor: {franjaSeleccionada.profesor.nombre} {franjaSeleccionada.profesor.apellido}
                </p>
              </div>
            )}

            <div className="info-box">
              <p>
                ✨ <strong>Profesor asignado según tu horario</strong>
              </p>
              <p className="info-small">
                Selecciona un horario disponible y confirmaremos al profesor
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
            <h2>📅 Selecciona Fecha y Horario</h2>

            {/* PASO 1: Seleccionar fecha */}
            <div className="form-group">
              <label>Fecha de la clase *</label>
              <input
                type="date"
                value={fechaSeleccionada}
                onChange={(e) => setFechaSeleccionada(e.target.value)}
                disabled={procesando || procesandoWompi}
                className={errores.fecha ? 'input-error' : ''}
                min={new Date().toISOString().split('T')[0]}
              />
              {errores.fecha && (
                <span className="error">{errores.fecha}</span>
              )}
              <span className="help-text">
                Selecciona la fecha para ver horarios disponibles
              </span>
            </div>

            {/* Loading de disponibilidad */}
            {loadingDisponibilidad && (
              <div className="disponibilidad-loading">
                <div className="spinner-small"></div>
                <span>Consultando disponibilidad...</span>
              </div>
            )}

            {/* PASO 2: Mostrar franjas disponibles */}
            {disponibilidad && disponibilidad.total > 0 && (
              <div className="form-group">
                <label>Horarios disponibles ({disponibilidad.total} opciones) *</label>
                <div className="franjas-lista">
                  {disponibilidad.franjas_disponibles.map((franja) => (
                    <label
                      key={franja.fecha_hora_inicio_iso}
                      className={`franja-item ${
                        franjaSeleccionada?.fecha_hora_inicio_iso === franja.fecha_hora_inicio_iso
                          ? 'franja-seleccionada'
                          : ''
                      }`}
                    >
                      <input
                        type="radio"
                        name="horario"
                        value={franja.fecha_hora_inicio_iso}
                        checked={franjaSeleccionada?.fecha_hora_inicio_iso === franja.fecha_hora_inicio_iso}
                        onChange={() => setFranjaSeleccionada(franja)}
                        disabled={procesando || procesandoWompi}
                      />
                      <div className="franja-info">
                        <div className="franja-hora">
                          {(franja.inicio_estudiante || franja.hora_inicio).substring(0, 5)} - {(franja.fin_estudiante || franja.hora_fin).substring(0, 5)}
                        </div>
                        <div className="franja-profesor">
                          👨‍🏫 {franja.profesor.nombre} {franja.profesor.apellido}
                        </div>
                        <div className="franja-duracion">
                          ⏱️ {franja.duracion_horas} hora{franja.duracion_horas > 1 ? 's' : ''}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>
                {errores.franja && (
                  <span className="error">{errores.franja}</span>
                )}
              </div>
            )}

            <h2>📝 Detalles de la Clase</h2>

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

      {/* ==================== MODALS ==================== */}
      <ErrorModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title={modalData.title}
        message={modalData.message}
        errors={modalData.errors}
        buttonText="Entendido"
      />

      <WarningModal
        isOpen={showWarningModal}
        onClose={() => setShowWarningModal(false)}
        title={modalData.title}
        message={modalData.message}
        buttonText="Entendido"
      />

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

      <LoadingModal
        isOpen={showLoadingModal}
        title="Procesando Pago"
        message="Estamos preparando tu transacción"
      />
    </div>
  );
};

export default CheckoutClase;
