// src/pages/profesor/MisClases.jsx
import { useState, useEffect } from 'react';
import { Header } from '../../components/header';
import { Footer } from '../../components/footer';
import profesorService from '../../services/profesor_service';
import '../../styles/profesor_clases.css';

export const MisClases = () => {
  const [clases, setClases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  useEffect(() => {
    cargarClases();
  }, [page]);

  const cargarClases = async () => {
    try {
      setLoading(true);
      const result = await profesorService.obtenerMisClases(page, 10);
      
      if (result.success) {
        const nuevasClases = result.data.sesiones || result.data || [];
        setClases(prev => page === 1 ? nuevasClases : [...prev, ...nuevasClases]);
        setHasMore(nuevasClases.length === 10);
      } else {
        setError(result.message);
      }
    } catch (err) {
      setError('Error al cargar clases');
    } finally {
      setLoading(false);
    }
  };

  const abrirDocumento = (url) => {
    window.open(url, '_blank');
  };

  const abrirMeet = (link) => {
    window.open(link, '_blank');
  };

  return (
    <div className="page">
      <Header />
      <main className="main">
        <div className="profesor-clases-container">
          <h1>📝 Mis Clases Asignadas</h1>

          {error && <div className="error-message">{error}</div>}

          {loading && page === 1 ? (
            <div className="loading">Cargando clases...</div>
          ) : (
            <>
              {clases.length === 0 ? (
                <p className="no-data">No tienes clases asignadas aún.</p>
              ) : (
                <div className="clases-grid">
                  {clases.map((clase) => (
                    <div key={clase.id} className="clase-card">
                      <div className="clase-header">
                        <h3>{clase.asignatura?.nombre || 'Asignatura'}</h3>
                        <span className={`badge ${profesorService.obtenerBadgeEstado(clase.estado).class}`}>
                          {profesorService.obtenerBadgeEstado(clase.estado).text}
                        </span>
                      </div>

                      <div className="clase-info">
                        <p><strong>👤 Estudiante:</strong> {clase.estudiante?.nombre} {clase.estudiante?.apellido}</p>
                        <p><strong>📅 Fecha:</strong> {profesorService.formatearFechaHora(clase.fecha_hora)}</p>
                        {clase.descripcion_estudiante && (
                          <p><strong>📄 Descripción:</strong> {clase.descripcion_estudiante}</p>
                        )}
                      </div>

                      <div className="clase-acciones">
                        {clase.documento_url && (
                          <button className="btn-documento" onClick={() => abrirDocumento(clase.documento_url)}>
                            📎 Ver Documento
                          </button>
                        )}
                        {clase.link_meet && (
                          <button className="btn-meet" onClick={() => abrirMeet(clase.link_meet)}>
                            🎥 Entrar a Meet
                          </button>
                        )}
                      </div>
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
        </div>
      </main>
      <Footer />
    </div>
  );
};
