// src/pages/profesor/dashboard.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/header';
import { Footer } from '../../components/footer';
import { useAuth } from '../../context/auth_context';
import profesorService from '../../services/profesor_service';
import '../../styles/profesor-css/profesor_dashboard.css';

export const ProfesorDashboard = () => {
  const navigate = useNavigate();
  const { user, logout, is_authenticated, loading } = useAuth();
  const [stats, setStats] = useState({
    clases: 0,
    cursos: 0,
    horarios: 0,
  });

  useEffect(() => {
    if (!loading && !is_authenticated) {
      navigate('/login');
    } else if (is_authenticated) {
      cargarEstadisticas();
    }
  }, [is_authenticated, loading, navigate]);

  const cargarEstadisticas = async () => {
    try {
      const [clases, cursos, horarios, asignaturas] = await Promise.all([
        profesorService.obtenerMisClases(1, 1),
        profesorService.obtenerMisCursos(1, 1),
        profesorService.obtenerMisHorarios(),
      ]);

      setStats({
        clases: clases.success ? (clases.data.total || 0) : 0,
        cursos: cursos.success ? (cursos.data.total || 0) : 0,
        horarios: horarios.success ? (horarios.data.franjas?.length || 0) : 0,
      });
    } catch (err) {
      console.error('Error cargando estadísticas:', err);
    }
  };

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
          </div>

          <div className="dashboard_grid">
            {/* Mis Clases */}
            <div className="dashboard_card" onClick={() => navigate('/profesor/mis-clases')}>
              <div className="card_icon">📝</div>
              <h2 className="card_title">Mis Clases</h2>
              <p className="card_description">Clases Asignadas</p>
              <button className="btn_card">Ver Clases</button>
            </div>

            {/* Mis Cursos */}
            <div className="dashboard_card" onClick={() => navigate('/profesor/mis-cursos')}>
              <div className="card_icon">🎓</div>
              <h2 className="card_title">Mis Cursos</h2>
              <p className="card_description">Cursos Asignados</p>
              <button className="btn_card">Ver Cursos</button>
            </div>

            {/* Mis Horarios */}
            <div className="dashboard_card" onClick={() => navigate('/profesor/franjas-horarias')}>
              <div className="card_icon">🕐</div>
              <h2 className="card_title">Mis Horarios</h2>
              <p className="card_description">Franjas Registradas</p>
              <button className="btn_card">Gestionar Horarios</button>
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
            <button className="btn-editar-perfil" onClick={() => navigate('/profesor/mi-perfil')}>
              ⚙️ Editar Perfil
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
