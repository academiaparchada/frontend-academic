// src/pages/admin/ContabilidadAdmin.jsx
import React, { useMemo, useState } from 'react';
import contabilidadAdminService from '../../services/contabilidad_admin_service';
import '../../styles/ContabilidadAdmin.css';

const ContabilidadAdmin = () => {
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [data, setData] = useState(null);

  const pagosOrdenados = useMemo(() => {
    const pagos = data?.pagos_por_profesor || [];
    return contabilidadAdminService.ordenarPagosPorProfesor(pagos);
  }, [data]);

  const validarRango = () => {
    if (!fechaInicio || !fechaFin) return { ok: false, message: 'Debes seleccionar un rango de fechas' };
    if (fechaInicio > fechaFin) return { ok: false, message: 'La fechaInicio no puede ser mayor a fechaFin' };
    return { ok: true };
  };

  const manejarErrorPorStatus = (status, message) => {
    // 400: faltan fechas -> mostrar mensaje
    if (status === 400) {
      setError(message || 'Debes seleccionar un rango de fechas');
      return;
    }

    // 401: token inválido/sin token
    if (status === 401) {
      localStorage.removeItem('token');
      setError('Sesión expirada. Inicia sesión nuevamente.');
      window.location.href = '/login';
      return;
    }

    // 403: rol incorrecto
    if (status === 403) {
      setError('No tienes permisos para ver este módulo.');
      window.location.href = '/';
      return;
    }

    // 404/500 genérico
    setError(message || 'Error consultando contabilidad, intenta más tarde.');
  };

  const consultar = async () => {
    const v = validarRango();
    if (!v.ok) {
      setError(v.message);
      return;
    }

    try {
      setLoading(true);
      setError('');

      const resultado = await contabilidadAdminService.obtenerContabilidad({ fechaInicio, fechaFin });

      if (resultado.success) {
        setData(resultado.data);
      } else {
        manejarErrorPorStatus(resultado.status, resultado.message);
      }
    } catch (err) {
      console.error(err);
      setError('Error consultando contabilidad, intenta más tarde.');
    } finally {
      setLoading(false);
    }
  };

  const limpiar = () => {
    setFechaInicio('');
    setFechaFin('');
    setData(null);
    setError('');
  };

  return (
    <div className="contabilidad-admin-container">
      <div className="contabilidad-header">
        <div>
          <h1>Contabilidad</h1>
          <p className="subtitulo">Consulta ingresos, pagos a profesores e ingresos adicionales por rango de fechas</p>
        </div>
      </div>

      <div className="contabilidad-filtros">
        <div className="filtro">
          <label>Fecha inicio</label>
          <input
            type="date"
            value={fechaInicio}
            onChange={(e) => setFechaInicio(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="filtro">
          <label>Fecha fin</label>
          <input
            type="date"
            value={fechaFin}
            onChange={(e) => setFechaFin(e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="acciones">
          <button className="btn-consultar" onClick={consultar} disabled={loading}>
            {loading ? 'Consultando...' : 'Consultar'}
          </button>
          <button className="btn-limpiar" onClick={limpiar} disabled={loading}>
            Limpiar
          </button>
        </div>
      </div>

      {error && (
        <div className="mensaje-error">
          {error}
        </div>
      )}

      {data && (
        <>
          <div className="kpis-grid">
            <div className="kpi-card">
              <span className="kpi-label">Ingresos totales</span>
              <span className="kpi-value">
                {contabilidadAdminService.formatearPrecio(data.ingresos_totales)}
              </span>
            </div>

            <div className="kpi-card">
              <span className="kpi-label">Pagos a profesores</span>
              <span className="kpi-value">
                {contabilidadAdminService.formatearPrecio(data.pagos_profesores_total)}
              </span>
            </div>

            <div className="kpi-card">
              <span className="kpi-label">Ingresos adicionales</span>
              <span className="kpi-value">
                {contabilidadAdminService.formatearPrecio(data.ingresos_adicionales)}
              </span>
            </div>

            <div className="kpi-card kpi-neto">
              <span className="kpi-label">Neto</span>
              <span className="kpi-value">
                {contabilidadAdminService.formatearPrecio(data.neto)}
              </span>
            </div>
          </div>

          <div className="tabla-container">
            <div className="tabla-header">
              <h3>Pagos por profesor</h3>
              <small>
                Rango: {data?.rango?.fechaInicio} → {data?.rango?.fechaFin}
              </small>
            </div>

            <table className="tabla-pagos">
              <thead>
                <tr>
                  <th>Profesor</th>
                  <th>Email</th>
                  <th className="text-right">Total pago</th>
                </tr>
              </thead>
              <tbody>
                {pagosOrdenados.length === 0 ? (
                  <tr>
                    <td colSpan="3" className="text-center">
                      No hay pagos en este rango.
                    </td>
                  </tr>
                ) : (
                  pagosOrdenados.map((p) => (
                    <tr key={p.profesor_id}>
                      <td>
                        {`${p.nombre || ''} ${p.apellido || ''}`.trim() || 'N/A'}
                      </td>
                      <td>{p.email || 'N/A'}</td>
                      <td className="text-right">
                        <strong>{contabilidadAdminService.formatearPrecio(p.total_pago_profesor)}</strong>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
};

export default ContabilidadAdmin;
