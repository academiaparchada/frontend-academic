// src/pages/profesor/MisCursos.jsx
import { useState, useEffect } from 'react';
import { Header } from '../../components/header';
import { Footer } from '../../components/footer';
import profesorService from '../../services/profesor_service';
import '../../styles/profesor-css/profesor_cursos.css';

export const MisCursos = () => {
  const [cursos, setCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  
  // Modal de inscritos
  const [modalInscritos, setModalInscritos] = useState(false);
  const [inscritosActuales, setInscritosActuales] = useState([]);
  const [cursoSeleccionado, setCursoSeleccionado] = useState(null);
  const [loadingInscritos, setLoadingInscritos] = useState(false);

  useEffect(() => {
    cargarCursos();
  }, [page]);

  const cargarCursos = async () => {
    try {
      setLoading(true);
      const result = await profesorService.obtenerMisCursos(page, 10);
      
      if (result.success) {
        const nuevosCursos = result.data.cursos || result.data || [];
        setCursos(prev => page === 1 ? nuevosCursos : [...prev, ...nuevosCursos]);
        setHasMore(nuevosCursos.length === 10);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Error al cargar cursos');
    } finally {
      setLoading(false);
    }
  };

  const verInscritos = async (curso) => {
    setCursoSeleccionado(curso);
    setModalInscritos(true);
    setLoadingInscritos(true);
    
    try {
      const result = await profesorService.obtenerInscritosCurso(curso.id);
      
      if (result.success) {
        setInscritosActuales(result.data.estudiantes || result.data || []);
      } else {
        setError(result.message);
        setInscritosActuales([]);
      }
    } catch (err) {
      setError('Error al cargar inscritos');
      setInscritosActuales([]);
    } finally {
      setLoadingInscritos(false);
    }
  };

  const cerrarModal = () => {
    setModalInscritos(false);
    setCursoSeleccionado(null);
    setInscritosActuales([]);
  };

  const obtenerBadgeTipo = (tipo) => {
    const badges = {
      'grupal': { text: '👥 Grupal', class: 'badge-grupal' },
      'pregrabado': { text: '🎬 Pregrabado', class: 'badge-pregrabado' }
    };
    return badges[tipo] || badges['grupal'];
  };

  const obtenerBadgeEstado = (estado) => {
    const badges = {
      'activo': { text: '✅ Activo', class: 'badge-activo' },
      'inactivo': { text: '❌ Inactivo', class: 'badge-inactivo' },
      'finalizado': { text: '🏁 Finalizado', class: 'badge-finalizado' }
    };
    return badges[estado] || badges['activo'];
  };

  return (
    <div className="page">
      <Header />
      <main className="main">
        <div className="profesor-cursos-container">
          <h1>🎓 Mis Cursos Asignados</h1>

          {error && <div className="error-message">{error}</div>}

          {loading && page === 1 ? (
            <div className="loading">Cargando cursos...</div>
          ) : (
            <>
              {cursos.length === 0 ? (
                <p className="no-data">No tienes cursos asignados aún.</p>
              ) : (
                <div className="cursos-grid">
                  {cursos.map((curso) => (
                    <div key={curso.id} className="curso-card">
                      <div className="curso-header">
                        <h3>{curso.nombre}</h3>
                        <div className="badges">
                          <span className={`badge ${obtenerBadgeTipo(curso.tipo).class}`}>
                            {obtenerBadgeTipo(curso.tipo).text}
                          </span>
                          <span className={`badge ${obtenerBadgeEstado(curso.estado).class}`}>
                            {obtenerBadgeEstado(curso.estado).text}
                          </span>
                        </div>
                      </div>

                      {curso.descripcion && (
                        <p className="curso-descripcion">{curso.descripcion}</p>
                      )}

                      <div className="curso-info">
                        <div className="info-item">
                          <span className="label">⏱️ Duración:</span>
                          <span className="value">{curso.duracion_horas} horas</span>
                        </div>
                        {curso.fecha_inicio && (
                          <div className="info-item">
                            <span className="label">📅 Inicio:</span>
                            <span className="value">
                              {new Date(curso.fecha_inicio).toLocaleDateString('es-CO')}
                            </span>
                          </div>
                        )}
                        {curso.fecha_fin && (
                          <div className="info-item">
                            <span className="label">🏁 Fin:</span>
                            <span className="value">
                              {new Date(curso.fecha_fin).toLocaleDateString('es-CO')}
                            </span>
                          </div>
                        )}
                      </div>

                      <button 
                        className="btn-ver-inscritos" 
                        onClick={() => verInscritos(curso)}
                      >
                        👥 Ver Inscritos
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {hasMore && !loading && (
                <button className="btn-load-more" onClick={() => setPage(p => p + 1)}>
                  Cargar más
                </button>
              )}
            </>
          )}

          {/* Modal de Inscritos */}
          {modalInscritos && (
            <div className="modal-overlay" onClick={cerrarModal}>
              <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                  <h2>👥 Estudiantes Inscritos</h2>
                  <button className="btn-close" onClick={cerrarModal}>✕</button>
                </div>

                <div className="modal-body">
                  {cursoSeleccionado && (
                    <p className="curso-nombre-modal">{cursoSeleccionado.nombre}</p>
                  )}

                  {loadingInscritos ? (
                    <div className="loading">Cargando inscritos...</div>
                  ) : inscritosActuales.length === 0 ? (
                    <p className="no-data">No hay estudiantes inscritos aún.</p>
                  ) : (
                    <div className="tabla-inscritos">
                      <table>
                        <thead>
                          <tr>
                            <th>Nombre</th>
                            <th>Email</th>
                            <th>Teléfono</th>
                            <th>Fecha Inscripción</th>
                          </tr>
                        </thead>
                        <tbody>
                          {inscritosActuales.map((estudiante) => (
                            <tr key={estudiante.id}>
                              <td>{estudiante.nombre} {estudiante.apellido}</td>
                              <td>{estudiante.email}</td>
                              <td>{estudiante.telefono || 'N/A'}</td>
                              <td>
                                {estudiante.fecha_inscripcion 
                                  ? new Date(estudiante.fecha_inscripcion).toLocaleDateString('es-CO')
                                  : 'N/A'
                                }
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};
