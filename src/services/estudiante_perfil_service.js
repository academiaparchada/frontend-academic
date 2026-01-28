// src/services/estudiante_perfil_service.js
const API_URL = import.meta.env.VITE_API_URL || 'https://api.parcheacademico.com/api';

class EstudiantePerfilService {
  _getToken() {
    return localStorage.getItem('token');
  }

  _getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this._getToken()}`
    };
  }

  async obtenerMiPerfil() {
    try {
      const response = await fetch(`${API_URL}/estudiante/perfil`, {
        method: 'GET',
        headers: this._getHeaders()
      });

      const data = await response.json();
      return response.ok
        ? { success: true, data: data.data }
        : { success: false, status: response.status, message: data.message || 'Error obteniendo perfil' };
    } catch (error) {
      console.error('Error obteniendo perfil estudiante:', error);
      return { success: false, status: 0, message: 'Error de conexión' };
    }
  }

  async actualizarMiPerfil(payload) {
    try {
      const response = await fetch(`${API_URL}/estudiante/perfil`, {
        method: 'PUT',
        headers: this._getHeaders(),
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      return response.ok
        ? { success: true, data: data.data, message: data.message }
        : { success: false, status: response.status, message: data.message || 'Error actualizando perfil', errors: data.errors };
    } catch (error) {
      console.error('Error actualizando perfil estudiante:', error);
      return { success: false, status: 0, message: 'Error de conexión' };
    }
  }

  async desactivarCuenta() {
    try {
      const response = await fetch(`${API_URL}/estudiante/cuenta`, {
        method: 'DELETE',
        headers: this._getHeaders()
      });

      const data = await response.json();
      return response.ok
        ? { success: true, message: data.message }
        : { success: false, status: response.status, message: data.message || 'Error desactivando cuenta' };
    } catch (error) {
      console.error('Error desactivando cuenta estudiante:', error);
      return { success: false, status: 0, message: 'Error de conexión' };
    }
  }
}

export default new EstudiantePerfilService();
