// src/pages/profesor/dashboard.jsx
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/header';
import { Footer } from '../../components/footer';
import { useAuth } from '../../context/auth_context';
import '../../styles/profesor_dashboard.css';

export const ProfesorDashboard = () => {
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
              <h1 className="dashboard_title">¡Bienvenido, Profesor {user?.nombre}!</h1>
              <p className="dashboard_subtitle">Dashboard de Profesor</p>
            </div>
            <button onClick={handle_logout} className="btn_logout">
              Cerrar Sesión
            </button>
          </div>

          <div className="dashboard_grid">
            {/* Mis franjas */}
            <div className="dashboard_card">
              <div className="card_icon">📚</div>
              <h2 className="card_title">Mi Franja Horaria </h2>
              <p className="card_number">0</p>
              <p className="card_description">Franjas Registradas</p>
              <button className="btn_card" onClick={() => navigate('/profesor/franjas-horarias')}>Gestionar Franjas</button>
            </div>

          </div>

          {/* Información del Profesor */}
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
