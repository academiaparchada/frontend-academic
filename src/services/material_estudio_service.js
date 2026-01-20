// src/services/material_estudio_service.js
import { API_BASE_URL, getToken, buildQuery } from './api';

/**
 * Servicio para gestionar el material de estudio de los cursos
 */
const materialEstudioService = {
  /**
   * Lista el material de estudio de un curso específico
   * @param {number} cursoId - ID del curso
   * @returns {Promise<Object>} - Lista de materiales
   */
  listarMaterial: async (cursoId) => {
    try {
      const token = getToken();
      if (!token) {
        return {
          success: false,
          status: 401,
          message: 'Inicia sesión para continuar',
        };
      }

      if (!cursoId) {
        return {
          success: false,
          status: 400,
          message: 'El ID del curso es requerido',
        };
      }

      const query = buildQuery({ curso_id: cursoId });
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
   * Obtiene la URL de descarga de un material específico
   * @param {number} materialId - ID del material
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
   * @param {number} materialId - ID del material a descargar
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
   * Obtiene el mensaje de error apropiado según el código de estado
   * @param {number} status - Código de estado HTTP
   * @param {string} defaultMessage - Mensaje por defecto del backend
   * @returns {string} - Mensaje de error amigable
   * @private
   */
  _getMensajeError: (status, defaultMessage = '') => {
    const mensajes = {
      400: 'Solicitud inválida. Verifica los datos enviados.',
      401: 'Inicia sesión para continuar',
      403: 'Debes comprar el curso para descargar este material',
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
