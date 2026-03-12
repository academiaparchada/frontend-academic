// src/components/header.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/auth_context';
import { useSessionModal } from '../context/session_modal_context'; // NUEVO
import '../styles/header.css';

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const { user, logout, is_authenticated, loading } = useAuth();
  const { showLogoutConfirmation } = useSessionModal(); // NUEVO

  const handleLogin = () => {
    navigate('/login');
    closeMenu();
  };

  const handleRegister = () => {
    navigate('/register');
    closeMenu();
  };

  const handleHome = () => {
    if (is_authenticated) {
      const rol = user?.rol;

      if (rol === 'administrador' || rol === 'admin') {
        navigate('/admin/dashboard');
      } else if (rol === 'profesor' || rol === 'teacher') {
        navigate('/profesor/dashboard');
      } else if (rol === 'estudiante' || rol === 'student') {
        navigate('/estudiante/dashboard');
      } else {
        navigate('/');
      }

      closeMenu();
      return;
    }

    navigate('/');
    closeMenu();
  };

  const handleSobreNosotros = () => {
    navigate('/about');
    closeMenu();
  };

  const handleMiPerfil = () => {
    const rol = user?.rol;

    if (rol === 'administrador' || rol === 'admin') {
      navigate('/admin/dashboard');
    } else if (rol === 'profesor' || rol === 'teacher') {
      navigate('/profesor/mi-perfil');
    } else if (rol === 'estudiante' || rol === 'student') {
      navigate('/estudiante/mi-perfil');
    } else {
      navigate('/');
    }

    closeMenu();
  };

  // MODIFICADO: Ahora muestra modal de confirmación
  const handleLogout = () => {
    closeMenu(); // Cerrar menú móvil primero
    showLogoutConfirmation(); // Mostrar modal de confirmación
  };

  const goToHomeSection = (sectionId) => {
    if (location.pathname === '/') {
      const el = document.getElementById(sectionId);
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      closeMenu();
      return;
    }

    navigate(`/?scroll=${sectionId}`);
    closeMenu();
  };

  const handleCursos = () => goToHomeSection('home-cursos');
  const handleClases = () => goToHomeSection('home-clases');

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const closeMenu = () => {
    setMenuOpen(false);
  };

  // Prevenir scroll cuando el menú móvil está abierto
  useEffect(() => {
    if (menuOpen) {
      document.body.classList.add('menu-open');
    } else {
      document.body.classList.remove('menu-open');
    }

    return () => {
      document.body.classList.remove('menu-open');
    };
  }, [menuOpen]);

  // Cerrar menú con tecla ESC
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
  }, [location.pathname]);

  return (
    <header className="header">
      {/* Logo clickable */}
      <div
        className="header__logo"
        onClick={handleHome}
        style={{ cursor: 'pointer' }}
        role="button"
        tabIndex={0}
        onKeyPress={(e) => {
          if (e.key === 'Enter') handleHome();
        }}
      >
        PARCHE<br />
        ACADÉMICO
      </div>

      {/* Botón hamburguesa */}
      <button
        className={`header__hamburger ${menuOpen ? 'active' : ''}`}
        onClick={toggleMenu}
        aria-label="Toggle menu"
        aria-expanded={menuOpen}
      >
        <span className="hamburger__line"></span>
        <span className="hamburger__line"></span>
        <span className="hamburger__line"></span>
      </button>

      {/* Overlay */}
      <div
        className={`header__overlay ${menuOpen ? 'active' : ''}`}
        onClick={closeMenu}
        aria-hidden="true"
      />

      {/* Desktop NAV */}
      <nav className="header__nav header__nav--desktop">
        <button className="header__link" onClick={handleCursos}>
          CURSOS
        </button>
        <button className="header__link" onClick={handleClases}>
          CLASES
        </button>
        <button className="header__link" onClick={handleSobreNosotros}>
          SOBRE NOSOTROS
        </button>
      </nav>

      {/* Desktop ACTIONS */}
      <div className="header__actions header__actions--desktop">
        {!loading && !is_authenticated && (
          <>
            <button
              className="header__btn header__btn--outline"
              onClick={handleLogin}
            >
              INICIAR SESIÓN
            </button>
            <button
              className="header__btn header__btn--solid"
              onClick={handleRegister}
            >
              REGISTRARSE
            </button>
          </>
        )}

        {!loading && is_authenticated && (
          <>
            <button
              className="header__btn header__btn--outline"
              onClick={handleMiPerfil}
            >
              MI PERFIL
            </button>
            <button
              className="header__btn header__btn--solid"
              onClick={handleLogout}
            >
              CERRAR SESIÓN
            </button>
          </>
        )}
      </div>

      {/* Mobile menu */}
      <div className={`header__mobileMenu ${menuOpen ? 'active' : ''}`}>
        <nav className="header__mobileNav">
          <button className="header__link" onClick={handleCursos}>
            CURSOS
          </button>
          <button className="header__link" onClick={handleClases}>
            CLASES
          </button>
          <button className="header__link" onClick={handleSobreNosotros}>
            SOBRE NOSOTROS
          </button>
        </nav>

        <div className="header__mobileActions">
          {!loading && !is_authenticated && (
            <>
              <button
                className="header__btn header__btn--outline"
                onClick={handleLogin}
              >
                INICIAR SESIÓN
              </button>
              <button
                className="header__btn header__btn--solid"
                onClick={handleRegister}
              >
                REGISTRARSE
              </button>
            </>
          )}

          {!loading && is_authenticated && (
            <>
              <button
                className="header__btn header__btn--outline"
                onClick={handleMiPerfil}
              >
                MI PERFIL
              </button>
              <button
                className="header__btn header__btn--solid"
                onClick={handleLogout}
              >
                CERRAR SESIÓN
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
