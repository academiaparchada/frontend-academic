// src/services/franjas_service.js
const API_URL = 'https://academiaparchada.onrender.com/api/franjas-horarias';

class FranjasService {
  // Obtener el token del localStorage
  _getToken() {
    return localStorage.getItem('token');
  }

  // Obtener headers con autenticación
  _getHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this._getToken()}`
    };
  }

  // Crear una nueva franja horaria
  async crearFranja(franjaData) {
    try {
      console.log('Creando franja horaria:', franjaData);
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: this._getHeaders(),
        body: JSON.stringify(franjaData)
      });

      const data = await response.json();
      console.log('Respuesta crear franja:', data);

      if (response.ok) {
        return { success: true, data: data.data };
      } else {
        return {
          success: false,
          message: data.message || 'Error al crear la franja horaria',
          errors: data.errors || []
        };
      }
    } catch (error) {
      console.error('Error al crear franja:', error);
      return {
        success: false,
        message: 'Error de conexión. Intenta de nuevo más tarde.'
      };
    }
  }

  // Listar franjas horarias de un profesor
  async listarFranjasProfesor(profesorId, page = 1, limit = 50) {
    try {
      console.log(`Listando franjas del profesor ${profesorId}`);
      
      const response = await fetch(
        `${API_URL}/profesor/${profesorId}?page=${page}&limit=${limit}`,
        {
          method: 'GET',
          headers: this._getHeaders()
        }
      );

      const data = await response.json();
      console.log('Respuesta listar franjas:', data);

      if (response.ok) {
        // 🔧 CORRECCIÓN: Transformar franjas_por_dia a franjasPorDia
        const franjasPorDia = data.data?.franjas_por_dia || {};
        const franjas = data.data?.franjas || [];
        
        // Inicializar todos los días de la semana para el calendario
        const diasSemana = ['lunes', 'martes', 'miercoles', 'jueves', 'viernes', 'sabado', 'domingo'];
        const franjasPorDiaCompleto = {};
        
        diasSemana.forEach(dia => {
          franjasPorDiaCompleto[dia] = franjasPorDia[dia] || [];
        });

        return { 
          success: true, 
          data: {
            franjas,
            franjasPorDia: franjasPorDiaCompleto,
            profesor: data.data?.profesor,
            pagination: data.data?.pagination
          }
        };
      } else {
        return {
          success: false,
          message: data.message || 'Error al obtener las franjas horarias',
          errors: data.errors || []
        };
      }
    } catch (error) {
      console.error('Error al listar franjas:', error);
      return {
        success: false,
        message: 'Error de conexión. Intenta de nuevo más tarde.'
      };
    }
  }

  // Editar una franja horaria
  async editarFranja(franjaId, franjaData) {
    try {
      console.log(`Editando franja ${franjaId}:`, franjaData);
      
      const response = await fetch(`${API_URL}/${franjaId}`, {
        method: 'PUT',
        headers: this._getHeaders(),
        body: JSON.stringify(franjaData)
      });

      const data = await response.json();
      console.log('Respuesta editar franja:', data);

      if (response.ok) {
        return { success: true, data: data.data };
      } else {
        return {
          success: false,
          message: data.message || 'Error al actualizar la franja horaria',
          errors: data.errors || []
        };
      }
    } catch (error) {
      console.error('Error al editar franja:', error);
      return {
        success: false,
        message: 'Error de conexión. Intenta de nuevo más tarde.'
      };
    }
  }

  // Eliminar una franja horaria
  async eliminarFranja(franjaId) {
    try {
      console.log(`Eliminando franja ${franjaId}`);
      
      const response = await fetch(`${API_URL}/${franjaId}`, {
        method: 'DELETE',
        headers: this._getHeaders()
      });

      const data = await response.json();
      console.log('Respuesta eliminar franja:', data);

      if (response.ok) {
        return { success: true, message: data.message };
      } else {
        return {
          success: false,
          message: data.message || 'Error al eliminar la franja horaria'
        };
      }
    } catch (error) {
      console.error('Error al eliminar franja:', error);
      return {
        success: false,
        message: 'Error de conexión. Intenta de nuevo más tarde.'
      };
    }
  }

  // Validar formato de hora (HH:MM o HH:MM:SS)
  validarFormatoHora(hora) {
    const regex = /^([0-1][0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/;
    return regex.test(hora);
  }

  // Convertir HH:MM a HH:MM:SS si es necesario
  normalizarHora(hora) {
    if (hora && hora.length === 5) {
      return `${hora}:00`;
    }
    return hora;
  }

  // Validar que hora_fin sea mayor que hora_inicio
  validarRangoHoras(horaInicio, horaFin) {
    const inicio = this.normalizarHora(horaInicio);
    const fin = this.normalizarHora(horaFin);
    
    const [h1, m1] = inicio.split(':').map(Number);
    const [h2, m2] = fin.split(':').map(Number);
    const minutos1 = h1 * 60 + m1;
    const minutos2 = h2 * 60 + m2;
    return minutos2 > minutos1;
  }

  // Detectar solapamiento con franjas existentes
  detectarSolapamiento(nuevaFranja, franjasExistentes, franjaEditandoId = null) {
    return franjasExistentes.some(franja => {
      // Si estamos editando, ignorar la franja actual
      if (franjaEditandoId && franja.id === franjaEditandoId) {
        return false;
      }

      // Solo verificar mismo día
      if (franja.dia_semana !== nuevaFranja.dia_semana) {
        return false;
      }

      const inicio1 = this.normalizarHora(nuevaFranja.hora_inicio);
      const fin1 = this.normalizarHora(nuevaFranja.hora_fin);
      const inicio2 = this.normalizarHora(franja.hora_inicio);
      const fin2 = this.normalizarHora(franja.hora_fin);

      const [h1, m1] = inicio1.split(':').map(Number);
      const [h2, m2] = fin1.split(':').map(Number);
      const [h3, m3] = inicio2.split(':').map(Number);
      const [h4, m4] = fin2.split(':').map(Number);

      const minInicioNueva = h1 * 60 + m1;
      const minFinNueva = h2 * 60 + m2;
      const minInicioExist = h3 * 60 + m3;
      const minFinExist = h4 * 60 + m4;

      return minInicioNueva < minFinExist && minFinNueva > minInicioExist;
    });
  }
}

export default new FranjasService();
