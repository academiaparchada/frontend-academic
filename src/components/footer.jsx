// src/components/footer.jsx
import '../styles/components-css/footer.css';

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
            <a 
              href="https://www.instagram.com/el_profe_parchao?igsh=bXluMXh4Y3FrZjd6" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="footer_social_link"
              aria-label="Instagram"
            >
              <img 
                src="/images/instagram.png" 
                alt="Instagram" 
                className="footer_social_icon"
              />
            </a>
            <a 
              href="https://www.facebook.com/share/16b75mC6Y3/" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="footer_social_link"
              aria-label="Facebook"
            >
              <img 
                src="/images/facebook.png" 
                alt="Facebook" 
                className="footer_social_icon"
              />
            </a>
            <a 
              href="https://www.tiktok.com/@el_profe_parchao?_r=1&_t=ZS-92X7wSXc2yb" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="footer_social_link"
              aria-label="TikTok"
            >
              <img 
                src="/images/tiktok.png" 
                alt="TikTok" 
                className="footer_social_icon"
              />
            </a>
          </div>
        </div>
      </div>

      <p className="footer_copy">
        © Parche Academico 2025. Todos los derechos reservados
      </p>
    </footer>
  );
}
