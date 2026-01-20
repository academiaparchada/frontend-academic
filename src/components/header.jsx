import { useNavigate } from 'react-router-dom';
import '../styles/header.css'; 

export function Header() {
  const navigate = useNavigate();

  const handleLogin = () => navigate('/login');
  const handleRegister = () => navigate('/register');
  const handleHome = () => navigate('/');
  
  return (
    <header className="header">
      {/* Logo clickable */}
      <div 
        className="header_logo" 
        onClick={handleHome}
        style={{ cursor: 'pointer' }}
      >
        PARCHE<br />ACADÉMICO
      </div>
      
      {/* Navegación con Links para SEO */}
      <nav className="header_nav">
        <button 
          className="header_link" 
          onClick={() => navigate('/cursos')}
        >
          CURSOS
        </button>
        <button 
          className="header_link" 
          onClick={() => navigate('/clases-personalizadas')}
        >
          CLASES
        </button>
      </nav>
      
      {/* Acciones */}
      <div className="header_actions">
        <button 
          className="header_btn header_btn--outline" 
          onClick={handleLogin}
        >
          INICIAR SESIÓN
        </button>
        <button 
          className="header_btn header_btn--solid" 
          onClick={handleRegister}
        >
          REGISTRARSE
        </button>
      </div>
    </header>
  );
}
