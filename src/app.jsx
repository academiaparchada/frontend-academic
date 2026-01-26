import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Header } from './components/header';
import { Footer } from './components/footer';
import cursosService from './services/cursos_service';
import clasesPersonalizadasService from './services/clases_personalizadas_service';
import './styles/home.css';

// ✅ Nota: reutilizamos clases CSS existentes de:
// - home.css: estructura y secciones (coursessection/featuressection/sectionheader...) [file:67]
// - CursosPublico.css: cards de curso (cursos-publico-grid/curso-publico-card...) [file:69]
// - ClasesPublico.css: cards de clase (clases-grid/clase-card...) [file:66]

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

  return (
    <div className="page">
      <Header />

      <main className="main">
        {/* Hero Section */}
        <section className="hero_section">
          <div className="hero_content">
            <div className="hero_text">
              <div className="hero_badge">
                Plataforma educativa innovadora
              </div>
              <h1 className="hero_title">
                La plataforma de aprendizaje que transforma tu futuro
              </h1>
              <p className="hero_description">
                Reinventando la educación con herramientas inteligentes para optimizar el aprendizaje,
                gestión de cursos, clases personalizadas y seguimiento del progreso.
              </p>
              <div className="hero_buttons">
                <Link to="/register" className="btn_primary">
                  Empieza gratis
                </Link>
                <Link to="/login" className="btn_secondary">
                  Iniciar sesión
                </Link>
              </div>
            </div>

            <div className="hero_image">
              {/* Aquí irán las imágenes flotantes de estudiantes/cursos */}
              <div className="floating_card card_1">
                <img
                  src="../images/seguimiento1.png"
                  alt="Estudiante"
                  className="card_img"
                />
                <div className="card_badge">Sistema de seguimiento</div>
              </div>
              <div className="floating_card card_2">
                <img
                  src="../images/clasenvivo1.png"
                  alt="Estudiante"
                  className="card_img"
                />
                <div className="card_badge">Clases en vivo</div>
              </div>
              <div className="floating_card card_3">
                <img
                  src="../images/pregrabados1.png"
                  alt="Estudiante"
                  className="card_img"
                />
                <div className="card_badge">Cursos pregrabados</div>
              </div>
              <div className="center_logo">
                <div className="logo_circle">
                  <span className="logo_text">PA</span>
                </div>
              </div>
            </div>
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
                        {curso.precio ?? ''}
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
            {/* Cursos Pregrabados */}
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

            {/* Cursos en Vivo */}
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

            {/* Clases Personalizadas */}
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
              {clasesPreview.map((clase) => (
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

                  <div className="clase-info">
                    {clase.duracion_horas ? (
                      <div className="info-item">
                        <span className="icon">⏱️</span>
                        <span>{clase.duracion_horas}h</span>
                      </div>
                    ) : null}
                  </div>

                  {clase.precio ? (
                    <div className="precio-container">
                      <div className="precio-label">Desde</div>
                      <div className="precio-valor">{clase.precio}</div>
                    </div>
                  ) : null}

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
              ))}

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


        {/* Benefits Section */}
        <section className="benefits_section">
          <div className="benefits_container">
            <div className="benefits_content">
              <div className="section_badge">Sistema de gestión de aprendizaje</div>
              <h2 className="section_title">Una plataforma integral de aprendizaje</h2>
              <p className="section_description">
                Desde la inscripción hasta la certificación, Parche Académico te ayuda a identificar y desarrollar
                tu talento de manera eficiente.
              </p>

              <div className="benefits_grid">
                <div className="benefit_item">
                  <div className="benefit_icon">📊</div>
                  <div className="benefit_text">
                    <h4 className="benefit_title">Seguimiento del progreso</h4>
                    <p className="benefit_desc">
                      Monitorea tu avance con dashboards detallados y métricas de rendimiento en tiempo real.
                    </p>
                  </div>
                </div>

                <div className="benefit_item">
                  <div className="benefit_icon">📝</div>
                  <div className="benefit_text">
                    <h4 className="benefit_title">Evaluaciones y tareas</h4>
                    <p className="benefit_desc">
                      Accede a herramientas de evaluación personalizables, cuestionarios y tareas con calificación automática.
                    </p>
                  </div>
                </div>

                <div className="benefit_item">
                  <div className="benefit_icon">🏆</div>
                  <div className="benefit_text">
                    <h4 className="benefit_title">Certificaciones</h4>
                    <p className="benefit_desc">
                      Obtiene certificados verificables al completar cursos y demuestra tus nuevas habilidades.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="benefits_image">
              <img
                src="../images/aprendizaje2.png"
                alt="Dashboard de beneficios"
                className="dashboard_img"
              />
            </div>
          </div>
        </section>

        {/* Additional Features */}
        <section className="extra_features_section">
          <div className="extra_features_grid">
            <div className="extra_card">
              <img
                src="../images/recursos2.png"
                alt="Base de datos"
                className="extra_img"
              />
              <div className="extra_content">
                <h3 className="extra_title">Biblioteca de recursos</h3>
                <p className="extra_description">
                  Gestiona tu contenido en una base de datos centralizada. Accede a recursos, materiales de estudio
                  y contenido complementario en un solo lugar.
                </p>
                <div className="extra_arrow">→</div>
              </div>
            </div>

            <div className="extra_card">
              <div className="extra_content">
                <h3 className="extra_title">Herramientas de evaluación</h3>
                <p className="extra_description">
                  Accede a cuestionarios personalizables, exámenes cronometrados y retroalimentación instantánea
                  para medir tu progreso de manera efectiva.
                </p>
                <div className="extra_arrow">→</div>
              </div>
              <img
                src="../images/evaluacion1.png"
                alt="Evaluaciones"
                className="extra_img"
              />
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="stats_section">
          <div className="stats_badge">Integrándose con Google Classroom</div>
          <div className="stats_grid">
            <div className="stat_item">
              <div className="stat_number">05</div>
              <div className="stat_label">Años de experiencia</div>
            </div>
            <div className="stat_item">
              <div className="stat_number">1000+</div>
              <div className="stat_label">Estudiantes activos</div>
            </div>
            <div className="stat_item">
              <div className="stat_number">50+</div>
              <div className="stat_label">Cursos disponibles</div>
            </div>
            <div className="stat_item">
              <div className="stat_number">95%</div>
              <div className="stat_label">Tasa de satisfacción</div>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="cta_section">
          <div className="cta_content">
            <h2 className="cta_title">¿Listo para transformar tu aprendizaje?</h2>
            <p className="cta_description">
              Únete a miles de estudiantes que ya están mejorando sus habilidades con Parche Académico.
            </p>
            <div className="cta_buttons">
              <Link to="/register" className="btn_cta_primary">
                Empieza ahora
              </Link>
              <Link to="/login" className="btn_cta_secondary">
                Ver cursos
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default App;
