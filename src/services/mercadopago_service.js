// src/services/mercadopago_service.js

const API_URL = import.meta.env.VITE_API_URL || 'https://academiaparchada.onrender.com/api';

class MercadoPagoService {  
  /**
   * Crear preferencia de pago (checkout)
   * @param {Object} datos - Datos de la compra
   * @returns {Promise<Object>}
   */
  async crearPreferencia(datos) {
    try {
      const token = localStorage.getItem('token');
      
      console.log('🔐 Token extraído de localStorage:', token ? `${token.substring(0, 20)}...` : 'NO HAY TOKEN');
      
      const headers = {
        'Content-Type': 'application/json'
      };

      // Crear copia de datos para no modificar el original
      const datosEnvio = { ...datos };

      // ✅ Si hay token, agregarlo y NO enviar estudiante
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
        // Eliminar estudiante si existe porque el backend lo tomará del token
        if (datosEnvio.estudiante) {
          console.log('🗑️ Eliminando campo estudiante (hay token)');
          delete datosEnvio.estudiante;
        }
        console.log('✅ Token agregado a headers');
      } else {
        console.log('⚠️ NO hay token, se debe enviar estudiante');
        if (!datosEnvio.estudiante) {
          console.error('❌ ERROR: No hay token NI estudiante');
        }
      }

      console.log('📋 Headers finales:', {
        'Content-Type': headers['Content-Type'],
        'Authorization': headers['Authorization'] ? 'Bearer ***' : 'NO'
      });

      console.log('📤 Datos a enviar:', {
        ...datosEnvio,
        estudiante: datosEnvio.estudiante ? '{ oculto }' : undefined
      });

      const response = await fetch(`${API_URL}/pagos/mercadopago/checkout`, {
        method: 'POST',
        headers,
        body: JSON.stringify(datosEnvio)
      });

      console.log('📨 Status de respuesta:', response.status);

      const result = await response.json();

      if (!response.ok) {
        console.error('❌ Error en respuesta:', result);
        console.error('❌ Status:', response.status);
        console.error('❌ Headers enviados:', headers);
        return {
          success: false,
          message: result.message || 'Error al crear preferencia de pago',
          errors: result.errors || []
        };
      }

      console.log('✅ Preferencia creada exitosamente:', result);

      return {
        success: true,
        data: result.data,
        message: result.message
      };

    } catch (error) {
      console.error('❌ Error creando preferencia:', error);
      return {
        success: false,
        message: 'Error de conexión al crear el pago'
      };
    }
  }

  /**
   * Consultar estado de una compra
   * @param {string} compraId - ID de la compra
   * @returns {Promise<Object>}
   */
  async consultarEstadoCompra(compraId) {
    try {
      console.log('🔍 Consultando estado de compra:', compraId);

      const response = await fetch(`${API_URL}/pagos/mercadopago/estado/${compraId}`);
      const result = await response.json();

      if (!response.ok) {
        console.error('❌ Error consultando estado:', result);
        return {
          success: false,
          message: result.message || 'Error al consultar estado',
          data: null
        };
      }

      console.log('✅ Estado obtenido:', result.data);

      return {
        success: true,
        data: result.data
      };

    } catch (error) {
      console.error('❌ Error consultando estado:', error);
      return {
        success: false,
        message: 'Error de conexión al consultar estado',
        data: null
      };
    }
  }

  /**
   * Redirigir al checkout de Mercado Pago
   * @param {string} initPoint - URL del checkout
   */
  redirigirACheckout(initPoint) {
    if (!initPoint) {
      console.error('❌ No se proporcionó init_point para redirección');
      return false;
    }

    console.log('🔄 Redirigiendo a Mercado Pago:', initPoint);
    
    // Redirigir en la misma ventana
    window.location.href = initPoint;
    return true;
  }

  /**
   * Mapear estado de MP a etiqueta visual
   * @param {string} estadoPago - Estado de la compra
   * @returns {Object}
   */
  obtenerEtiquetaEstado(estadoPago) {
    const estados = {
      'pendiente': {
        text: '⏳ Pendiente',
        class: 'estado-pendiente',
        color: '#f39c12'
      },
      'completado': {
        text: '✅ Pagado',
        class: 'estado-completado',
        color: '#27ae60'
      },
      'fallido': {
        text: '❌ Fallido',
        class: 'estado-fallido',
        color: '#e74c3c'
      }
    };

    return estados[estadoPago] || estados['pendiente'];
  }

  /**
   * Obtener mensaje según estado de MP
   * @param {string} mpStatus - Estado de Mercado Pago
   * @param {string} mpStatusDetail - Detalle del estado
   * @returns {string}
   */
  obtenerMensajeEstado(mpStatus, mpStatusDetail) {
    const mensajes = {
      'approved': '✅ Pago aprobado exitosamente',
      'pending': {
        'pending_contingency': '⏳ Tu pago está en revisión',
        'pending_review_manual': '⏳ Tu pago está siendo revisado',
        'pending_waiting_payment': '⏳ Esperando el pago',
        'default': '⏳ Pago pendiente de confirmación'
      },
      'rejected': {
        'cc_rejected_insufficient_amount': '❌ Fondos insuficientes',
        'cc_rejected_bad_filled_security_code': '❌ Código de seguridad inválido',
        'cc_rejected_call_for_authorize': '❌ Debes autorizar el pago con tu banco',
        'cc_rejected_card_disabled': '❌ Tarjeta deshabilitada',
        'default': '❌ Pago rechazado'
      },
      'cancelled': '❌ Pago cancelado',
      'in_process': '⏳ Pago en proceso',
      'default': 'Estado desconocido'
    };

    if (mpStatus === 'pending' && mensajes.pending[mpStatusDetail]) {
      return mensajes.pending[mpStatusDetail];
    }

    if (mpStatus === 'rejected' && mensajes.rejected[mpStatusDetail]) {
      return mensajes.rejected[mpStatusDetail];
    }

    return mensajes[mpStatus] || mensajes.default;
  }

  /**
   * Validar datos de compra antes de enviar
   * @param {Object} datos - Datos a validar
   * @param {boolean} esUsuarioAutenticado - Si el usuario está autenticado
   * @returns {Object}
   */
  validarDatosCompra(datos, esUsuarioAutenticado = false) {
    const errores = [];

    // Validar tipo_compra
    if (!datos.tipo_compra) {
      errores.push('El tipo de compra es obligatorio');
    }

    const tiposValidos = ['curso', 'clase_personalizada', 'paquete_horas'];
    if (datos.tipo_compra && !tiposValidos.includes(datos.tipo_compra)) {
      errores.push('Tipo de compra inválido');
    }

    // Validar según tipo
    if (datos.tipo_compra === 'curso' && !datos.curso_id) {
      errores.push('El ID del curso es obligatorio');
    }

    if (datos.tipo_compra === 'clase_personalizada') {
      if (!datos.clase_personalizada_id) {
        errores.push('El ID de la clase es obligatorio');
      }
      if (!datos.fecha_hora) {
        errores.push('La fecha y hora son obligatorias');
      }
    }

    if (datos.tipo_compra === 'paquete_horas') {
      if (!datos.clase_personalizada_id) {
        errores.push('El ID de la clase es obligatorio');
      }
      if (!datos.cantidad_horas || datos.cantidad_horas < 1) {
        errores.push('La cantidad de horas debe ser mayor a 0');
      }
    }

    // ✅ Solo validar estudiante si NO está autenticado
    if (!esUsuarioAutenticado && datos.estudiante) {
      if (!datos.estudiante.email) {
        errores.push('El email es obligatorio');
      }
      if (!datos.estudiante.password || datos.estudiante.password.length < 6) {
        errores.push('La contraseña debe tener al menos 6 caracteres');
      }
      if (!datos.estudiante.nombre) {
        errores.push('El nombre es obligatorio');
      }
      if (!datos.estudiante.apellido) {
        errores.push('El apellido es obligatorio');
      }
    }

    return {
      valido: errores.length === 0,
      errores
    };
  }

  /**
   * Formatear precio en COP
   * @param {number} precio
   * @returns {string}
   */
  formatearPrecio(precio) {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(precio);
  }
}

// Exportar instancia única
const mercadoPagoService = new MercadoPagoService();
export default mercadoPagoService;
