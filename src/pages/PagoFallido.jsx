import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import comprasService from '../services/compras_service';
import '../styles/ResultadoPago.css';

const PagoFallido = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const compraId = searchParams.get('compraId');

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
      const resultado = await comprasService.consultarEstadoCompra(compraId);

      if (resultado.success && resultado.data) {
        setCompra(resultado.data);

        const { estado_pago } = resultado.data;

        if (estado_pago === 'fallido') {
          setMensaje('Tu pago no pudo ser procesado');
        } else if (estado_pago === 'completado') {
          setMensaje('¡Tu pago fue exitoso!');
        } else {
          setMensaje('Verificando estado del pago...');
        }
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
              <strong>
                {compra.tipo_compra === 'curso' && '🎓 Curso'}
                {compra.tipo_compra === 'clase_personalizada' && '📝 Clase Personalizada'}
                {compra.tipo_compra === 'paquete_horas' && '📦 Paquete de Horas'}
              </strong>
            </div>
            <div className="detalle-item">
              <span>Monto:</span>
              <strong>{comprasService.formatearPrecio(compra.monto_total)}</strong>
            </div>
            <div className="detalle-item">
              <span>Proveedor:</span>
              <strong>
                {compra.proveedor_pago === 'wompi' ? 'Wompi' : 'Mercado Pago'}
              </strong>
            </div>
            <div className="detalle-item">
              <span>ID de Compra:</span>
              <strong>{compra.id}</strong>
            </div>
            {compra.wompi_status && (
              <div className="detalle-item">
                <span>Estado Wompi:</span>
                <strong>{compra.wompi_status}</strong>
              </div>
            )}
            {compra.mp_status_detail && (
              <div className="detalle-item">
                <span>Motivo MP:</span>
                <strong>{compra.mp_status_detail}</strong>
              </div>
            )}
          </div>
        )}

        <div className="info-box">
          <h4>❓ ¿Por qué falló el pago?</h4>
          <p>
            Los pagos pueden fallar por varios motivos: fondos insuficientes, 
            errores en los datos de la tarjeta, límites de compra, o problemas 
            de verificación del banco.
          </p>

          <h4 style={{ marginTop: '1rem' }}>💡 ¿Qué puedes hacer?</h4>
          <ul>
            <li>Verifica que los datos de tu tarjeta sean correctos</li>
            <li>Confirma que tienes fondos suficientes</li>
            <li>Intenta con otro método de pago</li>
            <li>Contacta a tu banco si el problema persiste</li>
          </ul>
        </div>

        <div className="acciones">
          <button className="btn-primary" onClick={handleIntentarNuevamente}>
            🔄 Intentar Nuevamente
          </button>

          <button className="btn-secondary" onClick={handleVolverDashboard}>
            🏠 Volver al Dashboard
          </button>
        </div>

        <div className="info-box" style={{ marginTop: '1.5rem', background: '#e3f2fd' }}>
          <h4>📞 ¿Necesitas ayuda?</h4>
          <p>
            Si el problema persiste, contáctanos a través de:
          </p>
          <ul>
            <li>📧 Email: soporte@parcheacademico.com</li>
            <li>💬 WhatsApp: +57 300 123 4567</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default PagoFallido;
