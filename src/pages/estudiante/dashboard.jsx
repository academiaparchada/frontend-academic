// src/pages/estudiante/dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/auth_context';
import { Footer } from '../../components/footer';
import '../../styles/estudiante-css/estudiante_dashboard.css';

export const EstudianteDashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // ✅ INICIALIZAR stats con valores por defecto
  const [stats, setStats] = useState({
    cursos: 0,
    clases: 0,
    paquetes: 0,
    horasDisponibles: 0
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar autenticación
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }

    // Cargar estadísticas
    cargarEstadisticas();
  }, [navigate]);

  const cargarEstadisticas = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      // Obtener compras del estudiante
      const response = await fetch('https://academiaparchada.onrender.com/api/compras/estudiante', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        const compras = data.data?.compras || [];

        // Calcular estadísticas
        const cursos = compras.filter(c => c.tipo_compra === 'curso').length;
        const clases = compras.filter(c => c.tipo_compra === 'clase_personalizada').length;
        const paquetes = compras.filter(c => c.tipo_compra === 'paquete_horas');

        // Calcular total de horas disponibles en paquetes
        const horasDisponibles = paquetes.reduce((total, p) => {
          return total + ((p.horas_totales || 0) - (p.horas_usadas || 0));
        }, 0);

        setStats({
          cursos,
          clases,
          paquetes: paquetes.length,
          horasDisponibles
        });
      } else {
        console.log('No se pudieron cargar las estadísticas');
      }
    } catch (error) {
      console.error('Error al cargar estadísticas:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // ✅ Mostrar loading mientras carga
  if (loading) {
    return (
      <div className="dashboard_container">
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          <div className="spinner"></div>
          <p>Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="dashboard_container">
        {/* Header */}
        <header className="dashboard_header">
          <div className="header_content">
            <h1>Dashboard de Estudiante</h1>
            <p className="welcome_message">
              Bienvenido, <strong>{user?.nombre || 'Estudiante'} {user?.apellido || ''}</strong>
            </p>
          </div>
          <div className="header_actions">
            <button className="btn_profile" onClick={() => navigate('/estudiante/perfil')}>
              👤 Mi Perfil
            </button>
            <button className="btn_logout" onClick={handleLogout}>
              🚪 Cerrar Sesión
            </button>
          </div>
        </header>

        {/* Cards Grid */}
        <div className="dashboard_grid">

          {/* Explorar Cursos */}
          <div className="dashboard_card">
            <div className="card_icon">🎓</div>
            <h2 className="card_title">Explorar Cursos</h2>
            <p className="card_number">{stats.cursos}</p>
            <p className="card_description">Cursos Comprados</p>
            <button
              className="btn_card"
              onClick={() => navigate('/cursos')}
            >
              Ver Catálogo
            </button>
          </div>

          {/* Mis Compras */}
          <div className="dashboard_card">
            <div className="card_icon">📦</div>
            <h2 className="card_title">Mis Compras</h2>
            <p className="card_number">{stats.cursos + stats.clases + stats.paquetes}</p>
            <p className="card_description">Compras Realizadas</p>
            <button
              className="btn_card"
              onClick={() => navigate('/estudiante/mis-compras')}
            >
              Ver Historial
            </button>
          </div>

          {/* Clases Personalizadas */}
          <div className="dashboard_card">
            <div className="card_icon">📝</div>
            <h2 className="card_title">Clases Personalizadas</h2>
            <p className="card_number">{stats.clases}</p>
            <p className="card_description">Clases Compradas</p>
            <button
              className="btn_card"
              onClick={() => navigate('/clases-personalizadas')}
            >
              Explorar Clases
            </button>
          </div>

          {/* Paquetes de Horas */}
          <div className="dashboard_card">
            <div className="card_icon">⏱️</div>
            <h2 className="card_title">Paquetes de Horas</h2>
            <p className="card_number">{stats.horasDisponibles}h</p>
            <p className="card_description">Horas Disponibles</p>
            <button
              className="btn_card"
              onClick={() => navigate('/estudiante/mis-paquetes')}
            >
              Gestionar Paquetes
            </button>
          </div>

          {/* ✅ NUEVA CARD: Mis Clases */}
          <div className="dashboard_card">
            <div className="card_icon">🎥</div>
            <h2 className="card_title">Mis Clases</h2>
            <p className="card_number">{stats.clases}</p>
            <p className="card_description">Ver fecha/hora y Meet</p>
            <button
              className="btn_card"
              onClick={() => navigate('/estudiante/mis-clases')}
            >
              Ver Mis Clases
            </button>
          </div>

          {/* Mis Cursos Activos */}
          <div className="dashboard_card">
            <div className="card_icon">📚</div>
            <h2 className="card_title">Mis Cursos</h2>
            <p className="card_number">{stats.cursos}</p>
            <p className="card_description">Cursos Activos</p>
            <button
              className="btn_card"
              onClick={() => navigate('/estudiante/mis-cursos')}
            >
              Ver Mis Cursos
            </button>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};
