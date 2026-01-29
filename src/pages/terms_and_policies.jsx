// src/pages/terms_and_policies.jsx
import { Header } from '../components/header';
import { Footer } from '../components/footer';
import '../styles/terms_and_policies.css';

export const TermsAndPolicies = () => {
  return (
    <div className="page">
      <Header />

      <main className="main">
        <div className="terms_container">
          <div className="terms_content">
            <h1 className="terms_main_title">
              Términos y Condiciones & Política de Privacidad
            </h1>
            <p className="terms_last_updated">Última actualización: Diciembre 2025</p>

            {/* Términos y Condiciones */}
            <section className="terms_section">
              <h2 className="terms_title">Términos y Condiciones</h2>

              <div className="terms_block">
                <h3 className="terms_subtitle">1. Aceptación de los Términos</h3>
                <p className="terms_text">
                  Al acceder, registrarse y utilizar la plataforma Parche Académico, el usuario declara haber leído,
                  entendido y aceptado íntegramente los presentes Términos y Condiciones. Si no está de acuerdo con alguno
                  de ellos, deberá abstenerse de utilizar la plataforma y sus servicios.
                </p>
              </div>

              <div className="terms_block">
                <h3 className="terms_subtitle">2. Uso de la Plataforma</h3>
                <p className="terms_text">
                  Parche Académico ofrece asesorías académicas personalizadas y cursos educativos en modalidad virtual.
                  El usuario se compromete a:
                </p>
                <ul className="terms_list">
                  <li>Utilizar la plataforma de manera responsable, ética y conforme a la ley</li>
                  <li>Proporcionar información veraz, completa y actualizada</li>
                  <li>Mantener la confidencialidad de sus credenciales de acceso</li>
                  <li>No compartir, distribuir ni comercializar el contenido sin autorización</li>
                  <li>Respetar los derechos de propiedad intelectual de Parche Académico y de los docentes</li>
                </ul>
                <p className="terms_text">
                  El uso indebido de la plataforma podrá dar lugar a la suspensión o cancelación del acceso sin derecho a
                  reembolso.
                </p>
              </div>

              <div className="terms_block">
                <h3 className="terms_subtitle">3. Registro de Cuenta</h3>
                <p className="terms_text">
                  Para acceder a los servicios, el usuario deberá crear una cuenta. Es responsable de mantener la
                  seguridad de su contraseña y de todas las actividades realizadas desde su cuenta. Parche Académico no
                  se hace responsable por accesos no autorizados derivados del descuido del usuario.
                </p>
              </div>

              <div className="terms_block">
                <h3 className="terms_subtitle">4. Servicios, Cursos y Contenido</h3>
                <p className="terms_text">
                  Todo el contenido educativo, materiales, explicaciones, recursos y metodologías ofrecidas en Parche
                  Académico son de uso exclusivo personal y educativo. Está prohibida su reproducción, grabación,
                  redistribución o uso con fines comerciales sin autorización expresa.
                </p>
              </div>

              <div className="terms_block">
                <h3 className="terms_subtitle">5. Pagos</h3>
                <p className="terms_text">
                  Los precios de las clases, asesorías y cursos se muestran de forma clara en la plataforma. Todos los
                  pagos se realizan de manera anticipada y a través de medios seguros habilitados por Parche Académico.
                </p>
              </div>

              <div className="terms_block">
                <h3 className="terms_subtitle">6. Cancelaciones, Reembolsos y Reasignaciones</h3>

                <h3 className="terms_subtitle">6.1 Clases y Asesorías Personalizadas</h3>
                <ul className="terms_list">
                  <li>En caso de cancelación por parte del estudiante, el reembolso será del 80 % del valor pagado.</li>
                  <li>
                    El 20 % restante no es reembolsable, ya que cubre gastos administrativos, operativos y de gestión.
                  </li>
                  <li>No se realizan reembolsos por clases ya dictadas o iniciadas.</li>
                </ul>

                <p className="terms_text">Reasignación de clases:</p>
                <ul className="terms_list">
                  <li>Para cambiar la fecha u hora de una clase, el estudiante deberá informar previamente al equipo de soporte.</li>
                  <li>Las solicitudes de reasignación están sujetas a disponibilidad y deben realizarse dentro del horario de atención.</li>
                  <li>Las solicitudes fuera de los canales oficiales o sin previo aviso pueden no ser aceptadas.</li>
                </ul>

                <h3 className="terms_subtitle">6.2 Cursos de Verano</h3>
                <ul className="terms_list">
                  <li>
                    Los cursos de verano solo iniciarán si se alcanza una cantidad mínima de estudiantes inscritos antes de
                    una fecha límite establecida.
                  </li>
                  <li>
                    Tanto la fecha límite como el número mínimo de inscritos estarán claramente indicados en la
                    descripción de cada curso.
                  </li>
                  <li>
                    Si no se cumple dicha condición, se realizará la devolución del 100 % del dinero pagado, sin penalización para el estudiante.
                  </li>
                </ul>
              </div>

              <div className="terms_block">
                <h3 className="terms_subtitle">7. Horarios de Soporte</h3>
                <p className="terms_text">
                  El horario oficial de atención y soporte es de 8:00 a.m. a 6:00 p.m. (hora Colombia). Las solicitudes
                  realizadas fuera de este horario serán atendidas el siguiente día hábil.
                </p>
              </div>

              <div className="terms_block">
                <h3 className="terms_subtitle">8. Modificaciones</h3>
                <p className="terms_text">
                  Parche Académico se reserva el derecho de modificar estos Términos y Condiciones en cualquier momento.
                  Las modificaciones entrarán en vigor desde su publicación en la plataforma y el uso continuo del
                  servicio implica su aceptación.
                </p>
              </div>
            </section>

            {/* Política de Privacidad */}
            <section className="terms_section">
              <h2 className="terms_title">Política de Privacidad</h2>

              <div className="terms_block">
                <h3 className="terms_subtitle">1. Información que Recopilamos</h3>
                <p className="terms_text">
                  Recopilamos información necesaria para la correcta prestación del servicio, incluyendo:
                </p>
                <ul className="terms_list">
                  <li>Datos personales: nombre, correo electrónico, teléfono</li>
                  <li>Información académica y de uso de la plataforma</li>
                  <li>Información de pago (procesada de forma segura por terceros autorizados)</li>
                  <li>Datos técnicos como IP, navegador y sistema operativo</li>
                </ul>
              </div>

              <div className="terms_block">
                <h3 className="terms_subtitle">2. Uso de la Información</h3>
                <p className="terms_text">La información recopilada se utiliza para:</p>
                <ul className="terms_list">
                  <li>Prestar y mejorar los servicios educativos</li>
                  <li>Personalizar la experiencia del usuario</li>
                  <li>Procesar pagos y transacciones</li>
                  <li>Enviar comunicaciones importantes</li>
                  <li>Cumplir con obligaciones legales</li>
                </ul>
              </div>

              <div className="terms_block">
                <h3 className="terms_subtitle">3. Protección de Datos</h3>
                <p className="terms_text">
                  Parche Académico implementa medidas técnicas y organizativas para proteger la información personal,
                  incluyendo encriptación, accesos restringidos y monitoreo constante de seguridad.
                </p>
              </div>

              <div className="terms_block">
                <h3 className="terms_subtitle">4. Compartir Información</h3>
                <p className="terms_text">
                  No vendemos ni compartimos datos personales, salvo en los siguientes casos:
                </p>
                <ul className="terms_list">
                  <li>Con consentimiento del usuario</li>
                  <li>Para cumplir requerimientos legales</li>
                  <li>Con proveedores tecnológicos bajo acuerdos de confidencialidad</li>
                  <li>En procesos de fusión, adquisición o venta de activos</li>
                </ul>
              </div>

              <div className="terms_block">
                <h3 className="terms_subtitle">5. Cookies</h3>
                <p className="terms_text">
                  Utilizamos cookies para mejorar la funcionalidad y experiencia del usuario. El usuario puede
                  desactivarlas desde su navegador, aunque algunas funciones podrían verse limitadas.
                </p>
              </div>

              <div className="terms_block">
                <h3 className="terms_subtitle">6. Derechos del Usuario</h3>
                <p className="terms_text">
                  El usuario puede solicitar acceso, corrección, eliminación u oposición al tratamiento de sus datos
                  personales, así como retirar su consentimiento cuando lo desee.
                </p>
              </div>

              <div className="terms_block">
                <h3 className="terms_subtitle">7. Retención de Datos</h3>
                <p className="terms_text">
                  Los datos personales se conservarán únicamente durante el tiempo necesario para cumplir los fines
                  descritos o según lo exija la ley.
                </p>
              </div>

              <div className="terms_block">
                <h3 className="terms_subtitle">8. Menores de Edad</h3>
                <p className="terms_text">
                  La plataforma está dirigida a personas mayores de 13 años. Los menores de 18 años deben contar con
                  autorización de un padre o tutor legal.
                </p>
              </div>
            </section>

            {/* Contacto */}
            <section className="terms_section">
              <h2 className="terms_title">Contacto</h2>
              <div className="terms_block">
                <p className="terms_text">
                  Para consultas relacionadas con estos Términos y Condiciones o la Política de Privacidad:
                </p>
                <ul className="terms_list">
                  <li>
                    <strong>Email:</strong>{' '}
                    <a href="mailto:soporte@parcheacademico.com">soporte@parcheacademico.com</a>
                  </li>
                  <li>
                    <strong>Teléfono:</strong> +57 3022014966
                  </li>
                </ul>
              </div>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
