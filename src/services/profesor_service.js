// src/services/profesor_service.js
const API_URL = import.meta.env.VITE_API_URL || 'https://api.parcheacademico.com/api';

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

  // ==================== GESTIÓN DE LINKS DE MEET ====================

/**
 * Lista las clases pendientes de asignar link de Meet
 * Endpoint: GET /sesiones/pendientes
 * @returns {Promise<Object>} Resultado con las clases pendientes
 */
async listarPendientesMeet() {
  try {
    const response = await fetch(
      `${API_URL}/sesiones/pendientes`,
      { headers: this._getHeaders() }
    );
    const data = await response.json();
    
    if (!response.ok || !data.success) {
      return { 
        success: false, 
        message: data.message || 'Error listando pendientes' 
      };
    }
    
    return { 
      success: true, 
      data: data.data?.sesiones || [] 
    };
  } catch (error) {
    console.error('Error obteniendo clases pendientes de Meet:', error);
    return { success: false, message: 'Error de conexión' };
  }
}

/**
 * Valida que un link sea una URL válida de Google Meet
 * @param {string} link - El link a validar
 * @returns {boolean} true si es válido, false si no
 */
validarLinkMeet(link) {
  if (!link || link.trim() === '') {
    return false;
  }

  const linkLimpio = link.trim();

  // Según documentación: debe empezar con http
  if (!linkLimpio.startsWith('http://') && !linkLimpio.startsWith('https://')) {
    return false;
  }

  try {
    const url = new URL(linkLimpio);
    
    // Verificar que el dominio sea meet.google.com
    if (!url.hostname.includes('meet.google.com')) {
      return false;
    }

    // Verificar que tenga un código de reunión (pathname no vacío)
    if (url.pathname.length <= 1) {
      return false;
    }

    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Valida y retorna un mensaje descriptivo sobre el link de Meet
 * @param {string} link - El link a validar
 * @returns {Object} Objeto con {valido: boolean, mensaje: string}
 */
validarLinkMeetDetallado(link) {
  if (!link || link.trim() === '') {
    return { 
      valido: false, 
      mensaje: 'El link no puede estar vacío' 
    };
  }

  const linkLimpio = link.trim();

  // Validar que comience con http:// o https://
  if (!linkLimpio.startsWith('http://') && !linkLimpio.startsWith('https://')) {
    return { 
      valido: false, 
      mensaje: 'El link debe comenzar con http:// o https://' 
    };
  }

  try {
    const url = new URL(linkLimpio);
    
    // Verificar que el dominio sea meet.google.com
    if (!url.hostname.includes('meet.google.com')) {
      return { 
        valido: false, 
        mensaje: 'El link debe ser de Google Meet (meet.google.com)' 
      };
    }

    // Verificar que tenga un código de reunión
    if (url.pathname.length <= 1) {
      return { 
        valido: false, 
        mensaje: 'El link debe incluir el código de la reunión' 
      };
    }

    return { 
      valido: true, 
      mensaje: 'Link válido' 
    };
  } catch (error) {
    return { 
      valido: false, 
      mensaje: 'El formato del link no es válido. Ejemplo: https://meet.google.com/abc-defg-hij' 
    };
  }
}

/**
 * Asigna un link de Google Meet a una sesión de clase
 * Endpoint: PUT /sesiones/:sesionId/meet
 * @param {number} sesionId - ID de la sesión
 * @param {string} linkMeet - Link de Google Meet
 * @returns {Promise<Object>} Resultado de la operación
 */
async asignarMeetSesion(sesionId, linkMeet) {
  // Validar el link antes de enviar
  const validacion = this.validarLinkMeetDetallado(linkMeet);
  
  if (!validacion.valido) {
    return { 
      success: false, 
      message: validacion.mensaje 
    };
  }

  try {
    const response = await fetch(
      `${API_URL}/sesiones/${sesionId}/meet`,
      {
        method: 'PUT',
        headers: this._getHeaders(),
        body: JSON.stringify({ link_meet: linkMeet.trim() })
      }
    );
    
    const data = await response.json();
    
    if (!response.ok || !data.success) {
      return { 
        success: false, 
        message: data.message || 'Error asignando link de Meet' 
      };
    }
    
    return { 
      success: true, 
      data: data.data?.sesion, 
      message: data.message || 'Link de Meet asignado correctamente. El estudiante recibirá un correo.' 
    };
  } catch (error) {
    console.error('Error asignando link de Meet:', error);
    return { success: false, message: 'Error de conexión' };
  }
}

/**
 * Actualiza el link de Meet de una sesión existente
 * Endpoint: PUT /sesiones/:sesionId/meet
 * @param {number} sesionId - ID de la sesión
 * @param {string} linkMeet - Nuevo link de Google Meet
 * @returns {Promise<Object>} Resultado de la operación
 */
async actualizarMeetSesion(sesionId, linkMeet) {
  // Reutiliza la misma función ya que el endpoint es el mismo
  return this.asignarMeetSesion(sesionId, linkMeet);
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

    const timezone = localStorage.getItem('timezone') || 'America/Bogota';

    return new Date(fecha).toLocaleString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: timezone
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