// src/pages/PagoExitoso.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import mercadoPagoService from '../services/mercadopago_service';
import '../styles/ResultadoPago.css';

const PagoExitoso = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const compraId = searchParams.get('compra_id');

  const [estado, setEstado] = useState('verificando'); // verificando | exitoso | pendiente | fallido
  const [compra, setCompra] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const [intentos, setIntentos] = useState(0);
  const MAX_INTENTOS = 10;

  useEffect(() => {
    if (!compraId) {
      setEstado('fallido');
      setMensaje('No se encontró información de la compra');
      return;
    }

    verificarEstadoCompra();
  }, [compraId]);

  const verificarEstadoCompra = async () => {
    try {
      const resultado = await mercadoPagoService.consultarEstadoCompra(compraId);

      if (resultado.success && resultado.data) {
        const { estado_pago, mp_status, mp_status_detail } = resultado.data;

        setCompra(resultado.data);

        // Si está completado, mostrar éxito
        if (estado_pago === 'completado') {
          setEstado('exitoso');
          setMensaje(mercadoPagoService.obtenerMensajeEstado(mp_status, mp_status_detail));
          return;
        }

        // Si está fallido, mostrar error
        if (estado_pago === 'fallido') {
          setEstado('fallido');
          setMensaje(mercadoPagoService.obtenerMensajeEstado(mp_status, mp_status_detail));
          return;
        }

        // Si sigue pendiente, reintentar
        if (estado_pago === 'pendiente') {
          if (intentos < MAX_INTENTOS) {
            setIntentos(prev => prev + 1);
            setTimeout(verificarEstadoCompra, 3000); // Reintentar cada 3 segundos
          } else {
            setEstado('pendiente');
            setMensaje('Tu pago está siendo procesado. Te notificaremos cuando esté confirmado.');
          }
        }
      } else {
        setEstado('fallido');
        setMensaje('No se pudo verificar el estado del pago');
      }
    } catch (error) {
      console.error('Error verificando estado:', error);
      setEstado('fallido');
      setMensaje('Error al verificar el estado del pago');
    }
  };

  const handleVolverDashboard = () => {
    navigate('/estudiante/dashboard');
  };

  const handleVerCompras = () => {
    navigate('/estudiante/mis-compras');
  };

  if (estado === 'verificando') {
    return (
      <div className="resultado-pago-container">
        <div className="resultado-card">
          <div className="spinner-grande"></div>
          <h2>Verificando tu pago...</h2>
          <p>Por favor espera un momento</p>
          <div className="progreso-intentos">
            Intento {intentos + 1} de {MAX_INTENTOS}
          </div>
        </div>
      </div>
    );
  }

  if (estado === 'exitoso') {
    return (
      <div className="resultado-pago-container">
        <div className="resultado-card exitoso">
          <div className="icono-resultado">✅</div>
          <h1>¡Pago Exitoso!</h1>
          <p className="mensaje-principal">{mensaje}</p>

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

          <div className="acciones">
            <button className="btn-primary" onClick={handleVerCompras}>
              📦 Ver Mis Compras
            </button>
            <button className="btn-secondary" onClick={handleVolverDashboard}>
              🏠 Volver al Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (estado === 'pendiente') {
    return (
      <div className="resultado-pago-container">
        <div className="resultado-card pendiente">
          <div className="icono-resultado">⏳</div>
          <h1>Pago Pendiente</h1>
          <p className="mensaje-principal">{mensaje}</p>

          <div className="info-box">
            <p>
              <strong>¿Qué significa esto?</strong><br />
              Tu pago está siendo procesado por Mercado Pago. 
              Esto puede tardar unos minutos.
            </p>
            <p>
              Te enviaremos una notificación por email cuando se confirme.
            </p>
          </div>

          <div className="acciones">
            <button className="btn-primary" onClick={() => verificarEstadoCompra()}>
              🔄 Verificar Estado
            </button>
            <button className="btn-secondary" onClick={handleVolverDashboard}>
              🏠 Volver al Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Estado fallido
  return (
    <div className="resultado-pago-container">
      <div className="resultado-card fallido">
        <div className="icono-resultado">❌</div>
        <h1>Pago No Completado</h1>
        <p className="mensaje-principal">{mensaje}</p>

        <div className="info-box">
          <p>
            <strong>¿Qué puedes hacer?</strong>
          </p>
          <ul>
            <li>Verifica que tengas fondos suficientes</li>
            <li>Revisa los datos de tu tarjeta</li>
            <li>Contacta a tu banco si el problema persiste</li>
            <li>Intenta con otro método de pago</li>
          </ul>
        </div>

        <div className="acciones">
          <button className="btn-primary" onClick={() => navigate('/cursos')}>
            🔄 Intentar Nuevamente
            </button>
          <button className="btn-secondary" onClick={handleVolverDashboard}>
            🏠 Volver al Dashboard
          </button>
        </div>
      </div>
    </div>
  );
};

export default PagoExitoso;
