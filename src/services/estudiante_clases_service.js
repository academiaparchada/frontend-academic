// src/services/estudiante_clases_service.js

const API_URL = import.meta.env.VITE_API_URL || 'https://api.parcheacademico.com/api';

class EstudianteClasesService {
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

  async listarMisClases(page = 1, limit = 10) {
    try {
      const token = this._getToken();
      if (!token) {
        return {
          success: false,
          status: 401,
          message: 'Token ausente'
        };
      }

      const url = `${API_URL}/estudiante/clases?page=${page}&limit=${limit}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: this._getHeaders()
      });

      const data = await response.json().catch(() => null);

      if (!response.ok || !data?.success) {
        return {
          success: false,
          status: response.status,
          message: data?.message || 'Error al obtener clases',
          errors: data?.errors || []
        };
      }

      return {
        success: true,
        status: response.status,
        data: {
          sesiones: data.data?.sesiones || [],
          pagination: data.data?.pagination || { page, limit, returned: 0 }
        }
      };
    } catch (error) {
      console.error('❌ Error listarMisClases:', error);
      return {
        success: false,
        status: 0,
        message: 'Error de conexión'
      };
    }
  }

  formatearFechaHora(fecha) {
    if (!fecha) return 'No especificada';

    const timezone = localStorage.getItem('timezone') ;

    return new Date(fecha).toLocaleString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: timezone
    });
  }

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

export default new EstudianteClasesService();
