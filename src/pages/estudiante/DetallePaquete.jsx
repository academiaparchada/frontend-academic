// src/pages/estudiante/DetallePaquete.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import comprasService from '../../services/compras_service';
import { getBrowserTimeZone } from '../../utils/timezone';
import '../../styles/estudiante-css/DetallePaquete.css';

const API_URL =
  import.meta.env.VITE_API_URL || 'https://academiaparchada.onrender.com/api';

const DetallePaquete = () => {
  const { compraId } = useParams();
  const navigate = useNavigate();

  const [paquete, setPaquete] = useState(null);
  const [sesiones, setSesiones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

  // Modal de agendar
  const [modalAbierto, setModalAbierto] = useState(false);
  const [procesando, setProcesando] = useState(false);
  const [subiendoArchivo, setSubiendoArchivo] = useState(false);

  // Añadimos campo fecha (YYYY-MM-DD), fecha_hora guardará el ISO de la franja seleccionada
  const [nuevaSesion, setNuevaSesion] = useState({
    fecha_hora: '',
    duracion_horas: 1,
    descripcion_estudiante: '',
    archivo: null,
    fecha: ''
  });

  const [errores, setErrores] = useState({});

  // Estado para disponibilidad de franjas
  const [franjas, setFranjas] = useState([]);
  const [loadingFranjas, setLoadingFranjas] = useState(false);
  const [errorFranjas, setErrorFranjas] = useState('');
  const [franjaSeleccionadaIso, setFranjaSeleccionadaIso] = useState('');

  useEffect(() => {
    cargarDatos();
  }, [compraId]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      setError('');
      console.log('🔄 Cargando paquete con ID:', compraId);
      const resultado = await comprasService.obtenerDetallePaquete(compraId);

      if (resultado.success) {
        console.log('✅ Datos del paquete recibidos:', resultado.data);
        setPaquete(resultado.data);
        setSesiones(resultado.data.sesiones || []);
        console.log(
          '📊 Sesiones cargadas:',
          resultado.data.sesiones?.length || 0
        );
        console.log('📦 Paquete:', resultado.data.compra);
      } else {
        setError(resultado.message || 'Error al cargar el paquete');
      }
    } catch (err) {
      console.error('❌ Error al cargar paquete:', err);
      setError(err.message || 'Error al cargar el paquete');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeSesion = (e) => {
    const { name, value } = e.target;

    setNuevaSesion((prev) => ({
      ...prev,
      [name]: name === 'duracion_horas' ? parseInt(value) : value
    }));

    // Si cambia la fecha, limpiar franjas y selección
    if (name === 'fecha') {
      setFranjas([]);
      setErrorFranjas('');
      setFranjaSeleccionadaIso('');
      setNuevaSesion((prev) => ({
        ...prev,
        fecha_hora: ''
      }));
    }

    if (errores[name]) {
      setErrores((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Manejar selección de archivo
  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;

    if (!file) {
      setNuevaSesion((prev) => ({ ...prev, archivo: null }));
      setErrores((prev) => ({ ...prev, archivo: '' }));
      return;
    }

    const validacion = comprasService.validarArchivo(file);
    if (!validacion.valido) {
      setErrores((prev) => ({ ...prev, archivo: validacion.mensaje }));
      setNuevaSesion((prev) => ({ ...prev, archivo: null }));
      return;
    }

    setNuevaSesion((prev) => ({ ...prev, archivo: file }));
    setErrores((prev) => ({ ...prev, archivo: '' }));
    console.log(
      '📎 Archivo seleccionado:',
      file.name,
      comprasService.formatearTamanoArchivo(file.size)
    );
  };

  const handleRemoveFile = () => {
    setNuevaSesion((prev) => ({ ...prev, archivo: null }));
    setErrores((prev) => ({ ...prev, archivo: '' }));
    const fileInput = document.querySelector('input[type="file"]');
    if (fileInput) fileInput.value = '';
  };

  const validarFormulario = () => {
    const nuevosErrores = {};
    const horasDisponibles = paquete?.compra?.horas_disponibles || 0;

    console.log('🔍 VALIDANDO FORMULARIO');
    console.log(' → Horas disponibles:', horasDisponibles);
    console.log(' → Duración solicitada:', nuevaSesion.duracion_horas);

    // Ahora validamos que haya seleccionado una franja (fecha_hora ISO)
    if (!nuevaSesion.fecha_hora) {
      nuevosErrores.fecha_hora =
        'Debes seleccionar un horario disponible para agendar la clase';
    }

    if (nuevaSesion.duracion_horas < 1) {
      nuevosErrores.duracion_horas = 'La duración debe ser al menos 1 hora';
    } else if (nuevaSesion.duracion_horas > 8) {
      nuevosErrores.duracion_horas =
        'La duración no puede ser mayor a 8 horas';
    } else if (nuevaSesion.duracion_horas > horasDisponibles) {
      nuevosErrores.duracion_horas = `Solo tienes ${horasDisponibles} hora(s) disponible(s)`;
      console.log('⚠️ ERROR: Duración excede horas disponibles');
    }

    if (
      !nuevaSesion.descripcion_estudiante ||
      nuevaSesion.descripcion_estudiante.trim().length < 10
    ) {
      nuevosErrores.descripcion_estudiante =
        'Describe qué necesitas (mínimo 10 caracteres)';
    }

    if (nuevaSesion.archivo) {
      const validacion = comprasService.validarArchivo(nuevaSesion.archivo);
      if (!validacion.valido) {
        nuevosErrores.archivo = validacion.mensaje;
      }
    }

    console.log(
      '✅ Validación:',
      Object.keys(nuevosErrores).length === 0 ? 'PASÓ' : 'FALLÓ',
      nuevosErrores
    );

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const consultarFranjas = async () => {
    if (!paquete || !nuevaSesion.fecha) return;

    try {
      setLoadingFranjas(true);
      setErrorFranjas('');
      setFranjas([]);
      setFranjaSeleccionadaIso('');
      setNuevaSesion((prev) => ({ ...prev, fecha_hora: '' }));

      const asignaturaId =
        paquete.compra?.clase_personalizada?.asignatura?.id ||
        paquete.compra?.clase_personalizada?.asignatura_id;
      const duracion = nuevaSesion.duracion_horas || 1;
      const timezone = getBrowserTimeZone();

      const url = `${API_URL}/disponibilidad/franjas?fecha=${
        nuevaSesion.fecha
      }&asignatura_id=${asignaturaId}&duracion_horas=${duracion}&timezone=${encodeURIComponent(
        timezone
      )}`;

      const response = await fetch(url);
      const json = await response.json();

      if (!response.ok || !json.success) {
        setErrorFranjas(
          json.message || 'Error al consultar disponibilidad de horarios'
        );
        return;
      }

      const data = json.data || {};
      const franjasDisponibles = data.franjas_disponibles || [];

      setFranjas(franjasDisponibles);

      if (franjasDisponibles.length === 0) {
        setErrorFranjas(
          data.mensaje ||
            'No hay horarios disponibles para esta fecha. Intenta con otra fecha.'
        );
      }
    } catch (err) {
      console.error('❌ Error consultando franjas:', err);
      setErrorFranjas(
        'Error al consultar disponibilidad. Intenta nuevamente.'
      );
    } finally {
      setLoadingFranjas(false);
    }
  };

  const handleSeleccionFranja = (franja) => {
    setFranjaSeleccionadaIso(franja.fecha_hora_inicio_iso);
    setNuevaSesion((prev) => ({
      ...prev,
      fecha_hora: franja.fecha_hora_inicio_iso
    }));
    if (errores.fecha_hora) {
      setErrores((prev) => ({ ...prev, fecha_hora: '' }));
    }
  };

  const handleAgendarSesion = async (e) => {
    e.preventDefault();
    console.log('═══════════════════════════════════════════════');
    console.log('🚀 INICIANDO AGENDAMIENTO DE SESIÓN');
    console.log('═══════════════════════════════════════════════');

    if (!validarFormulario()) {
      setMensaje({
        tipo: 'error',
        texto: 'Por favor corrige los errores del formulario'
      });
      return;
    }

    setProcesando(true);
    setMensaje({ tipo: '', texto: '' });

    try {
      if (nuevaSesion.archivo) {
        setSubiendoArchivo(true);
        setMensaje({
          tipo: 'info',
          texto: '📤 Subiendo documento...'
        });
      }

      // ✅ FIX: si ya viene ISO del endpoint (Z o con offset), NO volver a convertir
      const valorFecha = String(nuevaSesion.fecha_hora || '');
      const yaEsISOConZona =
        valorFecha.endsWith('Z') || /[+-]\d{2}:\d{2}$/.test(valorFecha);

      const fechaISO = yaEsISOConZona
        ? nuevaSesion.fecha_hora
        : comprasService.convertirFechaAISO(nuevaSesion.fecha_hora);

      console.log('📋 DATOS A ENVIAR:');
      console.log(' → Compra ID:', compraId);
      console.log(' → Fecha original:', nuevaSesion.fecha_hora);
      console.log(' → Fecha ISO 8601:', fechaISO);
      console.log(' → Duración:', nuevaSesion.duracion_horas, 'hora(s)');
      console.log(' → Descripción:', nuevaSesion.descripcion_estudiante);
      console.log(
        ' → Archivo:',
        nuevaSesion.archivo ? nuevaSesion.archivo.name : 'ninguno'
      );

      const datosSesion = {
        fecha_hora: fechaISO,
        duracion_horas: nuevaSesion.duracion_horas,
        descripcion_estudiante: nuevaSesion.descripcion_estudiante.trim()
      };

      const resultado = await comprasService.agendarSesionPaquete(
        compraId,
        datosSesion,
        nuevaSesion.archivo
      );

      setSubiendoArchivo(false);
      console.log('📥 RESPUESTA COMPLETA:', JSON.stringify(resultado, null, 2));

      if (resultado.success) {
        console.log('✅ SESIÓN AGENDADA EXITOSAMENTE');
        setMensaje({
          tipo: 'exito',
          texto: nuevaSesion.archivo
            ? '¡Sesión agendada con documento adjunto! 🎉'
            : '¡Sesión agendada exitosamente! 🎉'
        });

        setNuevaSesion({
          fecha_hora: '',
          duracion_horas: 1,
          descripcion_estudiante: '',
          archivo: null,
          fecha: ''
        });
        setErrores({});
        setFranjas([]);
        setFranjaSeleccionadaIso('');

        const fileInput = document.querySelector('input[type="file"]');
        if (fileInput) fileInput.value = '';

        setTimeout(() => {
          setModalAbierto(false);
          setMensaje({ tipo: '', texto: '' });
          cargarDatos();
        }, 2000);
      } else {
        console.error('❌ ERROR AL AGENDAR:');
        console.error(' → Mensaje:', resultado.message);
        console.error(' → Errores:', resultado.errors);
        setMensaje({
          tipo: 'error',
          texto: resultado.message || 'Error al agendar la sesión'
        });
      }
    } catch (err) {
      console.error('❌ EXCEPCIÓN:', err);
      setSubiendoArchivo(false);
      setMensaje({
        tipo: 'error',
        texto: 'Error al agendar la sesión. Intenta de nuevo.'
      });
    } finally {
      setProcesando(false);
      console.log('═══════════════════════════════════════════════');
    }
  };

  const abrirModal = () => {
    const horasDisponibles = paquete?.compra?.horas_disponibles || 0;
    console.log('🔓 ABRIENDO MODAL');
    console.log(' → Horas disponibles:', horasDisponibles);
    console.log(' → Estado pago:', paquete?.compra?.estado_pago);

    if (horasDisponibles <= 0) {
      alert('No tienes horas disponibles para agendar');
      return;
    }
    if (paquete?.compra?.estado_pago !== 'completado') {
      alert('El paquete debe estar pagado para agendar clases');
      return;
    }

    setModalAbierto(true);
    setMensaje({ tipo: '', texto: '' });
    setErrores({});
    setFranjas([]);
    setFranjaSeleccionadaIso('');
    setNuevaSesion({
      fecha_hora: '',
      duracion_horas: 1,
      descripcion_estudiante: '',
      archivo: null,
      fecha: ''
    });
  };

  if (loading) {
    return (
      <div className="detalle-paquete-container">
        <div className="loading-spinner">
          <div className="spinner" />
          <p>Cargando información...</p>
        </div>
      </div>
    );
  }

  if (error || !paquete) {
    return (
      <div className="detalle-paquete-container">
        <div className="error-mensaje">
          <h3>❌ Error</h3>
          <p>{error || 'Paquete no encontrado'}</p>
          <button onClick={() => navigate('/estudiante/mis-paquetes')}>
            Volver a Mis Paquetes
          </button>
        </div>
      </div>
    );
  }

  const horasDisponibles =
    paquete?.compra?.horas_disponibles ??
    (paquete?.compra?.horas_totales - paquete?.compra?.horas_usadas) ??
    0;

  const porcentajeUsado = paquete?.compra?.horas_totales
    ? (paquete.compra.horas_usadas / paquete.compra.horas_totales) * 100
    : 0;

  return (
    <div className="detalle-paquete-container">
      <div className="detalle-header">
        <button
          className="btn-volver"
          onClick={() => navigate('/estudiante/mis-paquetes')}
        >
          ← Volver
        </button>
        <h1>Detalle del Paquete</h1>
      </div>

      <div className="paquete-info-principal">
        <div className="info-card">
          <h2>
            📦{' '}
            {paquete?.compra?.clase_personalizada?.asignatura?.nombre ||
              'Paquete de horas'}
          </h2>

          <div className="horas-resumen">
            <div className="horas-circle">
              <div className="circle-content">
                <span className="horas-numero">{horasDisponibles}</span>
                <span className="horas-label">hora(s) disponible(s)</span>
              </div>
              <svg className="circle-progress" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  className="circle-bg"
                ></circle>
                <circle
                  cx="50"
                  cy="50"
                  r="45"
                  className="circle-fill"
                  style={{
                    strokeDasharray: `${porcentajeUsado * 2.827} 282.7`
                  }}
                ></circle>
              </svg>
            </div>

            <div className="horas-detalles">
              <div className="detalle-item">
                <span className="label">Total:</span>
                <span className="valor">
                  {paquete.compra.horas_totales}h
                </span>
              </div>
              <div className="detalle-item">
                <span className="label">Usadas:</span>
                <span className="valor usado">
                  {paquete.compra.horas_usadas}h
                </span>
              </div>
              <div className="detalle-item">
                <span className="label">Disponibles:</span>
                <span className="valor disponible">
                  {horasDisponibles}h
                </span>
              </div>
            </div>
          </div>

          <div className="info-adicional">
            <div className="info-row">
              <span className="icon">💰</span>
              <div>
                <span className="label">Monto Total</span>
                <strong>
                  {comprasService.formatearPrecio(
                    paquete.compra.monto_total
                  )}
                </strong>
              </div>
            </div>

            <div className="info-row">
              <span className="icon">📅</span>
              <div>
                <span className="label">Fecha de Compra</span>
                <strong>
                  {comprasService.formatearFecha(
                    paquete.compra.fecha_compra
                  )}
                </strong>
              </div>
            </div>

            <div className="info-row">
              <span className="icon">✅</span>
              <div>
                <span className="label">Estado</span>
                <span
                  className={`badge badge-${paquete.compra.estado_pago}`}
                >
                  {paquete.compra.estado_pago === 'completado'
                    ? 'Pagado'
                    : paquete.compra.estado_pago}
                </span>
              </div>
            </div>
          </div>

          {horasDisponibles > 0 && (
            <button
              className="btn-agendar-principal"
              onClick={abrirModal}
            >
              📅 Agendar Nueva Clase
            </button>
          )}
        </div>
      </div>

      {/* Sesiones */}
      <div className="sesiones-section">
        <h2>📚 Mis Clases ({sesiones.length})</h2>

        {sesiones.length === 0 ? (
          <div className="sin-sesiones">
            <p>📅 Aún no has agendado ninguna clase</p>
            {horasDisponibles > 0 && (
              <button
                className="btn-agendar-vacio"
                onClick={abrirModal}
              >
                Agendar mi Primera Clase
              </button>
            )}
          </div>
        ) : (
          <div className="sesiones-lista">
            {sesiones.map((sesion) => (
              <div key={sesion.id} className="sesion-card">
                <div className="sesion-fecha">
                  <span className="fecha-dia">
                    {new Date(
                      sesion.fecha_hora
                    ).toLocaleDateString('es-CO', {
                      day: 'numeric'
                    })}
                  </span>
                  <span className="fecha-mes">
                    {new Date(
                      sesion.fecha_hora
                    ).toLocaleDateString('es-CO', {
                      month: 'short'
                    })}
                  </span>
                </div>

                <div className="sesion-info">
                  <div className="sesion-header">
                    <h3>
                      {comprasService.formatearFechaHora(
                        sesion.fecha_hora
                      )}
                    </h3>
                    <span
                      className={`badge-estado ${sesion.estado}`}
                    >
                      {sesion.estado === 'programada'
                        ? '⏳ Programada'
                        : sesion.estado === 'completada'
                        ? '✅ Completada'
                        : '❌ Cancelada'}
                    </span>
                  </div>

                  {sesion.descripcion_estudiante && (
                    <p className="sesion-descripcion">
                      {sesion.descripcion_estudiante}
                    </p>
                  )}

                  {sesion.documento_url && (
                    <div className="sesion-documento">
                      <span className="icon">📎</span>
                      <a
                        href={sesion.documento_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="documento-link"
                      >
                        Ver documento adjunto
                      </a>
                    </div>
                  )}

                  {sesion.profesor && (
                    <div className="sesion-profesor">
                      <span className="icon">👨‍🏫</span>
                      <span>
                        {sesion.profesor.nombre}{' '}
                        {sesion.profesor.apellido}
                      </span>
                      {sesion.profesor.email && (
                        <span className="profesor-contacto">
                          📧 {sesion.profesor.email}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal agendar */}
      {modalAbierto && (
        <div
          className="modal-overlay"
          onClick={() => !procesando && setModalAbierto(false)}
        >
          <div
            className="modal-contenido"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h2>📅 Agendar Nueva Clase</h2>
              <button
                className="btn-cerrar"
                onClick={() => setModalAbierto(false)}
                disabled={procesando}
              >
                ×
              </button>
            </div>

            <form
              onSubmit={handleAgendarSesion}
              className="modal-form"
            >
              {mensaje.texto && (
                <div className={`mensaje ${mensaje.tipo}`}>
                  {mensaje.texto}
                </div>
              )}

              {/* Fecha + franjas */}
              <div className="form-group">
                <label>Fecha de la clase *</label>
                <div className="fecha-disponibilidad">
                  <input
                    type="date"
                    name="fecha"
                    value={nuevaSesion.fecha}
                    onChange={handleChangeSesion}
                    min={new Date().toISOString().split('T')[0]}
                    disabled={procesando}
                  />
                  <button
                    type="button"
                    className="btn-secundario-fecha"
                    onClick={consultarFranjas}
                    disabled={!nuevaSesion.fecha || procesando}
                  >
                    {loadingFranjas
                      ? 'Consultando...'
                      : 'Ver horarios disponibles'}
                  </button>
                </div>
              </div>

              {errorFranjas && (
                <div className="mensaje error">{errorFranjas}</div>
              )}

              {franjas.length > 0 && (
                <div className="form-group">
                  <label>Horarios disponibles *</label>
                  <div className="franjas-lista">
                    {franjas.map((franja) => (
                      <label
                        key={franja.fecha_hora_inicio_iso}
                        className={`franja-item ${
                          franjaSeleccionadaIso ===
                          franja.fecha_hora_inicio_iso
                            ? 'seleccionada'
                            : ''
                        }`}
                      >
                        <input
                          type="radio"
                          name="franja"
                          value={franja.fecha_hora_inicio_iso}
                          checked={
                            franjaSeleccionadaIso ===
                            franja.fecha_hora_inicio_iso
                          }
                          onChange={() => handleSeleccionFranja(franja)}
                          disabled={procesando}
                        />
                        <div className="franja-info">
                          <div className="franja-hora">
                            {(franja.inicio_estudiante || franja.hora_inicio)?.slice(0, 5)} -{' '}
                            {(franja.fin_estudiante || franja.hora_fin)?.slice(0, 5)}
                          </div>
                          <div className="franja-profesor">
                            Profesor:{' '}
                            {franja.profesor
                              ? `${franja.profesor.nombre} ${franja.profesor.apellido}`
                              : 'Por asignar'}
                          </div>
                          <div className="franja-detalle">
                            Duración: {franja.duracion_horas} hora
                            {franja.duracion_horas > 1 ? 's' : ''}
                          </div>
                        </div>
                      </label>
                    ))}
                  </div>
                  {errores.fecha_hora && (
                    <span className="error">{errores.fecha_hora}</span>
                  )}
                </div>
              )}

              {/* Duración */}
              <div className="form-group">
                <label>Duración (horas) *</label>
                <select
                  name="duracion_horas"
                  value={nuevaSesion.duracion_horas}
                  onChange={handleChangeSesion}
                  disabled={procesando}
                  className={errores.duracion_horas ? 'input-error' : ''}
                >
                  {Array.from(
                    {
                      length: Math.min(horasDisponibles, 8)
                    },
                    (_, i) => i + 1
                  ).map((h) => (
                    <option key={h} value={h}>
                      {h} hora{h > 1 ? 's' : ''}
                    </option>
                  ))}
                </select>
                {errores.duracion_horas && (
                  <span className="error">{errores.duracion_horas}</span>
                )}
                <span className="help-text">
                  Tienes {horasDisponibles} hora(s) disponible(s)
                </span>
              </div>

              {/* Descripción */}
              <div className="form-group">
                <label>¿Qué necesitas aprender? *</label>
                <textarea
                  name="descripcion_estudiante"
                  value={nuevaSesion.descripcion_estudiante}
                  onChange={handleChangeSesion}
                  placeholder="Ej: Necesito ayuda con derivadas parciales..."
                  rows={4}
                  disabled={procesando}
                  className={
                    errores.descripcion_estudiante ? 'input-error' : ''
                  }
                />
                {errores.descripcion_estudiante && (
                  <span className="error">
                    {errores.descripcion_estudiante}
                  </span>
                )}
              </div>

              {/* Archivo */}
              <div className="form-group">
                <label>
                  📎 Documento (opcional)
                  <span className="label-info">
                    Máx 25 MB - PDF, Word, Excel, imágenes, ZIP
                  </span>
                </label>

                {!nuevaSesion.archivo ? (
                  <div className="file-input-wrapper">
                    <input
                      type="file"
                      onChange={handleFileChange}
                      disabled={procesando}
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.zip,.rar,.7z,.png,.jpg,.jpeg,.webp,.txt"
                    />
                    <label className="file-input-label">
                      📁 Seleccionar archivo
                    </label>
                  </div>
                ) : (
                  <div className="file-selected">
                    <div className="file-info">
                      <span className="file-icon">📄</span>
                      <div className="file-details">
                        <span className="file-name">
                          {nuevaSesion.archivo.name}
                        </span>
                        <span className="file-size">
                          {comprasService.formatearTamanoArchivo(
                            nuevaSesion.archivo.size
                          )}
                        </span>
                      </div>
                    </div>
                    <button
                      type="button"
                      className="btn-remove-file"
                      onClick={handleRemoveFile}
                      disabled={procesando}
                    >
                      ×
                    </button>
                  </div>
                )}

                {errores.archivo && (
                  <span className="error">{errores.archivo}</span>
                )}
              </div>

              <div className="modal-acciones">
                <button
                  type="button"
                  className="btn-cancelar"
                  onClick={() => setModalAbierto(false)}
                  disabled={procesando}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="btn-guardar"
                  disabled={procesando}
                >
                  {procesando ? (
                    <>
                      <div className="spinner-small" />
                      {subiendoArchivo ? 'Subiendo...' : 'Agendando...'}
                    </>
                  ) : (
                    '✅ Agendar Clase'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetallePaquete;
