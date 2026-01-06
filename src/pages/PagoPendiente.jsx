// src/pages/PagoPendiente.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import mercadoPagoService from '../services/mercadopago_service';
import '../styles/ResultadoPago.css';

const PagoPendiente = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const compraId = searchParams.get('compra_id');

  const [compra, setCompra] = useState(null);
  const [verificando, setVerificando] = useState(false);
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    if (!compraId) {
      setMensaje('No se encontró información de la compra');
      return;
    }

    consultarEstado();
  }, [compraId]);

  const consultarEstado = async () => {
    try {
      setVerificando(true);
      const resultado = await mercadoPagoService.consultarEstadoCompra(compraId);

      if (resultado.success && resultado.data) {
        setCompra(resultado.data);
        
        const { mp_status, mp_status_detail } = resultado.data;
        const mensajeEstado = mercadoPagoService.obtenerMensajeEstado(mp_status, mp_status_detail);
        setMensaje(mensajeEstado);
      } else {
        setMensaje('No se pudo verificar el estado del pago');
      }
    } catch (error) {
      console.error('Error consultando estado:', error);
      setMensaje('Error al consultar el estado');
    } finally {
      setVerificando(false);
    }
  };

  const handleVolverDashboard = () => {
    navigate('/estudiante/dashboard');
  };

  const handleVerCompras = () => {
    navigate('/estudiante/mis-compras');
  };

  return (
    <div className="resultado-pago-container">
      <div className="resultado-card pendiente">
        <div className="icono-resultado">⏳</div>
        <h1>Pago en Proceso</h1>
        <p className="mensaje-principal">
          {mensaje || 'Tu pago está siendo procesado por Mercado Pago'}
        </p>

        {compra && (
          <div className="detalle-compra">
            <h3>Detalles de tu compra</h3>
            <div className="detalle-item">
              <span>Tipo:</span>
              <strong>{compra.tipo_compra}</strong>
            </div>
            <div className="detalle-item">
              <span>Monto:</span>
              <strong>{mercadoPagoService.formatearPrecio(compra.monto_total)}</strong>
            </div>
            <div className="detalle-item">
              <span>ID de Compra:</span>
              <strong>{compra.id}</strong>
            </div>
            {compra.mp_payment_id && (
              <div className="detalle-item">
                <span>ID de Pago MP:</span>
                <strong>{compra.mp_payment_id}</strong>
              </div>
            )}
          </div>
        )}

        <div className="info-box">
          <h4>📋 ¿Qué significa esto?</h4>
          <p>
            Tu pago está siendo procesado por Mercado Pago. 
            Esto puede tardar unos minutos dependiendo del método de pago utilizado.
          </p>
          
          <h4 style={{ marginTop: '1rem' }}>📧 Te mantendremos informado</h4>
          <p>
            Recibirás una notificación por email cuando tu pago sea confirmado.
            También puedes verificar el estado en la sección "Mis Compras".
          </p>

          <h4 style={{ marginTop: '1rem' }}>⏱️ Tiempos de procesamiento</h4>
          <ul>
            <li><strong>Tarjeta de crédito:</strong> Inmediato a 5 minutos</li>
            <li><strong>PSE:</strong> 2 a 3 días hábiles</li>
            <li><strong>Efectivo:</strong> Hasta 3 días hábiles</li>
          </ul>
        </div>

        <div className="acciones">
          <button 
            className="btn-primary" 
            onClick={consultarEstado}
            disabled={verificando}
          >
            {verificando ? (
              <>
                <div className="spinner-small"></div>
                Verificando...
              </>
            ) : (
              '🔄 Verificar Estado Ahora'
            )}
          </button>
          <button className="btn-secondary" onClick={handleVerCompras}>
            📦 Ver Mis Compras
          </button>
          <button className="btn-tertiary" onClick={handleVolverDashboard}>
            🏠 Volver al Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default PagoPendiente;
