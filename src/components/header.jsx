import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import '../styles/header.css';
import { useAuth } from '../context/auth_context';

export function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  const { user, logout, is_authenticated, loading } = useAuth();

  const handleLogin = () => {
    navigate('/login');
    closeMenu();
  };

  const handleRegister = () => {
    navigate('/register');
    closeMenu();
  };

  const handleHome = () => {
    // ✅ Si está logueado, enviar a su dashboard según rol
    if (is_authenticated) {
      const rol = user?.rol;

      if (rol === 'administrador') navigate('/admin/dashboard');
      else if (rol === 'profesor') navigate('/profesor/dashboard');
      else if (rol === 'estudiante') navigate('/estudiante/dashboard');
      else navigate('/');

      closeMenu();
      return;
    }

    // ✅ Si no está logueado, se queda igual (home público)
    navigate('/');
    closeMenu();
  };

  const handleSobreNosotros = () => {
    navigate('/about');
    closeMenu();
  };

  const handleMiPerfil = () => {
    const rol = user?.rol;

    if (rol === 'admin') navigate('/admin/dashboard');
    else if (rol === 'profesor') navigate('/profesor/mi-perfil');
    else if (rol === 'estudiante') navigate('/estudiante/dashboard');
    else navigate('/');

    closeMenu();
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
    closeMenu();
  };

  // ✅ Nuevo: en Home hace scroll, en otras rutas navega con query para que Home scrollee
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

      {/* Navegación */}
      <nav className={`header__nav ${menuOpen ? 'active' : ''}`}>
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

      {/* Acciones */}
      <div className={`header__actions ${menuOpen ? 'active' : ''}`}>
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
    </header>
  );
}
