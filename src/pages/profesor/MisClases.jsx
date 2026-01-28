// (ruta pendiente por confirmar en el repo, p. ej. src/pages/profesor/MisClases.jsx)
import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import profesorService from '../../services/profesor_service';
import { Header } from '../../components/header';
import { Footer } from '../../components/footer';
import '../../styles/profesor-css/profesor_clases.css';

const MisClases = () => {
  const [tabActiva, setTabActiva] = useState('asignadas');

  // Estado para clases asignadas
  const [clasesAsignadas, setClasesAsignadas] = useState([]);
  const [loadingClases, setLoadingClases] = useState(true);
  const [paginaClases, setPaginaClases] = useState(1);
  const [totalPaginasClases, setTotalPaginasClases] = useState(1);

  // Estado para clases pendientes de Meet
  const [clasesPendientes, setClasesPendientes] = useState([]);
  const [loadingPendientes, setLoadingPendientes] = useState(true);
  const [linkMeet, setLinkMeet] = useState({});
  const [asignandoMeet, setAsignandoMeet] = useState(null);

  // NUEVO: Estado para validaciones en tiempo real
  const [erroresValidacion, setErroresValidacion] = useState({});

  useEffect(() => {
    cargarClasesAsignadas();
    cargarClasesPendientes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (tabActiva === 'asignadas') {
      cargarClasesAsignadas();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paginaClases]);

  // ==================== CLASES ASIGNADAS ====================

  const cargarClasesAsignadas = async () => {
    console.log('🔄 Cargando clases asignadas...');
    setLoadingClases(true);
    try {
      const result = await profesorService.obtenerMisClases(paginaClases, 10);
      console.log('✅ Respuesta clases asignadas:', result);

      if (result.success) {
        const sesiones = result.data?.sesiones || [];
        console.log('📚 Sesiones asignadas:', sesiones);
        setClasesAsignadas(sesiones);

        const pagination = result.data?.pagination;
        if (pagination) {
          setTotalPaginasClases(pagination.totalPages || 1);
        }
      } else {
        console.error('❌ Error en clases asignadas:', result.message);
        toast.error(result.message);
      }
    } catch (error) {
      console.error('❌ Error catch en clases asignadas:', error);
      toast.error('Error al cargar clases asignadas');
    } finally {
      setLoadingClases(false);
    }
  };

  const abrirMeet = (link) => {
    if (link) {
      window.open(link, '_blank', 'noopener,noreferrer');
    }
  };

  const abrirDocumento = (url) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  // ==================== CLASES PENDIENTES DE MEET ====================

  const cargarClasesPendientes = async () => {
    console.log('🔄 Cargando clases pendientes de Meet...');
    setLoadingPendientes(true);
    try {
      const result = await profesorService.listarPendientesMeet();
      console.log('✅ Respuesta pendientes Meet:', result);

      if (result.success) {
        const pendientes = result.data || [];
        console.log('⏳ Clases pendientes:', pendientes);
        setClasesPendientes(Array.isArray(pendientes) ? pendientes : []);
      } else {
        console.error('❌ Error en pendientes:', result.message);
        toast.error(result.message);
        setClasesPendientes([]);
      }
    } catch (error) {
      console.error('❌ Error catch en pendientes:', error);
      toast.error('Error al cargar clases pendientes');
      setClasesPendientes([]);
    } finally {
      setLoadingPendientes(false);
    }
  };

  // MEJORADO: Validación en tiempo real mientras escribe
  const handleLinkChange = (sesionId, value) => {
    setLinkMeet((prev) => ({
      ...prev,
      [sesionId]: value
    }));

    // Validar en tiempo real si hay contenido
    if (value.trim()) {
      const validacion = profesorService.validarLinkMeetDetallado(value);
      setErroresValidacion((prev) => ({
        ...prev,
        [sesionId]: validacion.valido ? null : validacion.mensaje
      }));
    } else {
      // Limpiar error si está vacío
      setErroresValidacion((prev) => ({
        ...prev,
        [sesionId]: null
      }));
    }
  };

  const handleAsignarMeet = async (sesionId) => {
    const link = linkMeet[sesionId]?.trim();

    if (!link) {
      toast.error('Por favor ingresa un link de Meet');
      setErroresValidacion((prev) => ({
        ...prev,
        [sesionId]: 'El link no puede estar vacío'
      }));
      return;
    }

    console.log('🔄 Asignando Meet a sesión:', sesionId, 'Link:', link);

    // Validar usando el servicio
    const validacion = profesorService.validarLinkMeetDetallado(link);
    if (!validacion.valido) {
      console.error('❌ Link inválido:', validacion.mensaje);
      toast.error(validacion.mensaje);
      setErroresValidacion((prev) => ({
        ...prev,
        [sesionId]: validacion.mensaje
      }));
      return;
    }

    setAsignandoMeet(sesionId);
    try {
      const result = await profesorService.asignarMeetSesion(sesionId, link);
      console.log('✅ Resultado asignar Meet:', result);

      if (result.success) {
        toast.success(
          result.message ||
            'Link de Meet asignado exitosamente. El estudiante recibirá un correo.'
        );
        // Remover de pendientes y limpiar estados
        setClasesPendientes((prev) => prev.filter((s) => s.id !== sesionId));
        setLinkMeet((prev) => {
          const newLinks = { ...prev };
          delete newLinks[sesionId];
          return newLinks;
        });
        setErroresValidacion((prev) => {
          const newErrors = { ...prev };
          delete newErrors[sesionId];
          return newErrors;
        });
        cargarClasesAsignadas();
      } else {
        console.error('❌ Error asignando Meet:', result.message);
        toast.error(result.message);
        setErroresValidacion((prev) => ({
          ...prev,
          [sesionId]: result.message
        }));
      }
    } catch (error) {
      console.error('❌ Error catch asignando Meet:', error);
      toast.error('Error al asignar link de Meet');
    } finally {
      setAsignandoMeet(null);
    }
  };

  // ==================== RENDER ====================

  const renderClasesAsignadas = () => {
    if (loadingClases) {
      return (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Cargando clases...</p>
        </div>
      );
    }

    if (!clasesAsignadas || clasesAsignadas.length === 0) {
      return (
        <div className="empty-state">
          <div className="empty-icon">📚</div>
          <h3>No tienes clases asignadas</h3>
          <p>Cuando tengas clases programadas aparecerán aquí</p>
        </div>
      );
    }

    return (
      <>
        <div className="clases-grid">
          {clasesAsignadas.map((sesion) => {
            const badge = profesorService.obtenerBadgeEstado(sesion.estado);

            return (
              <div key={sesion.id} className="clase-card">
                <div className="clase-header">
                  <span className={`badge ${badge.class}`}>{badge.text}</span>
                  <span className="clase-id">#{sesion.id}</span>
                </div>

                <div className="clase-info">
                  <div className="info-row">
                    <strong>📅 Fecha y Hora:</strong>
                    <span>{profesorService.formatearFechaHora(sesion.fecha_hora)}</span>
                  </div>

                  <div className="info-row">
                    <strong>👤 Estudiante:</strong>
                    <span>
                      {sesion.estudiante?.nombre || 'N/A'}{' '}
                      {sesion.estudiante?.apellido || ''}
                    </span>
                  </div>

                  {sesion.estudiante?.email && (
                    <div className="info-row">
                      <strong>📧 Email:</strong>
                      <span>{sesion.estudiante.email}</span>
                    </div>
                  )}

                  <div className="info-row">
                    <strong>📚 Asignatura:</strong>
                    <span>{sesion.asignatura?.nombre || 'No especificada'}</span>
                  </div>

                  {sesion.descripcion_estudiante && (
                    <div className="info-row descripcion">
                      <strong>📝 Descripción:</strong>
                      <p>{sesion.descripcion_estudiante}</p>
                    </div>
                  )}
                </div>

                <div className="clase-actions">
                  {sesion.link_meet ? (
                    <button
                      onClick={() => abrirMeet(sesion.link_meet)}
                      className="btn-meet"
                    >
                      🎥 Entrar a Meet
                    </button>
                  ) : (
                    <span className="badge badge-pendiente">⏳ Meet pendiente</span>
                  )}

                  {sesion.documento_url && (
                    <button
                      onClick={() => abrirDocumento(sesion.documento_url)}
                      className="btn-documento"
                    >
                      📄 Ver documento
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {totalPaginasClases > 1 && (
          <div className="pagination">
            <button
              onClick={() => setPaginaClases((prev) => Math.max(1, prev - 1))}
              disabled={paginaClases === 1}
              className="btn-pagination"
            >
              ← Anterior
            </button>
            <span className="pagination-info">
              Página {paginaClases} de {totalPaginasClases}
            </span>
            <button
              onClick={() =>
                setPaginaClases((prev) => Math.min(totalPaginasClases, prev + 1))
              }
              disabled={paginaClases === totalPaginasClases}
              className="btn-pagination"
            >
              Siguiente →
            </button>
          </div>
        )}
      </>
    );
  };

  const renderClasesPendientes = () => {
    console.log(
      '🎨 Renderizando clases pendientes, loading:',
      loadingPendientes,
      'cantidad:',
      clasesPendientes.length
    );

    if (loadingPendientes) {
      return (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Cargando clases pendientes...</p>
        </div>
      );
    }

    if (!clasesPendientes || clasesPendientes.length === 0) {
      return (
        <div className="empty-state">
          <div className="empty-icon">✅</div>
          <h3>¡Todo al día!</h3>
          <p>No tienes clases pendientes por asignar Meet</p>
        </div>
      );
    }

    return (
      <div className="clases-grid">
        {clasesPendientes.map((sesion) => {
          if (!sesion || !sesion.id) {
            console.warn('⚠️ Sesión inválida:', sesion);
            return null;
          }

          const error = erroresValidacion[sesion.id];
          const linkActual = linkMeet[sesion.id] || '';
          const esValido = linkActual.trim() && !error;

          return (
            <div
              key={`pendiente-${sesion.id}`}
              className="clase-card pendiente-card"
            >
              <div className="clase-header">
                <span className="badge badge-pendiente">⏳ Pendiente Meet</span>
                <span className="clase-id">#{sesion.id}</span>
              </div>

              <div className="clase-info">
                <div className="info-row">
                  <strong>📅 Fecha y Hora:</strong>
                  <span>{profesorService.formatearFechaHora(sesion.fecha_hora)}</span>
                </div>

                <div className="info-row">
                  <strong>👤 Estudiante:</strong>
                  <span>
                    {sesion.estudiante?.nombre || 'N/A'}{' '}
                    {sesion.estudiante?.apellido || ''}
                  </span>
                </div>

                {sesion.estudiante?.email && (
                  <div className="info-row">
                    <strong>📧 Email:</strong>
                    <span>{sesion.estudiante.email}</span>
                  </div>
                )}

                <div className="info-row">
                  <strong>📚 Asignatura:</strong>
                  <span>{sesion.asignatura?.nombre || 'No especificada'}</span>
                </div>

                {sesion.descripcion_estudiante && (
                  <div className="info-row descripcion">
                    <strong>📝 Descripción:</strong>
                    <p>{sesion.descripcion_estudiante}</p>
                  </div>
                )}

                {sesion.documento_url && (
                  <div className="info-row">
                    <button
                      onClick={() => abrirDocumento(sesion.documento_url)}
                      className="btn-documento-small"
                    >
                      📄 Ver documento adjunto
                    </button>
                  </div>
                )}
              </div>

              <div className="asignar-meet-section">
                <label htmlFor={`meet-${sesion.id}`}>
                  Link de Google Meet: <span className="required">*</span>
                </label>

                <div className="input-wrapper">
                  <input
                    id={`meet-${sesion.id}`}
                    type="text"
                    placeholder="https://meet.google.com/xxx-xxxx-xxx"
                    value={linkActual}
                    onChange={(e) => handleLinkChange(sesion.id, e.target.value)}
                    disabled={asignandoMeet === sesion.id}
                    className={`input-meet ${error ? 'input-error' : ''} ${
                      esValido ? 'input-success' : ''
                    }`}
                  />
                </div>

                {/* Mensaje de error */}
                {error && (
                  <div className="error-message">
                    <span className="error-icon">⚠️</span>
                    {error}
                  </div>
                )}

                {/* Mensaje de ayuda cuando no hay error */}
                {!error && !linkActual.trim() && (
                  <div className="help-message">
                    💡 Ejemplo: https://meet.google.com/abc-defg-hij
                  </div>
                )}

                <button
                  onClick={() => handleAsignarMeet(sesion.id)}
                  disabled={asignandoMeet === sesion.id || !esValido}
                  className={`btn-asignar ${!esValido ? 'btn-disabled' : ''}`}
                >
                  {asignandoMeet === sesion.id ? (
                    <>
                      <span className="spinner-small"></span> Asignando...
                    </>
                  ) : (
                    '✅ Asignar Meet'
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="page">
      <Header />

      <main className="main">
        <div className="mis-clases-container">
          <div className="header-section">
            <h1>📚 Mis Clases</h1>
            <p className="subtitle">
              Gestiona tus clases personalizadas y asigna links de Google Meet
            </p>
          </div>

          <div className="tabs-container">
            <button
              className={`tab ${tabActiva === 'asignadas' ? 'active' : ''}`}
              onClick={() => setTabActiva('asignadas')}
            >
              📋 Clases Asignadas
              {clasesAsignadas && clasesAsignadas.length > 0 && (
                <span className="tab-badge">{clasesAsignadas.length}</span>
              )}
            </button>
            <button
              className={`tab ${tabActiva === 'pendientes' ? 'active' : ''}`}
              onClick={() => setTabActiva('pendientes')}
            >
              ⏳ Pendientes de Meet
              {clasesPendientes && clasesPendientes.length > 0 && (
                <span className="tab-badge alert">{clasesPendientes.length}</span>
              )}
            </button>
          </div>

          <div className="tab-content">
            {tabActiva === 'asignadas'
              ? renderClasesAsignadas()
              : renderClasesPendientes()}
          </div>

          {tabActiva === 'pendientes' &&
            clasesPendientes &&
            clasesPendientes.length > 0 && (
              <div className="info-footer">
                <p>
                  💡 <strong>Nota:</strong> Al asignar el link de Meet, el estudiante
                  recibirá automáticamente un correo electrónico con la información.
                </p>
              </div>
            )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MisClases;
