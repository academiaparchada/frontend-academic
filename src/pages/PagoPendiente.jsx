import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import comprasService from '../services/compras_service';
import '../styles/ResultadoPago.css';

const PagoPendiente = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const compraId = searchParams.get('compraId');

  const [compra, setCompra] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mensaje, setMensaje] = useState('Tu pago está siendo procesado...');
  const [intentosPolling, setIntentosPolling] = useState(0);
  const [pollingActivo, setPollingActivo] = useState(true);

  const MAX_INTENTOS = 150; // 150 * 2s = 5min

  useEffect(() => {
    if (!compraId) {
      setMensaje('No se encontró información de la compra');
      setLoading(false);
      return;
    }

    // Consulta inicial
    consultarEstado();

    // Polling cada 2 segundos
    const intervalo = setInterval(() => {
      if (pollingActivo && intentosPolling < MAX_INTENTOS) {
        consultarEstadoSilencioso();
        setIntentosPolling(prev => prev + 1);
      } else {
        clearInterval(intervalo);
        setPollingActivo(false);
        console.log('⏱️ Polling finalizado');
      }
    }, 2000);

    return () => clearInterval(intervalo);
  }, [compraId, intentosPolling, pollingActivo]);

  const consultarEstado = async () => {
    try {
      setLoading(true);
      const resultado = await comprasService.consultarEstadoCompra(compraId);

      if (resultado.success && resultado.data) {
        setCompra(resultado.data);
        const { estado_pago } = resultado.data;

        if (estado_pago === 'completado') {
          console.log('✅ Pago completado, redirigiendo a éxito');
          navigate(`/pago-exitoso?compraId=${compraId}`, { replace: true });
        } else if (estado_pago === 'fallido') {
          console.log('❌ Pago fallido, redirigiendo a fallo');
          navigate(`/pago-fallido?compraId=${compraId}`, { replace: true });
        } else {
          setMensaje('Tu pago está siendo verificado...');
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

  const consultarEstadoSilencioso = async () => {
    try {
      const resultado = await comprasService.consultarEstadoCompra(compraId);

      if (resultado.success && resultado.data) {
        setCompra(resultado.data);
        const { estado_pago } = resultado.data;

        console.log(`🔄 Polling ${intentosPolling}/${MAX_INTENTOS} - Estado: ${estado_pago}`);

        if (estado_pago === 'completado') {
          console.log('✅ Pago confirmado');
          setPollingActivo(false);
          navigate(`/pago-exitoso?compraId=${compraId}`, { replace: true });
        } else if (estado_pago === 'fallido') {
          console.log('❌ Pago rechazado');
          setPollingActivo(false);
          navigate(`/pago-fallido?compraId=${compraId}`, { replace: true });
        }
      }
    } catch (error) {
      console.error('Error en polling silencioso:', error);
    }
  };

  if (loading) {
    return (
      <div className="resultado-pago-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Verificando información del pago...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="resultado-pago-container">
      <div className="resultado-pago-card">
        <div className="resultado-icono pendiente">⏳</div>
        
        <h1>{mensaje}</h1>

        {compra && (
          <div className="compra-detalle">
            <div className="detalle-item">
              <span className="label">ID de Compra:</span>
              <span className="valor">{compra.id}</span>
            </div>

            <div className="detalle-item">
              <span className="label">Monto:</span>
              <span className="valor">
                {comprasService.formatearPrecio(compra.monto_total)}
              </span>
            </div>

            <div className="detalle-item">
              <span className="label">Proveedor:</span>
              <span className="valor">
                {compra.proveedor_pago === 'wompi' ? 'Wompi' : 'Mercado Pago'}
              </span>
            </div>
          </div>
        )}

        {pollingActivo && (
          <div className="polling-info">
            🔄 Verificando automáticamente... ({intentosPolling}/{MAX_INTENTOS})
          </div>
        )}

        {!pollingActivo && (
          <div className="polling-info warning">
            ⚠️ La verificación automática ha finalizado. 
            Revisa tu email o contacta con soporte.
          </div>
        )}
      </div>
    </div>
  );
};

export default PagoPendiente;
