// src/services/wompi_service.js

import comprasService from './compras_service';

const API_URL = import.meta.env.VITE_API_URL || 'https://api.parcheacademico.com/api';

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

  /**
   * Crear checkout Wompi (sin archivo adjunto)
   * @param {Object} datosCompra - Datos de la compra
   * @returns {Promise}
   */
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

  /**
   * ✅ ACTUALIZADO: Crear checkout Wompi CON archivo (flujo de 2 pasos)
   * PASO 1: Subir documento → obtener documento_url
   * PASO 2: Crear checkout con documento_url en el body JSON
   * @param {Object} datosCompra - Datos de la compra
   * @param {File} archivoDocumento - Archivo adjunto
   * @returns {Promise}
   */
  async crearCheckoutConArchivo(datosCompra, archivoDocumento = null) {
    try {
      console.log('📄 Wompi: Flujo de 2 pasos con archivo');

      let documento_url = null;

      // PASO 1: Subir documento si existe
      if (archivoDocumento) {
        console.log('📤 PASO 1: Subiendo documento...');
        const resultadoSubida = await comprasService.subirDocumentoClasePersonalizada(archivoDocumento);

        if (!resultadoSubida.success) {
          return {
            success: false,
            message: resultadoSubida.message || 'Error al subir el documento'
          };
        }

        documento_url = resultadoSubida.data.documento_url;
        console.log('✅ Documento subido:', documento_url);
      }

      // PASO 2: Crear checkout con documento_url (JSON, no FormData)
      console.log('🛒 PASO 2: Creando checkout Wompi...');

      const token = this._getToken();
      const datosEnvio = { ...datosCompra };

      // Si hay JWT, backend ignora estudiante
      if (token && datosEnvio.estudiante) delete datosEnvio.estudiante;

      // Agregar documento_url si se subió archivo
      if (documento_url) {
        datosEnvio.documento_url = documento_url;
      }

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
      console.log('✅ Checkout Wompi creado exitosamente');

      return { success: true, data: json.data };

    } catch (error) {
      console.error('❌ Wompi crearCheckoutConArchivo error:', error);
      return { success: false, message: 'Error de conexión creando checkout Wompi' };
    }
  }
}

export default new WompiService();
