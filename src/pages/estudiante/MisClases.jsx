import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/auth_context';
import estudianteClasesService from '../../services/estudiante_clases_service';
import { Header } from '../../components/header';
import { Footer } from '../../components/footer';
import '../../styles/estudiante-css/mis_clases.css';

const DEFAULT_LIMIT = 10;

const API_URL = import.meta.env.VITE_API_URL || 'https://api.parcheacademico.com';

const MisClasesEstudiante = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [page, setPage] = useState(1);
  const [limit] = useState(DEFAULT_LIMIT);

  const [sesiones, setSesiones] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: DEFAULT_LIMIT, returned: 0 });

  const [loading, setLoading] = useState(true);
  const [bloqueado, setBloqueado] = useState(false);
  const [error, setError] = useState('');

  // ✅ Cancelación: estados UI
  const [modalCancelarAbierto, setModalCancelarAbierto] = useState(false);
  const [modalCanceladoAbierto, setModalCanceladoAbierto] = useState(false);
  const [cancelando, setCancelando] = useState(false);

  const [sesionParaCancelar, setSesionParaCancelar] = useState(null);
  const [motivoCancelacion, setMotivoCancelacion] = useState('');
  const [errorCancelacion, setErrorCancelacion] = useState('');
  const [resultadoCancelacion, setResultadoCancelacion] = useState(null);

  const titulo = useMemo(() => 'Mis clases personalizadas', []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    cargar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const cargar = async () => {
    try {
      setLoading(true);
      setError('');
      setBloqueado(false);

      if (user?.rol && user.rol !== 'estudiante') {
        setBloqueado(true);
        return;
      }

      const res = await estudianteClasesService.listarMisClases(page, limit);

      if (!res.success) {
        if (res.status === 401) {
          navigate('/login');
          return;
        }
        if (res.status === 403) {
          setBloqueado(true);
          return;
        }
        setError(res.message || 'Error cargando clases');
        return;
      }

      setSesiones(res.data.sesiones);
      setPagination(res.data.pagination);
    } catch (e) {
      console.error(e);
      setError('Error de conexión. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const puedeIrAtras = page > 1;
  const puedeIrAdelante = (pagination?.returned || 0) >= limit;

  const getBadgeEstadoClass = (estado) => {
    const e = String(estado || '').toLowerCase();
    if (e.includes('cancel')) return 'badge-fallido';
    if (e.includes('fall')) return 'badge-fallido';
    if (e.includes('pend')) return 'badge-pendiente';
    return 'badge-estado';
  };

  const esProgramada = (estado) => String(estado || '').toLowerCase() === 'programada';

  const abrirModalCancelar = (sesion) => {
    setSesionParaCancelar(sesion);
    setMotivoCancelacion('');
    setErrorCancelacion('');
    setResultadoCancelacion(null);
    setModalCancelarAbierto(true);
  };

  const cerrarModalCancelar = () => {
    if (cancelando) return;
    setModalCancelarAbierto(false);
    setSesionParaCancelar(null);
    setMotivoCancelacion('');
    setErrorCancelacion('');
  };

  const cerrarModalCancelado = () => {
    setModalCanceladoAbierto(false);
    setResultadoCancelacion(null);
  };

  const cancelarSesion = async () => {
    if (!sesionParaCancelar?.id) return;

    try {
      setCancelando(true);
      setErrorCancelacion('');

      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }

      const motivo = (motivoCancelacion || '').trim();
      const body = motivo ? { motivo } : {};

      const url = `${API_URL}/api/sesiones-cancel/${sesionParaCancelar.id}/cancelar`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
      });

      const json = await response.json().catch(() => null);

      if (!response.ok || !json?.success) {
        const status = response.status;
        const msg =
          json?.message ||
          (status === 404
            ? 'Sesión no encontrada.'
            : status === 403
            ? 'No autorizado para cancelar esta sesión.'
            : status === 400
            ? 'No se puede cancelar esta sesión.'
            : 'No se pudo cancelar la sesión.');

        setErrorCancelacion(msg);

        // Recomendación: si el backend dice 400 por estado, refrescar listado (posible desync)
        if (status === 400) {
          await cargar();
        }
        return;
      }

      setResultadoCancelacion(json.data || null);
      setModalCancelarAbierto(false);
      setModalCanceladoAbierto(true);

      // Refrescar para que ya salga como cancelada y desaparezca el botón
      await cargar();
    } catch (e) {
      console.error(e);
      setErrorCancelacion('Error de conexión. Intenta de nuevo.');
    } finally {
      setCancelando(false);
    }
  };

  return (
    <>
      <Header />

      <div className="mis-clases-container">
        {/* Header */}
        <div className="mis-clases-header">
          <div>
            <h1>{titulo}</h1>
            <p>Revisa la fecha/hora de tu sesión y el link de Meet cuando esté disponible</p>
          </div>

          <div className="header-buttons">
            <button className="btn-volver" onClick={() => navigate('/estudiante/dashboard')}>
              ← Volver
            </button>

            <button className="btn-accion-principal" onClick={() => navigate('/clases-personalizadas')}>
              Comprar clase
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Cargando clases...</p>
          </div>
        )}

        {/* Bloqueado */}
        {!loading && bloqueado && (
          <div className="mensaje-error">
            <h3>Acceso restringido</h3>
            <p>Esta vista es solo para estudiantes.</p>
            <button className="btn-accion-principal" onClick={() => navigate('/login')}>
              Ir a login
            </button>
          </div>
        )}

        {/* Error */}
        {!loading && !bloqueado && error && (
          <div className="mensaje-error">
            <h3>Error</h3>
            <p>{error}</p>
            <button className="btn-accion-principal" onClick={cargar}>
              Reintentar
            </button>
          </div>
        )}

        {/* Contenido */}
        {!loading && !bloqueado && !error && (
          <>
            <div className="sessions-container">
              {sesiones.length === 0 ? (
                <div className="empty-state">
                  <h3>No tienes clases personalizadas aún</h3>
                  <p>Cuando compres y/o agendes una sesión, aparecerá aquí.</p>
                  <button className="btn-empty" onClick={() => navigate('/clases-personalizadas')}>
                    Ver clases personalizadas
                  </button>
                </div>
              ) : (
                <div className="sessions-list">
                  {sesiones.map((s) => {
                    const profesor = s?.profesor
                      ? `${s.profesor.nombre || ''} ${s.profesor.apellido || ''}`.trim()
                      : 'Profesor por asignar';

                    const profesorEmail = s?.profesor?.email || 'No disponible';

                    const meetValido = estudianteClasesService.esUrlValida(s?.link_meet);
                    const estado = s?.estado || 'Pendiente';
                    const asignatura = s?.clasepersonalizada?.asignatura?.nombre;

                    const mostrarBtnCancelar = esProgramada(estado);

                    return (
                      <div key={s.id} className="session-card">
                        <div className="session-card-header">
                          <span className={`badge ${getBadgeEstadoClass(estado)}`}>{estado}</span>

                          <span className="session-fecha">
                            {estudianteClasesService.formatearFechaHora(s.fecha_hora)}
                          </span>
                        </div>

                        <div className="session-card-body">
                          <div className="session-main">
                            <div className="session-info">
                              <div className="session-row">
                                <span className="label">Profesor</span>
                                <span className="value">{profesor}</span>
                              </div>

                              <div className="session-row">
                                <span className="label">Email profesor</span>
                                <span className="value">{profesorEmail}</span>
                              </div>

                              <div className="session-row">
                                <span className="label">Meet</span>
                                <span className="value">
                                  {meetValido ? (
                                    <a href={s.link_meet} target="_blank" rel="noreferrer">
                                      Unirse a la clase
                                    </a>
                                  ) : (
                                    'Pendiente por asignar'
                                  )}
                                </span>
                              </div>

                              {!!s?.descripcion_estudiante && (
                                <div className="session-row">
                                  <span className="label">Descripción</span>
                                  <span className="value">{s.descripcion_estudiante}</span>
                                </div>
                              )}

                              {!!s?.documento_url && (
                                <div className="session-row">
                                  <span className="label">Documento</span>
                                  <span className="value">
                                    <a href={s.documento_url} target="_blank" rel="noreferrer">
                                      Ver archivo
                                    </a>
                                  </span>
                                </div>
                              )}
                            </div>

                            <div className="session-actions">
                              {meetValido ? (
                                <button className="btn-unirse" onClick={() => window.open(s.link_meet, '_blank')}>
                                  Unirse
                                </button>
                              ) : (
                                <button className="btn-disabled" disabled>
                                  Link pendiente
                                </button>
                              )}

                              <button className="btn-volver" onClick={() => navigate('/estudiante/mis-compras')}>
                                Ver compras
                              </button>
                            </div>
                          </div>

                          {/* ✅ Botón nuevo abajo de la tarjeta (solo si está programada) */}
                          {mostrarBtnCancelar && (
                            <div className="session-cancel-row">
                              <button
                                className="btn-cancelar-sesion"
                                onClick={() => abrirModalCancelar(s)}
                              >
                                Cancelar sesión
                              </button>
                            </div>
                          )}
                        </div>

                        {!!asignatura && (
                          <div className="session-footer">
                            <span className="tag">{asignatura}</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="pagination-bar">
              <button
                className="btn-paginacion"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={!puedeIrAtras}
              >
                ← Anterior
              </button>

              <span className="pagination-info">Página {pagination.page || page}</span>

              <button
                className="btn-paginacion"
                onClick={() => setPage((p) => p + 1)}
                disabled={!puedeIrAdelante}
              >
                Siguiente →
              </button>
            </div>
          </>
        )}
      </div>

      {/* ✅ Modal confirmación cancelar */}
      {modalCancelarAbierto && (
        <div className="modal-cancel-overlay" onClick={cerrarModalCancelar}>
          <div className="modal-cancel-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-cancel-header">
              <h3>¿Seguro que deseas cancelar?</h3>
              <button className="modal-cancel-close" onClick={cerrarModalCancelar} disabled={cancelando}>
                ×
              </button>
            </div>

            <p className="modal-cancel-text">
              Esta acción no podrá revertirse, y recuerda:
              <strong>Será devuelto solo el 80%</strong> del  valor de la clase, según nuestros terminos y condiciones.
            </p>

            <div className="modal-cancel-field">
              <label>Motivo (opcional)</label>
              <textarea
                value={motivoCancelacion}
                onChange={(e) => setMotivoCancelacion(e.target.value)}
                maxLength={1000}
                rows={4}
                placeholder="Ej: Tuve un imprevisto y no podré asistir."
                disabled={cancelando}
              />
              <div className="modal-cancel-hint">{motivoCancelacion.length}/1000</div>
            </div>

            {!!errorCancelacion && <div className="modal-cancel-error">{errorCancelacion}</div>}

            <div className="modal-cancel-actions">
              <button className="modal-btn-secondary" onClick={cerrarModalCancelar} disabled={cancelando}>
                Volver
              </button>
              <button className="modal-btn-danger" onClick={cancelarSesion} disabled={cancelando}>
                {cancelando ? 'Cancelando...' : 'Confirmar cancelación'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ✅ Modal éxito */}
      {modalCanceladoAbierto && (
        <div className="modal-cancel-overlay" onClick={cerrarModalCancelado}>
          <div className="modal-cancel-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-cancel-header">
              <h3>Sesión cancelada</h3>
              <button className="modal-cancel-close" onClick={cerrarModalCancelado}>
                ×
              </button>
            </div>

            <p className="modal-cancel-text">
              La sesión fue cancelada exitosamente.
            </p>

            {!!resultadoCancelacion?.politica_reembolso && (
              <div className="modal-cancel-reembolso">
                <div>
                  <span className="label">Reembolso (estimado)</span>
                </div>
                <div className="value">
                  {resultadoCancelacion.politica_reembolso.porcentaje}% — ${Number(resultadoCancelacion.politica_reembolso.monto_estimado || 0).toLocaleString('es-CO')}
                </div>
              </div>
            )}

            <div className="modal-cancel-actions">
              <button className="modal-btn-secondary" onClick={cerrarModalCancelado}>
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
};

export default MisClasesEstudiante;
