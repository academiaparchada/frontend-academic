// src/pages/admin/ContabilidadAdmin.jsx
import React, { useMemo, useState } from 'react';
import contabilidadAdminService from '../../services/contabilidad_admin_service';
import adminMetricasService from '../../services/admin_metricas_service';
import adminComprasService from '../../services/admin_compras_service';
import ingresosAdicionalesAdminService from '../../services/ingresos_adicionales_admin_service';

import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from 'chart.js';

import '../../styles/ContabilidadAdmin.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Tooltip, Legend);

const ContabilidadAdmin = () => {
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [data, setData] = useState(null);

  // Métricas para gráfica
  const [metricas, setMetricas] = useState(null);

  // Compras (CU-049) dentro de contabilidad
  const [comprasEstado, setComprasEstado] = useState('');
  const [comprasTipo, setComprasTipo] = useState('');
  const [comprasPage, setComprasPage] = useState(1);
  const [comprasLimit, setComprasLimit] = useState(10);
  const [comprasLoading, setComprasLoading] = useState(false);
  const [comprasError, setComprasError] = useState('');
  const [comprasData, setComprasData] = useState({ items: [], total: 0, totalPages: 1 });

  // NUEVO: Form ingreso adicional (CU-048)
  const [iaDescripcion, setIaDescripcion] = useState('');
  const [iaMonto, setIaMonto] = useState('');
  const [iaFecha, setIaFecha] = useState(''); // datetime-local
  const [iaLoading, setIaLoading] = useState(false);
  const [iaMsg, setIaMsg] = useState({ tipo: '', texto: '' });

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
    if (status === 400) {
      setError(message || 'Debes seleccionar un rango de fechas');
      return;
    }
    if (status === 401) {
      localStorage.removeItem('token');
      setError('Sesión expirada. Inicia sesión nuevamente.');
      window.location.href = '/login';
      return;
    }
    if (status === 403) {
      setError('No tienes permisos para ver este módulo.');
      window.location.href = '/';
      return;
    }
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
      const metricasRes = await adminMetricasService.obtenerMetricas({ fechaInicio, fechaFin });

      if (resultado.success) {
        setData(resultado.data);
      } else {
        manejarErrorPorStatus(resultado.status, resultado.message);
      }

      if (metricasRes.success) setMetricas(metricasRes.data);
      else setMetricas(null);

      // Al consultar contabilidad, también refrescar compras con el mismo rango
      setComprasPage(1);
      await cargarCompras({ page: 1, fechaInicio, fechaFin });
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
    setMetricas(null);
    setError('');

    setComprasEstado('');
    setComprasTipo('');
    setComprasPage(1);
    setComprasLimit(10);
    setComprasError('');
    setComprasData({ items: [], total: 0, totalPages: 1 });

    // NUEVO
    setIaDescripcion('');
    setIaMonto('');
    setIaFecha('');
    setIaMsg({ tipo: '', texto: '' });
    setIaLoading(false);
  };

  const serie = metricas?.ingresos?.serie_por_dia || [];
  const chartData = useMemo(() => {
    const labels = serie.map((x) => x.fecha);
    const ingresos = serie.map((x) => Number(x.ingresos || 0));
    const compras = serie.map((x) => Number(x.compras || 0));

    return {
      labels,
      datasets: [
        {
          label: 'Ingresos (COP)',
          data: ingresos,
          borderColor: '#5b9999',
          backgroundColor: 'rgba(91, 153, 153, 0.15)',
          tension: 0.35,
          pointRadius: 3,
        },
        {
          label: 'Compras',
          data: compras,
          borderColor: '#2d5555',
          backgroundColor: 'rgba(45, 85, 85, 0.12)',
          tension: 0.35,
          pointRadius: 3,
          yAxisID: 'yCompras',
        },
      ],
    };
  }, [serie]);

  const chartOptions = useMemo(() => {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: 'top' },
        tooltip: {
          callbacks: {
            label: (ctx) => {
              const label = ctx.dataset.label || '';
              const v = ctx.raw;
              if (label.includes('Ingresos')) return `${label}: ${contabilidadAdminService.formatearPrecio(v)}`;
              return `${label}: ${v}`;
            },
          },
        },
      },
      scales: {
        y: {
          ticks: {
            callback: (value) => contabilidadAdminService.formatearPrecio(value),
          },
        },
        yCompras: {
          position: 'right',
          grid: { drawOnChartArea: false },
          ticks: { precision: 0 },
        },
      },
    };
  }, []);

  const cargarCompras = async ({ page = comprasPage, fechaInicio: fi = fechaInicio, fechaFin: ff = fechaFin } = {}) => {
    if (!fi || !ff) return;

    setComprasLoading(true);
    setComprasError('');

    const res = await adminComprasService.listarCompras({
      estado_pago: comprasEstado || undefined,
      tipo_compra: comprasTipo || undefined,
      page,
      limit: comprasLimit,
      fechaInicio: fi,
      fechaFin: ff,
    });

    if (!res.success) {
      setComprasData({ items: [], total: 0, totalPages: 1 });
      setComprasError(res.message || 'Error cargando compras');
      setComprasLoading(false);
      return;
    }

    // El shape exacto depende del backend; soportamos varias llaves comunes.
    const d = res.data || {};
    const items = d.compras || d.items || [];
    const pagination = d.pagination || d.paginacion || {};
    const totalPages = pagination.totalPages || d.totalPages || 1;
    const total = pagination.total || d.total || items.length;

    setComprasData({ items: Array.isArray(items) ? items : [], total, totalPages });
    setComprasLoading(false);
  };

  const aplicarFiltrosCompras = async () => {
    setComprasPage(1);
    await cargarCompras({ page: 1 });
  };

  const nextPage = async () => {
    const next = Math.min(comprasData.totalPages, comprasPage + 1);
    setComprasPage(next);
    await cargarCompras({ page: next });
  };

  const prevPage = async () => {
    const prev = Math.max(1, comprasPage - 1);
    setComprasPage(prev);
    await cargarCompras({ page: prev });
  };

  // =========================
  // NUEVO: Ingreso adicional
  // =========================
  const validarIngresoAdicional = () => {
    const errores = {};

    const desc = (iaDescripcion || '').trim();
    if (!desc) errores.descripcion = 'La descripción es obligatoria';

    const montoNum = Number(iaMonto);
    if (iaMonto === '' || !Number.isFinite(montoNum) || montoNum < 0) {
      errores.monto = 'El monto debe ser un número válido (>= 0)';
    }

    if (!iaFecha) {
      errores.fecha_ingreso = 'La fecha de ingreso es obligatoria';
    } else {
      const d = new Date(iaFecha);
      if (Number.isNaN(d.getTime())) errores.fecha_ingreso = 'Fecha inválida';
    }

    return { ok: Object.keys(errores).length === 0, errores };
  };

  const manejarErrorIngresoAdicional = (status, message) => {
    if (status === 401) {
      localStorage.removeItem('token');
      setIaMsg({ tipo: 'error', texto: 'Sesión expirada. Inicia sesión nuevamente.' });
      window.location.href = '/login';
      return;
    }
    if (status === 403) {
      setIaMsg({ tipo: 'error', texto: 'No tienes permisos para esta acción.' });
      return;
    }
    setIaMsg({ tipo: 'error', texto: message || 'Error creando ingreso adicional' });
  };

  const crearIngresoAdicional = async (e) => {
    e.preventDefault();
    setIaMsg({ tipo: '', texto: '' });

    const v = validarIngresoAdicional();
    if (!v.ok) {
      const msg =
        v.errores.descripcion ||
        v.errores.monto ||
        v.errores.fecha_ingreso ||
        'Por favor corrige el formulario';
      setIaMsg({ tipo: 'error', texto: msg });
      return;
    }

    const payload = {
      descripcion: iaDescripcion.trim(),
      monto: Number(iaMonto),
      fecha_ingreso: new Date(iaFecha).toISOString(),
    };

    try {
      setIaLoading(true);

      const res = await ingresosAdicionalesAdminService.crearIngresoAdicional(payload);

      if (!res.success) {
        manejarErrorIngresoAdicional(res.status, res.message);
        return;
      }

      setIaMsg({ tipo: 'exito', texto: 'Ingreso adicional registrado correctamente.' });

      // Reset form
      setIaDescripcion('');
      setIaMonto('');
      setIaFecha('');

      // Si ya hay un rango consultado, refrescar contabilidad para ver KPIs actualizados
      if (fechaInicio && fechaFin) {
        await consultar();
      }
    } catch (err) {
      console.error(err);
      setIaMsg({ tipo: 'error', texto: 'Error inesperado registrando el ingreso adicional.' });
    } finally {
      setIaLoading(false);
    }
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
          <input type="date" value={fechaInicio} onChange={(e) => setFechaInicio(e.target.value)} disabled={loading} />
        </div>

        <div className="filtro">
          <label>Fecha fin</label>
          <input type="date" value={fechaFin} onChange={(e) => setFechaFin(e.target.value)} disabled={loading} />
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

      {error && <div className="mensaje-error">{error}</div>}

      {/* NUEVO: registrar ingreso adicional */}
      <div className="tabla-container">
        <div className="tabla-header">
          <h3>Registrar ingreso adicional</h3>
          <small>Registra ingresos manuales (no provenientes de compras/pagos).</small>
        </div>

        {iaMsg.texto ? (
          <div className={iaMsg.tipo === 'exito' ? 'mensaje-exito' : 'mensaje-error'}>
            {iaMsg.texto}
          </div>
        ) : null}

        <form onSubmit={crearIngresoAdicional} className="contabilidad-filtros" style={{ marginTop: 10 }}>
          <div className="filtro" style={{ minWidth: 260 }}>
            <label>Descripción *</label>
            <input
              type="text"
              value={iaDescripcion}
              onChange={(e) => setIaDescripcion(e.target.value)}
              placeholder="Ej: Pago en efectivo (evento)"
              disabled={iaLoading}
            />
          </div>

          <div className="filtro" style={{ minWidth: 180 }}>
            <label>Monto (COP) *</label>
            <input
              type="number"
              value={iaMonto}
              onChange={(e) => setIaMonto(e.target.value)}
              min="0"
              step="1"
              placeholder="50000"
              disabled={iaLoading}
            />
          </div>

          <div className="filtro" style={{ minWidth: 240 }}>
            <label>Fecha ingreso *</label>
            <input
              type="datetime-local"
              value={iaFecha}
              onChange={(e) => setIaFecha(e.target.value)}
              disabled={iaLoading}
            />
          </div>

          <div className="acciones">
            <button className="btn-consultar" type="submit" disabled={iaLoading}>
              {iaLoading ? 'Guardando...' : 'Registrar'}
            </button>
          </div>
        </form>

        <small className="subtitulo" style={{ display: 'block', marginTop: 8 }}>
          Se enviará la fecha en formato ISO (UTC) al backend.
        </small>
      </div>

      {metricas && (
        <div className="contabilidad-chart-container">
          <div className="contabilidad-chart-header">
            <h3>Ingresos por día</h3>
            <small>Rango: {metricas?.rango?.fechaInicio} → {metricas?.rango?.fechaFin}</small>
          </div>

          {serie.length === 0 ? (
            <div className="contabilidad-chart-empty">No hay datos para graficar en este rango.</div>
          ) : (
            <div className="contabilidad-chart">
              <Line data={chartData} options={chartOptions} />
            </div>
          )}
        </div>
      )}

      {data && (
        <>
          <div className="kpis-grid">
            <div className="kpi-card">
              <span className="kpi-label">Ingresos totales</span>
              <span className="kpi-value">{contabilidadAdminService.formatearPrecio(data.ingresos_totales)}</span>
            </div>

            <div className="kpi-card">
              <span className="kpi-label">Pagos a profesores</span>
              <span className="kpi-value">{contabilidadAdminService.formatearPrecio(data.pagos_profesores_total)}</span>
            </div>

            <div className="kpi-card">
              <span className="kpi-label">Ingresos adicionales</span>
              <span className="kpi-value">{contabilidadAdminService.formatearPrecio(data.ingresos_adicionales)}</span>
            </div>

            <div className="kpi-card kpi-neto">
              <span className="kpi-label">Neto</span>
              <span className="kpi-value">{contabilidadAdminService.formatearPrecio(data.neto)}</span>
            </div>
          </div>

          <div className="tabla-container">
            <div className="tabla-header">
              <h3>Pagos por profesor</h3>
              <small>Rango: {data?.rango?.fechaInicio} → {data?.rango?.fechaFin}</small>
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
                    <td colSpan="3" className="text-center">No hay pagos en este rango.</td>
                  </tr>
                ) : (
                  pagosOrdenados.map((p) => (
                    <tr key={p.profesor_id}>
                      <td>{`${p.nombre || ''} ${p.apellido || ''}`.trim() || 'N/A'}</td>
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

          {/* Compras dentro de Contabilidad */}
          <div className="compras-container">
            <div className="compras-header">
              <h3>Compras</h3>
              <small>Rango: {fechaInicio} → {fechaFin}</small>
            </div>

            <div className="compras-filtros">
              <div className="compras-filtro">
                <label>Estado pago</label>
                <select value={comprasEstado} onChange={(e) => setComprasEstado(e.target.value)} disabled={comprasLoading}>
                  <option value="">Todos</option>
                  <option value="completado">Completado</option>
                  <option value="pendiente">Pendiente</option>
                  <option value="fallido">Fallido</option>
                </select>
              </div>

              <div className="compras-filtro">
                <label>Tipo compra</label>
                <select value={comprasTipo} onChange={(e) => setComprasTipo(e.target.value)} disabled={comprasLoading}>
                  <option value="">Todos</option>
                  <option value="curso">Curso</option>
                  <option value="clase_personalizada">Clase personalizada</option>
                  <option value="paquete_horas">Paquete horas</option>
                </select>
              </div>

              <div className="compras-acciones">
                <button className="btn-consultar" onClick={aplicarFiltrosCompras} disabled={comprasLoading}>
                  {comprasLoading ? 'Cargando...' : 'Aplicar'}
                </button>
              </div>
            </div>

            {comprasError ? <div className="compras-error">{comprasError}</div> : null}

            <div className="compras-table-wrap">
              <table className="compras-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Tipo</th>
                    <th>Estado</th>
                    <th className="text-right">Monto</th>
                    <th>Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {comprasLoading ? (
                    <tr><td colSpan="5" className="text-center">Cargando...</td></tr>
                  ) : comprasData.items.length === 0 ? (
                    <tr><td colSpan="5" className="text-center">No hay compras para los filtros.</td></tr>
                  ) : (
                    comprasData.items.map((c) => (
                      <tr key={c.id || c.compra_id || JSON.stringify(c)}>
                        <td>{c.id || c.compra_id || '—'}</td>
                        <td>{c.tipo_compra || c.tipo || '—'}</td>
                        <td>{c.estado_pago || c.estado || '—'}</td>
                        <td className="text-right">
                          <strong>{contabilidadAdminService.formatearPrecio(c.monto_total ?? c.monto ?? 0)}</strong>
                        </td>
                        <td>{(c.fecha_compra || c.created_at || c.createdAt || '').toString().slice(0, 10) || '—'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            <div className="compras-paginacion">
              <button className="btn-limpiar" onClick={prevPage} disabled={comprasLoading || comprasPage <= 1}>
                Anterior
              </button>

              <span className="compras-pageinfo">
                Página {comprasPage} de {comprasData.totalPages} · Total {comprasData.total}
              </span>

              <button className="btn-limpiar" onClick={nextPage} disabled={comprasLoading || comprasPage >= comprasData.totalPages}>
                Siguiente
              </button>

              <select
                className="compras-limit"
                value={comprasLimit}
                onChange={async (e) => {
                  const v = Number(e.target.value);
                  setComprasLimit(v);
                  setComprasPage(1);
                  await cargarCompras({ page: 1 });
                }}
                disabled={comprasLoading}
              >
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ContabilidadAdmin;
