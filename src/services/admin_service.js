// src/services/admin_service.js
import { apiFetch, buildQuery } from './api';

const admin_service = {
  // CU-046
  get_metricas: async ({ fechaInicio, fechaFin } = {}) => {
    const qs = buildQuery({ fechaInicio, fechaFin });
    return apiFetch(`/api/admin/metricas${qs}`, { method: 'GET' });
  },

  // CU-047
  get_contabilidad: async ({ fechaInicio, fechaFin }) => {
    const qs = buildQuery({ fechaInicio, fechaFin });
    return apiFetch(`/api/admin/contabilidad${qs}`, { method: 'GET' });
  },

  // CU-048
  post_ingreso_adicional: async ({ descripcion, monto, fecha_ingreso }) => {
    return apiFetch(`/api/admin/ingresos-adicionales`, {
      method: 'POST',
      body: JSON.stringify({ descripcion, monto, fecha_ingreso }),
    });
  },

  // CU-049
  get_compras: async ({
    estado_pago,
    tipo_compra,
    page = 1,
    limit = 10,
    fechaInicio,
    fechaFin,
  } = {}) => {
    const qs = buildQuery({
      estado_pago,
      tipo_compra,
      page,
      limit,
      fechaInicio,
      fechaFin,
    });
    return apiFetch(`/api/admin/compras${qs}`, { method: 'GET' });
  },

  // CU-050
  get_sesiones_pendientes: async () => {
    return apiFetch(`/api/sesiones/pendientes`, { method: 'GET' });
  },

  put_sesion_meet: async ({ sesionId, link_meet }) => {
    return apiFetch(`/api/sesiones/${sesionId}/meet`, {
      method: 'PUT',
      body: JSON.stringify({ link_meet }),
    });
  },
};

export default admin_service;
