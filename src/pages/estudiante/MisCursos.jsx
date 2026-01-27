// src/pages/estudiante/MisCursos.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/auth_context';
import comprasService from '../../services/compras_service';
import { Footer } from '../../components/footer';
import '../../styles/estudiante-css/mis_cursos.css';

const DEFAULT_LIMIT = 10;

const MisCursosEstudiante = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [page, setPage] = useState(1);
  const [limit] = useState(DEFAULT_LIMIT);

  const [cursos, setCursos] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, limit: DEFAULT_LIMIT, returned: 0 });

  const [loading, setLoading] = useState(true);
  const [bloqueado, setBloqueado] = useState(false);
  const [error, setError] = useState('');

  const titulo = useMemo(() => 'Mis cursos', []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    cargar();
  }, [page, navigate]);

  const cargar = async () => {
    try {
      setLoading(true);
      setError('');
      setBloqueado(false);

      if (user?.rol && user.rol !== 'estudiante') {
        setBloqueado(true);
        return;
      }

      // Usar el servicio de compras existente para obtener cursos
      const res = await comprasService.listarMisCompras();

      if (!res.success) {
        if (res.status === 401) {
          navigate('/login');
          return;
        }
        if (res.status === 403) {
          setBloqueado(true);
          return;
        }
        setError(res.message || 'Error cargando cursos');
        return;
      }

      // Filtrar solo las compras de tipo curso
      const cursosComprados = (res.data.compras || []).filter(
        compra => compra.tipo_compra === 'curso' && compra.curso
      );

      setCursos(cursosComprados);
      setPagination({
        page: 1,
        limit: cursosComprados.length,
        returned: cursosComprados.length
      });
    } catch (e) {
      console.error(e);
      setError('Error de conexión. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const getBadgeEstadoClass = (estado) => {
    const e = String(estado || '').toLowerCase();
    if (e === 'pagado') return 'badge-estado';
    if (e === 'pendiente') return 'badge-pendiente';
    if (e === 'fallido') return 'badge-fallido';
    return 'badge-estado';
  };

  const formatearEstado = (estado) => {
    if (!estado) return 'Desconocido';
    return estado.charAt(0).toUpperCase() + estado.slice(1);
  };

  return (
    <>
      <div className="mis-cursos-container">
        {/* Header */}
        <div className="mis-cursos-header">
          <div>
            <h1>{titulo}</h1>
            <p>Revisa tus cursos comprados y accede al contenido disponible</p>
          </div>

          <div className="header-buttons">
            <button className="btn-volver" onClick={() => navigate('/estudiante/dashboard')}>
              Volver
            </button>

            <button className="btn-accion-principal" onClick={() => navigate('/cursos')}>
              Ver todos los cursos
            </button>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Cargando cursos...</p>
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
            <div className="cursos-container">
              {cursos.length === 0 ? (
                <div className="empty-state">
                  <h3>No tienes cursos aún</h3>
                  <p>Cuando compres un curso aparecerá aquí con acceso completo al contenido.</p>
                  <button className="btn-empty" onClick={() => navigate('/cursos')}>
                    Ver cursos disponibles
                  </button>
                </div>
              ) : (
                <div className="cursos-list">
                  {cursos.map((compra) => {
                    const curso = compra.curso;
                    const profesor = curso.profesor
                      ? `${curso.profesor.nombre || ''} ${curso.profesor.apellido || ''}`.trim()
                      : 'Profesor no asignado';
                    const estado = compra.estado_pago || 'Desconocido';
                    const duracion = curso.duracion_horas || 0;

                    return (
                      <div key={compra.id} className="curso-card">
                        <div className="curso-card-header">
                          <span className={`badge ${getBadgeEstadoClass(estado)}`}>
                            {formatearEstado(estado)}
                          </span>
                          <span className="curso-fecha">
                            {comprasService.formatearFecha(compra.fecha_compra)}
                          </span>
                        </div>

                        <div className="curso-card-body">
                          <h3 className="curso-titulo">{curso.nombre}</h3>
                          
                          <div className="curso-detalles">
                            <div className="detalle-item">
                              <span className="label">👨‍🏫 Profesor:</span>
                              <span className="value">{profesor}</span>
                            </div>
                            
                            <div className="detalle-item">
                              <span className="label">⏱️ Duración:</span>
                              <span className="value">{duracion} horas</span>
                            </div>

                            {curso.asignatura && (
                              <div className="detalle-item">
                                <span className="label">📚 Asignatura:</span>
                                <span className="value">{curso.asignatura.nombre}</span>
                              </div>
                            )}

                            {curso.descripcion && (
                              <div className="detalle-item descripcion-completa">
                                <span className="label">📝 Descripción:</span>
                                <p className="value">{curso.descripcion}</p>
                              </div>
                            )}
                          </div>

                          <div className="curso-actions">
                            <button
                              className="btn-continuar"
                              onClick={() => navigate(`/estudiante/compra/${compra.id}`)}
                            >
                              Ver detalle del curso
                            </button>
                            <button
                              className="btn-secundario"
                              onClick={() => navigate('/estudiante/mis-compras')}
                            >
                              Ver todas las compras
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {cursos.length > 0 && (
              <div className="pagination-info-simple">
                <span>Mostrando {cursos.length} curso{cursos.length !== 1 ? 's' : ''}</span>
              </div>
            )}
          </>
        )}   
      </div>
      <Footer />
    </>
  );
};

export default MisCursosEstudiante;