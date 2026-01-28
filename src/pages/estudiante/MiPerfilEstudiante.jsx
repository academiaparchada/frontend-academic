// src/pages/estudiante/MiPerfilEstudiante.jsx
import React, { useEffect, useMemo, useState } from 'react';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Header } from '../../components/header';
import { Footer } from '../../components/footer';
import estudiantePerfilService from '../../services/estudiante_perfil_service';
import authService from '../../services/auth_service';
import { getAllTimeZoneOptions } from '../../utils/timezone';
import '../../styles/estudiante-css/mi_perfil_estudiante.css';

const MiPerfilEstudiante = () => {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [guardando, setGuardando] = useState(false);
  const [desactivando, setDesactivando] = useState(false);
  const [error, setError] = useState('');

  const [usuario, setUsuario] = useState(null);

  const [form, setForm] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
    timezone: 'America/Bogota'
  });

  const timeZoneOptions = useMemo(() => getAllTimeZoneOptions(), []);

  const valoresIniciales = useMemo(() => ({
    nombre: usuario?.nombre || '',
    apellido: usuario?.apellido || '',
    telefono: usuario?.telefono || '',
    timezone: usuario?.timezone || 'America/Bogota'
  }), [usuario]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
      return;
    }
    cargarPerfil();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const manejarCuentaInactiva = async (mensaje) => {
    toast.error(mensaje || 'Cuenta desactivada. Contacta soporte.');
    await authService.logout();
    navigate('/login');
  };

  const cargarPerfil = async () => {
    try {
      setLoading(true);
      setError('');

      const res = await estudiantePerfilService.obtenerMiPerfil();

      if (res.success) {
        const u = res.data?.usuario;
        setUsuario(u || null);
        setForm({
          nombre: u?.nombre || '',
          apellido: u?.apellido || '',
          telefono: u?.telefono || '',
          timezone: u?.timezone || 'America/Bogota'
        });
        return;
      }

      if (res.status === 401) {
        toast.error('Tu sesión expiró. Inicia sesión de nuevo.');
        await authService.logout();
        navigate('/login');
        return;
      }

      if (res.status === 403) {
        await manejarCuentaInactiva(res.message);
        return;
      }

      setError(res.message || 'No se pudo cargar el perfil');
    } catch (e) {
      console.error(e);
      setError('No se pudo cargar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const onChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const construirPayload = () => {
    const payload = {};
    if (form.nombre !== valoresIniciales.nombre) payload.nombre = form.nombre;
    if (form.apellido !== valoresIniciales.apellido) payload.apellido = form.apellido;
    if (form.telefono !== valoresIniciales.telefono) payload.telefono = form.telefono;
    if (form.timezone !== valoresIniciales.timezone) payload.timezone = form.timezone;
    return payload;
  };

  const handleGuardar = async (e) => {
    e.preventDefault();

    const payload = construirPayload();
    if (Object.keys(payload).length === 0) {
      toast.error('No hay cambios para guardar');
      return;
    }

    try {
      setGuardando(true);
      const res = await estudiantePerfilService.actualizarMiPerfil(payload);

      if (res.success) {
        toast.success(res.message || 'Perfil actualizado');
        const u = res.data?.usuario;
        setUsuario(u || usuario);
        setForm({
          nombre: u?.nombre || '',
          apellido: u?.apellido || '',
          telefono: u?.telefono || '',
          timezone: u?.timezone || 'America/Bogota'
        });
        return;
      }

      if (res.status === 401) {
        toast.error('Tu sesión expiró. Inicia sesión de nuevo.');
        await authService.logout();
        navigate('/login');
        return;
      }

      if (res.status === 403) {
        await manejarCuentaInactiva(res.message);
        return;
      }

      toast.error(res.message || 'No se pudo actualizar el perfil');
    } catch (err) {
      console.error(err);
      toast.error('No se pudo actualizar el perfil');
    } finally {
      setGuardando(false);
    }
  };

  const handleCancelar = () => {
    setForm({ ...valoresIniciales });
    toast.success('Cambios descartados');
  };

  const handleDesactivarCuenta = async () => {
    const confirmacion = window.confirm(
      '¿Seguro que deseas desactivar tu cuenta?\n\nEsto eliminará sesiones e inscripciones, preservando tu historial de compras.\nEsta acción no se puede revertir desde la app.'
    );

    if (!confirmacion) return;

    try {
      setDesactivando(true);
      const res = await estudiantePerfilService.desactivarCuenta();

      if (res.success) {
        toast.success(res.message || 'Cuenta desactivada');
        await authService.logout();
        navigate('/login');
        return;
      }

      if (res.status === 401) {
        toast.error('Tu sesión expiró. Inicia sesión de nuevo.');
        await authService.logout();
        navigate('/login');
        return;
      }

      if (res.status === 403) {
        toast.error(res.message || 'No tienes permisos para desactivar la cuenta');
        return;
      }

      toast.error(res.message || 'No se pudo desactivar la cuenta');
    } catch (err) {
      console.error(err);
      toast.error('No se pudo desactivar la cuenta');
    } finally {
      setDesactivando(false);
    }
  };

  if (loading) {
    return (
      <div className="page">
        <Header />
        <main className="main">
          <div className="mi-perfil-container">
            <div className="loading-spinner">
              <div className="spinner"></div>
              <p>Cargando perfil...</p>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="page">
      <Header />

      <main className="main">
        <div className="mi-perfil-container">
          <div className="mi-perfil-header">
            <div>
              <h1>Mi Perfil</h1>
              <p>Consulta y actualiza tu información personal</p>
            </div>

            <div className="header-buttons">
              <button className="btn-volver" onClick={() => navigate(-1)}>
                ← Volver
              </button>
            </div>
          </div>

          {error && <div className="mensaje-error">{error}</div>}

          <div className="mi-perfil-grid">
            <div className="perfil-card">
              <h2 className="card-title">Datos del Perfil</h2>

              <form onSubmit={handleGuardar} className="perfil-form">
                <div className="form-row">
                  <label className="form-label">Email</label>
                  <input
                    type="text"
                    value={usuario?.email || ''}
                    disabled
                    className="form-input form-input-disabled"
                  />
                </div>

                <div className="form-row two-cols">
                  <div className="col">
                    <label className="form-label">Nombre</label>
                    <input
                      type="text"
                      value={form.nombre}
                      onChange={(e) => onChange('nombre', e.target.value)}
                      className="form-input"
                      placeholder="Tu nombre"
                    />
                  </div>

                  <div className="col">
                    <label className="form-label">Apellido</label>
                    <input
                      type="text"
                      value={form.apellido}
                      onChange={(e) => onChange('apellido', e.target.value)}
                      className="form-input"
                      placeholder="Tu apellido"
                    />
                  </div>
                </div>

                <div className="form-row two-cols">
                  <div className="col">
                    <label className="form-label">Teléfono</label>
                    <input
                      type="text"
                      value={form.telefono}
                      onChange={(e) => onChange('telefono', e.target.value)}
                      className="form-input"
                      placeholder="3000000000"
                    />
                  </div>

                  <div className="col">
                    <label className="form-label">Zona horaria</label>
                    <select
                      value={form.timezone}
                      onChange={(e) => onChange('timezone', e.target.value)}
                      className="form-input"
                    >
                      {timeZoneOptions.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="form-actions">
                  <button
                    type="button"
                    className="btn-secundario"
                    onClick={handleCancelar}
                    disabled={guardando || desactivando}
                  >
                    Cancelar
                  </button>

                  <button
                    type="submit"
                    className="btn-accion-principal"
                    disabled={guardando || desactivando}
                  >
                    {guardando ? 'Guardando...' : 'Guardar cambios'}
                  </button>
                </div>
              </form>
            </div>

            <div className="perfil-card peligro-card">
              <h2 className="card-title">Zona de Peligro</h2>
              <p className="danger-text">
                Desactivar tu cuenta eliminará tus registros en nuestra web, excepto las compras que hiciste.
              </p>

              <button
                className="btn-peligro"
                onClick={handleDesactivarCuenta}
                disabled={desactivando || guardando}
              >
                {desactivando ? 'Desactivando...' : 'Desactivar cuenta'}
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default MiPerfilEstudiante;
