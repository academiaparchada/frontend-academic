// src/pages/estudiante/MisClases.jsx

import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/auth_context';
import estudianteClasesService from '../../services/estudiante_clases_service';
import '../../styles/estudiante-css/mis_clases.css';

const DEFAULT_LIMIT = 10;

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

      // Si tienes rol en user, lo validamos también en frontend (backend ya valida)
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

  return (
    <div className="mis-clases-container">
      {/* Header */}
      <div className="mis-clases-header">
        <div>
          <h1>{titulo}</h1>
          <p>Revisa la fecha/hora de tu sesión y el link de Meet cuando esté disponible</p>
        </div>

        <div className="header-buttons">
          <button className="btn-volver" onClick={() => navigate('/estudiante/dashboard')}>
            Volver
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

                  const meetValido = estudianteClasesService.esUrlValida(s?.link_meet);
                  const estado = s?.estado || 'Pendiente';
                  const asignatura = s?.clasepersonalizada?.asignatura?.nombre;

                  return (
                    <div key={s.id} className="session-card">
                      <div className="session-card-header">
                        <span className={`badge ${getBadgeEstadoClass(estado)}`}>
                          {estado}
                        </span>

                        {/* ✅ CORRECCIÓN: usar el service (lee localStorage.timezone) */}
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
                              <button
                                className="btn-unirse"
                                onClick={() => window.open(s.link_meet, '_blank')}
                              >
                                Unirse
                              </button>
                            ) : (
                              <button className="btn-disabled" disabled>
                                Link pendiente
                              </button>
                            )}

                            <button
                              className="btn-volver"
                              onClick={() => navigate('/estudiante/mis-compras')}
                            >
                              Ver compras
                            </button>
                          </div>
                        </div>
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

            <span className="pagination-info">
              Página {pagination.page || page}
            </span>

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
  );
};

export default MisClasesEstudiante;
