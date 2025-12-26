// src/app.jsx
import { Link } from 'react-router-dom';
import { Header } from './components/header';
import { Footer } from './components/footer';
import './styles/home.css';

function App() {
  return (
    <div className="page">
      <Header />

      <main className="main">
        {/* Hero Section */}
        <section className="hero_section">
          <div className="hero_content">
            <div className="hero_text">
              <div className="hero_badge">Plataforma educativa innovadora</div>
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
                <div className="card_badge">Sistema de seguimiento</div>
                <img src="/images/hero-student-1.jpg" alt="Estudiante" className="card_img" />
              </div>
              <div className="floating_card card_2">
                <img src="/images/hero-student-2.jpg" alt="Estudiante" className="card_img" />
                <div className="card_badge">Clases en vivo</div>
              </div>
              <div className="floating_card card_3">
                <img src="/images/hero-student-3.jpg" alt="Estudiante" className="card_img" />
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

        {/* Cursos Section */}
        <section className="courses_section">
          <div className="section_header">
            <div className="section_badge">Modalidades de aprendizaje</div>
            <h2 className="section_title">Una solución completa para tu educación</h2>
            <p className="section_description">
              Parche Académico te ofrece múltiples opciones de aprendizaje diseñadas para adaptarse a tu estilo de vida.
            </p>
          </div>

          <div className="courses_showcase">
            <img src="/images/courses-dashboard.jpg" alt="Panel de cursos" className="showcase_image" />
          </div>
        </section>

        {/* Features Grid */}
        <section className="features_section">
          <div className="features_grid">
            {/* Cursos Pregrabados */}
            <div className="feature_card">
              <div className="feature_icon">🎥</div>
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
              <div className="feature_icon">📺</div>
              <h3 className="feature_title">Cursos en Vivo</h3>
              <p className="feature_description">
                Participa en clases programadas con horarios fijos durante varias semanas. Interacción
                en tiempo real con profesores y compañeros.
              </p>
              <ul className="feature_list">
                <li>Clases en vivo interactivas</li>
                <li>Duración de X semanas</li>
                <li>Sesiones de Q&A en tiempo real</li>
                <li>Grupo de estudio colaborativo</li>
              </ul>
              <div className="feature_arrow">→</div>
            </div>

            {/* Clases Personalizadas */}
            <div className="feature_card">
              <div className="feature_icon">🎯</div>
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
              <img src="/images/benefits-dashboard.jpg" alt="Dashboard de beneficios" className="dashboard_img" />
            </div>
          </div>
        </section>

        {/* Additional Features */}
        <section className="extra_features_section">
          <div className="extra_features_grid">
            <div className="extra_card">
              <img src="/images/feature-database.jpg" alt="Base de datos" className="extra_img" />
              <div className="extra_content">
                <h3 className="extra_title">Biblioteca de recursos</h3>
                <p className="extra_description">
                  Gestiona tu contenido en una base de datos centralizada. Accede a recursos, materiales de estudio y
                  contenido complementario en un solo lugar.
                </p>
                <div className="extra_arrow">→</div>
              </div>
            </div>

            <div className="extra_card">
              <div className="extra_content">
                <h3 className="extra_title">Herramientas de evaluación</h3>
                <p className="extra_description">
                  Accede a cuestionarios personalizables, exámenes cronometrados y retroalimentación instantánea para
                  medir tu progreso de manera efectiva.
                </p>
                <div className="extra_arrow">→</div>
              </div>
              <img src="/images/feature-evaluation.jpg" alt="Evaluaciones" className="extra_img" />
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
