// src/services/clases_personalizadas_service.js
const API_URL = 'https://api.parcheacademico.com/api/clases-personalizadas';
const API_IMAGENES_URL = 'https://api.parcheacademico.com/api/imagenes/clases-personalizadas';

class ClasesPersonalizadasService {
  _getToken() {
    return localStorage.getItem('token');
  }

  // Solo auth (para FormData NO se debe setear Content-Type)
  _getAuthHeaders() {
    return {
      'Authorization': `Bearer ${this._getToken()}`
    };
  }

  // JSON headers (solo para endpoints JSON)
  _getJsonHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this._getToken()}`
    };
  }

  // Crear una nueva clase personalizada (AHORA con imagen opcional)
  async crearClase(claseData) {
    try {
      console.log('Creando clase personalizada:', claseData);

      const fd = new FormData();
      fd.append('asignatura_id', String(claseData.asignatura_id));
      fd.append('precio', String(claseData.precio));
      fd.append('duracion_horas', String(claseData.duracion_horas));
      fd.append('tipo_pago_profesor', String(claseData.tipo_pago_profesor));
      fd.append('valor_pago_profesor', String(claseData.valor_pago_profesor));

      // clave: "image"
      if (claseData.image instanceof File) {
        fd.append('image', claseData.image);
      }

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: this._getAuthHeaders(),
        body: fd
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

  // NUEVO: traer todas las clases (itera pages hasta total_pages/totalPages o hasta que el chunk sea menor al limit)
  async listarTodasClases(asignaturaId = null) {
    try {
      const limit = 100;
      let page = 1;
      let all = [];
      let keepGoing = true;

      while (keepGoing) {
        const res = await this.listarClases(page, limit, asignaturaId);

        if (!res.success) {
          return res;
        }

        const chunk = Array.isArray(res.data?.clases) ? res.data.clases : [];
        all = all.concat(chunk);

        const totalPages =
          res.data?.pagination?.total_pages ??
          res.data?.pagination?.totalPages ??
          null;

        if (typeof totalPages === 'number') {
          keepGoing = page < totalPages;
        } else {
          keepGoing = chunk.length >= limit;
        }

        page += 1;
      }

      // Dedupe por id (por seguridad)
      const map = new Map();
      all.forEach((c) => {
        if (c?.id) map.set(c.id, c);
      });

      return { success: true, data: { clases: Array.from(map.values()) } };
    } catch (error) {
      console.error('Error al listar todas las clases:', error);
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

  // Actualizar una clase personalizada (JSON, SIN imagen)
  async actualizarClase(claseId, cambios) {
    try {
      console.log(`Actualizando clase ${claseId}:`, cambios);

      // Nunca mandar image en JSON
      const { image, ...cambiosSinImage } = cambios || {};

      const response = await fetch(`${API_URL}/${claseId}`, {
        method: 'PUT',
        headers: this._getJsonHeaders(),
        body: JSON.stringify(cambiosSinImage)
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

  // Actualizar SOLO imagen de clase personalizada (endpoint dedicado)
  async actualizarImagenClasePersonalizada(claseId, imageFile) {
    try {
      if (!(imageFile instanceof File)) {
        return { success: false, message: 'Archivo de imagen inválido' };
      }

      const fd = new FormData();
      fd.append('image', imageFile);

      const response = await fetch(`${API_IMAGENES_URL}/${claseId}`, {
        method: 'PUT',
        headers: this._getAuthHeaders(),
        body: fd
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, data: data.data };
      } else {
        return {
          success: false,
          message: data.message || 'Error actualizando imagen',
          errors: data.errors || []
        };
      }
    } catch (error) {
      console.error('Error al actualizar imagen de clase:', error);
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
        headers: this._getJsonHeaders()
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

  calcularPagoProfesor(clase) {
    if (clase.tipo_pago_profesor === 'porcentaje') {
      return clase.precio * (clase.valor_pago_profesor / 100);
    }
    return clase.valor_pago_profesor;
  }

  formatearPrecio(precio) {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(precio);
  }

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
