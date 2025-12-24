// src/components/header.jsx
import '../styles/header.css';

export function Header() {
  return (
    <header className="header">
      <div className="header_logo">PARCHE<br />ACADEMICO</div>

      <nav className="header_nav">
        <button className="header_link">CURSOS</button>
        <button className="header_link">CLASES</button>
      </nav>

      <div className="header_actions">
        <button className="header_btn header_btn--outline">
          INICIAR SESION
        </button>
        <button className="header_btn header_btn--solid">
          REGISTRARSE
        </button>
      </div>
    </header>
  );
}
