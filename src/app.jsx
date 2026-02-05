// src/App.jsx (o el archivo donde tienes el Home)
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Header } from './components/header';
import { Footer } from './components/footer';
import cursosService from './services/cursos_service';
import clasesPersonalizadasService from './services/clases_personalizadas_service';
import comprasService from './services/compras_service';
import './styles/home.css';

// ✅ Nota: reutilizamos clases CSS existentes de:
// - home.css: estructura y secciones
// - CursosPublico.css: cards de curso
// - ClasesPublico.css: cards de clase

function App() {
  const location = useLocation();
  const navigate = useNavigate();

  const [cursosPreview, setCursosPreview] = useState([]);
  const [loadingCursos, setLoadingCursos] = useState(false);

  const [clasesPreview, setClasesPreview] = useState([]);
  const [loadingClases, setLoadingClases] = useState(false);

  // ✅ Scroll automático cuando vienes de otra ruta (/?scroll=home-cursos o home-clases)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const targetId = params.get('scroll');

    if (!targetId) return;

    // esperar que renderice el DOM
    setTimeout(() => {
      const el = document.getElementById(targetId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 50);
  }, [location.search]);

  // ✅ Cargar 3 cursos (mismo servicio que CursosPublico.jsx)
  useEffect(() => {
    const cargarCursosPreview = async () => {
      try {
        setLoadingCursos(true);

        const resultado = await cursosService.listarCursos({
          page: 1,
          limit: 3,
          estado: 'activo',
          tipo: ''
        });

        if (resultado?.success) {
          setCursosPreview(resultado.data?.cursos || []);
        } else {
          setCursosPreview([]);
        }
      } catch (e) {
        setCursosPreview([]);
      } finally {
        setLoadingCursos(false);
      }
    };

    cargarCursosPreview();
  }, []);

  // ✅ Cargar 3 clases (mismo servicio que ClasesPersonalizadasPublico.jsx)
  useEffect(() => {
    const cargarClasesPreview = async () => {
      try {
        setLoadingClases(true);

        const resultado = await clasesPersonalizadasService.listarClases();
        if (resultado?.success) {
          const all = resultado.data?.clases || [];
          setClasesPreview(all.slice(0, 3));
        } else {
          setClasesPreview([]);
        }
      } catch (e) {
        setClasesPreview([]);
      } finally {
        setLoadingClases(false);
      }
    };

    cargarClasesPreview();
  }, []);

  const formatearPrecioSeguro = (precio) => {
    if (precio === 0) return 'Gratis';
    if (precio === null || precio === undefined || precio === '') return '—';
    return comprasService.formatearPrecio(precio);
  };

  return (
    <div className="page">
      <Header />

      <main className="main">
        {/* Hero Section - CON EL MISMO ESTILO QUE LAS DEMÁS SECCIONES */}
        <section className="courses_section" id="hero-video-section">
          <div className="section_header">
            <span className="section_badge">✨ Educación innovadora</span>
            <h2 className="section_title">
              Transforma tu Futuro Académico
            </h2>
            <p className="section_description">
              Cursos en vivo, clases personalizadas y contenido pregrabado en una sola plataforma
            </p>
          </div>

          <div className="courses_showcase">
            <video
              className="showcase_video"
              controls
              poster="/images/video-thumbnail.jpg"
              preload="metadata"
              playsInline
              style={{ maxWidth: '100%', width: '100%', height: 'auto' }}
            >
              <source src="/images/hero-video.mp4" type="video/mp4" />
              Tu navegador no soporta videos HTML5.
            </video>
          </div>
        </section>



        {/* ✅ HOME: Clases Personalizadas (preview + ver más) */}
        <section id="home-clases" className="courses_section">
          <div className="section_header">
            <div className="section_badge">Clases personalizadas</div>
            <h2 className="section_title">Agenda clases 1 a 1 o compra paquetes</h2>
            <p className="section_description">
              Selección rápida de materias disponibles. Si quieres ver todas, entra en "Ver más".
            </p>
          </div>

          {loadingClases ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Cargando clases...</p>
            </div>
          ) : (
            <div className="clases-grid">
              {clasesPreview.map((clase) => {
                const descripcionAsignatura =
                  (clase?.descripcion_asignatura && String(clase.descripcion_asignatura).trim()) ||
                  (clase?.asignatura?.descripcion && String(clase.asignatura.descripcion).trim()) ||
                  '';

                return (
                  <div key={clase.id} className="clase-card">
                    {/* Imagen (si existe) */}
                    {clase.imagen_url ? (
                      <div className="clase-imagen">
                        <img
                          src={clase.imagen_url}
                          alt={clase.asignatura?.nombre || 'Clase'}
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      </div>
                    ) : (
                      <div className="clase-icon">🧑‍🏫</div>
                    )}

                    <h3>{clase.asignatura?.nombre || 'Clase personalizada'}</h3>

                    {descripcionAsignatura ? (
                      <p>{descripcionAsignatura}</p>
                    ) : null}

                    <div className="clase-info">
                      {clase.duracion_horas ? (
                        <div className="info-item">
                          <span className="icon">⏱️</span>
                          <span>{clase.duracion_horas}h</span>
                        </div>
                      ) : null}
                    </div>

                    <div className="precio-container">
                      <div className="precio-label">Desde</div>
                      <div className="precio-valor">{formatearPrecioSeguro(clase.precio)}</div>
                    </div>

                    <div className="clase-acciones">
                      <button
                        className="btn-comprar-clase"
                        onClick={() => navigate(`/checkout/clase/${clase.id}`)}
                      >
                        Comprar clase
                      </button>

                      <button
                        className="btn-comprar-paquete"
                        onClick={() => navigate(`/checkout/paquete/${clase.id}`)}
                      >
                        Comprar paquete
                      </button>

                      <p className="ventaja-paquete">
                        💡 Con el paquete puedes agendar tus clases cuando quieras
                      </p>
                    </div>
                  </div>
                );
              })}

              {clasesPreview.length === 0 && (
                <div className="sin-clases" style={{ gridColumn: '1 / -1' }}>
                  <h3>🧑‍🏫 Pronto agregaremos nuevas materias</h3>
                  <p>Vuelve más tarde para ver nuevas opciones.</p>
                </div>
              )}
            </div>
          )}

          <div style={{ maxWidth: 1200, margin: '2rem auto 0', textAlign: 'center' }}>
            <Link to="/clases-personalizadas" className="btn_cta_primary" style={{ display: 'inline-block' }}>
              Ver más clases
            </Link>
          </div>
        </section>

        {/* ✅ HOME: Cursos (preview + ver más) */}
        <section id="home-cursos" className="courses_section">
          <div className="section_header">
            <div className="section_badge">Cursos</div>
            <h2 className="section_title">
              Una solución completa para tu educación
            </h2>
            <p className="section_description">
              Parche Académico te ofrece múltiples opciones de aprendizaje diseñadas para adaptarse a tu estilo de vida.
            </p>
          </div>

          {loadingCursos ? (
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Cargando cursos...</p>
            </div>
          ) : (
            <div className="cursos-publico-grid">
              {cursosPreview.map((curso) => (
                <div key={curso.id} className="curso-publico-card">
                  <div className="curso-tipo-badge">
                    <span>{curso.tipo || 'CURSO'}</span>
                  </div>

                  {/* Imagen (si existe) */}
                  {curso.imagen_url ? (
                    <div className="curso-publico-imagen">
                      <img
                        src={curso.imagen_url}
                        alt={`Curso ${curso.nombre}`}
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    </div>
                  ) : null}

                  <div className="curso-publico-header">
                    <h3>{curso.nombre}</h3>
                    <span className="duracion">
                      ⏱️ {curso.duracion_horas || 0}h
                    </span>
                  </div>

                  <p className="curso-publico-descripcion">
                    {curso.descripcion || 'Curso completo con contenido actualizado'}
                  </p>

                  <div className="curso-publico-footer">
                    <div className="precio-container">
                      <span className="precio-label">Precio</span>
                      <span className="precio-valor">
                        {formatearPrecioSeguro(curso.precio)}
                      </span>
                    </div>

                    <button
                      className="btn-inscribirse"
                      onClick={() => navigate(`/checkout/curso/${curso.id}`)}
                    >
                      Inscribirme
                    </button>
                  </div>
                </div>
              ))}

              {cursosPreview.length === 0 && (
                <div className="sin-cursos" style={{ gridColumn: '1 / -1' }}>
                  <h3>📚 No hay cursos para mostrar</h3>
                  <p>Pronto agregaremos nuevos cursos</p>
                </div>
              )}
            </div>
          )}

          <div style={{ maxWidth: 1200, margin: '0 auto', textAlign: 'center' }}>
            <Link to="/cursos" className="btn_secondary" style={{ display: 'inline-block' }}>
              Ver más cursos
            </Link>
          </div>
        </section>

        {/* Features Grid (se queda como estaba) */}
        <section className="features_section">
          <div className="features_grid">
            <div className="feature_card">
              <div className="feature_icon">📚</div>
              <h3 className="feature_title">Cursos Pregrabados</h3>
              <p className="feature_description">
                Accede a contenido grabado de alta calidad disponible 24/7. Aprende a tu propio ritmo,
                en cualquier momento y desde cualquier lugar.
              </p>
              <ul className="feature_list">
                <li>Acceso ilimitado al contenido</li>
                <li>Aprende a tu propio ritmo</li>
                <li>Recursos descargables</li>
                <li>Certificado al completar</li>
              </ul>
              <div className="feature_arrow">→</div>
            </div>

            <div className="feature_card featured">
              <div className="feature_badge">Más popular</div>
              <div className="feature_icon">🎥</div>
              <h3 className="feature_title">Cursos en Vivo</h3>
              <p className="feature_description">
                Participa en clases programadas con horarios fijos durante varias semanas.
                Interacción en tiempo real con profesores y compañeros.
              </p>
              <ul className="feature_list">
                <li>Clases en vivo interactivas</li>
                <li>Duración de X semanas</li>
                <li>Sesiones de Q&amp;A en tiempo real</li>
                <li>Grupo de estudio colaborativo</li>
              </ul>
              <div className="feature_arrow">→</div>
            </div>

            <div className="feature_card">
              <div className="feature_icon">🧑‍🏫</div>
              <h3 className="feature_title">Clases Personalizadas</h3>
              <p className="feature_description">
                Recibe atención individualizada con clases uno-a-uno adaptadas a tus necesidades específicas
                de aprendizaje.
              </p>
              <ul className="feature_list">
                <li>Sesión privada con profesor</li>
                <li>Horarios flexibles</li>
                <li>Contenido personalizado</li>
                <li>Avance a tu medida</li>
              </ul>
              <div className="feature_arrow">→</div>
            </div>
          </div>
        </section>

        {/* ...el resto del home queda igual... */}
      </main>

      <Footer />
    </div>
  );
}

export default App;
