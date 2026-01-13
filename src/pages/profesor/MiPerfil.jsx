// src/pages/profesor/MiPerfil.jsx
import { useState } from 'react';
import { Header } from '../../components/header';
import { Footer } from '../../components/footer';
import { useAuth } from '../../context/auth_context';
import profesorService from '../../services/profesor_service';
import '../../styles/profesor_perfil.css';

export const MiPerfil = () => {
  const { user, updateUser } = useAuth();
  const [editando, setEditando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

  const [datosPerfil, setDatosPerfil] = useState({
    nombre: user?.nombre || '',
    apellido: user?.apellido || '',
    telefono: user?.telefono || ''
  });

  const [errores, setErrores] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDatosPerfil(prev => ({
      ...prev,
      [name]: value
    }));

    if (errores[name]) {
      setErrores(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validar = () => {
    const nuevosErrores = {};

    if (!datosPerfil.nombre.trim()) {
      nuevosErrores.nombre = 'El nombre es obligatorio';
    }

    if (!datosPerfil.apellido.trim()) {
      nuevosErrores.apellido = 'El apellido es obligatorio';
    }

    if (!datosPerfil.telefono.trim()) {
      nuevosErrores.telefono = 'El teléfono es obligatorio';
    } else if (!/^\d{10}$/.test(datosPerfil.telefono.replace(/\s/g, ''))) {
      nuevosErrores.telefono = 'Teléfono inválido (debe tener 10 dígitos)';
    }

    setErrores(nuevosErrores);
    return Object.keys(nuevosErrores).length === 0;
  };

  const handleGuardar = async () => {
    if (!validar()) {
      setMensaje({ tipo: 'error', texto: 'Por favor corrige los errores' });
      return;
    }

    // Verificar si hubo cambios
    const hubocambios = 
      datosPerfil.nombre !== user.nombre ||
      datosPerfil.apellido !== user.apellido ||
      datosPerfil.telefono !== (user.telefono || '');

    if (!huboChangios) {
      setMensaje({ tipo: 'info', texto: 'No hay cambios para guardar' });
      return;
    }

    setGuardando(true);
    setMensaje({ tipo: '', texto: '' });

    try {
      const result = await profesorService.actualizarPerfil(datosPerfil);

      if (result.success) {
        setMensaje({ tipo: 'success', texto: '✅ Perfil actualizado correctamente' });
        setEditando(false);
        
        // Actualizar contexto de usuario
        const usuarioActualizado = { ...user, ...datosPerfil };
        updateUser(usuarioActualizado);
        localStorage.setItem('user', JSON.stringify(usuarioActualizado));
      } else {
        setMensaje({ tipo: 'error', texto: result.message });
      }
    } catch (err) {
      setMensaje({ tipo: 'error', texto: 'Error al actualizar perfil' });
    } finally {
      setGuardando(false);
    }
  };

  const handleCancelar = () => {
    setDatosPerfil({
      nombre: user?.nombre || '',
      apellido: user?.apellido || '',
      telefono: user?.telefono || ''
    });
    setEditando(false);
    setErrores({});
    setMensaje({ tipo: '', texto: '' });
  };

  return (
    <div className="page">
      <Header />
      <main className="main">
        <div className="profesor-perfil-container">
          <h1>⚙️ Mi Perfil</h1>

          {mensaje.texto && (
            <div className={`mensaje ${mensaje.tipo}`}>
              {mensaje.texto}
            </div>
          )}

          <div className="perfil-card">
            <div className="perfil-header">
              <div className="avatar">
                {user?.nombre?.charAt(0)}{user?.apellido?.charAt(0)}
              </div>
              <div className="info-basica">
                <p className="rol-badge">👨‍🏫 Profesor</p>
                <p className="email">{user?.email}</p>
              </div>
            </div>

            <div className="perfil-body">
              <div className="form-group">
                <label>Nombre</label>
                <input
                  type="text"
                  name="nombre"
                  value={datosPerfil.nombre}
                  onChange={handleChange}
                  disabled={!editando || guardando}
                  className={errores.nombre ? 'input-error' : ''}
                />
                {errores.nombre && <span className="error">{errores.nombre}</span>}
              </div>

              <div className="form-group">
                <label>Apellido</label>
                <input
                  type="text"
                  name="apellido"
                  value={datosPerfil.apellido}
                  onChange={handleChange}
                  disabled={!editando || guardando}
                  className={errores.apellido ? 'input-error' : ''}
                />
                {errores.apellido && <span className="error">{errores.apellido}</span>}
              </div>

              <div className="form-group">
                <label>Teléfono</label>
                <input
                  type="tel"
                  name="telefono"
                  value={datosPerfil.telefono}
                  onChange={handleChange}
                  disabled={!editando || guardando}
                  className={errores.telefono ? 'input-error' : ''}
                  placeholder="3001234567"
                />
                {errores.telefono && <span className="error">{errores.telefono}</span>}
              </div>

              <div className="form-group">
                <label>Email</label>
                <input
                  type="email"
                  value={user?.email || ''}
                  disabled
                  className="input-disabled"
                />
                <span className="help-text">El email no se puede modificar</span>
              </div>
            </div>

            <div className="perfil-footer">
              {!editando ? (
                <button className="btn-editar" onClick={() => setEditando(true)}>
                  ✏️ Editar Perfil
                </button>
              ) : (
                <div className="botones-edicion">
                  <button 
                    className="btn-cancelar" 
                    onClick={handleCancelar}
                    disabled={guardando}
                  >
                    Cancelar
                  </button>
                  <button 
                    className="btn-guardar" 
                    onClick={handleGuardar}
                    disabled={guardando}
                  >
                    {guardando ? 'Guardando...' : '💾 Guardar Cambios'}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};
