// src/pages/admin/sesiones_pendientes.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/header';
import { Footer } from '../../components/footer';
import { useAuth } from '../../context/auth_context';
import admin_service from '../../services/admin_service';
import '../../styles/sesiones_pendientes.css';

const SesionesPendientes = () => {
  const navigate = useNavigate();
  const { is_authenticated, loading } = useAuth();

  const [items, setItems] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState('');

  const [editingId, setEditingId] = useState(null);
  const [linkMeet, setLinkMeet] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !is_authenticated) navigate('/login');
  }, [is_authenticated, loading, navigate]);

  const load = async () => {
    setLoadingData(true);
    setError('');

    const result = await admin_service.get_sesiones_pendientes();

    if (result?.success) {
      const data = result.data || {};
      // Puede venir como data.sesiones o directamente array; soportamos ambas
      const lista = data.sesiones || data.items || data || [];
      setItems(Array.isArray(lista) ? lista : []);
    } else {
      setItems([]);
      setError(result?.message || 'Error al cargar sesiones pendientes');
    }

    setLoadingData(false);
  };

  useEffect(() => {
    if (!loading && is_authenticated) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading, is_authenticated]);

  const startEdit = (sesion) => {
    setEditingId(sesion.id || sesion.sesion_id);
    setLinkMeet('');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setLinkMeet('');
  };

  const saveMeet = async () => {
    if (!editingId) return;
    if (!linkMeet || !linkMeet.startsWith('http')) {
      setError('Ingresa un link válido (https://...)');
      return;
    }

    setSaving(true);
    setError('');

    const result = await admin_service.put_sesion_meet({ sesionId: editingId, link_meet: linkMeet });

    if (result?.success) {
      cancelEdit();
      await load();
    } else {
      setError(result?.message || 'No se pudo guardar el link Meet');
    }

    setSaving(false);
  };

  if (loading) return <div className="loading">Cargando...</div>;

  return (
    <div className="page">
      <Header />

      <main className="main">
        <div className="sesiones_container">
          <div className="sesiones_header">
            <div>
              <h1>Sesiones pendientes</h1>
              <p>Sesiones programadas sin link Meet. Al asignarlo, el backend envía correo al estudiante.</p>
            </div>
            <button className="sesiones_btn_back" onClick={() => navigate('/admin/dashboard')}>
              Volver
            </button>
          </div>

          {error ? <div className="sesiones_error">{error}</div> : null}

          <div className="sesiones_panel">
            {loadingData ? (
              <div className="sesiones_loading">Cargando sesiones...</div>
            ) : items.length === 0 ? (
              <div className="sesiones_empty">No hay sesiones pendientes.</div>
            ) : (
              <table className="sesiones_table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Clase</th>
                    <th>Estudiante</th>
                    <th>Profesor</th>
                    <th>Fecha</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((s) => {
                    const id = s.id || s.sesion_id;
                    const fecha = (s.fecha || s.fecha_sesion || s.inicio || s.start || '').toString().slice(0, 16);
                    return (
                      <tr key={id}>
                        <td className="mono">{id || '—'}</td>
                        <td>{s.clase_nombre || s.titulo || s.clase || '—'}</td>
                        <td>{s.estudiante_email || s.estudiante || '—'}</td>
                        <td>{s.profesor_email || s.profesor || '—'}</td>
                        <td>{fecha || '—'}</td>
                        <td>
                          {editingId === id ? (
                            <div className="sesiones_edit">
                              <input
                                className="sesiones_input"
                                placeholder="https://meet.google.com/..."
                                value={linkMeet}
                                onChange={(e) => setLinkMeet(e.target.value)}
                                disabled={saving}
                              />
                              <button className="sesiones_btn_primary" onClick={saveMeet} disabled={saving}>
                                {saving ? 'Guardando...' : 'Guardar'}
                              </button>
                              <button className="sesiones_btn_secondary" onClick={cancelEdit} disabled={saving}>
                                Cancelar
                              </button>
                            </div>
                          ) : (
                            <button className="sesiones_btn_primary" onClick={() => startEdit(s)}>
                              Asignar link
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default SesionesPendientes;
