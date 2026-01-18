// src/pages/admin/sesiones_pendientes.jsx
import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/header';
import { Footer } from '../../components/footer';
import { useAuth } from '../../context/auth_context';
import admin_service from '../../services/admin_service';
import '../../styles/sesiones_pendientes.css';

const SesionesPendientes = () => {
  const navigate = useNavigate();
  const { is_authenticated, loading } = useAuth();

  const [cursoId, setCursoId] = useState('');

  const [items, setItems] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState('');

  // crear sesiones (batch)
  const [sesionesDraft, setSesionesDraft] = useState([
    { fecha_hora: '', duracion_min: 60 },
  ]);
  const [creating, setCreating] = useState(false);
  const [createMsg, setCreateMsg] = useState('');

  // editar meet por sesión
  const [editingId, setEditingId] = useState(null);
  const [linkMeet, setLinkMeet] = useState('');
  const [saving, setSaving] = useState(false);
  const [warning, setWarning] = useState('');

  useEffect(() => {
    if (!loading && !is_authenticated) navigate('/login');
  }, [is_authenticated, loading, navigate]);

  const canLoad = useMemo(() => !!cursoId && cursoId.trim().length > 5, [cursoId]);

  const load = async () => {
    if (!canLoad) return;

    setLoadingData(true);
    setError('');
    setWarning('');
    setCreateMsg('');

    const result = await admin_service.get_curso_sesiones({ cursoId: cursoId.trim() });

    if (result?.success) {
      const data = result.data || {};
      const lista = data.sesiones || [];
      setItems(Array.isArray(lista) ? lista : []);
    } else {
      setItems([]);
      setError(result?.message || 'Error al cargar sesiones del curso');
    }

    setLoadingData(false);
  };

  const addDraftRow = () => {
    setSesionesDraft((prev) => [...prev, { fecha_hora: '', duracion_min: 60 }]);
  };

  const removeDraftRow = (idx) => {
    setSesionesDraft((prev) => prev.filter((_, i) => i !== idx));
  };

  const updateDraft = (idx, field, value) => {
    setSesionesDraft((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, [field]: value } : s))
    );
  };

  const crearSesiones = async () => {
    if (!canLoad) {
      setError('Debes ingresar un cursoId válido.');
      return;
    }

    const payload = sesionesDraft
      .map((s) => ({
        fecha_hora: s.fecha_hora ? new Date(s.fecha_hora).toISOString() : '',
        duracion_min: Number(s.duracion_min || 60),
      }))
      .filter((s) => !!s.fecha_hora);

    if (payload.length === 0) {
      setError('Agrega al menos una fecha/hora válida para crear sesiones.');
      return;
    }

    setCreating(true);
    setError('');
    setCreateMsg('');
    setWarning('');

    const res = await admin_service.post_curso_sesiones({ cursoId: cursoId.trim(), sesiones: payload });

    if (res?.success) {
      setCreateMsg(res?.message || 'Sesiones creadas');
      setSesionesDraft([{ fecha_hora: '', duracion_min: 60 }]);
      await load();
    } else {
      setError(res?.message || 'No se pudieron crear las sesiones');
    }

    setCreating(false);
  };

  const startEdit = (sesion) => {
    setEditingId(sesion.id);
    setLinkMeet(sesion.link_meet || '');
    setWarning('');
    setError('');
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
    setWarning('');

    const res = await admin_service.put_curso_sesion_meet({
      cursoId: cursoId.trim(),
      sesionId: editingId,
      link_meet: linkMeet,
    });

    if (res?.success) {
      const notif = res?.data?.notificacion;
      if (notif && notif.ok === false) {
        setWarning(`Se guardó el link, pero hubo fallas enviando correos (sent: ${notif.sent || 0}).`);
      }
      cancelEdit();
      await load();
    } else {
      setError(res?.message || 'No se pudo guardar el link Meet');
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
              <h1>Sesiones de curso (Admin)</h1>
              <p>Crea sesiones para cursos grupales y asigna link Meet (notifica por email al asignar/actualizar).</p>
            </div>
            <button className="sesiones_btn_back" onClick={() => navigate('/admin/dashboard')}>
              Volver
            </button>
          </div>

          <div className="sesiones_panel" style={{ marginBottom: '1rem' }}>
            <div style={{ padding: '1rem 1.25rem' }}>
              <label style={{ fontWeight: 800, color: '#2d5555' }}>Curso ID</label>
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                <input
                  className="sesiones_input"
                  placeholder="uuid del curso"
                  value={cursoId}
                  onChange={(e) => setCursoId(e.target.value)}
                  disabled={loadingData || creating || saving}
                  style={{ minWidth: 320 }}
                />
                <button className="sesiones_btn_primary" onClick={load} disabled={!canLoad || loadingData}>
                  {loadingData ? 'Cargando...' : 'Cargar sesiones'}
                </button>
              </div>
            </div>
          </div>

          {error ? <div className="sesiones_error">{error}</div> : null}
          {warning ? <div className="sesiones_error" style={{ color: '#b7791f', borderColor: 'rgba(183,121,31,0.25)', background: 'rgba(183,121,31,0.12)' }}>{warning}</div> : null}
          {createMsg ? <div className="sesiones_error" style={{ color: '#2f855a', borderColor: 'rgba(47,133,90,0.25)', background: 'rgba(47,133,90,0.12)' }}>{createMsg}</div> : null}

          {/* Crear sesiones */}
          <div className="sesiones_panel" style={{ marginBottom: '1rem' }}>
            <div style={{ padding: '1rem 1.25rem' }}>
              <h3 style={{ margin: 0, color: '#2d5555' }}>Crear sesiones</h3>
              <small style={{ color: 'rgba(45,85,85,0.75)', fontWeight: 700 }}>
                No se envían correos al crear sesiones.
              </small>

              <div style={{ marginTop: '0.75rem', display: 'grid', gap: '0.6rem' }}>
                {sesionesDraft.map((s, idx) => (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: '1fr 160px 120px', gap: '0.6rem' }}>
                    <input
                      className="sesiones_input"
                      type="datetime-local"
                      value={s.fecha_hora}
                      onChange={(e) => updateDraft(idx, 'fecha_hora', e.target.value)}
                      disabled={creating}
                    />
                    <input
                      className="sesiones_input"
                      type="number"
                      min={15}
                      step={5}
                      value={s.duracion_min}
                      onChange={(e) => updateDraft(idx, 'duracion_min', e.target.value)}
                      disabled={creating}
                    />
                    <button
                      className="sesiones_btn_secondary"
                      onClick={() => removeDraftRow(idx)}
                      disabled={creating || sesionesDraft.length === 1}
                    >
                      Quitar
                    </button>
                  </div>
                ))}
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.9rem', flexWrap: 'wrap' }}>
                <button className="sesiones_btn_secondary" onClick={addDraftRow} disabled={creating}>
                  Agregar fila
                </button>
                <button className="sesiones_btn_primary" onClick={crearSesiones} disabled={creating || !canLoad}>
                  {creating ? 'Creando...' : 'Crear sesiones'}
                </button>
              </div>
            </div>
          </div>

          {/* Tabla sesiones */}
          <div className="sesiones_panel">
            {loadingData ? (
              <div className="sesiones_loading">Cargando sesiones...</div>
            ) : items.length === 0 ? (
              <div className="sesiones_empty">No hay sesiones para este curso.</div>
            ) : (
              <table className="sesiones_table">
                <thead>
                  <tr>
                    <th>Fecha/hora</th>
                    <th>Duración</th>
                    <th>Estado</th>
                    <th>Meet</th>
                    <th>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((s) => {
                    const fecha = (s.fecha_hora || '').toString().slice(0, 16).replace('T', ' ');
                    return (
                      <tr key={s.id}>
                        <td className="mono">{fecha || '—'}</td>
                        <td>{s.duracion_min ?? 60} min</td>
                        <td>{s.estado || 'programada'}</td>
                        <td>
                          {s.link_meet ? (
                            <a href={s.link_meet} target="_blank" rel="noreferrer">
                              Abrir Meet
                            </a>
                          ) : (
                            'Pendiente'
                          )}
                        </td>
                        <td>
                          {editingId === s.id ? (
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
                              {s.link_meet ? 'Actualizar link' : 'Asignar link'}
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
