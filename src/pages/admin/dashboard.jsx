// src/pages/admin/dashboard.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/header';
import { Footer } from '../../components/footer';
import { useAuth } from '../../context/auth_context';
import '../../styles/admin_dashboard.css';

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout, is_authenticated, loading } = useAuth();

  useEffect(() => {
    if (!loading && !is_authenticated) {
      navigate('/login');
    }
  }, [is_authenticated, loading, navigate]);

  const handle_logout = async () => {
    await logout();
    navigate('/login');
  };

  if (loading) {
    return <div className="loading">Cargando...</div>;
  }

  return (
    <div className="page">
      <Header />

      <main className="main">
        <div className="dashboard_container">
          <div className="dashboard_header">
            <div className="welcome_section">
              <h1 className="dashboard_title">¡Bienvenido, Admin {user?.nombre}!</h1>
              <p className="dashboard_subtitle">Panel de Administración</p>
            </div>
            <button onClick={handle_logout} className="btn_logout">
              Cerrar Sesión
            </button>
          </div>

          <div className="dashboard_grid">
            {/* Gestión de Profesores (unifica Profesores + Franjas) */}
            <div className="dashboard_card">
              <div className="card_icon">👨‍🏫</div>
              <h2 className="card_title">Gestión de Profesores</h2>
              <p className="card_number">0</p>
              <p className="card_description">Profesores y franjas horarias</p>
              <button
                className="btn_card"
                onClick={() => navigate('/admin/gestion-profesores')}
              >
                Gestionar
              </button>
            </div>

            {/* Total Cursos */}
            <div className="dashboard_card">
              <div className="card_icon">📚</div>
              <h2 className="card_title">Cursos</h2>
              <p className="card_number">0</p>
              <p className="card_description">Cursos activos</p>
              <button className="btn_card" onClick={() => navigate('/admin/asignaturas')}>
                Gestionar Cursos
              </button>
            </div>

            {/* Clases Personalizadas */}
            <div className="dashboard_card">
              <div className="card_icon">📚</div>
              <h2 className="card_title">Clases Personalizadas</h2>
              <p className="card_number">0</p>
              <p className="card_description">Clases Registradas</p>
              <button className="btn_card" onClick={() => navigate('/admin/clases-personalizadas')}>
                Ver Clases
              </button>
            </div>

            {/* cursos */}
            <div className="dashboard_card">
              <div className="card_icon">📖</div>
              <h2 className="card_title">Cursos</h2>
              <p className="card_number">0</p>
              <p className="card_description">Cursos Activos</p>
              <button className="btn_card" onClick={() => navigate('/admin/cursos')}>
                Gestionar Cursos
              </button>
            </div>

            {/* NUEVO: Contabilidad */}
            <div className="dashboard_card">
              <div className="card_icon">💰</div>
              <h2 className="card_title">Contabilidad</h2>
              <p className="card_number">—</p>
              <p className="card_description">Ingresos, pagos y neto por rango</p>
              <button className="btn_card" onClick={() => navigate('/admin/contabilidad')}>
                Ver Contabilidad
              </button>
            </div>

            {/* Clases */}
            <div className="dashboard_card">
              <div className="card_icon">📅</div>
              <h2 className="card_title">Clases</h2>
              <p className="card_number">0</p>
              <p className="card_description">Programadas hoy</p>
              <button className="btn_card">Ver Calendario</button>
            </div>
          </div>

          {/* Información del Admin */}
          <div className="user_info_section">
            <h2 className="section_title">Mi Información</h2>
            <div className="user_info_grid">
              <div className="info_item">
                <span className="info_label">Nombre:</span>
                <span className="info_value">{user?.nombre} {user?.apellido}</span>
              </div>
              <div className="info_item">
                <span className="info_label">Email:</span>
                <span className="info_value">{user?.email}</span>
              </div>
              <div className="info_item">
                <span className="info_label">Teléfono:</span>
                <span className="info_value">{user?.telefono || 'No registrado'}</span>
              </div>
              <div className="info_item">
                <span className="info_label">Rol:</span>
                <span className="info_value">{user?.rol}</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
