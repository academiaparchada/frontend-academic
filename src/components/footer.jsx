// src/components/Footer.jsx
import '../styles/footer.css';

export function Footer() {
  return (
    <footer className="pa-footer">
      <div className="pa-footer__top-border" />

      <div className="pa-footer__content">
        <div className="pa-footer__block">
          <div className="pa-footer__logo">PARCHE<br />ACADEMICO</div>
        </div>

        <div className="pa-footer__block">
          <h3 className="pa-footer__title">Quienes somos:</h3>
          <p className="pa-footer__text">
            Empresa de enseñanza<br />
            con metodologías innovadoras<br />
            de fácil aprendizaje
          </p>
        </div>

        <div className="pa-footer__block">
          <h3 className="pa-footer__title">Nuestras Redes:</h3>
          <div className="pa-footer__socials">
            <span className="pa-footer__social">IG</span>
            <span className="pa-footer__social">FB</span>
            <span className="pa-footer__social">TT</span>
          </div>
        </div>
      </div>

      <p className="pa-footer__copy">
        © Parche Academico 2025. Todos los derechos reservados
      </p>
    </footer>
  );
}
