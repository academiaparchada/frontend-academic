// src/pages/estudiante/MisCompras.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import comprasService from '../../services/compras_service';
import { ModalMaterialEstudio } from '../../components/ModalMaterialEstudio';
import { Footer } from '../../components/footer';
import { Header } from '../../components/header';
import '../../styles/estudiante-css/MisCompras.css';

const MisCompras = () => {
  const navigate = useNavigate();
  const [compras, setCompras] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Estados para el modal de material
  const [modalMaterialOpen, setModalMaterialOpen] = useState(false);
  const [cursoSeleccionado, setCursoSeleccionado] = useState(null);

  useEffect(() => {
    cargarCompras();
  }, []);

  const cargarCompras = async () => {
    try {
      setLoading(true);
      const resultado = await comprasService.listarMisCompras();
      
      if (resultado.success) {
        setCompras(resultado.data.compras || []);
      } else {
        setError(resultado.message);
      }
    } catch (err) {
      console.error('Error al cargar compras:', err);
      setError('Error al cargar tus compras');
    } finally {
      setLoading(false);
    }
  };

  const handleVerDetalle = (compra) => {
    if (compra.tipo_compra === 'paquete_horas') {
      navigate(`/estudiante/paquete/${compra.id}`);
    } else {
      navigate(`/estudiante/compra/${compra.id}`);
    }
  };

  const handleVerMaterial = (compra) => {
    setCursoSeleccionado(compra.curso);
    setModalMaterialOpen(true);
  };

  const cerrarModalMaterial = () => {
    setModalMaterialOpen(false);
    setCursoSeleccionado(null);
  };

  const filtrarPorTipo = (tipo) => {
    return compras.filter(c => c.tipo_compra === tipo);
  };

  if (loading) {
    return (
      <div className="page">
        <Header />

        <main className="main">
          <div className="mis-compras-container">
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Cargando tus compras...</p>
            </div>
          </div>
        </main>

        <Footer />
      </div>
    );
  }

  const cursos = filtrarPorTipo('curso');
  const clases = filtrarPorTipo('clase_personalizada');
  const paquetes = filtrarPorTipo('paquete_horas');

  return (
    <div className="page">
      <Header />

      <main className="main">
        <>
          <div className="mis-compras-container">
            <div className="mis-compras-header">
              <div>
                <h1>Mis Compras</h1>
                <p>Historial completo de tus adquisiciones</p>
              </div>
              <button className="btn-volver" onClick={() => navigate('/estudiante/dashboard')}>
                ← Volver al Dashboard
              </button>
            </div>

            {error && (
              <div className="mensaje-error">
                {error}
              </div>
            )}

            {compras.length === 0 && !loading && (
              <div className="sin-compras">
                <h3>📦 No tienes compras aún</h3>
                <p>Explora nuestros cursos y clases disponibles</p>
                <div className="acciones-sin-compras">
                  <button onClick={() => navigate('/cursos')} className="btn-explorar">
                    Ver Cursos
                  </button>
                  <button onClick={() => navigate('/clases-personalizadas')} className="btn-explorar">
                    Ver Clases
                  </button>
                </div>
              </div>
            )}

            {/* Cursos */}
            {cursos.length > 0 && (
              <div className="seccion-compras">
                <h2>🎓 Cursos ({cursos.length})</h2>
                <div className="compras-grid">
                  {cursos.map(compra => {
                    const badgeEstado = comprasService.obtenerBadgeEstadoPago(compra.estado_pago);
                    const pagado = compra.estado_pago === 'pagado';
                    
                    return (
                      <div key={compra.id} className="compra-card">
                        <div className="compra-header">
                          <span className={`badge ${badgeEstado.class}`}>
                            {badgeEstado.text}
                          </span>
                          <span className="fecha-compra">
                            {comprasService.formatearFecha(compra.fecha_compra)}
                          </span>
                        </div>

                        <h3>{compra.curso?.nombre}</h3>
                        
                        <div className="compra-detalles">
                          <div className="detalle">
                            <span className="label">⏱️ Duración:</span>
                            <span className="valor">{compra.curso?.duracion_horas}h</span>
                          </div>
                          <div className="detalle">
                            <span className="label">👨‍🏫 Profesor:</span>
                            <span className="valor">
                              {compra.curso?.profesor?.nombre} {compra.curso?.profesor?.apellido}
                            </span>
                          </div>
                        </div>

                        <div className="compra-footer">
                          <span className="precio">
                            {comprasService.formatearPrecio(compra.monto_total)}
                          </span>
                          <div className="compra-acciones">
                            {pagado && (
                              <button 
                                className="btn-material"
                                onClick={() => handleVerMaterial(compra)}
                                title="Ver material de estudio"
                              >
                                📚 Material
                              </button>
                            )}
                            <button 
                              className="btn-ver-detalle"
                              onClick={() => handleVerDetalle(compra)}
                            >
                              Ver Detalle
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Clases Personalizadas */}
            {clases.length > 0 && (
              <div className="seccion-compras">
                <h2>📝 Clases Personalizadas ({clases.length})</h2>
                <div className="compras-grid">
                  {clases.map(compra => {
                    const badgeEstado = comprasService.obtenerBadgeEstadoPago(compra.estado_pago);
                    
                    return (
                      <div key={compra.id} className="compra-card">
                        <div className="compra-header">
                          <span className={`badge ${badgeEstado.class}`}>
                            {badgeEstado.text}
                          </span>
                          <span className="fecha-compra">
                            {comprasService.formatearFecha(compra.fecha_compra)}
                          </span>
                        </div>

                        <h3>{compra.clase_personalizada?.asignatura?.nombre}</h3>
                        
                        <div className="compra-detalles">
                          <div className="detalle">
                            <span className="label">⏱️ Duración:</span>
                            <span className="valor">{compra.clase_personalizada?.duracion_horas}h</span>
                          </div>
                          {compra.sesion && (
                            <>
                              <div className="detalle">
                                <span className="label">📅 Fecha:</span>
                                <span className="valor">
                                  {comprasService.formatearFechaHora(compra.sesion.fecha_hora)}
                                </span>
                              </div>
                              <div className="detalle">
                                <span className="label">👨‍🏫 Profesor:</span>
                                <span className="valor">
                                  {compra.sesion.profesor?.nombre} {compra.sesion.profesor?.apellido}
                                </span>
                              </div>
                            </>
                          )}
                        </div>

                        <div className="compra-footer">
                          <span className="precio">
                            {comprasService.formatearPrecio(compra.monto_total)}
                          </span>
                          <button 
                            className="btn-ver-detalle"
                            onClick={() => handleVerDetalle(compra)}
                          >
                            Ver Detalle
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Paquetes de Horas */}
            {paquetes.length > 0 && (
              <div className="seccion-compras">
                <h2>📦 Paquetes de Horas ({paquetes.length})</h2>
                <div className="compras-grid">
                  {paquetes.map(compra => {
                    const badgeEstado = comprasService.obtenerBadgeEstadoPago(compra.estado_pago);
                    const horasDisponibles = compra.horas_totales - compra.horas_usadas;
                    
                    return (
                      <div key={compra.id} className="compra-card paquete">
                        <div className="compra-header">
                          <span className={`badge ${badgeEstado.class}`}>
                            {badgeEstado.text}
                          </span>
                          <span className="fecha-compra">
                            {comprasService.formatearFecha(compra.fecha_compra)}
                          </span>
                        </div>

                        <h3>{compra.clase_personalizada?.asignatura?.nombre}</h3>
                        
                        <div className="horas-progress">
                          <div className="horas-info">
                            <span>Usadas: {compra.horas_usadas}/{compra.horas_totales}h</span>
                            <span className={horasDisponibles > 0 ? 'disponibles' : 'agotadas'}>
                              {horasDisponibles > 0 
                                ? `${horasDisponibles}h disponibles` 
                                : 'Agotado'
                              }
                            </span>
                          </div>
                          <div className="progress-bar">
                            <div 
                              className="progress-fill"
                              style={{ 
                                width: `${(compra.horas_usadas / compra.horas_totales) * 100}%` 
                              }}
                            ></div>
                          </div>
                        </div>

                        <div className="compra-footer">
                          <span className="precio">
                            {comprasService.formatearPrecio(compra.monto_total)}
                          </span>
                          <button 
                            className="btn-ver-detalle"
                            onClick={() => handleVerDetalle(compra)}
                          >
                            {horasDisponibles > 0 ? 'Agendar Clase' : 'Ver Detalle'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Modal de Material de Estudio */}
            <ModalMaterialEstudio
              isOpen={modalMaterialOpen}
              onClose={cerrarModalMaterial}
              curso={cursoSeleccionado}
            />
          </div>
        </>
      </main>

      <Footer />
    </div>
  );
};

export default MisCompras;
