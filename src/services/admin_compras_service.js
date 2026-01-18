// src/services/admin_compras_service.js
const API_URL = 'https://api.parcheacademico.com/api/admin/compras';

class AdminComprasService {
  _getToken() {
    return localStorage.getItem('token');
  }

  _getAuthHeaders() {
    return {
      Authorization: `Bearer ${this._getToken()}`,
      Accept: 'application/json',
    };
  }

  async listarCompras({ estado_pago, tipo_compra, page = 1, limit = 10, fechaInicio, fechaFin } = {}) {
    try {
      const params = new URLSearchParams();
      if (estado_pago) params.append('estado_pago', estado_pago);
      if (tipo_compra) params.append('tipo_compra', tipo_compra);
      if (fechaInicio) params.append('fechaInicio', fechaInicio);
      if (fechaFin) params.append('fechaFin', fechaFin);
      params.append('page', String(page));
      params.append('limit', String(limit));

      const url = `${API_URL}?${params.toString()}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: this._getAuthHeaders(),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        return {
          success: false,
          status: response.status,
          message: data?.message || 'Error consultando compras',
          raw: data,
        };
      }

      return { success: true, data: data.data };
    } catch (error) {
      console.error('Error listando compras:', error);
      return { success: false, status: 0, message: 'Error de conexión. Intenta más tarde.' };
    }
  }
}

export default new AdminComprasService();
