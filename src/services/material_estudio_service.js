// src/services/material_estudio_service.js
import { API_BASE_URL, getToken, buildQuery } from './api';

/**
 * Servicio para gestionar el material de estudio de los cursos y sesiones
 */
const materialEstudioService = {
  /**
   * Lista el material de estudio de un curso específico
   * @param {string} cursoId - ID del curso
   * @returns {Promise<Object>} - Lista de materiales
   */
  listarMaterial: async (cursoId) => {
  try {
    const token = getToken();
    
    console.log('🔧 [SERVICE DEBUG] listarMaterial llamado:', {
      cursoId,
      hasToken: !!token,
      tokenLength: token?.length
    });
    
    if (!token) {
      console.error('❌ No hay token');
      return {
        success: false,
        status: 401,
        message: 'Inicia sesión para continuar',
      };
    }

    if (!cursoId) {
      console.error('❌ No hay cursoId');
      return {
        success: false,
        status: 400,
        message: 'El ID del curso es requerido',
      };
    }

    const query = buildQuery({ curso_id: cursoId });
    const url = `${API_BASE_URL}/api/material-estudio${query}`;
    
    console.log('🔧 [SERVICE DEBUG] Haciendo petición:', {
      url,
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token.substring(0, 20)}...`
      }
    });
    
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
    });

    console.log('🔧 [SERVICE DEBUG] Respuesta recibida:', {
      ok: response.ok,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries())
    });

    const data = await response.json();
    
    console.log('🔧 [SERVICE DEBUG] Data parseada:', {
      data,
      dataKeys: Object.keys(data)
    });

    if (!response.ok) {
      console.error('❌ Respuesta no OK:', {
        status: response.status,
        data
      });
      
      return {
        success: false,
        status: response.status,
        message: materialEstudioService._getMensajeError(response.status, data.message),
        data: [],
      };
    }

    // Extraer el array de materiales correctamente
    const materiales = data.data?.materiales || data.materiales || data.data || [];

    console.log('✅ [SERVICE DEBUG] Materiales extraídos:', {
      materiales,
      length: materiales.length,
      isArray: Array.isArray(materiales)
    });

    return {
      success: true,
      status: 200,
      message: 'Material cargado exitosamente',
      data: Array.isArray(materiales) ? materiales : [],
    };
  } catch (error) {
    console.error('❌ [SERVICE DEBUG] Error capturado:', {
      error,
      message: error.message,
      stack: error.stack
    });
    
    return {
      success: false,
      status: 500,
      message: 'Ocurrió un error al cargar el material. Intenta de nuevo.',
      data: [],
    };
  }
},



  /**
   * Lista el material de estudio de una sesión de clase
   * @param {string} sesionClaseId - ID de la sesión
   * @returns {Promise<Object>} - Lista de materiales
   */
  listarMaterialSesion: async (sesionClaseId) => {
    try {
      const token = getToken();
      if (!token) {
        return {
          success: false,
          status: 401,
          message: 'Inicia sesión para continuar',
        };
      }

      if (!sesionClaseId) {
        return {
          success: false,
          status: 400,
          message: 'El ID de la sesión es requerido',
        };
      }

      const query = buildQuery({ sesion_clase_id: sesionClaseId });
      const response = await fetch(`${API_BASE_URL}/api/material-estudio${query}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          status: response.status,
          message: materialEstudioService._getMensajeError(response.status, data.message),
          data: null,
        };
      }

      return {
        success: true,
        status: 200,
        message: 'Material cargado exitosamente',
        data: data.data || [],
      };
    } catch (error) {
      console.error('Error al listar material:', error);
      return {
        success: false,
        status: 500,
        message: 'Ocurrió un error al cargar el material. Intenta de nuevo.',
      };
    }
  },

  /**
   * Crea un nuevo material de estudio (sube archivo)
   * @param {Object} materialData - Datos del material
   * @param {File} materialData.file - Archivo a subir
   * @param {string} materialData.titulo - Título del material
   * @param {string} materialData.tipo - Tipo: documento | video | imagen | otro
   * @param {string} [materialData.curso_id] - ID del curso (opcional si hay sesion_clase_id)
   * @param {string} [materialData.sesion_clase_id] - ID de la sesión (opcional si hay curso_id)
   * @returns {Promise<Object>} - Resultado de la operación
   */
  crearMaterial: async (materialData) => {
    try {
      const token = getToken();
      if (!token) {
        return {
          success: false,
          status: 401,
          message: 'Inicia sesión para continuar',
        };
      }

      // Validaciones
      if (!materialData.file) {
        return {
          success: false,
          status: 400,
          message: 'Debes seleccionar un archivo',
        };
      }

      if (!materialData.titulo || !materialData.tipo) {
        return {
          success: false,
          status: 400,
          message: 'El título y tipo son obligatorios',
        };
      }

      if (!materialData.curso_id && !materialData.sesion_clase_id) {
        return {
          success: false,
          status: 400,
          message: 'Debes especificar un curso o una sesión',
        };
      }

      // Crear FormData
      const formData = new FormData();
      formData.append('file', materialData.file);
      formData.append('titulo', materialData.titulo);
      formData.append('tipo', materialData.tipo);
      
      if (materialData.curso_id) {
        formData.append('curso_id', materialData.curso_id);
      }
      
      if (materialData.sesion_clase_id) {
        formData.append('sesion_clase_id', materialData.sesion_clase_id);
      }

      // Enviar petición
      const response = await fetch(`${API_BASE_URL}/api/material-estudio`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          // NO enviar Content-Type, fetch lo hace automáticamente con FormData
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          status: response.status,
          message: materialEstudioService._getMensajeError(response.status, data.message),
          data: null,
        };
      }

      return {
        success: true,
        status: 201,
        message: 'Material subido exitosamente',
        data: data.data || null,
      };
    } catch (error) {
      console.error('Error al crear material:', error);
      return {
        success: false,
        status: 500,
        message: 'Ocurrió un error al subir el material. Intenta de nuevo.',
      };
    }
  },

  /**
   * Elimina un material de estudio
   * @param {string} materialId - ID del material a eliminar
   * @returns {Promise<Object>} - Resultado de la operación
   */
  eliminarMaterial: async (materialId) => {
    try {
      const token = getToken();
      if (!token) {
        return {
          success: false,
          status: 401,
          message: 'Inicia sesión para continuar',
        };
      }

      if (!materialId) {
        return {
          success: false,
          status: 400,
          message: 'El ID del material es requerido',
        };
      }

      const response = await fetch(
        `${API_BASE_URL}/api/material-estudio/${materialId}`,
        {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          status: response.status,
          message: materialEstudioService._getMensajeError(response.status, data.message),
          data: null,
        };
      }

      return {
        success: true,
        status: 200,
        message: 'Material eliminado exitosamente',
        data: data.data || null,
      };
    } catch (error) {
      console.error('Error al eliminar material:', error);
      return {
        success: false,
        status: 500,
        message: 'Ocurrió un error al eliminar el material. Intenta de nuevo.',
      };
    }
  },

  /**
   * Obtiene la URL de descarga de un material específico
   * @param {string} materialId - ID del material
   * @returns {Promise<Object>} - URL de descarga y datos del material
   */
  obtenerUrlDescarga: async (materialId) => {
    try {
      const token = getToken();
      if (!token) {
        return {
          success: false,
          status: 401,
          message: 'Inicia sesión para continuar',
        };
      }

      if (!materialId) {
        return {
          success: false,
          status: 400,
          message: 'El ID del material es requerido',
        };
      }

      const response = await fetch(
        `${API_BASE_URL}/api/material-estudio/${materialId}/descargar`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          status: response.status,
          message: materialEstudioService._getMensajeError(response.status, data.message),
          data: null,
        };
      }

      return {
        success: true,
        status: 200,
        message: 'URL obtenida exitosamente',
        data: data.data || null,
      };
    } catch (error) {
      console.error('Error al obtener URL de descarga:', error);
      return {
        success: false,
        status: 500,
        message: 'Ocurrió un error al obtener el archivo. Intenta de nuevo.',
      };
    }
  },

  /**
   * Descarga un archivo (abre la URL en nueva pestaña)
   * @param {string} materialId - ID del material a descargar
   * @returns {Promise<Object>} - Resultado de la operación
   */
  descargarMaterial: async (materialId) => {
    try {
      const resultado = await materialEstudioService.obtenerUrlDescarga(materialId);

      if (!resultado.success) {
        return resultado;
      }

      const { url, titulo } = resultado.data;

      if (!url) {
        return {
          success: false,
          status: 500,
          message: 'No se pudo obtener la URL del archivo',
        };
      }

      // Abrir en nueva pestaña para descargar/visualizar
      window.open(url, '_blank', 'noopener,noreferrer');

      return {
        success: true,
        status: 200,
        message: `Descargando: ${titulo}`,
      };
    } catch (error) {
      console.error('Error al descargar material:', error);
      return {
        success: false,
        status: 500,
        message: 'Ocurrió un error al descargar el archivo. Intenta de nuevo.',
      };
    }
  },

  /**
   * Valida el tipo de archivo según extensión
   * @param {File} file - Archivo a validar
   * @returns {Object} - { valido: boolean, mensaje: string }
   */
  validarArchivoPermitido: (file) => {
    const tiposPermitidos = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/png',
      'image/jpeg',
      'image/jpg',
      'image/webp',
      'application/zip',
      'application/x-rar-compressed',
      'text/plain',
      'video/mp4',
    ];

    if (!tiposPermitidos.includes(file.type)) {
      return {
        valido: false,
        mensaje: 'Tipo de archivo no permitido. Solo: PDF, DOC, DOCX, PNG, JPG, WEBP, ZIP, RAR, TXT, MP4',
      };
    }

    // Validar tamaño máximo (50MB)
    const tamañoMaximo = 50 * 1024 * 1024; // 50MB
    if (file.size > tamañoMaximo) {
      return {
        valido: false,
        mensaje: 'El archivo es demasiado grande. Tamaño máximo: 50MB',
      };
    }

    return { valido: true, mensaje: '' };
  },

  /**
   * Obtiene el mensaje de error apropiado según el código de estado
   * @param {number} status - Código de estado HTTP
   * @param {string} defaultMessage - Mensaje por defecto del backend
   * @returns {string} - Mensaje de error amigable
   * @private
   */
  _getMensajeError: (status, defaultMessage = '') => {
    const mensajes = {
      400: defaultMessage || 'Solicitud inválida. Verifica los datos enviados.',
      401: 'Inicia sesión para continuar',
      403: 'No tienes permisos para realizar esta acción',
      404: 'Este material ya no está disponible',
      500: 'Ocurrió un error. Intenta de nuevo',
    };

    return mensajes[status] || defaultMessage || 'Error desconocido';
  },

  /**
   * Formatea el tamaño del archivo de bytes a formato legible
   * @param {number} bytes - Tamaño en bytes
   * @returns {string} - Tamaño formateado (ej: "2.5 MB")
   */
  formatearTamano: (bytes) => {
    if (!bytes || bytes === 0) return '0 B';

    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  },

  /**
   * Obtiene el icono apropiado según el tipo de archivo
   * @param {string} tipo - Tipo de archivo
   * @returns {string} - Emoji del icono
   */
  obtenerIconoTipo: (tipo) => {
    const iconos = {
      // Por tipo de material
      documento: '📄',
      video: '🎥',
      imagen: '🖼️',
      otro: '📎',
      // Por extensión
      pdf: '📄',
      doc: '📝',
      docx: '📝',
      xls: '📊',
      xlsx: '📊',
      ppt: '📽️',
      pptx: '📽️',
      zip: '📦',
      rar: '📦',
      jpg: '🖼️',
      jpeg: '🖼️',
      png: '🖼️',
      gif: '🖼️',
      mp4: '🎥',
      mp3: '🎵',
      txt: '📃',
    };

    return iconos[tipo?.toLowerCase()] || '📎';
  },
};

export default materialEstudioService;
