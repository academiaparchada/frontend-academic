// src/components/footer.jsx
import '../styles/footer.css';

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer_border" />

      <div className="footer_content">
        <div className="footer_block">
          <div className="footer_logo">PARCHE<br />ACADEMICO</div>
        </div>

        <div className="footer_block">
          <h3 className="footer_title">Quienes somos:</h3>
          <p className="footer_text">
            Empresa de enseñanza<br />
            con metodologías innovadoras<br />
            de fácil aprendizaje
          </p>
        </div>

        <div className="footer_block">
          <h3 className="footer_title">Nuestras Redes:</h3>
          <div className="footer_socials">
            <span className="footer_social">IG</span>
            <span className="footer_social">FB</span>
            <span className="footer_social">TT</span>
          </div>
        </div>
      </div>

      <p className="footer_copy">
        © Parche Academico 2025. Todos los derechos reservados
      </p>
    </footer>
  );
}
