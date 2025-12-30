// src/pages/estudiante/DetallePaquete.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import comprasService from '../../services/compras_service';
import '../../styles/DetallePaquete.css';

const DetallePaquete = () => {
  const { compraId } = useParams();
  const navigate = useNavigate();
  
  const [paquete, setPaquete] = useState(null);
  const [sesiones, setSesiones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });
  
  // Modal de agendar
  const [modalAbierto, setModalAbierto] = useState(false);
  const [procesando, setProcesando] = useState(false);
  
  const [nuevaSesion, setNuevaSesion] = useState({
    fecha_hora: '',
    duracion_horas: 1,
    descripcion_estudiante: ''
  });

  const [errores, setErrores] = useState({});

  useEffect(() => {
    cargarDatos();
  }, [compraId]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const resultado = await comprasService.obtenerDetallePaquete(compraId);
      
      if (resultado.success) {
        setPaquete(resultado.data);
        setSesiones(resultado.sesiones || []);
      } else {
        setError(resultado.message);
      }
    } catch (err) {
      console.error('Error al cargar paquete:', err);
      setError('Error al cargar el paquete');
    } finally {
      setLoading(false);
    }
  };

  const handleChangeSesion = (e) => {
    const { name, value } = e.target;
    setNuevaSesion(prev => ({
      ...prev,
      [name]: name === 'duracion_horas' ? parseInt(value) : value
    }));

    if (errores[name]) {
      setErrores(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validarFormulario = () => {
    const nuevosErrores = {};

    if (!nuevaSesion.fecha_hora) {
      nuevosErrores.fecha_hora = 'La fecha y hora son obligatorias';
    } else {
      const fechaSeleccionada = new Date(nuevaSesion.fecha_hora);
      const ahora = new Date();
      
      if (fechaSeleccionada <= ahora) {
        nuevosErrores.fecha_hora = 'La fecha debe ser futura';
      }
    }

    if (nuevaSesion.duracion_horas < 1 || nuevaSesion.duracion_horas > (paquete?.horas_disponibles || 0)) {
      nuevosErrores.duracion_horas = `Debes seleccionar entre 1 y ${paquete?.horas_disponibles} hora(s)`;
    }

    if (!nuevaSesion.descripcion_estudiante || nuevaSesion.descripcion_estudiante.trim().length < 10) {
      nuevosErrores.descripcion_estudiante = 'Describe qué necesitas (mínimo 10 caracteres)';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleAgendarSesion = async (e) => {
    e.preventDefault();
    
    if (!validarFormulario()) {
      setMensaje({ tipo: 'error', texto: 'Por favor corrige los errores del formulario' });
      return;
    }

    setProcesando(true);
    setMensaje({ tipo: '', texto: '' });

    try {
      const datosSesion = {
        fecha_hora: comprasService.convertirFechaAISO(nuevaSesion.fecha_hora),
        duracion_horas: nuevaSesion.duracion_horas,
        descripcion_estudiante: nuevaSesion.descripcion_estudiante
      };

      const resultado = await comprasService.agendarSesionPaquete(compraId, datosSesion);

      if (resultado.success) {
        setMensaje({ 
          tipo: 'exito', 
          texto: '¡Sesión agendada exitosamente!' 
        });

        // Limpiar formulario
        setNuevaSesion({
          fecha_hora: '',
          duracion_horas: 1,
          descripcion_estudiante: ''
        });

        // Recargar datos
        setTimeout(() => {
          setModalAbierto(false);
          setMensaje({ tipo: '', texto: '' });
          cargarDatos();
        }, 2000);
      } else {
        setMensaje({ tipo: 'error', texto: resultado.message });
      }
    } catch (err) {
      console.error('Error al agendar sesión:', err);
      setMensaje({ tipo: 'error', texto: 'Error al agendar la sesión' });
    } finally {
      setProcesando(false);
    }
  };

  const abrirModal = () => {
    if ((paquete?.horas_disponibles || 0) <= 0) {
      alert('No tienes horas disponibles para agendar');
      return;
    }
    setModalAbierto(true);
    setMensaje({ tipo: '', texto: '' });
  };

  if (loading) {
    return (
      <div className="detalle-paquete-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Cargando información...</p>
        </div>
      </div>
    );
  }

  if (error || !paquete) {
    return (
      <div className="detalle-paquete-container">
        <div className="error-mensaje">
          <h3>❌ Error</h3>
          <p>{error || 'Paquete no encontrado'}</p>
          <button onClick={() => navigate('/estudiante/mis-compras')}>
            Volver a Mis Compras
          </button>
        </div>
      </div>
    );
  }

  const horasDisponibles = paquete.horas_totales - paquete.horas_usadas;
  const porcentajeUsado = (paquete.horas_usadas / paquete.horas_totales) * 100;

  return (
    <div className="detalle-paquete-container">
      <div className="detalle-header">
        <button className="btn-volver" onClick={() => navigate('/estudiante/mis-compras')}>
          ← Volver
        </button>
        <h1>Detalle del Paquete</h1>
      </div>

      <div className="paquete-info-principal">
        <div className="info-card">
          <h2>📦 {paquete.clase_personalizada?.asignatura?.nombre}</h2>
          
          <div className="horas-resumen">
            <div className="horas-circle">
              <div className="circle-content">
                <span className="horas-numero">{horasDisponibles}</span>
                <span className="horas-label">hora(s) disponible(s)</span>
              </div>
              <svg className="circle-progress" viewBox="0 0 100 100">
                <circle cx="50" cy="50" r="45" className="circle-bg"></circle>
                <circle 
                  cx="50" 
                  cy="50" 
                  r="45" 
                  className="circle-fill"
                  style={{
                    strokeDasharray: `${porcentajeUsado * 2.827} 282.7`
                  }}
                ></circle>
              </svg>
            </div>

            <div className="horas-detalles">
              <div className="detalle-item">
                <span className="label">Total:</span>
                <span className="valor">{paquete.horas_totales}h</span>
              </div>
              <div className="detalle-item">
                <span className="label">Usadas:</span>
                <span className="valor usado">{paquete.horas_usadas}h</span>
              </div>
              <div className="detalle-item">
                <span className="label">Disponibles:</span>
                <span className="valor disponible">{horasDisponibles}h</span>
              </div>
            </div>
          </div>

          <div className="info-adicional">
            <div className="info-row">
              <span className="icon">💰</span>
              <div>
                <span className="label">Monto Total</span>
                <strong>{comprasService.formatearPrecio(paquete.monto_total)}</strong>
              </div>
            </div>

            <div className="info-row">
              <span className="icon">📅</span>
              <div>
                <span className="label">Fecha de Compra</span>
                <strong>{comprasService.formatearFecha(paquete.fecha_compra)}</strong>
              </div>
            </div>

            <div className="info-row">
              <span className="icon">✅</span>
              <div>
                <span className="label">Estado</span>
                <span className={`badge badge-${paquete.estado_pago}`}>
                  {paquete.estado_pago === 'completado' ? 'Pagado' : paquete.estado_pago}
                </span>
              </div>
            </div>
          </div>

          {horasDisponibles > 0 && (
            <button className="btn-agendar-principal" onClick={abrirModal}>
              📅 Agendar Nueva Clase
            </button>
          )}
        </div>
      </div>

      {/* Lista de sesiones */}
      <div className="sesiones-section">
        <h2>📚 Mis Clases ({sesiones.length})</h2>
        
        {sesiones.length === 0 ? (
          <div className="sin-sesiones">
            <p>📅 Aún no has agendado ninguna clase</p>
            {horasDisponibles > 0 && (
              <button className="btn-agendar-vacio" onClick={abrirModal}>
                Agendar mi Primera Clase
              </button>
            )}
          </div>
        ) : (
          <div className="sesiones-lista">
            {sesiones.map(sesion => (
              <div key={sesion.id} className="sesion-card">
                <div className="sesion-fecha">
                  <span className="fecha-dia">
                    {new Date(sesion.fecha_hora).toLocaleDateString('es-CO', { day: 'numeric' })}
                  </span>
                  <span className="fecha-mes">
                    {new Date(sesion.fecha_hora).toLocaleDateString('es-CO', { month: 'short' })}
                  </span>
                </div>

                <div className="sesion-info">
                  <div className="sesion-header">
                    <h3>{comprasService.formatearFechaHora(sesion.fecha_hora)}</h3>
                    <span className={`badge-estado ${sesion.estado}`}>
                      {sesion.estado === 'programada' ? '⏳ Programada' : 
                       sesion.estado === 'completada' ? '✅ Completada' : 
                       '❌ Cancelada'}
                    </span>
                  </div>

                  {sesion.descripcion_estudiante && (
                    <p className="sesion-descripcion">
                      {sesion.descripcion_estudiante}
                    </p>
                  )}

                  {sesion.profesor && (
                    <div className="sesion-profesor">
                      <span className="icon">👨‍🏫</span>
                      <span>
                        {sesion.profesor.nombre} {sesion.profesor.apellido}
                      </span>
                      {sesion.profesor.email && (
                        <span className="profesor-contacto">
                          📧 {sesion.profesor.email}
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal para agendar */}
      {modalAbierto && (
        <div className="modal-overlay" onClick={() => setModalAbierto(false)}>
          <div className="modal-contenido" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>📅 Agendar Nueva Clase</h2>
              <button 
                className="btn-cerrar" 
                onClick={() => setModalAbierto(false)}
                disabled={procesando}
              >
                ×
              </button>
            </div>

            <form onSubmit={handleAgendarSesion} className="modal-form">
              {mensaje.texto && (
                <div className={`mensaje ${mensaje.tipo}`}>
                  {mensaje.texto}
                </div>
              )}

              <div className="form-group">
                <label>Fecha y Hora *</label>
                <input
                  type="datetime-local"
                  name="fecha_hora"
                  value={nuevaSesion.fecha_hora}
                  onChange={handleChangeSesion}
                  disabled={procesando}
                  className={errores.fecha_hora ? 'input-error' : ''}
                  min={new Date().toISOString().slice(0, 16)}
                />
                {errores.fecha_hora && (
                  <span className="error">{errores.fecha_hora}</span>
                )}
              </div>

              <div className="form-group">
                <label>Duración (horas) *</label>
                <select
                  name="duracion_horas"
                  value={nuevaSesion.duracion_horas}
                  onChange={handleChangeSesion}
                  disabled={procesando}
                  className={errores.duracion_horas ? 'input-error' : ''}
                >
                  {Array.from({ length: Math.min(horasDisponibles, 5) }, (_, i) => i + 1).map(h => (
                    <option key={h} value={h}>
                      {h} hora{h > 1 ? 's' : ''}
                    </option>
                  ))}
                </select>
                {errores.duracion_horas && (
                  <span className="error">{errores.duracion_horas}</span>
                )}
                <span className="help-text">
                  Tienes {horasDisponibles} hora(s) disponible(s)
                </span>
              </div>

              <div className="form-group">
                <label>¿Qué necesitas aprender? *</label>
                <textarea
                  name="descripcion_estudiante"
                  value={nuevaSesion.descripcion_estudiante}
                  onChange={handleChangeSesion}
                  placeholder="Ej: Necesito ayuda con derivadas parciales..."
                  rows="4"
                  disabled={procesando}
                  className={errores.descripcion_estudiante ? 'input-error' : ''}
                ></textarea>
                {errores.descripcion_estudiante && (
                  <span className="error">{errores.descripcion_estudiante}</span>
                )}
              </div>

              <div className="modal-acciones">
                <button 
                  type="button"
                  className="btn-cancelar"
                  onClick={() => setModalAbierto(false)}
                  disabled={procesando}
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="btn-guardar"
                  disabled={procesando}
                >
                  {procesando ? (
                    <>
                      <div className="spinner-small"></div>
                      Agendando...
                    </>
                  ) : (
                    '✅ Agendar Clase'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default DetallePaquete;
