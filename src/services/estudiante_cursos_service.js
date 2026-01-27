// src/services/estudiante_cursos_service.js

const API_URL = import.meta.env.VITE_API_URL || 'https://api.parcheacademico.com/api';

class EstudianteCursosService {
  _getToken() {
    return localStorage.getItem('token');
  }

  _getHeaders() {
    const token = this._getToken();
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  /**
   * Listar cursos del estudiante autenticado
   * @param {number} page - Número de página
   * @param {number} limit - Límite de resultados por página
   * @returns {Promise<Object>} - Respuesta con cursos y paginación
   */
  async listarMisCursos(page = 1, limit = 10) {
    try {
      const token = this._getToken();
      if (!token) {
        return {
          success: false,
          status: 401,
          message: 'Token ausente'
        };
      }

      const url = `${API_URL}/estudiante/cursos?page=${page}&limit=${limit}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: this._getHeaders()
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        return {
          success: false,
          status: response.status,
          message: data?.message || 'Error al obtener cursos',
          errors: data?.errors || []
        };
      }

      return {
        success: true,
        status: response.status,
        data: {
          cursos: data.data?.cursos || [],
          pagination: data.data?.pagination || { page, limit, returned: 0 }
        }
      };
    } catch (error) {
      console.error('❌ Error listarMisCursos:', error);
      return {
        success: false,
        status: 0,
        message: 'Error de conexión'
      };
    }
  }

  /**
   * Obtener detalle de un curso específico del estudiante
   * @param {number} cursoId - ID del curso
   * @returns {Promise<Object>} - Respuesta con detalles del curso
   */
  async obtenerDetalleCurso(cursoId) {
    try {
      const token = this._getToken();
      if (!token) {
        return {
          success: false,
          status: 401,
          message: 'Token ausente'
        };
      }

      const url = `${API_URL}/estudiante/cursos/${cursoId}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: this._getHeaders()
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        return {
          success: false,
          status: response.status,
          message: data?.message || 'Error al obtener detalle del curso',
          errors: data?.errors || []
        };
      }

      return {
        success: true,
        status: response.status,
        data: data.data || {}
      };
    } catch (error) {
      console.error('❌ Error obtenerDetalleCurso:', error);
      return {
        success: false,
        status: 0,
        message: 'Error de conexión'
      };
    }
  }

  /**
   * Marcar módulo como completado
   * @param {number} moduloId - ID del módulo
   * @returns {Promise<Object>} - Respuesta de la operación
   */
  async marcarModuloCompletado(moduloId) {
    try {
      const token = this._getToken();
      if (!token) {
        return {
          success: false,
          status: 401,
          message: 'Token ausente'
        };
      }

      const url = `${API_URL}/estudiante/cursos/modulos/${moduloId}/completar`;

      const response = await fetch(url, {
        method: 'POST',
        headers: this._getHeaders()
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        return {
          success: false,
          status: response.status,
          message: data?.message || 'Error al marcar módulo como completado',
          errors: data?.errors || []
        };
      }

      return {
        success: true,
        status: response.status,
        message: data.message || 'Módulo marcado como completado',
        data: data.data || {}
      };
    } catch (error) {
      console.error('❌ Error marcarModuloCompletado:', error);
      return {
        success: false,
        status: 0,
        message: 'Error de conexión'
      };
    }
  }

  /**
   * Formatear fecha en formato legible
   * @param {string} fecha - Fecha en formato ISO
   * @returns {string} - Fecha formateada
   */
  formatearFecha(fecha) {
    if (!fecha) return 'No especificada';

    const timezone = localStorage.getItem('timezone') || 'America/Bogota';

    return new Date(fecha).toLocaleString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      timeZone: timezone
    });
  }

  /**
   * Calcular porcentaje de progreso
   * @param {number} completados - Módulos completados
   * @param {number} totales - Total de módulos
   * @returns {number} - Porcentaje (0-100)
   */
  calcularProgreso(completados, totales) {
    if (!totales || totales === 0) return 0;
    return Math.round((completados / totales) * 100);
  }

  /**
   * Validar si una URL es válida
   * @param {string} valor - URL a validar
   * @returns {boolean} - true si es válida
   */
  esUrlValida(valor) {
    if (!valor || typeof valor !== 'string') return false;
    try {
      const url = new URL(valor);
      return url.protocol === 'http:' || url.protocol === 'https:';
    } catch {
      return false;
    }
  }
}

export default new EstudianteCursosService();
