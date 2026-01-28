// src/pages/estudiante/MisPaquetes.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import comprasService from '../../services/compras_service';
import { Footer } from '../../components/footer';
import { Header } from '../../components/header';
import '../../styles/estudiante-css/MisPaquetes.css';

const MisPaquetes = () => {
  const navigate = useNavigate();
  const [paquetes, setPaquetes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filtro, setFiltro] = useState('todos'); // 'todos', 'activos', 'agotados'

  useEffect(() => {
    cargarPaquetes();
  }, []);

  const cargarPaquetes = async () => {
    try {
      setLoading(true);
      const resultado = await comprasService.listarMisCompras();
      
      if (resultado.success) {
        // Filtrar solo paquetes de horas
        const soloPaquetes = resultado.data.compras.filter(
          c => c.tipo_compra === 'paquete_horas'
        );
        setPaquetes(soloPaquetes);
      } else {
        setError(resultado.message);
      }
    } catch (err) {
      console.error('Error al cargar paquetes:', err);
      setError('Error al cargar tus paquetes');
    } finally {
      setLoading(false);
    }
  };

  const paquetesFiltrados = () => {
    if (filtro === 'activos') {
      return paquetes.filter(p => {
        const horasDisponibles = p.horas_totales - p.horas_usadas;
        return horasDisponibles > 0;
      });
    } else if (filtro === 'agotados') {
      return paquetes.filter(p => {
        const horasDisponibles = p.horas_totales - p.horas_usadas;
        return horasDisponibles === 0;
      });
    }
    return paquetes;
  };

  const calcularEstadisticas = () => {
    const activos = paquetes.filter(p => (p.horas_totales - p.horas_usadas) > 0);
    const horasTotales = paquetes.reduce((sum, p) => sum + p.horas_totales, 0);
    const horasUsadas = paquetes.reduce((sum, p) => sum + p.horas_usadas, 0);
    const horasDisponibles = horasTotales - horasUsadas;

    return {
      total: paquetes.length,
      activos: activos.length,
      agotados: paquetes.length - activos.length,
      horasTotales,
      horasUsadas,
      horasDisponibles
    };
  };

  const handleVerDetalle = (paqueteId) => {
    navigate(`/estudiante/paquete/${paqueteId}`);
  };

  const handleComprarPaquete = () => {
    navigate('/clases-personalizadas');
  };

  if (loading) {
    return (
      <div className="page">
        <Header />

        <main className="main">
          <div className="mis-paquetes-container">
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Cargando tus paquetes...</p>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  const stats = calcularEstadisticas();
  const paquetesMostrar = paquetesFiltrados();

  return (
    <div className="page">
      <Header />

      <main className="main">
          <div className="mis-paquetes-container">
            {/* Header */}
            <div className="mis-paquetes-header">
              <div>
                <h1>⏱️ Mis Paquetes de Horas</h1>
                <p>Gestiona y agenda tus clases personalizadas</p>
              </div>
              <div className="header-buttons">
                <button 
                  className="btn-comprar-paquete"
                  onClick={handleComprarPaquete}
                >
                  + Comprar Nuevo Paquete
                </button>
                <button 
                  className="btn-volver" 
                  onClick={() => navigate('/estudiante/dashboard')}
                >
                  ← Volver al Dashboard
                </button>
              </div>
            </div>

            {error && (
              <div className="mensaje-error">
                {error}
              </div>
            )}

            {/* Estadísticas Resumidas */}
            {paquetes.length > 0 && (
              <div className="estadisticas-grid">
                <div className="stat-card total">
                  <div className="stat-icon">📦</div>
                  <div className="stat-info">
                    <span className="stat-numero">{stats.total}</span>
                    <span className="stat-label">Paquetes Totales</span>
                  </div>
                </div>

                <div className="stat-card activos">
                  <div className="stat-icon">✅</div>
                  <div className="stat-info">
                    <span className="stat-numero">{stats.activos}</span>
                    <span className="stat-label">Paquetes Activos</span>
                  </div>
                </div>

                <div className="stat-card disponibles">
                  <div className="stat-icon">⏱️</div>
                  <div className="stat-info">
                    <span className="stat-numero">{stats.horasDisponibles}h</span>
                    <span className="stat-label">Horas Disponibles</span>
                  </div>
                </div>

                <div className="stat-card usadas">
                  <div className="stat-icon">📚</div>
                  <div className="stat-info">
                    <span className="stat-numero">{stats.horasUsadas}h</span>
                    <span className="stat-label">Horas Usadas</span>
                  </div>
                </div>
              </div>
            )}

            {/* Filtros */}
            {paquetes.length > 0 && (
              <div className="filtros-container">
                <button 
                  className={`btn-filtro ${filtro === 'todos' ? 'activo' : ''}`}
                  onClick={() => setFiltro('todos')}
                >
                  Todos ({paquetes.length})
                </button>
                <button 
                  className={`btn-filtro ${filtro === 'activos' ? 'activo' : ''}`}
                  onClick={() => setFiltro('activos')}
                >
                  ✅ Activos ({stats.activos})
                </button>
                <button 
                  className={`btn-filtro ${filtro === 'agotados' ? 'activo' : ''}`}
                  onClick={() => setFiltro('agotados')}
                >
                  ⚠️ Agotados ({stats.agotados})
                </button>
              </div>
            )}

            {/* Sin Paquetes */}
            {paquetes.length === 0 && !loading && (
              <div className="sin-paquetes">
                <div className="sin-paquetes-icon">📦</div>
                <h3>No tienes paquetes de horas</h3>
                <p>
                  Los paquetes de horas te permiten comprar múltiples horas de clase 
                  a un mejor precio y agendar tus sesiones cuando lo necesites.
                </p>
                <button 
                  className="btn-comprar-primer-paquete"
                  onClick={handleComprarPaquete}
                >
                  🎓 Comprar Mi Primer Paquete
                </button>
              </div>
            )}

            {/* Lista de Paquetes */}
            {paquetesMostrar.length > 0 && (
              <div className="paquetes-grid">
                {paquetesMostrar.map(paquete => {
                  const horasDisponibles = paquete.horas_totales - paquete.horas_usadas;
                  const porcentajeUsado = (paquete.horas_usadas / paquete.horas_totales) * 100;
                  const badgeEstado = comprasService.obtenerBadgeEstadoPago(paquete.estado_pago);
                  const esActivo = horasDisponibles > 0;
                  
                  return (
                    <div key={paquete.id} className={`paquete-card ${!esActivo ? 'agotado' : ''}`}>
                      {/* Header del Card */}
                      <div className="paquete-card-header">
                        <span className={`badge ${badgeEstado.class}`}>
                          {badgeEstado.text}
                        </span>
                        {!esActivo && (
                          <span className="badge badge-agotado">
                            ⚠️ Agotado
                          </span>
                        )}
                        <span className="fecha-compra">
                          {comprasService.formatearFecha(paquete.fecha_compra)}
                        </span>
                      </div>

                      {/* Contenido Principal */}
                      <div className="paquete-card-body">
                        <h3 className="paquete-titulo">
                          {paquete.clase_personalizada?.asignatura?.nombre || 'Paquete de Horas'}
                        </h3>

                        {/* Círculo de Progreso */}
                        <div className="paquete-progreso">
                          <div className="progreso-circulo">
                            <svg viewBox="0 0 36 36" className="circular-chart">
                              <path
                                className="circle-bg"
                                d="M18 2.0845
                                  a 15.9155 15.9155 0 0 1 0 31.831
                                  a 15.9155 15.9155 0 0 1 0 -31.831"
                              />
                              <path
                                className="circle"
                                strokeDasharray={`${porcentajeUsado}, 100`}
                                d="M18 2.0845
                                  a 15.9155 15.9155 0 0 1 0 31.831
                                  a 15.9155 15.9155 0 0 1 0 -31.831"
                              />
                              <text x="18" y="20.35" className="percentage">
                                {horasDisponibles}h
                              </text>
                            </svg>
                          </div>

                          <div className="progreso-info">
                            <div className="progreso-detalle">
                              <span className="label">Total:</span>
                              <span className="valor">{paquete.horas_totales}h</span>
                            </div>
                            <div className="progreso-detalle">
                              <span className="label">Usadas:</span>
                              <span className="valor usadas">{paquete.horas_usadas}h</span>
                            </div>
                            <div className="progreso-detalle">
                              <span className="label">Disponibles:</span>
                              <span className={`valor ${esActivo ? 'disponibles' : 'agotadas'}`}>
                                {horasDisponibles}h
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Barra de Progreso Lineal */}
                        <div className="barra-progreso">
                          <div 
                            className="barra-fill"
                            style={{ width: `${porcentajeUsado}%` }}
                          ></div>
                        </div>

                        {/* Precio */}
                        <div className="paquete-precio">
                          <span className="precio-label">Total Pagado:</span>
                          <span className="precio-valor">
                            {comprasService.formatearPrecio(paquete.monto_total)}
                          </span>
                        </div>
                      </div>

                      {/* Footer con Botones */}
                      <div className="paquete-card-footer">
                        {esActivo ? (
                          <button 
                            className="btn-agendar-clase"
                            onClick={() => handleVerDetalle(paquete.id)}
                          >
                            📅 Agendar Clase
                          </button>
                        ) : (
                          <button 
                            className="btn-ver-historial"
                            onClick={() => handleVerDetalle(paquete.id)}
                          >
                            📚 Ver Historial
                          </button>
                        )}
                        <button 
                          className="btn-ver-detalle-secundario"
                          onClick={() => handleVerDetalle(paquete.id)}
                        >
                          Ver Detalle →
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Info Box */}
            {paquetes.length > 0 && (
              <div className="info-box">
                <h3>💡 ¿Cómo funcionan los paquetes?</h3>
                <ul>
                  <li>✅ Compra horas a mejor precio que clases individuales</li>
                  <li>📅 Agenda tus clases cuando quieras</li>
                  <li>⏱️ Usa las horas a tu ritmo, sin vencimiento</li>
                  <li>🎯 Enfoca cada sesión en lo que necesites</li>
                </ul>
              </div>
            )}
          </div>
      </main>

      <Footer />
    </div>
  );
};

export default MisPaquetes;
