// src/services/ingresos_adicionales_admin_service.js

const API_URL = 'https://api.parcheacademico.com/api/admin/ingresos-adicionales';

class IngresosAdicionalesAdminService {
  _getToken() {
    return localStorage.getItem('token');
  }

  _getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': `Bearer ${this._getToken()}`,
    };
  }

  async crearIngresoAdicional(payload) {
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: this._getHeaders(),
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data?.success) {
        return {
          success: false,
          status: response.status,
          message: data?.message || 'Error creando ingreso adicional',
          raw: data,
        };
      }

      return {
        success: true,
        status: response.status,
        data: data.data, // backend: { success:true, data:<registro> }
        message: data?.message,
      };
    } catch (error) {
      console.error('Error creando ingreso adicional:', error);
      return { success: false, status: 0, message: 'Error de conexión. Intenta más tarde.' };
    }
  }
}

export default new IngresosAdicionalesAdminService();
