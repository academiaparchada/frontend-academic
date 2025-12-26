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
            <h1 className="terms_main_title">Términos y Condiciones & Política de Privacidad</h1>
            <p className="terms_last_updated">Última actualización: Diciembre 2025</p>

            {/* Términos y Condiciones */}
            <section className="terms_section">
              <h2 className="terms_title">Términos y Condiciones</h2>

              <div className="terms_block">
                <h3 className="terms_subtitle">1. Aceptación de los Términos</h3>
                <p className="terms_text">
                  Al acceder y utilizar la plataforma Parche Académico, usted acepta estar sujeto a estos Términos y Condiciones. 
                  Si no está de acuerdo con alguno de estos términos, por favor no utilice nuestra plataforma.
                </p>
              </div>

              <div className="terms_block">
                <h3 className="terms_subtitle">2. Uso de la Plataforma</h3>
                <p className="terms_text">
                  Parche Académico es una plataforma de enseñanza en línea que ofrece cursos y clases con metodologías innovadoras. 
                  Los usuarios se comprometen a:
                </p>
                <ul className="terms_list">
                  <li>Utilizar la plataforma de manera responsable y legal</li>
                  <li>Proporcionar información veraz y actualizada</li>
                  <li>Mantener la confidencialidad de sus credenciales de acceso</li>
                  <li>No compartir el contenido de los cursos sin autorización</li>
                  <li>Respetar los derechos de propiedad intelectual</li>
                </ul>
              </div>

              <div className="terms_block">
                <h3 className="terms_subtitle">3. Registro de Cuenta</h3>
                <p className="terms_text">
                  Para acceder a nuestros servicios, los usuarios deben crear una cuenta proporcionando información precisa y completa. 
                  El usuario es responsable de mantener la seguridad de su contraseña y cuenta.
                </p>
              </div>

              <div className="terms_block">
                <h3 className="terms_subtitle">4. Cursos y Contenido</h3>
                <p className="terms_text">
                  Todo el contenido educativo proporcionado en Parche Académico es de nuestra propiedad o está licenciado para su uso. 
                  Los usuarios tienen acceso al contenido únicamente para uso personal y educativo, no comercial.
                </p>
              </div>

              <div className="terms_block">
                <h3 className="terms_subtitle">5. Pagos y Reembolsos</h3>
                <p className="terms_text">
                  Los precios de los cursos y clases se muestran claramente en la plataforma. Los pagos se procesan de forma segura. 
                  Las políticas de reembolso se aplicarán según lo especificado para cada curso o servicio.
                </p>
              </div>

              <div className="terms_block">
                <h3 className="terms_subtitle">6. Modificaciones</h3>
                <p className="terms_text">
                  Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios serán notificados a los usuarios 
                  y entrarán en vigor inmediatamente después de su publicación.
                </p>
              </div>
            </section>

            {/* Política de Privacidad */}
            <section className="terms_section">
              <h2 className="terms_title">Política de Privacidad</h2>

              <div className="terms_block">
                <h3 className="terms_subtitle">1. Información que Recopilamos</h3>
                <p className="terms_text">
                  Recopilamos la siguiente información de nuestros usuarios:
                </p>
                <ul className="terms_list">
                  <li><strong>Información personal:</strong> nombre, apellido, correo electrónico, teléfono</li>
                  <li><strong>Información de uso:</strong> cursos accedidos, progreso, interacciones en la plataforma</li>
                  <li><strong>Información de pago:</strong> datos necesarios para procesar transacciones (procesados de forma segura)</li>
                  <li><strong>Información técnica:</strong> dirección IP, tipo de navegador, sistema operativo</li>
                </ul>
              </div>

              <div className="terms_block">
                <h3 className="terms_subtitle">2. Cómo Utilizamos su Información</h3>
                <p className="terms_text">
                  Utilizamos la información recopilada para:
                </p>
                <ul className="terms_list">
                  <li>Proporcionar y mejorar nuestros servicios educativos</li>
                  <li>Personalizar la experiencia de aprendizaje</li>
                  <li>Procesar pagos y transacciones</li>
                  <li>Enviar notificaciones importantes sobre cursos y actualizaciones</li>
                  <li>Analizar el uso de la plataforma para mejoras continuas</li>
                  <li>Cumplir con requisitos legales y regulatorios</li>
                </ul>
              </div>

              <div className="terms_block">
                <h3 className="terms_subtitle">3. Protección de Datos</h3>
                <p className="terms_text">
                  Implementamos medidas de seguridad técnicas y organizativas para proteger su información personal contra 
                  acceso no autorizado, pérdida o alteración. Esto incluye:
                </p>
                <ul className="terms_list">
                  <li>Encriptación de datos sensibles</li>
                  <li>Acceso restringido a información personal</li>
                  <li>Monitoreo regular de sistemas de seguridad</li>
                  <li>Capacitación del personal en protección de datos</li>
                </ul>
              </div>

              <div className="terms_block">
                <h3 className="terms_subtitle">4. Compartir Información</h3>
                <p className="terms_text">
                  No vendemos ni compartimos su información personal con terceros, excepto en los siguientes casos:
                </p>
                <ul className="terms_list">
                  <li>Con su consentimiento explícito</li>
                  <li>Para cumplir con obligaciones legales</li>
                  <li>Con proveedores de servicios que nos ayudan a operar la plataforma (bajo acuerdos de confidencialidad)</li>
                  <li>En caso de fusión, adquisición o venta de activos</li>
                </ul>
              </div>

              <div className="terms_block">
                <h3 className="terms_subtitle">5. Cookies y Tecnologías Similares</h3>
                <p className="terms_text">
                  Utilizamos cookies y tecnologías similares para mejorar la funcionalidad de la plataforma, analizar el tráfico 
                  y personalizar el contenido. Puede configurar su navegador para rechazar cookies, aunque esto puede afectar 
                  algunas funcionalidades.
                </p>
              </div>

              <div className="terms_block">
                <h3 className="terms_subtitle">6. Sus Derechos</h3>
                <p className="terms_text">
                  Usted tiene derecho a:
                </p>
                <ul className="terms_list">
                  <li>Acceder a su información personal</li>
                  <li>Corregir datos inexactos o incompletos</li>
                  <li>Solicitar la eliminación de sus datos</li>
                  <li>Oponerse al procesamiento de sus datos</li>
                  <li>Solicitar la portabilidad de sus datos</li>
                  <li>Retirar su consentimiento en cualquier momento</li>
                </ul>
              </div>

              <div className="terms_block">
                <h3 className="terms_subtitle">7. Retención de Datos</h3>
                <p className="terms_text">
                  Conservamos su información personal solo durante el tiempo necesario para cumplir con los propósitos descritos 
                  en esta política, a menos que la ley requiera o permita un período de retención más largo.
                </p>
              </div>

              <div className="terms_block">
                <h3 className="terms_subtitle">8. Menores de Edad</h3>
                <p className="terms_text">
                  Nuestra plataforma está dirigida a personas mayores de 13 años. Si tiene menos de 18 años, debe contar con 
                  el consentimiento de un padre o tutor para utilizar nuestros servicios.
                </p>
              </div>
            </section>

            {/* Contacto */}
            <section className="terms_section">
              <h2 className="terms_title">Contacto</h2>
              <div className="terms_block">
                <p className="terms_text">
                  Si tiene preguntas sobre estos Términos y Condiciones o nuestra Política de Privacidad, 
                  por favor contáctenos a través de:
                </p>
                <ul className="terms_list">
                  <li><strong>Email:</strong> contacto@parcheacademico.com</li>
                  <li><strong>Teléfono:</strong> +57 (XXX) XXX-XXXX</li>
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
