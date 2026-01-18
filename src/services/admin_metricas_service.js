// src/services/admin_metricas_service.js
const API_URL = 'https://api.parcheacademico.com/api/admin/metricas';

class AdminMetricasService {
  _getToken() {
    return localStorage.getItem('token');
  }

  _getAuthHeaders() {
    return {
      Authorization: `Bearer ${this._getToken()}`,
      Accept: 'application/json',
    };
  }

  async obtenerMetricas({ fechaInicio, fechaFin } = {}) {
    try {
      const params = new URLSearchParams();
      if (fechaInicio) params.append('fechaInicio', fechaInicio);
      if (fechaFin) params.append('fechaFin', fechaFin);

      const url = params.toString() ? `${API_URL}?${params.toString()}` : API_URL;

      const response = await fetch(url, {
        method: 'GET',
        headers: this._getAuthHeaders(),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        return {
          success: false,
          status: response.status,
          message: data?.message || 'Error consultando métricas',
          raw: data,
        };
      }

      return { success: true, data: data.data };
    } catch (error) {
      console.error('Error obteniendo métricas:', error);
      return { success: false, status: 0, message: 'Error de conexión. Intenta más tarde.' };
    }
  }
}

export default new AdminMetricasService();
