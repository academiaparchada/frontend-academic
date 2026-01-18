// src/pages/CursosPublico.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import cursosService from '../services/cursos_service';
import '../styles/CursosPublico.css';

const CursosPublico = () => {
  const navigate = useNavigate();
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [filtros, setFiltros] = useState({
    estado: 'activo',
    tipo: ''
  });
  const limit = 12;

  useEffect(() => {
    cargarCursos();
  }, [page, filtros]);

  const cargarCursos = async () => {
    try {
      setLoading(true);
      setError(null);

      const filtrosLimpios = {
        page,
        limit,
        ...Object.fromEntries(
          Object.entries(filtros).filter(([_, v]) => v !== '')
        )
      };

      const resultado = await cursosService.listarCursos(filtrosLimpios);

      if (resultado.success) {
        setCursos(resultado.data.cursos);
        setPagination(resultado.data.pagination);
      } else {
        setError(resultado.message);
      }
    } catch (err) {
      console.error('Error al cargar cursos:', err);
      setError('Error al cargar los cursos');
    } finally {
      setLoading(false);
    }
  };

  const handleInscribirse = (curso) => {
    navigate(`/checkout/curso/${curso.id}`);
  };

  if (loading && cursos.length === 0) {
    return (
      <div className="loading-container">
        <div className="spinner"></div>
        <p>Cargando cursos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h3>❌ Error al cargar cursos</h3>
        <p>{error}</p>
        <button onClick={cargarCursos}>Reintentar</button>
      </div>
    );
  }

  return (
    <div className="cursos-publico-container">
      <header className="cursos-publico-header">
        <h1>Nuestros Cursos</h1>
        <p>Encuentra el curso perfecto para ti y comienza a aprender hoy</p>
      </header>

      <div className="filtros-publico">
        <button
          className={`filtro-btn ${filtros.tipo === '' ? 'active' : ''}`}
          onClick={() => setFiltros({ ...filtros, tipo: '' })}
        >
          Todos
        </button>
        <button
          className={`filtro-btn ${filtros.tipo === 'grupal' ? 'active' : ''}`}
          onClick={() => setFiltros({ ...filtros, tipo: 'grupal' })}
        >
          👥 Grupales
        </button>
        <button
          className={`filtro-btn ${filtros.tipo === 'pregrabado' ? 'active' : ''}`}
          onClick={() => setFiltros({ ...filtros, tipo: 'pregrabado' })}
        >
          🎥 Pregrabados
        </button>
      </div>

      <div className="cursos-publico-grid">
        {cursos.map((curso) => {
          const badgeTipo = cursosService.obtenerBadgeTipo(curso.tipo);

          return (
            <div key={curso.id} className="curso-publico-card">
              <div className="curso-tipo-badge">
                <span className={badgeTipo.class}>{badgeTipo.text}</span>
              </div>

              {/* IMAGEN */}
              {curso.imagen_url ? (
                <div className="curso-publico-imagen">
                  <img
                    src={curso.imagen_url}
                    alt={`Portada del curso ${curso.nombre}`}
                    loading="lazy"
                    onError={(e) => { e.currentTarget.style.display = 'none'; }}
                  />
                </div>
              ) : null}

              <div className="curso-publico-header">
                <h3>{curso.nombre}</h3>
                <span className="duracion">⏱️ {curso.duracion_horas}h</span>
              </div>

              <p className="curso-publico-descripcion">
                {curso.descripcion || 'Curso completo con contenido actualizado'}
              </p>

              <div className="curso-publico-info">
                <div className="info-item">
                  <span className="info-icon">📚</span>
                  <span>{curso.asignatura?.nombre || 'N/A'}</span>
                </div>

                {curso.profesor && (
                  <div className="info-item">
                    <span className="info-icon">👨‍🏫</span>
                    <span>
                      {curso.profesor.nombre} {curso.profesor.apellido}
                    </span>
                  </div>
                )}

                {curso.fecha_inicio && (
                  <div className="info-item">
                    <span className="info-icon">📅</span>
                    <span>
                      Inicia: {cursosService.formatearFecha(curso.fecha_inicio)}
                    </span>
                  </div>
                )}

                {curso.franjas_horarias && curso.franjas_horarias.length > 0 && (
                  <div className="info-item full-width">
                    <span className="info-icon">🕐</span>
                    <div className="horarios-list">
                      {curso.franjas_horarias.slice(0, 2).map((franja, idx) => (
                        <span key={idx} className="horario-badge">
                          {franja.dia_semana} {franja.hora_inicio}
                        </span>
                      ))}
                      {curso.franjas_horarias.length > 2 && (
                        <span className="horario-badge">
                          +{curso.franjas_horarias.length - 2}
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="curso-publico-footer">
                <div className="precio-container">
                  <span className="precio-label">Precio</span>
                  <span className="precio-valor">
                    {cursosService.formatearPrecio(curso.precio)}
                  </span>
                </div>

                <button
                  className="btn-inscribirse"
                  onClick={() => handleInscribirse(curso)}
                >
                  Inscribirme
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {cursos.length === 0 && !loading && (
        <div className="sin-cursos">
          <h3>📚 No hay cursos disponibles</h3>
          <p>Pronto agregaremos nuevos cursos</p>
        </div>
      )}

      {pagination.total_pages > 1 && (
        <div className="pagination-publico">
          <button
            className="btn-page"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            ← Anterior
          </button>

          <span className="page-info">
            Página {page} de {pagination.total_pages}
          </span>

          <button
            className="btn-page"
            disabled={page === pagination.total_pages}
            onClick={() => setPage(page + 1)}
          >
            Siguiente →
          </button>
        </div>
      )}
    </div>
  );
};

export default CursosPublico;
