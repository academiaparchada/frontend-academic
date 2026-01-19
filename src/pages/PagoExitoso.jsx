import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import comprasService from '../services/compras_service';
import '../styles/ResultadoPago.css';

const PagoExitoso = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const compraId = searchParams.get('compraId');
  
  const [compra, setCompra] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verificando, setVerificando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  
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
      console.log('🔍 Consultando estado de compra:', compraId);
      
      const resultado = await comprasService.consultarEstadoCompra(compraId);
      console.log('📥 Resultado consultarEstadoCompra:', resultado);

      if (resultado.success && resultado.data) {
        setCompra(resultado.data);
        const { estado_pago, proveedor_pago } = resultado.data;
        console.log('✅ Estado obtenido:', estado_pago);

        if (estado_pago === 'completado') {
          setMensaje('¡Tu pago ha sido confirmado exitosamente!');
          setPollingActivo(false);
          setIntentosPolling(MAX_INTENTOS);
        } else if (estado_pago === 'pendiente') {
          setMensaje(`Tu pago está siendo procesado por ${proveedor_pago === 'wompi' ? 'Wompi' : 'Mercado Pago'}`);
        } else if (estado_pago === 'fallido') {
          setMensaje('El pago fue rechazado');
          setPollingActivo(false);
        } else {
          setMensaje('Verificando estado del pago...');
        }
      } else {
        setMensaje('No se pudo verificar el estado del pago');
      }
    } catch (error) {
      console.error('❌ Error consultando estado:', error);
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
          console.log('✅ Pago confirmado, deteniendo polling');
          setMensaje('¡Tu pago ha sido confirmado exitosamente!');
          setPollingActivo(false);
          setIntentosPolling(MAX_INTENTOS);
        } else if (estado_pago === 'fallido') {
          console.log('❌ Pago rechazado');
          setMensaje('El pago fue rechazado');
          setPollingActivo(false);
          setIntentosPolling(MAX_INTENTOS);
        }
      }
    } catch (error) {
      console.error('Error en polling silencioso:', error);
    }
  };

  const handleVerificarManual = async () => {
    setVerificando(true);
    await consultarEstado();
    setVerificando(false);
  };

  const handleVolverDashboard = () => {
    navigate('/estudiante/dashboard');
  };

  if (loading) {
    return (
      <div className="resultado-pago-container">
        <div className="resultado-card">
          <div className="spinner-grande"></div>
          <p className="mensaje-principal">Verificando información del pago...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="resultado-pago-container">
      <div className="resultado-card exitoso">
        <div className="icono-resultado">✅</div>
        
        <h1>¡Pago Exitoso!</h1>
        
        <p className="mensaje-principal">
          {mensaje || '¡Tu compra ha sido confirmada exitosamente!'}
        </p>

        {compra && (
          <>
            <div className="info-box">
              <h4>✉️ Confirmación enviada</h4>
              <p>
                Se ha enviado un correo electrónico de confirmación con todos los detalles de tu compra.
              </p>
            </div>

            {pollingActivo && intentosPolling < MAX_INTENTOS && (
              <div className="progreso-intentos">
                Verificando confirmación... ({intentosPolling}/{MAX_INTENTOS})
              </div>
            )}

            <div className="acciones">
              <button 
                className="btn-primary" 
                onClick={handleVolverDashboard}
              >
                📚 Ir a Mi Dashboard
              </button>

              {pollingActivo && (
                <button 
                  className="btn-secondary" 
                  onClick={handleVerificarManual}
                  disabled={verificando}
                >
                  {verificando ? (
                    <>
                      <span className="spinner-small"></span> Verificando...
                    </>
                  ) : (
                    <>🔄 Verificar estado ahora</>
                  )}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default PagoExitoso;
