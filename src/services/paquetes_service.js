// src/services/paquetes_service.js

const API_URL = 'https://academiaparchada.onrender.com/api/paquetes-horas';

class PaquetesService {
  /**
   * Obtiene el token de autenticación
   */
  getAuthHeaders() {
    const token = localStorage.getItem('token');
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    };
  }

  /**
   * Obtener detalle del paquete con sus sesiones
   * @param {string} compraId - ID de la compra del paquete
   */
  async obtenerDetallePaquete(compraId) {
    try {
      const response = await fetch(`${API_URL}/${compraId}`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message || 'Error al obtener el paquete'
        };
      }

      return {
        success: true,
        data: data.data
      };
    } catch (error) {
      console.error('Error al obtener paquete:', error);
      return {
        success: false,
        message: 'Error de conexión al obtener el paquete'
      };
    }
  }

  /**
   * Listar sesiones del paquete
   * @param {string} compraId - ID de la compra del paquete
   */
  async listarSesiones(compraId) {
    try {
      const response = await fetch(`${API_URL}/${compraId}/sesiones`, {
        method: 'GET',
        headers: this.getAuthHeaders()
      });

      const data = await response.json();

      if (!response.ok) {
        return {
          success: false,
          message: data.message || 'Error al obtener sesiones'
        };
      }

      return {
        success: true,
        data: data.data
      };
    } catch (error) {
      console.error('Error al obtener sesiones:', error);
      return {
        success: false,
        message: 'Error de conexión al obtener sesiones'
      };
    }
  }

  /**
   * Agendar una nueva sesión consumiendo horas del paquete
   * @param {string} compraId - ID de la compra del paquete
   * @param {object} datosAgendamiento - Datos de la sesión a agendar
   */
  async agendarSesion(compraId, datosAgendamiento) {
    try {
      console.log('📤 Agendando sesión:', { compraId, datosAgendamiento });

      const response = await fetch(`${API_URL}/${compraId}/agendar`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(datosAgendamiento)
      });

      const data = await response.json();
      console.log('📥 Respuesta del servidor:', data);

      if (!response.ok) {
        return {
          success: false,
          message: data.message || 'Error al agendar sesión',
          errors: data.errors || []
        };
      }

      return {
        success: true,
        data: data.data,
        message: data.message
      };
    } catch (error) {
      console.error('Error al agendar sesión:', error);
      return {
        success: false,
        message: 'Error de conexión al agendar la sesión'
      };
    }
  }

  /**
   * Formatea una fecha ISO a string legible
   * @param {string} isoDate - Fecha en formato ISO
   * @param {string} timezone - Zona horaria del usuario
   */
  formatearFecha(isoDate, timezone = 'America/Bogota') {
    if (!isoDate) return 'No especificada';

    try {
      const date = new Date(isoDate);
      return new Intl.DateTimeFormat('es-CO', {
        timeZone: timezone,
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      }).format(date);
    } catch (error) {
      console.error('Error formateando fecha:', error);
      return isoDate;
    }
  }

  /**
   * Convierte fecha local a ISO string con timezone
   * @param {string} fechaLocal - Fecha en formato datetime-local
   * @param {string} timezone - Zona horaria (ej: 'America/Bogota')
   */
  convertirFechaAISO(fechaLocal, timezone = 'America/Bogota') {
    if (!fechaLocal) return null;

    try {
      // Crear fecha como UTC y luego ajustar según timezone
      const fecha = new Date(fechaLocal);
      
      // Obtener offset de la zona horaria
      const offsetMinutos = fecha.getTimezoneOffset();
      const offsetHoras = Math.abs(offsetMinutos / 60);
      const signo = offsetMinutos > 0 ? '-' : '+';
      const offset = `${signo}${String(Math.floor(offsetHoras)).padStart(2, '0')}:${String(Math.abs(offsetMinutos % 60)).padStart(2, '0')}`;
      
      // Retornar en formato ISO con offset
      return fecha.toISOString().replace('Z', offset);
    } catch (error) {
      console.error('Error convirtiendo fecha:', error);
      return null;
    }
  }

  /**
   * Valida si una fecha es futura
   * @param {string} fecha - Fecha a validar
   */
  esFechaFutura(fecha) {
    const fechaSeleccionada = new Date(fecha);
    const ahora = new Date();
    return fechaSeleccionada > ahora;
  }
}

export default new PaquetesService();
