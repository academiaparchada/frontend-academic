// src/components/header.jsx
import { useNavigate } from 'react-router-dom';
import '../styles/header.css';

export function Header() {
  const navigate = useNavigate();

  const handle_login = () => {
    navigate('/login');
  };

  const handle_register = () => {
    navigate('/register');
  };

  const handle_home = () => {
    navigate('/');
  };

  return (
    <header className="header">
      <div className="header_logo" onClick={handle_home} style={{cursor: 'pointer'}}>
        PARCHE<br />ACADEMICO
      </div>

      <nav className="header_nav">
        <button className="header_link">CURSOS</button>
        <button className="header_link">CLASES</button>
      </nav>

      <div className="header_actions">
        <button className="header_btn header_btn--outline" onClick={handle_login}>
          INICIAR SESION
        </button>
        <button className="header_btn header_btn--solid" onClick={handle_register}>
          REGISTRARSE
        </button>
      </div>
    </header>
  );
}
