import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/header.css';

export function Header() {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogin = () => {
    navigate('/login');
    closeMenu();
  };

  const handleRegister = () => {
    navigate('/register');
    closeMenu();
  };

  const handleHome = () => {
    navigate('/');
    closeMenu();
  };

  const handleCursos = () => {
    navigate('/cursos');
    closeMenu();
  };

  const handleClases = () => {
    navigate('/clases-personalizadas');
    closeMenu();
  };

  // Función para toggle del menú
  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  // Cerrar menú
  const closeMenu = () => {
    setMenuOpen(false);
  };

  // Prevenir scroll del body cuando el menú está abierto
  useEffect(() => {
    if (menuOpen) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }

    // Cleanup
    return () => {
      document.body.classList.remove('menu-open');
    };
  }, [menuOpen]);

  // Cerrar menú con tecla Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && menuOpen) {
        setMenuOpen(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [menuOpen]);

  // Cerrar menú al cambiar de ruta
  useEffect(() => {
    setMenuOpen(false);
  }, [navigate]);

  return (
    <header className="header">
      {/* Logo clickable */}
      <div 
        className="header_logo" 
        onClick={handleHome}
        style={{ cursor: 'pointer' }}
        role="button"
        tabIndex={0}
        onKeyPress={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            handleHome();
          }
        }}
      >
        PARCHE<br />ACADÉMICO
      </div>

      {/* Botón hamburguesa */}
      <button
        className={`header_hamburger ${menuOpen ? 'active' : ''}`}
        onClick={toggleMenu}
        aria-label="Toggle menu"
        aria-expanded={menuOpen}
      >
        <span className="hamburger_line"></span>
        <span className="hamburger_line"></span>
        <span className="hamburger_line"></span>
      </button>

      {/* Overlay */}
      <div
        className={`header_overlay ${menuOpen ? 'active' : ''}`}
        onClick={closeMenu}
        aria-hidden="true"
      ></div>
      
      {/* Navegación */}
      <nav className={`header_nav ${menuOpen ? 'active' : ''}`}>
        <button 
          className="header_link" 
          onClick={handleCursos}
        >
          CURSOS
        </button>
        <button 
          className="header_link" 
          onClick={handleClases}
        >
          CLASES
        </button>
      </nav>
      
      {/* Acciones */}
      <div className={`header_actions ${menuOpen ? 'active' : ''}`}>
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
