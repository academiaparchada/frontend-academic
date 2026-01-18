// src/pages/admin/compras.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/header';
import { Footer } from '../../components/footer';
import { useAuth } from '../../context/auth_context';
import admin_service from '../../services/admin_service';
import { formatCOP, toYMD } from '../../utils/format';
import '../../styles/admin_compras.css';

const ComprasAdmin = () => {
  const navigate = useNavigate();
  const { is_authenticated, loading, logout } = useAuth();

  const [estadoPago, setEstadoPago] = useState('');
  const [tipoCompra, setTipoCompra] = useState('');
  const [fechaInicio, setFechaInicio] = useState('');
  const [fechaFin, setFechaFin] = useState('');

  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);

  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState('');

  const hoyYMD = toYMD(new Date());

  useEffect(() => {
    if (!loading && !is_authenticated) navigate('/login');
  }, [is_authenticated, loading, navigate]);

  const handle_logout = async () => {
    await logout();
    navigate('/login');
  };

  const load = async (opts = {}) => {
    setLoadingData(true);
    setError('');

    const result = await admin_service.get_compras({
      estado_pago: estadoPago || undefined,
      tipo_compra: tipoCompra || undefined,
      fechaInicio: fechaInicio || undefined,
      fechaFin: fechaFin || undefined,
      page,
      limit,
      ...opts,
    });

    if (result?.success) {
      // Nota: el shape exacto de compras depende del backend; aquí soporta dos variantes comunes.
      const data = result.data || {};
      const lista = data.compras || data.items || [];
      const pag = data.pagination || data.paginacion || { page, totalPages: 1, total: lista.length };

      setItems(Array.isArray(lista) ? lista : []);
      setPagination({
        page: pag.page || page,
        totalPages: pag.totalPages || 1,
        total: pag.total || 0,
      });
    } else {
      setItems([]);
      setPagination({ page: 1, totalPages: 1, total: 0 });
      setError(result?.message || 'Error al cargar compras');
    }

    setLoadingData(false);
  };

  useEffect(() => {
    if (!loading && is_authenticated) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, is_authenticated, page, limit]);

  const onFiltrar = async () => {
    setPage(1);
    await load({ page: 1 });
  };

  const onLimpiar = async () => {
    setEstadoPago('');
    setTipoCompra('');
    setFechaInicio('');
    setFechaFin('');
    setPage(1);
    setLimit(10);
    await load({
      estado_pago: undefined,
      tipo_compra: undefined,
      fechaInicio: undefined,
      fechaFin: undefined,
      page: 1,
      limit: 10,
    });
  };

  if (loading) return <div className="loading">Cargando...</div>;

  return (
    <div className="page">
      <Header />

      <main className="main">
        <div className="admin_compras_container">
          <div className="admin_compras_header">
            <div>
              <h1>Compras (Admin)</h1>
              <p>Filtra por estado, tipo y rango de fechas.</p>
            </div>
            <button onClick={handle_logout} className="admin_compras_logout">Cerrar Sesión</button>
          </div>

          <div className="admin_compras_filters">
            <div className="admin_compras_filter">
              <label>Estado pago</label>
              <select value={estadoPago} onChange={(e) => setEstadoPago(e.target.value)} disabled={loadingData}>
                <option value="">Todos</option>
                <option value="completado">Completado</option>
                <option value="pendiente">Pendiente</option>
                <option value="fallido">Fallido</option>
              </select>
            </div>

            <div className="admin_compras_filter">
              <label>Tipo compra</label>
              <select value={tipoCompra} onChange={(e) => setTipoCompra(e.target.value)} disabled={loadingData}>
                <option value="">Todos</option>
                <option value="curso">Curso</option>
                <option value="clase_personalizada">Clase personalizada</option>
                <option value="paquete_horas">Paquete horas</option>
              </select>
            </div>

            <div className="admin_compras_filter">
              <label>Fecha inicio</label>
              <input
                type="date"
                value={fechaInicio}
                max={fechaFin || hoyYMD}
                onChange={(e) => setFechaInicio(e.target.value)}
                disabled={loadingData}
              />
            </div>

            <div className="admin_compras_filter">
              <label>Fecha fin</label>
              <input
                type="date"
                value={fechaFin}
                min={fechaInicio || undefined}
                max={hoyYMD}
                onChange={(e) => setFechaFin(e.target.value)}
                disabled={loadingData}
              />
            </div>

            <div className="admin_compras_actions">
              <button className="admin_compras_btn_primary" onClick={onFiltrar} disabled={loadingData}>
                {loadingData ? 'Cargando...' : 'Aplicar'}
              </button>
              <button className="admin_compras_btn_secondary" onClick={onLimpiar} disabled={loadingData}>
                Limpiar
              </button>
            </div>
          </div>

          {error ? <div className="admin_compras_error">{error}</div> : null}

          <div className="admin_compras_table_wrap">
            <table className="admin_compras_table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Tipo</th>
                  <th>Estado</th>
                  <th className="right">Monto</th>
                  <th>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="admin_compras_empty">No hay compras para los filtros.</td>
                  </tr>
                ) : (
                  items.map((c) => (
                    <tr key={c.id || c.compra_id || JSON.stringify(c)}>
                      <td className="mono">{c.id || c.compra_id || '—'}</td>
                      <td>{c.tipo_compra || c.tipo || '—'}</td>
                      <td>{c.estado_pago || c.estado || '—'}</td>
                      <td className="right">{formatCOP(c.monto_total ?? c.monto ?? 0)}</td>
                      <td>{(c.fecha_compra || c.created_at || c.createdAt || '').toString().slice(0, 10) || '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="admin_compras_pagination">
            <button
              className="admin_compras_pagebtn"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={loadingData || page <= 1}
            >
              Anterior
            </button>

            <span className="admin_compras_pageinfo">
              Página {page} de {pagination.totalPages} · Total {pagination.total}
            </span>

            <button
              className="admin_compras_pagebtn"
              onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
              disabled={loadingData || page >= pagination.totalPages}
            >
              Siguiente
            </button>

            <select
              className="admin_compras_limit"
              value={limit}
              onChange={(e) => { setLimit(Number(e.target.value)); setPage(1); }}
              disabled={loadingData}
            >
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
            </select>
          </div>

          <div className="admin_compras_back">
            <button className="admin_compras_btn_secondary" onClick={() => navigate('/admin/dashboard')}>
              Volver al Dashboard
            </button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ComprasAdmin;
