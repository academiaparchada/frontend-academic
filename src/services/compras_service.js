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

  // Comprar curso (DEPRECATED - Usar iniciarPagoMercadoPago)
  async comprarCurso(cursoId, datosEstudiante = null) {
    try {
      console.log('⚠️ ADVERTENCIA: Método deprecated. Usar iniciarPagoMercadoPago');
      console.log('Comprando curso:', cursoId);

      const body = datosEstudiante
        ? { curso_id: cursoId, estudiante: datosEstudiante }
        : { curso_id: cursoId };

      const headers = datosEstudiante
        ? { 'Content-Type': 'application/json' }
        : this._getHeaders();

      const response = await fetch(`${API_URL}/compras/curso`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });

      const data = await response.json();
      console.log('Respuesta comprar curso:', data);

      if (response.ok) {
        return { success: true, data: data.data };
      } else {
        return {
          success: false,
          message: data.message || 'Error al realizar la compra',
          errors: data.errors || []
        };
      }

    } catch (error) {
      console.error('Error al comprar curso:', error);
      return {
        success: false,
        message: 'Error de conexión. Intenta de nuevo más tarde.'
      };
    }
  }

  // Comprar clase personalizada (DEPRECATED - Usar iniciarPagoMercadoPago)
  async comprarClasePersonalizada(claseId, datosCompra) {
    try {
      console.log('⚠️ ADVERTENCIA: Método deprecated. Usar iniciarPagoMercadoPago');
      console.log('Comprando clase personalizada:', claseId, datosCompra);

      const body = {
        clase_personalizada_id: claseId,
        fecha_hora: datosCompra.fecha_hora,
        descripcion_estudiante: datosCompra.descripcion_estudiante,
        estudiante: datosCompra.estudiante
      };

      const headers = datosCompra.estudiante
        ? { 'Content-Type': 'application/json' }
        : this._getHeaders();

      const response = await fetch(`${API_URL}/compras/clase-personalizada`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });

      const data = await response.json();
      console.log('Respuesta comprar clase:', data);

      if (response.ok) {
        return { success: true, data: data.data };
      } else {
        return {
          success: false,
          message: data.message || 'Error al realizar la compra',
          errors: data.errors || []
        };
      }

    } catch (error) {
      console.error('Error al comprar clase:', error);
      return {
        success: false,
        message: 'Error de conexión. Intenta de nuevo más tarde.'
      };
    }
  }

  // Comprar paquete de horas (DEPRECATED - Usar iniciarPagoMercadoPago)
  async comprarPaqueteHoras(claseId, cantidadHoras, datosEstudiante = null) {
    try {
      console.log('⚠️ ADVERTENCIA: Método deprecated. Usar iniciarPagoMercadoPago');
      console.log('Comprando paquete de horas:', claseId, cantidadHoras);

      const body = datosEstudiante
        ? {
            clase_personalizada_id: claseId,
            cantidad_horas: cantidadHoras,
            estudiante: datosEstudiante
          }
        : {
            clase_personalizada_id: claseId,
            cantidad_horas: cantidadHoras
          };

      const headers = datosEstudiante
        ? { 'Content-Type': 'application/json' }
        : this._getHeaders();

      const response = await fetch(`${API_URL}/paquetes-horas`, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });

      const data = await response.json();
      console.log('Respuesta comprar paquete:', data);

      if (response.ok) {
        return { success: true, data: data.data };
      } else {
        return {
          success: false,
          message: data.message || 'Error al comprar paquete',
          errors: data.errors || []
        };
      }

    } catch (error) {
      console.error('Error al comprar paquete:', error);
      return {
        success: false,
        message: 'Error de conexión. Intenta de nuevo más tarde.'
      };
    }
  }

  // ==================== MÉTODOS DE GESTIÓN ====================

  /**
   * ✅ ACTUALIZADO: Agendar sesión usando paquete de horas CON SOPORTE PARA DOCUMENTOS
   * Flujo de 2 pasos:
   * 1. Si hay archivo, subirlo primero → obtener documento_url
   * 2. Agendar sesión con documento_url (opcional)
   *
   * @param {string} compraId - ID de la compra del paquete
   * @param {Object} datosSesion - Datos de la sesión
   * @param {string} datosSesion.fecha_hora - Fecha y hora en formato ISO 8601
   * @param {number} datosSesion.duracion_horas - Duración en horas (1-8)
   * @param {string} [datosSesion.descripcion_estudiante] - Descripción opcional
   * @param {File} [archivo] - Archivo opcional a adjuntar
   * @returns {Promise}
   */
  async agendarSesionPaquete(compraId, datosSesion, archivo = null) {
    try {
      console.log('═══════════════════════════════════════════════');
      console.log('🚀 INICIANDO AGENDAMIENTO DE SESIÓN CON PAQUETE');
      console.log('═══════════════════════════════════════════════');
      console.log('📦 Compra ID:', compraId);
      console.log('📋 Datos sesión:', datosSesion);
      console.log('📎 Archivo adjunto:', archivo ? archivo.name : 'ninguno');

      let documento_url = null;

      // ✅ PASO 1: Si hay archivo, subirlo primero
      if (archivo) {
        console.log('📤 PASO 1: Subiendo documento...');

        const resultadoSubida = await this.subirDocumentoClasePersonalizada(archivo);

        if (!resultadoSubida.success) {
          console.error('❌ Error subiendo documento:', resultadoSubida.message);
          return {
            success: false,
            message: resultadoSubida.message || 'Error al subir el documento'
          };
        }

        documento_url = resultadoSubida.data.documento_url;
        console.log('✅ Documento subido:', documento_url);
      } else {
        console.log('ℹ️ Sin archivo adjunto');
      }

      // ✅ PASO 2: Agendar sesión (con o sin documento_url)
      console.log('📅 PASO 2: Agendando sesión...');

      const payload = {
        fecha_hora: datosSesion.fecha_hora,
        duracion_horas: datosSesion.duracion_horas,
        descripcion_estudiante: datosSesion.descripcion_estudiante || '',
        ...(documento_url && { documento_url }) // Solo incluir si existe
      };

      console.log('📤 Payload final:', JSON.stringify(payload, null, 2));

      const response = await fetch(`${API_URL}/paquetes-horas/${compraId}/agendar`, {
        method: 'POST',
        headers: this._getHeaders(),
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      console.log('📥 Respuesta del servidor:', JSON.stringify(data, null, 2));

      if (!response.ok || !data.success) {
        console.error('❌ Error agendando sesión:', data.message);
        return {
          success: false,
          message: data.message || 'Error al agendar la sesión',
          errors: data.errors || []
        };
      }

      console.log('✅ SESIÓN AGENDADA EXITOSAMENTE');
      console.log('═══════════════════════════════════════════════');

      return {
        success: true,
        data: data.data,
        message: data.message || 'Sesión agendada exitosamente'
      };

    } catch (error) {
      console.error('❌ EXCEPCIÓN al agendar sesión:', error);
      console.log('═══════════════════════════════════════════════');
      return {
        success: false,
        message: 'Error de conexión al agendar la sesión'
      };
    }
  }

  // Listar compras del estudiante
  async listarMisCompras() {
    try {
      const response = await fetch(`${API_URL}/compras/estudiante`, {
        headers: this._getHeaders()
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          data: {
            compras: data.data?.compras || [],
            total: data.data?.total || 0
          }
        };
      } else {
        return {
          success: false,
          message: data.message || 'Error al obtener compras'
        };
      }

    } catch (error) {
      console.error('Error al listar compras:', error);
      return {
        success: false,
        message: 'Error de conexión.'
      };
    }
  }

  // Obtener detalle de una compra
  async obtenerDetalleCompra(compraId) {
    try {
      const response = await fetch(`${API_URL}/compras/${compraId}`, {
        headers: this._getHeaders()
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, data: data.data };
      } else {
        return {
          success: false,
          message: data.message || 'Error al obtener detalle'
        };
      }

    } catch (error) {
      console.error('Error al obtener detalle:', error);
      return {
        success: false,
        message: 'Error de conexión.'
      };
    }
  }

  /**
   * ✅ ACTUALIZADO: Obtener detalle de paquete de horas con sesiones
   * @param {string} compraId - ID de la compra del paquete
   * @returns {Promise}
   */
  async obtenerDetallePaquete(compraId) {
    try {
      console.log('🔄 Obteniendo detalle del paquete:', compraId);

      const response = await fetch(`${API_URL}/paquetes-horas/${compraId}`, {
        method: 'GET',
        headers: this._getHeaders()
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        return {
          success: false,
          message: data.message || 'Error al obtener el paquete'
        };
      }

      console.log('✅ Paquete obtenido:', data.data);

      return {
        success: true,
        data: data.data // { compra, sesiones, total_sesiones }
      };

    } catch (error) {
      console.error('❌ Error obteniendo paquete:', error);
      return {
        success: false,
        message: 'Error de conexión al obtener el paquete'
      };
    }
  }

  // Listar sesiones de un paquete
  async listarSesionesPaquete(compraId) {
    try {
      const response = await fetch(`${API_URL}/paquetes-horas/${compraId}/sesiones`, {
        headers: this._getHeaders()
      });

      const data = await response.json();

      if (response.ok) {
        return {
          success: true,
          data: {
            sesiones: data.data?.sesiones || [],
            total: data.data?.total || 0
          }
        };
      } else {
        return {
          success: false,
          message: data.message || 'Error al obtener sesiones'
        };
      }

    } catch (error) {
      console.error('Error al listar sesiones:', error);
      return {
        success: false,
        message: 'Error de conexión.'
      };
    }
  }

  // ==================== UTILIDADES ====================

  // ====== NUEVO (solo UI): moneda por timezone + conversion aproximada ======
  _getBrowserTimeZone() {
    return (
      localStorage.getItem('timezone') ||
      Intl.DateTimeFormat().resolvedOptions().timeZone ||
      'America/Bogota'
    );
  }

  /**
   * Mapeo amplio por zonas horarias típicas (LATAM + ES + algunos otros).
   * IMPORTANTE: timezone no identifica país al 100%, pero es suficiente para aproximación visual.
   */
  _getCurrencyConfigByTimezone(timezone) {
    const tz = String(timezone || '').toLowerCase();

    // Default: Colombia
    const fallback = { locale: 'es-CO', currency: 'COP', rateFromCOP: 1 };

    // ---- COLOMBIA (COP) ----
    if (tz.includes('bogota')) return { locale: 'es-CO', currency: 'COP', rateFromCOP: 1 };

    // ---- MÉXICO (MXN) ----
    if (tz.includes('mexico') || tz.includes('tijuana') || tz.includes('chihuahua') || tz.includes('monterrey') || tz.includes('cancun')) {
      return { locale: 'es-MX', currency: 'MXN', rateFromCOP: 0.0046 };
    }

    // ---- CENTROAMÉRICA (mezcla, simplificado) ----
    // Guatemala (GTQ), Honduras (HNL), Nicaragua (NIO), Costa Rica (CRC), El Salvador (USD), Panamá (USD)
    if (tz.includes('guatemala')) return { locale: 'es-GT', currency: 'GTQ', rateFromCOP: 0.0019 };
    if (tz.includes('tegucigalpa')) return { locale: 'es-HN', currency: 'HNL', rateFromCOP: 0.0063 };
    if (tz.includes('managua')) return { locale: 'es-NI', currency: 'NIO', rateFromCOP: 0.0092 };
    if (tz.includes('costa_rica') || tz.includes('san_jose')) return { locale: 'es-CR', currency: 'CRC', rateFromCOP: 0.13 };
    if (tz.includes('el_salvador')) return { locale: 'es-SV', currency: 'USD', rateFromCOP: 0.00025 };
    if (tz.includes('panama')) return { locale: 'es-PA', currency: 'USD', rateFromCOP: 0.00025 };

    // ---- CARIBE (simplificado) ----
    // República Dominicana (DOP), Puerto Rico (USD), Cuba (CUP) — Cuba es raro por timezone; lo omitimos
    if (tz.includes('santo_domingo')) return { locale: 'es-DO', currency: 'DOP', rateFromCOP: 0.015 };
    if (tz.includes('puerto_rico')) return { locale: 'es-PR', currency: 'USD', rateFromCOP: 0.00025 };

    // ---- VENEZUELA (USD simplificado) ----
    // (Venezuela tiene VES, pero por simplicidad y “poca precisión”, lo pongo USD)
    if (tz.includes('caracas')) return { locale: 'es-VE', currency: 'USD', rateFromCOP: 0.00025 };

    // ---- ECUADOR (USD) ----
    if (tz.includes('guayaquil') || tz.includes('quito')) return { locale: 'es-EC', currency: 'USD', rateFromCOP: 0.00025 };

    // ---- PERÚ (PEN) ----
    if (tz.includes('lima')) return { locale: 'es-PE', currency: 'PEN', rateFromCOP: 0.00095 };

    // ---- BOLIVIA (BOB) ----
    if (tz.includes('la_paz')) return { locale: 'es-BO', currency: 'BOB', rateFromCOP: 0.0017 };

    // ---- CHILE (CLP) ----
    if (tz.includes('santiago')) return { locale: 'es-CL', currency: 'CLP', rateFromCOP: 0.22 };

    // ---- ARGENTINA (ARS) ----
    if (tz.includes('argentina') || tz.includes('buenos_aires')) return { locale: 'es-AR', currency: 'ARS', rateFromCOP: 0.26 };

    // ---- URUGUAY (UYU) ----
    if (tz.includes('montevideo')) return { locale: 'es-UY', currency: 'UYU', rateFromCOP: 0.0098 };

    // ---- PARAGUAY (PYG) ----
    if (tz.includes('asuncion')) return { locale: 'es-PY', currency: 'PYG', rateFromCOP: 1.8 };

    // ---- BRASIL (BRL) ----
    if (tz.includes('sao_paulo') || tz.includes('fortaleza') || tz.includes('manaus') || tz.includes('rio_branco') || tz.includes('recife')) {
      return { locale: 'pt-BR', currency: 'BRL', rateFromCOP: 0.00125 };
    }

    // ---- USA (USD) / CANADÁ (CAD) ----
    if (tz.includes('new_york') || tz.includes('los_angeles') || tz.includes('chicago') || tz.includes('denver') || tz.includes('phoenix')) {
      return { locale: 'en-US', currency: 'USD', rateFromCOP: 0.00025 };
    }
    if (tz.includes('toronto') || tz.includes('vancouver') || tz.includes('edmonton') || tz.includes('halifax')) {
      return { locale: 'en-CA', currency: 'CAD', rateFromCOP: 0.00034 };
    }

    // ---- ESPAÑA / EUROPA (EUR) ----
    if (tz.includes('madrid') || tz.includes('barcelona') || tz.includes('canary') || tz.includes('ceuta') || tz.includes('melilla')) {
      return { locale: 'es-ES', currency: 'EUR', rateFromCOP: 0.00023 };
    }
    // Algunos otros en Europa (por si timezone viene distinto)
    if (tz.includes('paris') || tz.includes('berlin') || tz.includes('rome') || tz.includes('amsterdam') || tz.includes('lisbon')) {
      return { locale: 'es-ES', currency: 'EUR', rateFromCOP: 0.00023 };
    }

    // ---- REINO UNIDO (GBP) ----
    if (tz.includes('london')) return { locale: 'en-GB', currency: 'GBP', rateFromCOP: 0.00020 };

    // ---- AUSTRALIA / NZ (por si acaso) ----
    if (tz.includes('sydney') || tz.includes('melbourne') || tz.includes('brisbane') || tz.includes('perth')) {
      return { locale: 'en-AU', currency: 'AUD', rateFromCOP: 0.00038 };
    }
    if (tz.includes('auckland')) return { locale: 'en-NZ', currency: 'NZD', rateFromCOP: 0.00041 };

    return fallback;
  }

  _convertFromCOP(precioCOP, rateFromCOP) {
    const n = Number(precioCOP);
    if (!Number.isFinite(n)) return 0;

    const rate = Number(rateFromCOP);
    if (!Number.isFinite(rate) || rate <= 0) return n;

    return n * rate;
  }

  // Formatear precio (ACTUALIZADO: solo visual)
  formatearPrecio(precio) {
    const timezone = this._getBrowserTimeZone();
    const cfg = this._getCurrencyConfigByTimezone(timezone);

    const precioConvertido = this._convertFromCOP(precio, cfg.rateFromCOP);

    // Mantener el "look" anterior: COP sin decimales; USD/EUR/GBP/CAD/AUD/NZD con 2.
    const usaDecimales = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'NZD', 'PEN', 'BOB', 'BRL', 'MXN', 'UYU', 'GTQ', 'HNL', 'NIO', 'DOP'].includes(cfg.currency);

    return new Intl.NumberFormat(cfg.locale, {
      style: 'currency',
      currency: cfg.currency,
      currencyDisplay: 'code', // ✅ OPCIÓN A: mostrar COP/MXN/EUR/etc [web:35]
      minimumFractionDigits: usaDecimales ? 2 : 0,
      maximumFractionDigits: usaDecimales ? 2 : 0
    }).format(precioConvertido);
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
