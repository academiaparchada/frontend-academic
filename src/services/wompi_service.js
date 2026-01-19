// src/services/wompi_service.js
const API_URL = import.meta.env.VITE_API_URL || 'https://academiaparchada.onrender.com/api';

class WompiService {
  _getToken() {
    return localStorage.getItem('token');
  }

  _getHeadersJson() {
    const token = this._getToken();
    return {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {})
    };
  }

  _getHeadersMultipart() {
    const token = this._getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async crearCheckout(datosCompra) {
    try {
      const token = this._getToken();
      const datosEnvio = { ...datosCompra };

      // Si hay JWT, backend ignora estudiante
      if (token && datosEnvio.estudiante) delete datosEnvio.estudiante;

      const res = await fetch(`${API_URL}/pagos/wompi/checkout`, {
        method: 'POST',
        headers: this._getHeadersJson(),
        body: JSON.stringify(datosEnvio)
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        return { success: false, message: json?.message || 'Error creando checkout Wompi' };
      }

      localStorage.setItem('ultima_compra_id', json.data.compraId);
      return { success: true, data: json.data };
    } catch (error) {
      console.error('Wompi crearCheckout error:', error);
      return { success: false, message: 'Error de conexión creando checkout Wompi' };
    }
  }

  async crearCheckoutConArchivo(datosCompra, archivoDocumento = null) {
    try {
      const token = this._getToken();
      const esUsuarioAutenticado = !!token;

      const formData = new FormData();

      // Comunes
      formData.append('tipo_compra', datosCompra.tipo_compra);

      // Por tipo (en este front solo lo usaremos con clase_personalizada + archivo)
      if (datosCompra.tipo_compra === 'clase_personalizada') {
        formData.append('clase_personalizada_id', datosCompra.clase_personalizada_id);
        formData.append('fecha_hora', datosCompra.fecha_hora);
        if (datosCompra.estudiante_timezone) formData.append('estudiante_timezone', datosCompra.estudiante_timezone);
        if (datosCompra.descripcion_estudiante) formData.append('descripcion_estudiante', datosCompra.descripcion_estudiante);
      } else if (datosCompra.tipo_compra === 'curso') {
        formData.append('curso_id', datosCompra.curso_id);
      } else if (datosCompra.tipo_compra === 'paquete_horas') {
        formData.append('clase_personalizada_id', datosCompra.clase_personalizada_id);
        formData.append('cantidad_horas', String(datosCompra.cantidad_horas));
      }

      if (!esUsuarioAutenticado && datosCompra.estudiante) {
        formData.append('estudiante[email]', datosCompra.estudiante.email);
        formData.append('estudiante[password]', datosCompra.estudiante.password);
        formData.append('estudiante[nombre]', datosCompra.estudiante.nombre);
        formData.append('estudiante[apellido]', datosCompra.estudiante.apellido);
        formData.append('estudiante[telefono]', datosCompra.estudiante.telefono);
        if (datosCompra.estudiante.timezone) formData.append('estudiante[timezone]', datosCompra.estudiante.timezone);
      }

      if (archivoDocumento) {
        formData.append('documento', archivoDocumento);
      }

      const res = await fetch(`${API_URL}/pagos/wompi/checkout`, {
        method: 'POST',
        headers: this._getHeadersMultipart(),
        body: formData
      });

      const json = await res.json();

      if (!res.ok || !json.success) {
        return { success: false, message: json?.message || 'Error creando checkout Wompi' };
      }

      localStorage.setItem('ultima_compra_id', json.data.compraId);
      return { success: true, data: json.data };
    } catch (error) {
      console.error('Wompi crearCheckoutConArchivo error:', error);
      return { success: false, message: 'Error de conexión creando checkout Wompi' };
    }
  }
}

export default new WompiService();
