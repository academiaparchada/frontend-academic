// src/pages/admin/dashboard.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/header';
import { Footer } from '../../components/footer';
import { useAuth } from '../../context/auth_context';
import adminMetricasService from '../../services/admin_metricas_service';
import contabilidadAdminService from '../../services/contabilidad_admin_service';
import '../../styles/admin_dashboard.css';

export const AdminDashboard = () => {
  const navigate = useNavigate();
  const { user, logout, is_authenticated, loading } = useAuth();

  const [loadingMetricas, setLoadingMetricas] = useState(false);
  const [metricas, setMetricas] = useState(null);

  useEffect(() => {
    if (!loading && !is_authenticated) {
      navigate('/login');
    }
  }, [is_authenticated, loading, navigate]);

  useEffect(() => {
    const cargar = async () => {
      if (loading || !is_authenticated) return;

      setLoadingMetricas(true);
      const res = await adminMetricasService.obtenerMetricas(); // últimos 30 días por backend
      if (res.success) setMetricas(res.data);
      setLoadingMetricas(false);
    };

    cargar();
  }, [loading, is_authenticated]);

  const handle_logout = async () => {
    await logout();
    navigate('/login');
  };

  const estudiantes = metricas?.usuarios?.por_rol?.estudiante ?? 0;
  const profesores = metricas?.usuarios?.por_rol?.profesor ?? 0;
  const cursosTotal = metricas?.cursos?.total ?? 0;
  const cursosActivos = metricas?.cursos?.activos ?? 0;
  const ingresos = metricas?.ingresos?.total_rango ?? 0;

  if (loading) return <div className="loading">Cargando...</div>;

  return (
    <div className="page">
      <Header />

      <main className="main">
        <div className="dashboard_container">
          <div className="dashboard_header">
            <div className="welcome_section">
              <h1 className="dashboard_title">¡Bienvenido, Admin {user?.nombre}!</h1>
              <p className="dashboard_subtitle">
                Panel de Administración {metricas?.rango?.fechaInicio && metricas?.rango?.fechaFin ? `· Rango: ${metricas.rango.fechaInicio} → ${metricas.rango.fechaFin}` : ''}
              </p>
            </div>
            <button onClick={handle_logout} className="btn_logout">
              Cerrar Sesión
            </button>
          </div>

          <div className="dashboard_grid">
            <div className="dashboard_card">
              <div className="card_icon">🎓</div>
              <h2 className="card_title">Estudiantes</h2>
              <p className="card_number">{loadingMetricas ? '…' : estudiantes}</p>
              <p className="card_description">Usuarios con rol estudiante</p>
              <button className="btn_card" onClick={() => navigate('/admin/contabilidad')}>
                Ver en Contabilidad
              </button>
            </div>

            <div className="dashboard_card">
              <div className="card_icon">👨‍🏫</div>
              <h2 className="card_title">Profesores</h2>
              <p className="card_number">{loadingMetricas ? '…' : profesores}</p>
              <p className="card_description">Profesores y franjas horarias</p>
              <button className="btn_card" onClick={() => navigate('/admin/gestion-profesores')}>
                Gestionar
              </button>
            </div>

            <div className="dashboard_card">
              <div className="card_icon">🧑‍💻</div>
              <h2 className="card_title">Clases Personalizadas</h2>
              <p className="card_number">—</p>
              <p className="card_description">Configuración y gestión</p>
              <button className="btn_card" onClick={() => navigate('/admin/clases-personalizadas')}>
                Ver Clases
              </button>
            </div>

            <div className="dashboard_card">
              <div className="card_icon">📚</div>
              <h2 className="card_title">Cursos</h2>
              <p className="card_number">{loadingMetricas ? '…' : `${cursosActivos}/${cursosTotal}`}</p>
              <p className="card_description">Activos / Total</p>
              <button className="btn_card" onClick={() => navigate('/admin/cursos')}>
                Gestionar Cursos
              </button>
            </div>

            <div className="dashboard_card">
              <div className="card_icon">💰</div>
              <h2 className="card_title">Ingresos (rango)</h2>
              <p className="card_number">{loadingMetricas ? '…' : contabilidadAdminService.formatearPrecio(ingresos)}</p>
              <p className="card_description">Compras completadas del rango</p>
              <button className="btn_card" onClick={() => navigate('/admin/contabilidad')}>
                Ver Contabilidad
              </button>
            </div>

            <div className="dashboard_card">
              <div className="card_icon">🧾</div>
              <h2 className="card_title">Asignaturas</h2>
              <p className="card_number">—</p>
              <p className="card_description">Gestión de asignaturas</p>
              <button className="btn_card" onClick={() => navigate('/admin/asignaturas')}>
                Gestionar
              </button>
            </div>
          </div>

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
