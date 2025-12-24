// src/components/Header.jsx
import '../styles/header.css';

export function Header() {
  return (
    <header className="pa-header">
      <div className="pa-header__logo">PARCHE<br />ACADEMICO</div>

      <nav className="pa-header__nav">
        <button className="pa-header__link">CURSOS</button>
        <button className="pa-header__link">CLASES</button>
      </nav>

      <div className="pa-header__actions">
        <button className="pa-header__btn pa-header__btn--outline">
          INICIAR SESION
        </button>
        <button className="pa-header__btn pa-header__btn--solid">
          REGISTRARSE
        </button>
      </div>
    </header>
  );
}
