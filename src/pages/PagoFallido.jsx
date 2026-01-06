// src/pages/PagoFallido.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import mercadoPagoService from '../services/mercadopago_service';
import '../styles/ResultadoPago.css';

const PagoFallido = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const compraId = searchParams.get('compra_id');

  const [compra, setCompra] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!compraId) {
      setMensaje('No se encontró información de la compra');
      setLoading(false);
      return;
    }

    consultarEstado();
  }, [compraId]);

  const consultarEstado = async () => {
    try {
      setLoading(true);
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
      setLoading(false);
    }
  };

  const handleVolverDashboard = () => {
    navigate('/estudiante/dashboard');
  };

  const handleIntentarNuevamente = () => {
    // Redirigir según el tipo de compra
    if (compra?.tipo_compra === 'curso') {
      navigate('/cursos');
    } else if (compra?.tipo_compra === 'clase_personalizada') {
      navigate('/clases-personalizadas');
    } else if (compra?.tipo_compra === 'paquete_horas') {
      navigate('/clases-personalizadas');
    } else {
      navigate('/cursos');
    }
  };

  if (loading) {
    return (
      <div className="resultado-pago-container">
        <div className="resultado-card">
          <div className="spinner-grande"></div>
          <p>Verificando información...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="resultado-pago-container">
      <div className="resultado-card fallido">
        <div className="icono-resultado">❌</div>
        <h1>Pago No Completado</h1>
        <p className="mensaje-principal">
          {mensaje || 'No se pudo procesar tu pago'}
        </p>

        {compra && (
          <div className="detalle-compra">
            <h3>Detalles del intento</h3>
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
            {compra.mp_status_detail && (
              <div className="detalle-item">
                <span>Motivo:</span>
                <strong>{compra.mp_status_detail}</strong>
              </div>
            )}
          </div>
        )}

        <div className="info-box error">
          <h4>❓ ¿Qué pudo haber pasado?</h4>
          <ul>
            <li><strong>Fondos insuficientes:</strong> Verifica el saldo disponible en tu tarjeta o cuenta</li>
            <li><strong>Datos incorrectos:</strong> Revisa que los datos de tu tarjeta sean correctos</li>
            <li><strong>Límite de compra:</strong> Tu banco puede tener límites de compra online</li>
            <li><strong>Restricciones del banco:</strong> Algunos bancos bloquean compras por seguridad</li>
            <li><strong>Tarjeta vencida:</strong> Verifica la fecha de vencimiento</li>
          </ul>

          <h4 style={{ marginTop: '1.5rem' }}>💡 ¿Qué puedes hacer?</h4>
          <ul>
            <li>Verifica los datos de tu método de pago</li>
            <li>Contacta a tu banco para autorizar la compra</li>
            <li>Intenta con otro método de pago</li>
            <li>Verifica que tengas fondos suficientes</li>
          </ul>
        </div>

        <div className="contacto-soporte">
          <h4>🆘 ¿Necesitas ayuda?</h4>
          <p>
            Si el problema persiste, contáctanos a través de:
          </p>
          <div className="contacto-items">
            <div className="contacto-item">
              <span>📧</span>
              <span>soporte@academiaparchada.com</span>
            </div>
            <div className="contacto-item">
              <span>📱</span>
              <span>WhatsApp: +57 300 123 4567</span>
            </div>
          </div>
        </div>

        <div className="acciones">
          <button className="btn-primary" onClick={handleIntentarNuevamente}>
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

export default PagoFallido;
