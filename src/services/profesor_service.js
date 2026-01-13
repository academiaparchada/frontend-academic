// src/services/profesor_service.js
const API_URL = import.meta.env.VITE_API_URL || 'https://academiaparchada.onrender.com/api';

class ProfesorService {
  _getToken() {
    return localStorage.getItem('token');
  }

  _getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this._getToken()}`
    };
  }

  // ==================== CU-040: MIS CLASES ASIGNADAS ====================
  
  async obtenerMisClases(page = 1, limit = 10) {
    try {
      const response = await fetch(
        `${API_URL}/profesor/clases?page=${page}&limit=${limit}`,
        { headers: this._getHeaders() }
      );
      const data = await response.json();
      return response.ok ? { success: true, data: data.data } : { success: false, message: data.message };
    } catch (error) {
      console.error('Error obteniendo clases:', error);
      return { success: false, message: 'Error de conexión' };
    }
  }

  async obtenerDetalleSesion(sesionId) {
    try {
      const response = await fetch(
        `${API_URL}/profesor/clases/${sesionId}`,
        { headers: this._getHeaders() }
      );
      const data = await response.json();
      return response.ok ? { success: true, data: data.data } : { success: false, message: data.message };
    } catch (error) {
      console.error('Error obteniendo sesión:', error);
      return { success: false, message: 'Error de conexión' };
    }
  }

  // ==================== CU-041 y CU-042: MIS CURSOS ====================
  
  async obtenerMisCursos(page = 1, limit = 10) {
    try {
      const response = await fetch(
        `${API_URL}/profesor/cursos?page=${page}&limit=${limit}`,
        { headers: this._getHeaders() }
      );
      const data = await response.json();
      return response.ok ? { success: true, data: data.data } : { success: false, message: data.message };
    } catch (error) {
      console.error('Error obteniendo cursos:', error);
      return { success: false, message: 'Error de conexión' };
    }
  }

  async obtenerInscritosCurso(cursoId) {
    try {
      const response = await fetch(
        `${API_URL}/profesor/cursos/${cursoId}/inscritos`,
        { headers: this._getHeaders() }
      );
      const data = await response.json();
      return response.ok ? { success: true, data: data.data } : { success: false, message: data.message };
    } catch (error) {
      console.error('Error obteniendo inscritos:', error);
      return { success: false, message: 'Error de conexión' };
    }
  }

  // ==================== CU-043: GESTIONAR HORARIOS ====================
  
  async obtenerMisHorarios() {
    try {
      const response = await fetch(
        `${API_URL}/profesor/horarios`,
        { headers: this._getHeaders() }
      );
      const data = await response.json();
      return response.ok ? { success: true, data: data.data } : { success: false, message: data.message };
    } catch (error) {
      console.error('Error obteniendo horarios:', error);
      return { success: false, message: 'Error de conexión' };
    }
  }

  async crearHorario(datosHorario) {
    try {
      const response = await fetch(
        `${API_URL}/profesor/horarios`,
        {
          method: 'POST',
          headers: this._getHeaders(),
          body: JSON.stringify(datosHorario)
        }
      );
      const data = await response.json();
      return response.ok ? { success: true, data: data.data } : { success: false, message: data.message, errors: data.errors };
    } catch (error) {
      console.error('Error creando horario:', error);
      return { success: false, message: 'Error de conexión' };
    }
  }

  async eliminarHorario(franjaId) {
    try {
      const response = await fetch(
        `${API_URL}/profesor/horarios/${franjaId}`,
        {
          method: 'DELETE',
          headers: this._getHeaders()
        }
      );
      const data = await response.json();
      return response.ok ? { success: true, data: data.data } : { success: false, message: data.message };
    } catch (error) {
      console.error('Error eliminando horario:', error);
      return { success: false, message: 'Error de conexión' };
    }
  }

  // ==================== CU-045: EDITAR PERFIL ====================
  
  async actualizarPerfil(datosPerfil) {
    try {
      const response = await fetch(
        `${API_URL}/profesor/perfil`,
        {
          method: 'PUT',
          headers: this._getHeaders(),
          body: JSON.stringify(datosPerfil)
        }
      );
      const data = await response.json();
      return response.ok ? { success: true, data: data.data } : { success: false, message: data.message, errors: data.errors };
    } catch (error) {
      console.error('Error actualizando perfil:', error);
      return { success: false, message: 'Error de conexión' };
    }
  }

  // ==================== UTILIDADES ====================
  
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

  obtenerBadgeEstado(estado) {
    const badges = {
      'programada': { text: '📅 Programada', class: 'badge-programada' },
      'completada': { text: '✅ Completada', class: 'badge-completada' },
      'cancelada': { text: '❌ Cancelada', class: 'badge-cancelada' }
    };
    return badges[estado] || badges['programada'];
  }
}

export default new ProfesorService();
