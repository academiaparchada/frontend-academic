// src/services/contabilidad_admin_service.js

const API_URL = 'https://api.parcheacademico.com/api/admin/contabilidad';

class ContabilidadAdminService {
  _getToken() {
    return localStorage.getItem('token');
  }

  _getAuthHeaders() {
    return {
      Authorization: `Bearer ${this._getToken()}`,
      Accept: 'application/json',
    };
  }

  async obtenerContabilidad({ fechaInicio, fechaFin }) {
    try {
      if (!fechaInicio || !fechaFin) {
        return { success: false, status: 400, message: 'Debes seleccionar un rango de fechas' };
      }

      const params = new URLSearchParams({ fechaInicio, fechaFin });
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
          message: data?.message || 'Error consultando contabilidad',
          raw: data,
        };
      }

      return { success: true, data: data.data };
    } catch (error) {
      console.error('Error obteniendo contabilidad:', error);
      return { success: false, status: 0, message: 'Error de conexión. Intenta más tarde.' };
    }
  }

  formatearPrecio(precio) {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(Number(precio || 0));
  }

  ordenarPagosPorProfesor(pagos = []) {
    return [...pagos].sort(
      (a, b) => Number(b.total_pago_profesor || 0) - Number(a.total_pago_profesor || 0)
    );
  }
}

export default new ContabilidadAdminService();
