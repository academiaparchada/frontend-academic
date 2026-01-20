// src/pages/estudiante/DetalleCompra.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Header } from '../../components/header';
import { Footer } from '../../components/footer';
import { ModalMaterialEstudio } from '../../components/ModalMaterialEstudio';
import comprasService from '../../services/compras_service';
import '../../styles/DetalleCompra.css';

const DetalleCompra = () => {
  const navigate = useNavigate();
  const { compraId } = useParams();
  const [compra, setCompra] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Estados para el modal de material
  const [modalMaterialOpen, setModalMaterialOpen] = useState(false);

  useEffect(() => {
    cargarDetalleCompra();
  }, [compraId]);

  const cargarDetalleCompra = async () => {
    try {
      setLoading(true);
      const resultado = await comprasService.listarMisCompras();
      
      if (resultado.success) {
        const compraEncontrada = resultado.data.compras.find(c => c.id === compraId);
        if (compraEncontrada) {
          setCompra(compraEncontrada);
        } else {
          setError('Compra no encontrada');
        }
      } else {
        setError(resultado.message);
      }
    } catch (err) {
      console.error('Error al cargar detalle:', err);
      setError('Error al cargar el detalle de la compra');
    } finally {
      setLoading(false);
    }
  };

  const handleVerMaterial = () => {
    setModalMaterialOpen(true);
  };

  const cerrarModalMaterial = () => {
    setModalMaterialOpen(false);
  };

  if (loading) {
    return (
      <div className="page">
        <Header />
        <main className="main">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <p>Cargando detalle...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !compra) {
    return (
      <div className="page">
        <Header />
        <main className="main">
          <div className="error-container">
            <h2>❌ {error || 'Compra no encontrada'}</h2>
            <button className="btn-back" onClick={() => navigate('/estudiante/mis-compras')}>
              Volver a Mis Compras
            </button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const badgeEstado = comprasService.obtenerBadgeEstadoPago(compra.estado_pago);
  const esCurso = compra.tipo_compra === 'curso';
  const estaPagado = compra.estado_pago === 'pagado';

  return (
    <div className="page">
      <Header />
      <main className="main">
        <div className="detalle-compra-container">
          <div className="detalle-header">
            <button className="btn-volver" onClick={() => navigate('/estudiante/mis-compras')}>
              ← Volver
            </button>
            <h1>Detalle de Compra</h1>
          </div>

          <div className="detalle-card">
            <div className="detalle-estado">
              <span className={`badge ${badgeEstado.class}`}>
                {badgeEstado.text}
              </span>
              <span className="fecha">
                {comprasService.formatearFecha(compra.fecha_compra)}
              </span>
            </div>

            <h2>{compra.curso?.nombre || compra.clase_personalizada?.asignatura?.nombre}</h2>

            {/* Botón de Material (solo para cursos pagados) */}
            {esCurso && estaPagado && (
              <div className="acciones-curso">
                <button className="btn-material-grande" onClick={handleVerMaterial}>
                  📚 Ver Material de Estudio
                </button>
              </div>
            )}

            <div className="detalle-info">
              <div className="info-item">
                <span className="label">💰 Monto Total:</span>
                <span className="valor">{comprasService.formatearPrecio(compra.monto_total)}</span>
              </div>
              
              {compra.curso && (
                <>
                  <div className="info-item">
                    <span className="label">⏱️ Duración:</span>
                    <span className="valor">{compra.curso.duracion_horas} horas</span>
                  </div>
                  <div className="info-item">
                    <span className="label">👨‍🏫 Profesor:</span>
                    <span className="valor">
                      {compra.curso.profesor?.nombre} {compra.curso.profesor?.apellido}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="label">📚 Asignatura:</span>
                    <span className="valor">{compra.curso.asignatura?.nombre || 'N/A'}</span>
                  </div>
                  {compra.curso.descripcion && (
                    <div className="info-item descripcion">
                      <span className="label">📝 Descripción:</span>
                      <p className="valor">{compra.curso.descripcion}</p>
                    </div>
                  )}
                </>
              )}

              {compra.clase_personalizada && compra.sesion && (
                <>
                  <div className="info-item">
                    <span className="label">⏱️ Duración:</span>
                    <span className="valor">{compra.clase_personalizada.duracion_horas} horas</span>
                  </div>
                  <div className="info-item">
                    <span className="label">📅 Fecha programada:</span>
                    <span className="valor">
                      {comprasService.formatearFechaHora(compra.sesion.fecha_hora)}
                    </span>
                  </div>
                  <div className="info-item">
                    <span className="label">👨‍🏫 Profesor:</span>
                    <span className="valor">
                      {compra.sesion.profesor?.nombre} {compra.sesion.profesor?.apellido}
                    </span>
                  </div>
                </>
              )}
            </div>

            <div className="detalle-pago">
              <h3>Información de Pago</h3>
              <div className="info-item">
                <span className="label">ID de Compra:</span>
                <span className="valor mono">{compra.id}</span>
              </div>
              {compra.metodo_pago && (
                <div className="info-item">
                  <span className="label">Método de Pago:</span>
                  <span className="valor">{compra.metodo_pago.toUpperCase()}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />

      {/* Modal de Material de Estudio */}
      {esCurso && (
        <ModalMaterialEstudio
          isOpen={modalMaterialOpen}
          onClose={cerrarModalMaterial}
          curso={compra.curso}
        />
      )}
    </div>
  );
};

export default DetalleCompra;
