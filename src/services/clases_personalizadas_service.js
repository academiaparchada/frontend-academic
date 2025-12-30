// src/services/clases_personalizadas_service.js
const API_URL = 'https://academiaparchada.onrender.com/api/clases-personalizadas';

class ClasesPersonalizadasService {
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

  // Crear una nueva clase personalizada
  async crearClase(claseData) {
    try {
      console.log('Creando clase personalizada:', claseData);
      
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: this._getHeaders(),
        body: JSON.stringify(claseData)
      });

      const data = await response.json();
      console.log('Respuesta crear clase:', data);

      if (response.ok) {
        return { success: true, data: data.data };
      } else {
        return {
          success: false,
          message: data.message || 'Error al crear la clase personalizada',
          errors: data.errors || []
        };
      }
    } catch (error) {
      console.error('Error al crear clase:', error);
      return {
        success: false,
        message: 'Error de conexión. Intenta de nuevo más tarde.'
      };
    }
  }

  // Listar clases personalizadas con paginación
  async listarClases(page = 1, limit = 10, asignaturaId = null) {
    try {
      let url = `${API_URL}?page=${page}&limit=${limit}`;
      
      if (asignaturaId) {
        url += `&asignatura_id=${asignaturaId}`;
      }

      console.log('Listando clases:', url);
      
      const response = await fetch(url);
      const data = await response.json();
      
      console.log('Respuesta listar clases:', data);

      if (response.ok) {
        return { 
          success: true, 
          data: {
            clases: data.data?.clases_personalizadas || [],
            pagination: data.data?.pagination || {}
          }
        };
      } else {
        return {
          success: false,
          message: data.message || 'Error al obtener las clases personalizadas'
        };
      }
    } catch (error) {
      console.error('Error al listar clases:', error);
      return {
        success: false,
        message: 'Error de conexión. Intenta de nuevo más tarde.'
      };
    }
  }

  // Obtener una clase por ID
  async obtenerClase(claseId) {
    try {
      console.log(`Obteniendo clase ${claseId}`);
      
      const response = await fetch(`${API_URL}/${claseId}`);
      const data = await response.json();

      if (response.ok) {
        return { success: true, data: data.data };
      } else {
        return {
          success: false,
          message: data.message || 'Error al obtener la clase'
        };
      }
    } catch (error) {
      console.error('Error al obtener clase:', error);
      return {
        success: false,
        message: 'Error de conexión.'
      };
    }
  }

  // Actualizar una clase personalizada
  async actualizarClase(claseId, cambios) {
    try {
      console.log(`Actualizando clase ${claseId}:`, cambios);
      
      const response = await fetch(`${API_URL}/${claseId}`, {
        method: 'PUT',
        headers: this._getHeaders(),
        body: JSON.stringify(cambios)
      });

      const data = await response.json();
      console.log('Respuesta actualizar clase:', data);

      if (response.ok) {
        return { success: true, data: data.data };
      } else {
        return {
          success: false,
          message: data.message || 'Error al actualizar la clase',
          errors: data.errors || []
        };
      }
    } catch (error) {
      console.error('Error al actualizar clase:', error);
      return {
        success: false,
        message: 'Error de conexión. Intenta de nuevo más tarde.'
      };
    }
  }

  // Eliminar una clase personalizada
  async eliminarClase(claseId) {
    try {
      console.log(`Eliminando clase ${claseId}`);
      
      const response = await fetch(`${API_URL}/${claseId}`, {
        method: 'DELETE',
        headers: this._getHeaders()
      });

      const data = await response.json();
      console.log('Respuesta eliminar clase:', data);

      if (response.ok) {
        return { success: true, message: data.message };
      } else {
        return {
          success: false,
          message: data.message || 'Error al eliminar la clase'
        };
      }
    } catch (error) {
      console.error('Error al eliminar clase:', error);
      return {
        success: false,
        message: 'Error de conexión. Intenta de nuevo más tarde.'
      };
    }
  }

  // Calcular el pago al profesor
  calcularPagoProfesor(clase) {
    if (clase.tipo_pago_profesor === 'porcentaje') {
      return clase.precio * (clase.valor_pago_profesor / 100);
    }
    return clase.valor_pago_profesor;
  }

  // Formatear precio en COP
  formatearPrecio(precio) {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(precio);
  }

  // Validar datos de clase
  validarClase(claseData) {
    const errores = {};

    if (!claseData.asignatura_id) {
      errores.asignatura_id = 'Debes seleccionar una asignatura';
    }

    if (!claseData.precio || claseData.precio <= 0) {
      errores.precio = 'El precio debe ser mayor a 0';
    }

    if (!claseData.duracion_horas || claseData.duracion_horas <= 0) {
      errores.duracion_horas = 'La duración debe ser mayor a 0';
    }

    if (!claseData.tipo_pago_profesor) {
      errores.tipo_pago_profesor = 'Debes seleccionar un tipo de pago';
    }

    if (!claseData.valor_pago_profesor || claseData.valor_pago_profesor < 0) {
      errores.valor_pago_profesor = 'El valor de pago debe ser mayor o igual a 0';
    }

    if (claseData.tipo_pago_profesor === 'porcentaje' && claseData.valor_pago_profesor > 100) {
      errores.valor_pago_profesor = 'El porcentaje no puede ser mayor a 100';
    }

    return {
      valido: Object.keys(errores).length === 0,
      errores
    };
  }
}

export default new ClasesPersonalizadasService();
