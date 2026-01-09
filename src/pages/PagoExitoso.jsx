// src/pages/PagoExitoso.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import mercadoPagoService from '../services/mercadopago_service';
import comprasService from '../services/compras_service';
import '../styles/ResultadoPago.css';

const PagoExitoso = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const compraId = searchParams.get('compra_id');

  const [compra, setCompra] = useState(null);
  const [loading, setLoading] = useState(true);
  const [verificando, setVerificando] = useState(false);
  const [mensaje, setMensaje] = useState('');
  
  // Estados para polling
  const [intentosPolling, setIntentosPolling] = useState(0);
  const [pollingActivo, setPollingActivo] = useState(true);
  const MAX_INTENTOS = 30; // 30 intentos = 60 segundos (2s cada uno)

  useEffect(() => {
    if (!compraId) {
      setMensaje('No se encontró información de la compra');
      setLoading(false);
      return;
    }

    consultarEstado();

    // Polling automático cada 2 segundos
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
      const resultado = await mercadoPagoService.consultarEstadoCompra(compraId);

      if (resultado.success && resultado.data) {
        setCompra(resultado.data);
        
        const { mp_status, mp_status_detail, estado_pago } = resultado.data;
        const mensajeEstado = mercadoPagoService.obtenerMensajeEstado(mp_status, mp_status_detail);
        setMensaje(mensajeEstado);

        // Si está completado, detener polling
        if (estado_pago === 'completado') {
          setPollingActivo(false);
          setIntentosPolling(MAX_INTENTOS);
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
      const resultado = await mercadoPagoService.consultarEstadoCompra(compraId);

      if (resultado.success && resultado.data) {
        setCompra(resultado.data);
        
        const { mp_status, mp_status_detail, estado_pago } = resultado.data;
        const mensajeEstado = mercadoPagoService.obtenerMensajeEstado(mp_status, mp_status_detail);
        setMensaje(mensajeEstado);

        console.log(`🔄 Polling ${intentosPolling}/${MAX_INTENTOS} - Estado: ${estado_pago}`);

        // Si está completado, detener polling
        if (estado_pago === 'completado') {
          console.log('✅ Pago confirmado, deteniendo polling');
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

  const handleVerCompras = () => {
    navigate('/estudiante/mis-compras');
  };

  const handleVerDetalleCompra = () => {
    if (compra) {
      if (compra.tipo_compra === 'paquete_horas') {
        navigate(`/estudiante/paquete/${compra.id}`);
      } else {
        navigate('/estudiante/mis-compras');
      }
    }
  };

  if (loading) {
    return (
      <div className="resultado-pago-container">
        <div className="resultado-card">
          <div className="spinner-grande"></div>
          <p>Verificando información del pago...</p>
        </div>
      </div>
    );
  }

  const estadoCompletado = compra?.estado_pago === 'completado';

  return (
    <div className="resultado-pago-container">
      <div className="resultado-card exitoso">
        <div className="icono-resultado">
          {estadoCompletado ? '✅' : '⏳'}
        </div>
        <h1>
          {estadoCompletado ? '¡Pago Exitoso!' : 'Procesando Pago'}
        </h1>
        <p className="mensaje-principal">
          {mensaje || 'Tu pago ha sido procesado exitosamente'}
        </p>

        {compra && (
          <div className="detalle-compra">
            <h3>Detalles de tu compra</h3>
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
              <span>Estado:</span>
              <strong className={`estado-${compra.estado_pago}`}>
                {compra.estado_pago === 'completado' && '✅ Completado'}
                {compra.estado_pago === 'pendiente' && '⏳ Pendiente'}
                {compra.estado_pago === 'fallido' && '❌ Fallido'}
              </strong>
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

        {estadoCompletado ? (
          <div className="info-box">
            <h4>🎉 ¡Felicitaciones!</h4>
            <p>
              Tu compra ha sido confirmada exitosamente. 
              {compra?.tipo_compra === 'curso' && ' Ya puedes acceder al curso desde tu dashboard.'}
              {compra?.tipo_compra === 'clase_personalizada' && ' Recibirás un email con los detalles de tu clase.'}
              {compra?.tipo_compra === 'paquete_horas' && ' Puedes agendar tus sesiones desde "Mis Compras".'}
            </p>
            <p style={{ marginTop: '0.5rem' }}>
              📧 Se ha enviado un email de confirmación a tu correo registrado.
            </p>
          </div>
        ) : (
          <div className="info-box">
            <h4>⏳ Confirmación en proceso</h4>
            <p>
              Tu pago está siendo verificado por Mercado Pago. 
              Este proceso puede tardar unos minutos.
            </p>
            {pollingActivo && (
              <div className="progreso-intentos">
                <p style={{ fontSize: '0.9rem', color: '#718096', marginTop: '0.5rem' }}>
                  🔄 Verificando automáticamente... ({intentosPolling}/{MAX_INTENTOS})
                </p>
              </div>
            )}
            {!pollingActivo && intentosPolling >= MAX_INTENTOS && (
              <p style={{ marginTop: '0.5rem', fontSize: '0.9rem', color: '#e67e22' }}>
                ⚠️ La verificación automática ha finalizado. 
                Puedes verificar manualmente o revisar tu email.
              </p>
            )}
          </div>
        )}

        <div className="acciones">
          {!estadoCompletado && (
            <button 
              className="btn-primary" 
              onClick={handleVerificarManual}
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
          )}
          
          {estadoCompletado && (
            <button className="btn-primary" onClick={handleVerDetalleCompra}>
              📋 Ver Detalles de la Compra
            </button>
          )}

          <button className="btn-secondary" onClick={handleVerCompras}>
            📦 Ver Mis Compras
          </button>
          
          <button className="btn-tertiary" onClick={handleVolverDashboard}>
            🏠 Volver al Dashboard
          </button>
        </div>

        {estadoCompletado && compra?.tipo_compra === 'paquete_horas' && (
          <div className="info-box" style={{ marginTop: '1.5rem', background: '#fff3cd' }}>
            <h4>📅 Próximo paso</h4>
            <p>
              Ahora puedes agendar tus sesiones desde la sección "Mis Compras". 
              Selecciona las fechas y horarios que mejor te convengan.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default PagoExitoso;
