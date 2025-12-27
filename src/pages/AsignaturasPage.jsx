import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import '../styles/asignaturas.css';

const API_URL = 'https://academiaparchada.onrender.com/api/asignaturas';

const AsignaturasPage = () => {
  const [asignaturas, setAsignaturas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ nombre: '', descripcion: '' });
  const [editingId, setEditingId] = useState(null);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const token = localStorage.getItem('token');

  // Cargar asignaturas
  useEffect(() => {
    loadAsignaturas();
  }, [page]);

  const loadAsignaturas = async () => {
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}?page=${page}&limit=10`);
      const data = await response.json();
      
      if (data.success) {
        setAsignaturas(data.data.asignaturas);
        setTotalPages(data.data.totalPages);
        setTotal(data.data.total);
      } else {
        toast.error('Error al cargar asignaturas');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error de conexión al cargar asignaturas');
    } finally {
      setLoading(false);
    }
  };

  // Validar formulario
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.nombre || formData.nombre.trim().length < 3) {
      newErrors.nombre = 'El nombre debe tener al menos 3 caracteres';
    } else if (formData.nombre.length > 100) {
      newErrors.nombre = 'El nombre no puede exceder 100 caracteres';
    }
    
    if (formData.descripcion && formData.descripcion.length > 500) {
      newErrors.descripcion = 'La descripción no puede exceder 500 caracteres';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Crear o editar
  const handleSubmit = async (e) => {
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
      const url = editingId ? `${API_URL}/${editingId}` : API_URL;
      const method = editingId ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          nombre: formData.nombre.trim(),
          descripcion: formData.descripcion.trim() || undefined
        })
      });

      const data = await response.json();

      if (response.ok) {
        toast.success(data.message || (editingId ? 'Asignatura actualizada' : 'Asignatura creada'));
        closeModal();
        loadAsignaturas();
      } else {
        // Manejar errores específicos
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
          toast.error('Error al guardar la asignatura');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error de conexión al guardar');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Eliminar
  const handleDelete = async (id, nombre) => {
    if (!window.confirm(`¿Estás seguro de eliminar la asignatura "${nombre}"?\n\nEsta acción no se puede deshacer.`)) {
      return;
    }

    if (!token) {
      toast.error('Debes iniciar sesión como administrador');
      return;
    }
    
    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        toast.success('Asignatura eliminada exitosamente');
        // Si es la última de la página y no es página 1, ir a página anterior
        if (asignaturas.length === 1 && page > 1) {
          setPage(page - 1);
        } else {
          loadAsignaturas();
        }
      } else {
        if (response.status === 401) {
          toast.error('No estás autenticado');
        } else if (response.status === 403) {
          toast.error('No tienes permisos de administrador');
        } else {
          toast.error(data.message || 'Error al eliminar');
        }
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error de conexión al eliminar');
    }
  };

  // Abrir modal para editar
  const handleEdit = (asignatura) => {
    setFormData({ 
      nombre: asignatura.nombre, 
      descripcion: asignatura.descripcion || '' 
    });
    setEditingId(asignatura.id);
    setErrors({});
    setShowModal(true);
  };

  // Abrir modal para crear
  const handleCreate = () => {
    setFormData({ nombre: '', descripcion: '' });
    setEditingId(null);
    setErrors({});
    setShowModal(true);
  };

  // Cerrar modal
  const closeModal = () => {
    setShowModal(false);
    setFormData({ nombre: '', descripcion: '' });
    setEditingId(null);
    setErrors({});
  };

  // Formatear fecha
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="asignaturas-page">
      <div className="asignaturas-container">
        {/* Header */}
        <div className="asignaturas-header">
          <div className="header-content">
            <div className="header-text">
              <h1>Gestión de Asignaturas</h1>
              <p className="subtitle">
                {loading ? 'Cargando...' : `${total} asignatura${total !== 1 ? 's' : ''} registrada${total !== 1 ? 's' : ''}`}
              </p>
            </div>
            <button onClick={handleCreate} className="btn-create">
              <span className="icon">+</span>
              Nueva Asignatura
            </button>
          </div>
        </div>

        {/* Content */}
        {loading ? (
          <div className="loading-container">
            <div className="spinner"></div>
            <p>Cargando asignaturas...</p>
          </div>
        ) : asignaturas.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📚</div>
            <h2>No hay asignaturas</h2>
            <p>Comienza creando tu primera asignatura</p>
            <button onClick={handleCreate} className="btn-empty">
              Crear Asignatura
            </button>
          </div>
        ) : (
          <>
            {/* Table */}
            <div className="table-container">
              <table className="asignaturas-table">
                <thead>
                  <tr>
                    <th>Nombre</th>
                    <th>Descripción</th>
                    <th>Fecha de Creación</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {asignaturas.map(asignatura => (
                    <tr key={asignatura.id}>
                      <td className="name-cell">
                        <strong>{asignatura.nombre}</strong>
                      </td>
                      <td className="description-cell">
                        {asignatura.descripcion || <em className="no-description">Sin descripción</em>}
                      </td>
                      <td className="date-cell">
                        {formatDate(asignatura.created_at)}
                      </td>
                      <td className="actions-cell">
                        <button 
                          onClick={() => handleEdit(asignatura)} 
                          className="btn-edit"
                          title="Editar"
                        >
                          ✏️
                        </button>
                        <button 
                          onClick={() => handleDelete(asignatura.id, asignatura.nombre)} 
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
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="pagination">
                <button 
                  onClick={() => setPage(p => Math.max(1, p - 1))} 
                  disabled={page === 1}
                  className="pagination-btn"
                >
                  ← Anterior
                </button>
                <span className="pagination-info">
                  Página {page} de {totalPages}
                </span>
                <button 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))} 
                  disabled={page === totalPages}
                  className="pagination-btn"
                >
                  Siguiente →
                </button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editingId ? 'Editar Asignatura' : 'Nueva Asignatura'}</h2>
              <button onClick={closeModal} className="btn-close">
                ✕
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label htmlFor="nombre">
                  Nombre de la asignatura <span className="required">*</span>
                </label>
                <input
                  id="nombre"
                  type="text"
                  placeholder="Ej: Matemáticas, Física, Inglés..."
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
                <label htmlFor="descripcion">
                  Descripción (opcional)
                </label>
                <textarea
                  id="descripcion"
                  placeholder="Describe brevemente el contenido de esta asignatura..."
                  value={formData.descripcion}
                  onChange={(e) => {
                    setFormData({ ...formData, descripcion: e.target.value });
                    if (errors.descripcion) setErrors({ ...errors, descripcion: '' });
                  }}
                  rows={4}
                  className={errors.descripcion ? 'input-error' : ''}
                  maxLength={500}
                />
                {errors.descripcion && <span className="error-message">{errors.descripcion}</span>}
                <span className="char-count">{formData.descripcion.length}/500</span>
              </div>
              
              <div className="modal-actions">
                <button 
                  type="button" 
                  onClick={closeModal} 
                  className="btn-cancel"
                  disabled={isSubmitting}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  className="btn-submit"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Guardando...' : (editingId ? 'Actualizar' : 'Crear')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AsignaturasPage;