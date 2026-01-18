// src/services/cursos_service.js
const API_URL = 'https://academiaparchada.onrender.com/api/cursos';
const API_IMAGENES_CURSOS_URL = 'https://academiaparchada.onrender.com/api/imagenes/cursos';

class CursosService {
  _getToken() {
    return localStorage.getItem('token');
  }

  // Solo auth (para FormData NO se debe setear Content-Type)
  _getAuthHeaders() {
    return {
      'Authorization': `Bearer ${this._getToken()}`
    };
  }

  // JSON headers (para endpoints JSON)
  _getJsonHeaders() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this._getToken()}`
    };
  }

  // Armar FormData para curso (incluye image opcional)
  _buildCursoFormData(payload = {}) {
    const fd = new FormData();

    Object.entries(payload).forEach(([k, v]) => {
      if (v === undefined || v === null) return;

      if (k === 'image') return;

      // arrays -> JSON string
      if (Array.isArray(v)) {
        fd.append(k, JSON.stringify(v));
        return;
      }

      // NUEVO: sesiones_programadas debe ir como JSON string
      if (k === 'sesiones_programadas') {
        if (typeof v === 'string') {
          fd.append(k, v);
        } else {
          fd.append(k, JSON.stringify(v));
        }
        return;
      }

      // Objetos genéricos: por seguridad, stringificar (evita "[object Object]")
      if (typeof v === 'object') {
        fd.append(k, JSON.stringify(v));
        return;
      }

      fd.append(k, String(v));
    });

    if (payload.image instanceof File) {
      fd.append('image', payload.image); // clave exacta: "image"
    }

    return fd;
  }

  // Crear un nuevo curso (con imagen opcional)
  async crearCurso(cursoData) {
    try {
      console.log('Creando curso:', cursoData);

      const fd = this._buildCursoFormData(cursoData);

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: this._getAuthHeaders(),
        body: fd
      });

      const data = await response.json();
      console.log('Respuesta crear curso:', data);

      if (response.ok) {
        return { success: true, data: data.data };
      } else {
        return {
          success: false,
          message: data.message || 'Error al crear el curso',
          errors: data.errors || []
        };
      }
    } catch (error) {
      console.error('Error al crear curso:', error);
      return {
        success: false,
        message: 'Error de conexión. Intenta de nuevo más tarde.'
      };
    }
  }

  // Listar cursos con paginación y filtros
  async listarCursos(filtros = {}) {
    try {
      const params = new URLSearchParams();

      if (filtros.page) params.append('page', filtros.page);
      if (filtros.limit) params.append('limit', filtros.limit);
      if (filtros.estado) params.append('estado', filtros.estado);
      if (filtros.tipo) params.append('tipo', filtros.tipo);
      if (filtros.asignatura_id) params.append('asignatura_id', filtros.asignatura_id);
      if (filtros.profesor_id) params.append('profesor_id', filtros.profesor_id);

      const url = `${API_URL}?${params.toString()}`;
      console.log('Listando cursos:', url);

      const response = await fetch(url);
      const data = await response.json();

      console.log('Respuesta listar cursos:', data);

      if (response.ok) {
        return {
          success: true,
          data: {
            cursos: data.data?.cursos || [],
            pagination: data.data?.pagination || {}
          }
        };
      } else {
        return {
          success: false,
          message: data.message || 'Error al obtener los cursos'
        };
      }
    } catch (error) {
      console.error('Error al listar cursos:', error);
      return {
        success: false,
        message: 'Error de conexión. Intenta de nuevo más tarde.'
      };
    }
  }

  // Obtener un curso por ID
  async obtenerCurso(cursoId) {
    try {
      console.log(`Obteniendo curso ${cursoId}`);

      const response = await fetch(`${API_URL}/${cursoId}`);
      const data = await response.json();

      if (response.ok) {
        return { success: true, data: data.data };
      } else {
        return {
          success: false,
          message: data.message || 'Error al obtener el curso'
        };
      }
    } catch (error) {
      console.error('Error al obtener curso:', error);
      return {
        success: false,
        message: 'Error de conexión.'
      };
    }
  }

  // Actualizar un curso (con imagen opcional)
  async actualizarCurso(cursoId, cambios) {
    try {
      console.log(`Actualizando curso ${cursoId}:`, cambios);

      const fd = this._buildCursoFormData(cambios);

      const response = await fetch(`${API_URL}/${cursoId}`, {
        method: 'PUT',
        headers: this._getAuthHeaders(),
        body: fd
      });

      const data = await response.json();
      console.log('Respuesta actualizar curso:', data);

      if (response.ok) {
        return { success: true, data: data.data };
      } else {
        return {
          success: false,
          message: data.message || 'Error al actualizar el curso',
          errors: data.errors || []
        };
      }
    } catch (error) {
      console.error('Error al actualizar curso:', error);
      return {
        success: false,
        message: 'Error de conexión. Intenta de nuevo más tarde.'
      };
    }
  }

  // (Opcional) Actualizar SOLO imagen del curso (endpoint dedicado)
  async actualizarImagenCurso(cursoId, imageFile) {
    try {
      if (!(imageFile instanceof File)) {
        return { success: false, message: 'Archivo de imagen inválido' };
      }

      const fd = new FormData();
      fd.append('image', imageFile);

      const response = await fetch(`${API_IMAGENES_CURSOS_URL}/${cursoId}`, {
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
      console.error('Error al actualizar imagen del curso:', error);
      return {
        success: false,
        message: 'Error de conexión. Intenta de nuevo más tarde.'
      };
    }
  }

  // Eliminar un curso
  async eliminarCurso(cursoId) {
    try {
      console.log(`Eliminando curso ${cursoId}`);

      const response = await fetch(`${API_URL}/${cursoId}`, {
        method: 'DELETE',
        headers: this._getJsonHeaders()
      });

      const data = await response.json();
      console.log('Respuesta eliminar curso:', data);

      if (response.ok) {
        return { success: true, message: data.message };
      } else {
        return {
          success: false,
          message: data.message || 'Error al eliminar el curso'
        };
      }
    } catch (error) {
      console.error('Error al eliminar curso:', error);
      return {
        success: false,
        message: 'Error de conexión. Intenta de nuevo más tarde.'
      };
    }
  }

  calcularPagoProfesor(curso) {
    if (!curso.tipo_pago_profesor || !curso.valor_pago_profesor) {
      return 0;
    }

    if (curso.tipo_pago_profesor === 'porcentaje') {
      return curso.precio * (curso.valor_pago_profesor / 100);
    }
    return curso.valor_pago_profesor;
  }

  formatearPrecio(precio) {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(precio);
  }

  formatearFecha(fecha) {
    if (!fecha) return 'No especificada';
    return new Date(fecha).toLocaleDateString('es-CO', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  validarCurso(cursoData) {
    const errores = {};

    if (!cursoData.nombre || cursoData.nombre.trim() === '') {
      errores.nombre = 'El nombre es obligatorio';
    }

    if (!cursoData.asignatura_id) {
      errores.asignatura_id = 'Debes seleccionar una asignatura';
    }

    if (!cursoData.precio || cursoData.precio <= 0) {
      errores.precio = 'El precio debe ser mayor a 0';
    }

    if (!cursoData.duracion_horas || cursoData.duracion_horas <= 0) {
      errores.duracion_horas = 'La duración debe ser mayor a 0';
    }

    if (!cursoData.tipo) {
      errores.tipo = 'Debes seleccionar el tipo de curso';
    } else if (!['grupal', 'pregrabado'].includes(cursoData.tipo)) {
      errores.tipo = 'El tipo debe ser "grupal" o "pregrabado"';
    }

    // Validaciones sesiones_programadas (NUEVO)
    if (cursoData.sesiones_programadas) {
      if (cursoData.tipo !== 'grupal') {
        errores.sesiones_programadas = 'Las sesiones automáticas solo aplican a cursos grupales';
      }

      if (!cursoData.fecha_inicio || !cursoData.fecha_fin) {
        errores.fecha_inicio = errores.fecha_inicio || 'Requerida si generas sesiones automáticas';
        errores.fecha_fin = errores.fecha_fin || 'Requerida si generas sesiones automáticas';
      }

      const sp = cursoData.sesiones_programadas;

      if (!sp.days_of_week || !Array.isArray(sp.days_of_week) || sp.days_of_week.length === 0) {
        errores.sesiones_programadas = 'Selecciona al menos un día (days_of_week)';
      }

      if (!sp.hora_inicio || !sp.hora_fin) {
        errores.sesiones_programadas = 'Debes indicar hora_inicio y hora_fin';
      } else {
        // comparación simple HH:mm
        if (String(sp.hora_fin) <= String(sp.hora_inicio)) {
          errores.sesiones_programadas = 'hora_fin debe ser mayor que hora_inicio';
        }
      }
    }

    if (cursoData.tipo_pago_profesor) {
      if (!['porcentaje', 'monto_fijo'].includes(cursoData.tipo_pago_profesor)) {
        errores.tipo_pago_profesor = 'El tipo de pago debe ser "porcentaje" o "monto_fijo"';
      }

      if (cursoData.valor_pago_profesor !== undefined && cursoData.valor_pago_profesor !== null) {
        if (cursoData.tipo_pago_profesor === 'porcentaje') {
          if (cursoData.valor_pago_profesor < 0 || cursoData.valor_pago_profesor > 100) {
            errores.valor_pago_profesor = 'El porcentaje debe estar entre 0 y 100';
          }
        } else {
          if (cursoData.valor_pago_profesor < 0) {
            errores.valor_pago_profesor = 'El monto no puede ser negativo';
          }
        }
      }
    }

    if (cursoData.fecha_inicio && cursoData.fecha_fin) {
      const inicio = new Date(cursoData.fecha_inicio);
      const fin = new Date(cursoData.fecha_fin);

      if (fin <= inicio) {
        errores.fecha_fin = 'La fecha de fin debe ser posterior a la fecha de inicio';
      }
    }

    if (cursoData.tipo === 'grupal' && !cursoData.profesor_id) {
      errores.profesor_id = 'Los cursos grupales requieren un profesor asignado';
    }

    return {
      valido: Object.keys(errores).length === 0,
      errores
    };
  }

  obtenerBadgeTipo(tipo) {
    return tipo === 'grupal'
      ? { text: '👥 Grupal', class: 'badge-grupal' }
      : { text: '🎥 Pregrabado', class: 'badge-pregrabado' };
  }

  obtenerBadgeEstado(estado) {
    const badges = {
      'activo': { text: '✅ Activo', class: 'badge-activo' },
      'inactivo': { text: '⏸️ Inactivo', class: 'badge-inactivo' },
      'finalizado': { text: '✔️ Finalizado', class: 'badge-finalizado' }
    };
    return badges[estado] || badges['activo'];
  }
}

export default new CursosService();
