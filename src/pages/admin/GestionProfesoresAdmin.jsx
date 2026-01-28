// src/pages/admin/GestionProfesoresAdmin.jsx
import React, { useEffect, useMemo, useState } from 'react';
import { toast } from 'react-hot-toast';

import { Header } from '../../components/header';
import { Footer } from '../../components/footer';

import CalendarioSemanal from '../../components/CalendarioSemanal';
import ModalFranja from '../../components/ModalFranja';
import franjasService from '../../services/franjas_service';

// Dejamos los CSS como están (según tu mensaje)
import '../../styles/admin-css/gestion_profesores_admin.css';
import '../../styles/profesores.css';
import '../../styles/profesor-css/FranjasHorarias.css';

import { getAllTimeZoneOptions } from '../../utils/timezone';

const API_PROFESORES = 'https://academiaparchada.onrender.com/api/profesores';
const API_ASIGNATURAS = 'https://academiaparchada.onrender.com/api/asignaturas';

const GestionProfesoresAdmin = () => {
  const token = localStorage.getItem('token');

  const timeZoneOptions = useMemo(() => getAllTimeZoneOptions(), []);

  // =========================
  // SECCIÓN: PROFESORES (copiada de ProfesoresPage.jsx)
  // =========================
  const [profesores, setProfesores] = useState([]);
  const [asignaturasDisponibles, setAsignaturasDisponibles] = useState([]);
  const [loadingProfesores, setLoadingProfesores] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [showModalProfesor, setShowModalProfesor] = useState(false);
  const [showCredentials, setShowCredentials] = useState(false);
  const [credencialesTemporales, setCredencialesTemporales] = useState(null);

  const [formData, setFormData] = useState({
    email: '',
    nombre: '',
    apellido: '',
    telefono: '',
    asignaturas: [],
    timezone: '' // NUEVO
  });

  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // =========================
  // SECCIÓN: FRANJAS (copiada de FranjasHorariasAdmin.jsx)
  // =========================
  const [profesorSeleccionado, setProfesorSeleccionado] = useState(null);
  const [franjasPorDia, setFranjasPorDia] = useState({});
  const [todasLasFranjas, setTodasLasFranjas] = useState([]);
  const [loadingFranjas, setLoadingFranjas] = useState(false);
  const [errorFranjas, setErrorFranjas] = useState('');

  const [modalAbierto, setModalAbierto] = useState(false);
  const [franjaEditar, setFranjaEditar] = useState(null);
  const [diaSeleccionado, setDiaSeleccionado] = useState(null);

  // =========================
  // CARGAS INICIALES
  // =========================
  useEffect(() => {
    loadProfesores();
  }, [page]);

  useEffect(() => {
    loadAsignaturas();
  }, []);

  useEffect(() => {
    if (profesorSeleccionado) {
      cargarFranjasProfesor(profesorSeleccionado.id);
    }
  }, [profesorSeleccionado]);

  // =========================
  // PROFESORES: API
  // =========================
  const loadProfesores = async () => {
    try {
      setLoadingProfesores(true);

      const response = await fetch(`${API_PROFESORES}?page=${page}&limit=10`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setProfesores(data.data.profesores);
        setTotalPages(data.data.pagination.totalPages);
        setTotal(data.data.pagination.total);

        if (!profesorSeleccionado && Array.isArray(data.data.profesores) && data.data.profesores.length > 0) {
          setProfesorSeleccionado(data.data.profesores[0]);
        }
      } else {
        toast.error('Error al cargar profesores');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error de conexión al cargar profesores');
    } finally {
      setLoadingProfesores(false);
    }
  };

  const loadAsignaturas = async () => {
    try {
      const response = await fetch(`${API_ASIGNATURAS}?page=1&limit=100`);
      const data = await response.json();
      if (data.success) {
        setAsignaturasDisponibles(data.data.asignaturas);
      }
    } catch (error) {
      console.error('Error al cargar asignaturas:', error);
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!editingId) {
      if (!formData.email || !formData.email.includes('@')) {
        newErrors.email = 'Email inválido';
      }
    }

    if (!formData.nombre || formData.nombre.trim().length < 2) {
      newErrors.nombre = 'El nombre debe tener al menos 2 caracteres';
    } else if (formData.nombre.length > 100) {
      newErrors.nombre = 'El nombre no puede exceder 100 caracteres';
    }

    if (!formData.apellido || formData.apellido.trim().length < 2) {
      newErrors.apellido = 'El apellido debe tener al menos 2 caracteres';
    } else if (formData.apellido.length > 100) {
      newErrors.apellido = 'El apellido no puede exceder 100 caracteres';
    }

    if (formData.telefono && (formData.telefono.length < 7 || formData.telefono.length > 20)) {
      newErrors.telefono = 'El teléfono debe tener entre 7 y 20 caracteres';
    }

    if (!formData.asignaturas || formData.asignaturas.length === 0) {
      newErrors.asignaturas = 'Debe seleccionar al menos una asignatura';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmitProfesor = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      toast.error('Por favor corrige los errores del formulario');
      return;
    }

    if (!token) {
      toast.error('Debes iniciar sesión como administrador');
      return;
    }

    setIsSubmitting(true);

    try {
      const url = editingId ? `${API_PROFESORES}/${editingId}` : API_PROFESORES;
      const method = editingId ? 'PUT' : 'POST';

      const payload = {
        nombre: formData.nombre.trim(),
        apellido: formData.apellido.trim(),
        telefono: formData.telefono.trim() || undefined,
        asignaturas: formData.asignaturas
      };

      if (!editingId) {
        payload.email = formData.email.trim();
      }

      // NUEVO: enviar timezone solo si el usuario seleccionó una opción
      if (formData.timezone && String(formData.timezone).trim()) {
        payload.timezone = String(formData.timezone).trim();
      }

      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || (editingId ? 'Profesor actualizado' : 'Profesor creado'));

        if (!editingId && data.data.credenciales) {
          setCredencialesTemporales(data.data.credenciales);
          setShowCredentials(true);
        } else {
          closeModalProfesor();
        }

        loadProfesores();
      } else {
        if (response.status === 401) {
          toast.error('No estás autenticado. Inicia sesión nuevamente.');
        } else if (response.status === 403) {
          toast.error('No tienes permisos de administrador');
        } else if (data.message) {
          toast.error(data.message);
        } else if (data.errors) {
          const formErrors = {};
          data.errors.forEach(err => {
            formErrors[err.field] = err.message;
          });
          setErrors(formErrors);
        } else {
          toast.error('Error al guardar el profesor');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error de conexión al guardar');
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyPassword = () => {
    if (credencialesTemporales?.password_temporal) {
      navigator.clipboard.writeText(credencialesTemporales.password_temporal);
      toast.success('Contraseña copiada al portapapeles');
    }
  };

  const handleDeleteProfesor = async (id, nombre, apellido) => {
    if (!window.confirm(`¿Estás seguro de eliminar al profesor ${nombre} ${apellido}?\n\nEsta acción no se puede deshacer.`)) {
      return;
    }

    if (!token) {
      toast.error('Debes iniciar sesión como administrador');
      return;
    }

    try {
      const response = await fetch(`${API_PROFESORES}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || 'Profesor eliminado exitosamente');

        if (profesores.length === 1 && page > 1) {
          setPage(page - 1);
        } else {
          loadProfesores();
        }
      } else {
        if (response.status === 401) {
          toast.error('No estás autenticado');
        } else if (response.status === 403) {
          toast.error('No tienes permisos de administrador');
        } else {
          toast.error(data.message || 'Error al eliminar... ');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error de conexión al eliminar');
    }
  };

  const handleEditProfesor = async (profesor) => {
    // timezone puede venir como profesor.timezone o profesor.usuario.timezone
    const tz = profesor?.timezone || profesor?.usuario?.timezone || '';

    setFormData({
      email: profesor.email,
      nombre: profesor.nombre,
      apellido: profesor.apellido,
      telefono: profesor.telefono || '',
      asignaturas: profesor.asignaturas.map(a => a.id),
      timezone: tz
    });

    setEditingId(profesor.id);
    setErrors({});
    setShowModalProfesor(true);
  };

  const handleCreateProfesor = () => {
    setFormData({
      email: '',
      nombre: '',
      apellido: '',
      telefono: '',
      asignaturas: [],
      timezone: ''
    });

    setEditingId(null);
    setErrors({});
    setShowModalProfesor(true);
  };

  const closeModalProfesor = () => {
    setShowModalProfesor(false);
    setShowCredentials(false);
    setCredencialesTemporales(null);

    setFormData({
      email: '',
      nombre: '',
      apellido: '',
      telefono: '',
      asignaturas: [],
      timezone: ''
    });

    setEditingId(null);
    setErrors({});
  };

  const toggleAsignatura = (asignaturaId) => {
    setFormData(prev => {
      const asignaturas = prev.asignaturas.includes(asignaturaId)
        ? prev.asignaturas.filter(id => id !== asignaturaId)
        : [...prev.asignaturas, asignaturaId];
      return { ...prev, asignaturas };
    });

    if (errors.asignaturas) {
      setErrors({ ...errors, asignaturas: '' });
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  // =========================
  // FRANJAS: API/LOGIC
  // =========================
  const cargarFranjasProfesor = async (profesorId) => {
    try {
      setLoadingFranjas(true);
      setErrorFranjas('');

      const resultado = await franjasService.listarFranjasProfesor(profesorId);

      if (resultado.success) {
        setFranjasPorDia(resultado.data.franjasPorDia || {});
        setTodasLasFranjas(resultado.data.franjas || []);
      } else {
        setErrorFranjas(resultado.message);
        setFranjasPorDia({});
        setTodasLasFranjas([]);
      }
    } catch (err) {
      console.error('Error al cargar franjas:', err);
      setErrorFranjas('Error al cargar las franjas horarias');
      setFranjasPorDia({});
      setTodasLasFranjas([]);
    } finally {
      setLoadingFranjas(false);
    }
  };

  const handleAgregarFranja = (dia) => {
    setDiaSeleccionado(dia);
    setFranjaEditar(null);
    setModalAbierto(true);
  };

  const handleEditarFranja = (franja) => {
    setFranjaEditar(franja);
    setDiaSeleccionado(null);
    setModalAbierto(true);
  };

  const handleEliminarFranja = async (franja) => {
    const confirmacion = window.confirm(
      `¿Estás seguro de eliminar la franja del ${franja.dia_semana} (${franja.hora_inicio} - ${franja.hora_fin})?`
    );
    if (!confirmacion) return;

    try {
      setLoadingFranjas(true);
      const resultado = await franjasService.eliminarFranja(franja.id);

      if (resultado.success) {
        await cargarFranjasProfesor(profesorSeleccionado.id);
        alert(resultado.message);
      } else {
        alert(`Error: ${resultado.message}`);
      }
    } catch (err) {
      console.error('Error al eliminar franja:', err);
      alert('Error al eliminar la franja horaria');
    } finally {
      setLoadingFranjas(false);
    }
  };

  const handleFranjaSaved = () => {
    if (profesorSeleccionado) {
      cargarFranjasProfesor(profesorSeleccionado.id);
    }
  };

  return (
    <div className="page">
      <Header />

      <main className="main">
        <div className="gestion-profesores-admin">
          {/* SECCIÓN 1: PROFESORES */}
          <div className="profesores-page">
            <div className="profesores-container">
              <div className="profesores-header">
                <div className="header-content">
                  <div className="header-text">
                    <h1>Gestión de Profesores</h1>
                    <p className="subtitle">
                      {loadingProfesores
                        ? 'Cargando...'
                        : `${total} profesor${total !== 1 ? 'es' : ''} registrado${total !== 1 ? 's' : ''}`}
                    </p>
                  </div>

                  <button onClick={handleCreateProfesor} className="btn-create">
                    <span className="icon">+</span> Nuevo Profesor
                  </button>
                </div>
              </div>

              {loadingProfesores ? (
                <div className="loading-container">
                  <div className="spinner"></div>
                  <p>Cargando profesores...</p>
                </div>
              ) : profesores.length === 0 ? (
                <div className="empty-state">
                  <div className="empty-icon">👨‍🏫</div>
                  <h2>No hay profesores</h2>
                  <p>Comienza agregando tu primer profesor</p>
                  <button onClick={handleCreateProfesor} className="btn-empty">
                    Agregar Profesor
                  </button>
                </div>
              ) : (
                <div className="table-container">
                  <table className="profesores-table">
                    <thead>
                      <tr>
                        <th>Nombre Completo</th>
                        <th>Email</th>
                        <th>Teléfono</th>
                        <th>Asignaturas</th>
                        <th>Fecha de Registro</th>
                        <th>Acciones</th>
                      </tr>
                    </thead>
                    <tbody>
                      {profesores.map((profesor) => (
                        <tr key={profesor.id}>
                          <td className="name-cell">
                            <strong>{profesor.nombre} {profesor.apellido}</strong>
                          </td>
                          <td className="email-cell">{profesor.email}</td>
                          <td className="phone-cell">
                            {profesor.telefono || <em className="no-phone">Sin teléfono</em>}
                          </td>
                          <td className="asignaturas-cell">
                            <div className="asignaturas-badges">
                              {profesor.asignaturas.map((asig) => (
                                <span key={asig.id} className="badge-asignatura">
                                  {asig.nombre}
                                </span>
                              ))}
                            </div>
                          </td>
                          <td className="date-cell">{formatDate(profesor.created_at)}</td>
                          <td className="actions-cell">
                            <button onClick={() => handleEditProfesor(profesor)} className="btn-edit" title="Editar">
                              ✏️
                            </button>
                            <button
                              onClick={() => handleDeleteProfesor(profesor.id, profesor.nombre, profesor.apellido)}
                              className="btn-delete"
                              title="Eliminar"
                            >
                              🗑️
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {totalPages > 1 && (
                    <div className="pagination">
                      <button
                        onClick={() => setPage(p => Math.max(1, p - 1))}
                        disabled={page === 1}
                        className="pagination-btn"
                      >
                        Anterior
                      </button>
                      <span className="pagination-info">Página {page} de {totalPages}</span>
                      <button
                        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                        disabled={page === totalPages}
                        className="pagination-btn"
                      >
                        Siguiente
                      </button>
                    </div>
                  )}
                </div>
              )}

              {showModalProfesor && (
                <div className="modal-overlay" onClick={closeModalProfesor}>
                  <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header">
                      <h2>{editingId ? 'Editar Profesor' : 'Nuevo Profesor'}</h2>
                      <button onClick={closeModalProfesor} className="btn-close">×</button>
                    </div>

                    {!showCredentials ? (
                      <form onSubmit={handleSubmitProfesor} className="modal-form">
                        {!editingId && (
                          <div className="form-group">
                            <label htmlFor="email">
                              Email <span className="required">*</span>
                            </label>
                            <input
                              id="email"
                              type="email"
                              placeholder="profesor@academia.com"
                              value={formData.email}
                              onChange={(e) => {
                                setFormData({ ...formData, email: e.target.value });
                                if (errors.email) setErrors({ ...errors, email: '' });
                              }}
                              className={errors.email ? 'input-error' : ''}
                            />
                            {errors.email && <span className="error-message">{errors.email}</span>}
                          </div>
                        )}

                        <div className="form-group">
                          <label htmlFor="nombre">
                            Nombre <span className="required">*</span>
                          </label>
                          <input
                            id="nombre"
                            type="text"
                            placeholder="Ej: Juan"
                            value={formData.nombre}
                            onChange={(e) => {
                              setFormData({ ...formData, nombre: e.target.value });
                              if (errors.nombre) setErrors({ ...errors, nombre: '' });
                            }}
                            className={errors.nombre ? 'input-error' : ''}
                            maxLength={100}
                          />
                          {errors.nombre && <span className="error-message">{errors.nombre}</span>}
                          <span className="char-count">{formData.nombre.length}/100</span>
                        </div>

                        <div className="form-group">
                          <label htmlFor="apellido">
                            Apellido <span className="required">*</span>
                          </label>
                          <input
                            id="apellido"
                            type="text"
                            placeholder="Ej: Pérez"
                            value={formData.apellido}
                            onChange={(e) => {
                              setFormData({ ...formData, apellido: e.target.value });
                              if (errors.apellido) setErrors({ ...errors, apellido: '' });
                            }}
                            className={errors.apellido ? 'input-error' : ''}
                            maxLength={100}
                          />
                          {errors.apellido && <span className="error-message">{errors.apellido}</span>}
                          <span className="char-count">{formData.apellido.length}/100</span>
                        </div>

                        <div className="form-group">
                          <label htmlFor="telefono">Teléfono (opcional)</label>
                          <input
                            id="telefono"
                            type="tel"
                            placeholder="3001234567"
                            value={formData.telefono}
                            onChange={(e) => {
                              setFormData({ ...formData, telefono: e.target.value });
                              if (errors.telefono) setErrors({ ...errors, telefono: '' });
                            }}
                            className={errors.telefono ? 'input-error' : ''}
                            maxLength={20}
                          />
                          {errors.telefono && <span className="error-message">{errors.telefono}</span>}
                        </div>

                        {/* SELECT GLOBAL */}
                        <div className="form-group">
                          <label htmlFor="timezone">Zona horaria (opcional)</label>
                          <select
                            id="timezone"
                            value={formData.timezone}
                            onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                          >
                            <option value="">Usar valor por defecto</option>
                            {timeZoneOptions.map((tz) => (
                              <option key={tz.value} value={tz.value}>
                                {tz.label}
                              </option>
                            ))}
                          </select>
                          <span className="help-text">
                            Si no seleccionas nada, se mantiene el default o el valor previo.
                          </span>
                        </div>

                        <div className="form-group">
                          <label>
                            Asignaturas <span className="required">*</span>
                          </label>
                          <div className="asignaturas-selector">
                            {asignaturasDisponibles.map((asig) => (
                              <label key={asig.id} className="checkbox-label">
                                <input
                                  type="checkbox"
                                  checked={formData.asignaturas.includes(asig.id)}
                                  onChange={() => toggleAsignatura(asig.id)}
                                />
                                <span>{asig.nombre}</span>
                              </label>
                            ))}
                          </div>

                          {errors.asignaturas && <span className="error-message">{errors.asignaturas}</span>}
                          <span className="help-text">
                            {formData.asignaturas.length} asignatura{formData.asignaturas.length !== 1 ? 's' : ''} seleccionada{formData.asignaturas.length !== 1 ? 's' : ''}
                          </span>
                        </div>

                        <div className="modal-actions">
                          <button type="button" onClick={closeModalProfesor} className="btn-cancel" disabled={isSubmitting}>
                            Cancelar
                          </button>
                          <button type="submit" className="btn-submit" disabled={isSubmitting}>
                            {isSubmitting ? 'Guardando...' : (editingId ? 'Actualizar' : 'Crear Profesor')}
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="credentials-container">
                        <div className="credentials-icon">✅</div>
                        <h3>Profesor creado exitosamente</h3>
                        <p className="credentials-intro">
                          Se ha enviado un email al profesor con sus credenciales de acceso.
                        </p>

                        <div className="credentials-box">
                          <div className="credential-item">
                            <label>Email</label>
                            <span>{credencialesTemporales?.email}</span>
                          </div>

                          <div className="credential-item">
                            <label>Contraseña temporal</label>
                            <div className="password-container">
                              <span className="password">{credencialesTemporales?.password_temporal}</span>
                              <button onClick={copyPassword} className="btn-copy" title="Copiar">📋</button>
                            </div>
                          </div>
                        </div>

                        <p className="credentials-note">⚠️ Guarda esta contraseña, no se volverá a mostrar.</p>
                        <button onClick={closeModalProfesor} className="btn-close-credentials">Cerrar</button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* SECCIÓN 2: FRANJAS HORARIAS */}
          <div className="gestion-profesores-divider" />

          <div className="franjas-horarias-container">
            <div className="franjas-header">
              <h1>Gestión de Franjas Horarias</h1>
              <p className="subtitulo">Administra las franjas horarias de todos los profesores</p>
            </div>

            <div className="selector-profesor">
              <label htmlFor="profesor-select">Seleccionar Profesor</label>
              <select
                id="profesor-select"
                value={profesorSeleccionado?.id || ''}
                onChange={(e) => {
                  const profesor = profesores.find(p => String(p.id) === String(e.target.value));
                  setProfesorSeleccionado(profesor || null);
                }}
                disabled={loadingFranjas || profesores.length === 0}
              >
                <option value="">-- Selecciona un profesor --</option>
                {profesores.map((profesor) => (
                  <option key={profesor.id} value={profesor.id}>
                    {profesor.nombre} {profesor.apellido} - {profesor.email}
                  </option>
                ))}
              </select>
            </div>

            {errorFranjas && <div className="mensaje-error">{errorFranjas}</div>}

            {loadingFranjas && (
              <div className="loading-spinner">
                <div className="spinner"></div>
                <p>Cargando...</p>
              </div>
            )}

            {!loadingFranjas && profesores.length === 0 && (
              <div className="mensaje-info">
                <p>⚠️ No hay profesores registrados en el sistema</p>
              </div>
            )}

            {profesorSeleccionado && !loadingFranjas && (
              <div className="calendario-section">
                <div className="profesor-info">
                  <h2>Horario de {profesorSeleccionado.nombre} {profesorSeleccionado.apellido}</h2>
                </div>

                <CalendarioSemanal
                  franjasPorDia={franjasPorDia}
                  onAgregarFranja={handleAgregarFranja}
                  onEditarFranja={handleEditarFranja}
                  onEliminarFranja={handleEliminarFranja}
                />
              </div>
            )}

            {!profesorSeleccionado && !loadingFranjas && profesores.length > 0 && (
              <div className="mensaje-info">
                <p>👆 Selecciona un profesor para gestionar sus franjas horarias</p>
              </div>
            )}

            <ModalFranja
              isOpen={modalAbierto}
              onClose={() => setModalAbierto(false)}
              franjaEditar={franjaEditar}
              diaSeleccionado={diaSeleccionado}
              profesorId={profesorSeleccionado?.id}
              todasLasFranjas={todasLasFranjas}
              onFranjaSaved={handleFranjaSaved}
            />
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default GestionProfesoresAdmin;
