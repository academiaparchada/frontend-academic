// src/services/compras_service.js

import mercadoPagoService from './mercadopago_service';

// ✅ CORREGIDO: URL correcta
const API_URL = import.meta.env.VITE_API_URL || 'https://api.parcheacademico.com/api';

class ComprasService {

  _getToken() {
    return localStorage.getItem('token');
  }

  _getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this._getToken()}`
    };
  }

  _getHeadersMultipart() {
    const token = this._getToken();
    return token ? {
      'Authorization': `Bearer ${token}`
      // NO incluir Content-Type para que el navegador lo configure automáticamente con boundary
    } : {};
  }

  // ==================== NUEVO: SUBIR DOCUMENTO ====================
  /**
   * ✅ NUEVO: Subir documento para clase personalizada (endpoint independiente)
   * Usado por Wompi que requiere 2 pasos: subir documento → crear checkout
   * @param {File} archivo - Archivo a subir
   * @returns {Promise<{success: boolean, data?: object, message?: string}>}
   */
  async subirDocumentoClasePersonalizada(archivo) {
    try {
      console.log('📤 Subiendo documento:', archivo.name);

      // Validar archivo
      const validacion = this.validarArchivo(archivo);
      if (!validacion.valido) {
        return {
          success: false,
          message: validacion.mensaje
        };
      }

      // Crear FormData
      const formData = new FormData();
      formData.append('documento', archivo);

      // Subir al endpoint de documentos
      const response = await fetch(`${API_URL}/documentos/clase-personalizada`, {
        method: 'POST',
        headers: this._getHeadersMultipart(),
        body: formData
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        return {
          success: false,
          message: data.message || 'Error al subir el documento'
        };
      }

      console.log('✅ Documento subido:', data.data.documento_url);

      return {
        success: true,
        data: {
          documento_url: data.data.documento_url,
          documento_path: data.data.documento_path,
          content_type: data.data.content_type,
          size: data.data.size
        }
      };

    } catch (error) {
      console.error('❌ Error subiendo documento:', error);
      return {
        success: false,
        message: 'Error de conexión al subir el documento'
      };
    }
  }

  // ==================== MÉTODOS DE MERCADO PAGO ====================
  /**
   * Iniciar proceso de pago con Mercado Pago
   * @param {Object} datosCompra - Datos de la compra
   * @returns {Promise}
   */
  async iniciarPagoMercadoPago(datosCompra) {
    try {
      const token = localStorage.getItem('token');
      const esUsuarioAutenticado = !!token;

      console.log('💳 Iniciando pago MP...');
      console.log('Usuario autenticado:', esUsuarioAutenticado);

      // Validar datos antes de enviar
      const validacion = mercadoPagoService.validarDatosCompra(datosCompra, esUsuarioAutenticado);
      if (!validacion.valido) {
        console.error('❌ Validación fallida:', validacion.errores);
        return {
          success: false,
          message: 'Datos de compra inválidos',
          errors: validacion.errores
        };
      }

      // ✅ NO eliminar estudiante aquí, mercadoPagoService lo manejará
      console.log('📦 Datos preparados para envío:', {
        ...datosCompra,
        estudiante: datosCompra.estudiante ? '{ oculto }' : undefined,
        usuarioAutenticado: esUsuarioAutenticado
      });

      console.log('📤 Datos finales:', {
        ...datosCompra,
        estudiante: datosCompra.estudiante ? '{ oculto }' : undefined
      });

      // Crear preferencia en Mercado Pago
      const resultado = await mercadoPagoService.crearPreferencia(datosCompra);

      if (resultado.success) {
        // Guardar compra_id en localStorage para tracking
        localStorage.setItem('ultima_compra_id', resultado.data.compra_id);
        console.log('✅ Compra ID guardado:', resultado.data.compra_id);
      }

      return resultado;

    } catch (error) {
      console.error('❌ Error iniciando pago:', error);
      return {
        success: false,
        message: 'Error al iniciar el proceso de pago'
      };
    }
  }

  /**
   * NUEVO: Iniciar proceso de pago con Mercado Pago CON ARCHIVO (multipart/form-data)
   * Usar para clases personalizadas que necesiten adjuntar documento
   * @param {Object} datosCompra - Datos de la compra
   * @param {File} archivoDocumento - Archivo adjunto (opcional)
   * @returns {Promise}
   */
  async iniciarPagoMercadoPagoConArchivo(datosCompra, archivoDocumento = null) {
    try {
      const token = localStorage.getItem('token');
      const esUsuarioAutenticado = !!token;

      console.log('💳 Iniciando pago MP (FormData con archivo)...');
      console.log('Usuario autenticado:', esUsuarioAutenticado);
      console.log('Archivo adjunto:', archivoDocumento ? archivoDocumento.name : 'ninguno');

      // Validar archivo si existe
      if (archivoDocumento) {
        const validacionArchivo = this.validarArchivo(archivoDocumento);
        if (!validacionArchivo.valido) {
          return {
            success: false,
            message: validacionArchivo.mensaje
          };
        }
      }

      // Crear FormData
      const formData = new FormData();

      // Agregar campos de texto
      formData.append('tipo_compra', datosCompra.tipo_compra);

      if (datosCompra.tipo_compra === 'curso') {
        formData.append('curso_id', datosCompra.curso_id);
      } else if (datosCompra.tipo_compra === 'clase_personalizada') {
        formData.append('clase_personalizada_id', datosCompra.clase_personalizada_id);
        formData.append('fecha_hora', datosCompra.fecha_hora);
        if (datosCompra.descripcion_estudiante) {
          formData.append('descripcion_estudiante', datosCompra.descripcion_estudiante);
        }
        if (datosCompra.estudiante_timezone) {
          formData.append('estudiante_timezone', datosCompra.estudiante_timezone);
        }
      } else if (datosCompra.tipo_compra === 'paquete_horas') {
        formData.append('clase_personalizada_id', datosCompra.clase_personalizada_id);
        formData.append('cantidad_horas', datosCompra.cantidad_horas);
      }

      // Agregar datos de estudiante si es nuevo usuario
      if (!esUsuarioAutenticado && datosCompra.estudiante) {
        formData.append('estudiante[email]', datosCompra.estudiante.email);
        formData.append('estudiante[password]', datosCompra.estudiante.password);
        formData.append('estudiante[nombre]', datosCompra.estudiante.nombre);
        formData.append('estudiante[apellido]', datosCompra.estudiante.apellido);
        formData.append('estudiante[telefono]', datosCompra.estudiante.telefono);
        if (datosCompra.estudiante.timezone) {
          formData.append('estudiante[timezone]', datosCompra.estudiante.timezone);
        }
      }

      // Agregar archivo si existe
      if (archivoDocumento) {
        formData.append('documento', archivoDocumento);
      }

      // Enviar al backend
      const response = await fetch(`${API_URL}/pagos/mercadopago/checkout`, {
        method: 'POST',
        headers: this._getHeadersMultipart(),
        body: formData
      });

      const data = await response.json();
      console.log('📥 Respuesta del servidor:', data);

      if (!response.ok) {
        return {
          success: false,
          message: data.message || 'Error al crear la preferencia de pago',
          errors: data.errors || []
        };
      }

      // Guardar compra_id
      if (data.data?.compra_id) {
        localStorage.setItem('ultima_compra_id', data.data.compra_id);
        console.log('✅ Compra ID guardado:', data.data.compra_id);
      }

      return {
        success: true,
        data: data.data,
        message: data.message
      };

    } catch (error) {
      console.error('❌ Error iniciando pago con archivo:', error);
      return {
        success: false,
        message: 'Error al iniciar el proceso de pago'
      };
    }
  }

  /**
   * NUEVO: Validar archivo adjunto
   * @param {File} archivo - Archivo a validar
   * @returns {Object} - {valido: boolean, mensaje: string}
   */
  validarArchivo(archivo) {
    const MAX_SIZE = 25 * 1024 * 1024; // 25MB
    const EXTENSIONES_PERMITIDAS = [
      'pdf', 'doc', 'docx', 'txt',
      'jpg', 'jpeg', 'png',
      'zip', 'rar', '7z'
    ];

    if (!archivo) {
      return { valido: true }; // Archivo opcional
    }

    // Validar tamaño
    if (archivo.size > MAX_SIZE) {
      return {
        valido: false,
        mensaje: 'El archivo no puede pesar más de 25MB'
      };
    }

    // Validar extensión
    const extension = archivo.name.split('.').pop().toLowerCase();
    if (!EXTENSIONES_PERMITIDAS.includes(extension)) {
      return {
        valido: false,
        mensaje: `Formato no permitido. Usa: ${EXTENSIONES_PERMITIDAS.join(', ')}`
      };
    }

    return { valido: true };
  }

  /**
   * Verificar estado de pago
   * @param {string} compraId - ID de la compra
   * @returns {Promise}
   */
  async verificarEstadoPago(compraId) {
    return await mercadoPagoService.consultarEstadoCompra(compraId);
  }

  /**
   * ✅ NUEVO: Consultar estado de compra usando endpoint unificado (MP + Wompi)
   * @param {string} compraId - UUID de la compra
   * @returns {Promise}
   */
  async consultarEstadoCompra(compraId) {
    try {
      const res = await fetch(`${API_URL}/pagos/compras/${compraId}/estado`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' }
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        return {
          success: false,
          message: json?.message || 'Error consultando estado de compra'
        };
      }

      return { success: true, data: json.data };

    } catch (error) {
      console.error('❌ Error consultarEstadoCompra:', error);
      return {
        success: false,
        message: 'Error de conexión al consultar estado'
      };
    }
  }

  /**
   * Redirigir al checkout de Mercado Pago
   * @param {string} initPoint - URL del checkout
   */
  redirigirACheckout(initPoint) {
    return mercadoPagoService.redirigirACheckout(initPoint);
  }

  // ==================== MÉTODOS ORIGINALES (DEPRECATED - Usar Mercado Pago) ====================

  // ... (resto de métodos deprecated sin cambios)

  // ==================== MÉTODOS DE GESTIÓN ====================

  // ... (sin cambios)

  // ==================== UTILIDADES ====================

  // Formatear precio
  formatearPrecio(precio) {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(precio);
  }

  // Formatear fecha y hora
  formatearFechaHora(fecha) {
    if (!fecha) return 'No especificada';
    return new Date(fecha).toLocaleString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  // Formatear solo fecha
  formatearFecha(fecha) {
    if (!fecha) return 'No especificada';
    return new Date(fecha).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  // Convertir fecha local a ISO con zona horaria
  convertirFechaAISO(fechaLocal) {
    // Formato esperado: "2026-01-07T14:00"
    // Salida: "2026-01-07T14:00:00-05:00"
    if (!fechaLocal) return null;
    return `${fechaLocal}:00-05:00`;
  }

  // NUEVO: Formatear tamaño de archivo
  formatearTamanoArchivo(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  }

  // Validar datos de estudiante nuevo
  validarEstudiante(estudiante) {
    const errores = {};

    if (!estudiante.email || !estudiante.email.includes('@')) {
      errores.email = 'Email inválido';
    }
    if (!estudiante.nombre || estudiante.nombre.trim() === '') {
      errores.nombre = 'El nombre es obligatorio';
    }
    if (!estudiante.apellido || estudiante.apellido.trim() === '') {
      errores.apellido = 'El apellido es obligatorio';
    }
    if (!estudiante.password || estudiante.password.length < 6) {
      errores.password = 'La contraseña debe tener al menos 6 caracteres';
    }
    if (!estudiante.telefono) {
      errores.telefono = 'El teléfono es obligatorio';
    }

    return {
      valido: Object.keys(errores).length === 0,
      errores
    };
  }

  // Obtener badge de tipo de compra
  obtenerBadgeTipoCompra(tipo) {
    const badges = {
      'curso': { text: '🎓 Curso', class: 'badge-curso' },
      'clase_personalizada': { text: '📝 Clase', class: 'badge-clase' },
      'paquete_horas': { text: '📦 Paquete', class: 'badge-paquete' }
    };
    return badges[tipo] || badges['curso'];
  }

  // Obtener badge de estado de pago
  obtenerBadgeEstadoPago(estado) {
    const badges = {
      'completado': { text: '✅ Pagado', class: 'badge-pagado' },
      'pendiente': { text: '⏳ Pendiente', class: 'badge-pendiente' },
      'fallido': { text: '❌ Fallido', class: 'badge-fallido' }
    };
    return badges[estado] || badges['pendiente'];
  }
}

export default new ComprasService();
