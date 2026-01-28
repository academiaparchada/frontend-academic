// src/pages/about.jsx
import { Header } from '../components/header';
import { Footer } from '../components/footer';
import '../styles/ClasesPublico.css';

export const About = () => {
  const whatsappNumber = '573022014966';
  const whatsappLink = `https://wa.me/${whatsappNumber}`;

  return (
    <div className="page">
      <Header />

      <main className="main">
        <div className="clases-publico-container">
          <header className="clases-header">
            <h1>Sobre nosotros</h1>
            <p>Conoce qué es Parche Académico y cómo podemos ayudarte</p>
          </header>

          <div className="clases-grid">
            <div className="clase-card">
              <div className="clase-info">
                <h3>¿Qué es Parche Académico?</h3>
                <p>
                  Parche Académico es una plataforma de apoyo académico dedicada a brindar asesorías personalizadas y de alta calidad para estudiantes de colegio y educación superior.
                </p>
                <p>
                  Nuestro enfoque está centrado en el aprendizaje claro, estructurado y efectivo, con el objetivo de obtener resultados reales en el desempeño académico.
                </p>
              </div>
            </div>

            <div className="clase-card">
              <div className="clase-info">
                <h3>Nuestro enfoque</h3>
                <p>
                  Trabajamos con estudiantes que presentan dificultades en asignaturas como matemáticas, física y química, así como con aquellos que buscan reforzar y profundizar sus conocimientos.
                </p>
                <p>
                  Cada asesoría es diseñada de forma individual, teniendo en cuenta el nivel del estudiante, sus objetivos académicos y el contexto de la asignatura.
                </p>
              </div>
            </div>

            <div className="clase-card">
              <div className="clase-info">
                <h3>Nuestro compromiso</h3>
                <p>
                  En Parche Académico creemos que una buena explicación puede marcar la diferencia entre aprobar o reprobar una materia.
                </p>
                <p>
                  Por eso, nuestro acompañamiento no se limita a una clase, sino que busca generar comprensión, seguimiento y confianza durante todo el proceso.
                </p>
              </div>
            </div>

            <div className="clase-card">
              <div className="clase-info">
                <h3>Contacto</h3>
                <p>
                  📲 WhatsApp:{' '}
                  <a href={whatsappLink} target="_blank" rel="noreferrer">
                    +57 302 2014966
                  </a>
                </p>
                <p>
                  📧 Correo:{' '}
                  <a href="mailto:academia.parchada@gmail.com">
                    academia.parchada@gmail.com
                  </a>
                </p>
              </div>

              <div className="clase-acciones" style={{ padding: '1rem' }}>
                <a
                  className="btn-comprar-clase"
                  href={whatsappLink}
                  target="_blank"
                  rel="noreferrer"
                >
                  Hablar por WhatsApp
                </a>

                <a
                  className="btn-comprar-paquete"
                  href="mailto:academia.parchada@gmail.com"
                >
                  Escribir por correo
                </a>

                <p className="ventaja-paquete">
                  Respondemos lo más pronto posible para ayudarte a agendar tu asesoría.
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
