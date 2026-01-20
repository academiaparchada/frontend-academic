// src/pages/admin/ClasesPersonalizadasAdmin.jsx
import React, { useState, useEffect } from 'react';
import ModalClasePersonalizada from '../../components/ModalClasePersonalizada';
import clasesService from '../../services/clases_personalizadas_service';
import '../../styles/admin-css/ClasesPersonalizadasAdmin.css';

const ClasesPersonalizadasAdmin = () => {
  const [clases, setClases] = useState([]);
  const [asignaturas, setAsignaturas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);
  const [filtroAsignatura, setFiltroAsignatura] = useState('');

  // Estados del modal
  const [modalAbierto, setModalAbierto] = useState(false);
  const [claseEditar, setClaseEditar] = useState(null);

  const limit = 12;

  // Cargar asignaturas y clases al montar
  useEffect(() => {
    cargarAsignaturas();
    cargarClases();
  }, []);

  // Recargar clases cuando cambia la página o el filtro
  useEffect(() => {
    cargarClases();
  }, [page, filtroAsignatura]);

  // Cargar asignaturas disponibles
  const cargarAsignaturas = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://academiaparchada.onrender.com/api/asignaturas', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        const listaAsignaturas = Array.isArray(data.data?.asignaturas)
          ? data.data.asignaturas
          : [];
        setAsignaturas(listaAsignaturas);
      }
    } catch (err) {
      console.error('Error al cargar asignaturas:', err);
    }
  };

  // Cargar clases personalizadas
  const cargarClases = async () => {
    try {
      setLoading(true);
      setError('');

      const resultado = await clasesService.listarClases(
        page,
        limit,
        filtroAsignatura || null
      );

      if (resultado.success) {
        setClases(resultado.data.clases || []);
        setPagination(resultado.data.pagination || {});
      } else {
        setError(resultado.message);
        setClases([]);
      }
    } catch (err) {
      console.error('Error al cargar clases:', err);
      setError('Error al cargar las clases personalizadas');
      setClases([]);
    } finally {
      setLoading(false);
    }
  };

  // Abrir modal para crear clase
  const handleCrearClase = () => {
    setClaseEditar(null);
    setModalAbierto(true);
  };

  // Abrir modal para editar clase
  const handleEditarClase = (clase) => {
    setClaseEditar(clase);
    setModalAbierto(true);
  };

  // Eliminar clase
  const handleEliminarClase = async (clase) => {
    const confirmacion = window.confirm(
      `¿Estás seguro de eliminar la clase de ${clase.asignatura.nombre}?\n\nPrecio: ${clasesService.formatearPrecio(clase.precio)}\nDuración: ${clase.duracion_horas}h`
    );

    if (!confirmacion) return;

    try {
      setLoading(true);
      const resultado = await clasesService.eliminarClase(clase.id);

      if (resultado.success) {
        alert(resultado.message);
        await cargarClases();
      } else {
        alert(`Error: ${resultado.message}`);
      }
    } catch (err) {
      console.error('Error al eliminar clase:', err);
      alert('Error al eliminar la clase personalizada');
    } finally {
      setLoading(false);
    }
  };

  // Callback cuando se guarda una clase
  const handleClaseSaved = () => {
    cargarClases();
  };

  // Cambiar filtro de asignatura
  const handleFiltroChange = (e) => {
    setFiltroAsignatura(e.target.value);
    setPage(1);
  };

  return (
    <div className="clases-admin-container">
      <div className="clases-header">
        <div>
          <h1>Gestión de Clases Personalizadas</h1>
          <p className="subtitulo">Administra las plantillas de clases disponibles para compra</p>
        </div>
        <button className="btn-crear" onClick={handleCrearClase}>
          + Nueva Clase
        </button>
      </div>

      {/* Filtros */}
      <div className="filtros-container">
        <div className="filtro-asignatura">
          <label htmlFor="filtro-asignatura">Filtrar por Asignatura:</label>
          <select
            id="filtro-asignatura"
            value={filtroAsignatura}
            onChange={handleFiltroChange}
            disabled={loading}
          >
            <option value="">Todas las asignaturas</option>
            {asignaturas.map(asignatura => (
              <option key={asignatura.id} value={asignatura.id}>
                {asignatura.nombre}
              </option>
            ))}
          </select>
        </div>

        {pagination.total > 0 && (
          <div className="resultados-info">
            Mostrando {clases.length} de {pagination.total} clases
          </div>
        )}
      </div>

      {/* Mensajes de error */}
      {error && (
        <div className="mensaje-error">
          {error}
        </div>
      )}

      {/* Indicador de carga */}
      {loading && (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Cargando...</p>
        </div>
      )}

      {/* Tabla de clases */}
      {!loading && clases.length > 0 && (
        <div className="tabla-container">
          <table className="tabla-clases">
            <thead>
              <tr>
                <th>Imagen</th>
                <th>Asignatura</th>
                <th>Duración</th>
                <th>Precio Estudiante</th>
                <th>Tipo Pago Profesor</th>
                <th>Valor Pago Profesor</th>
                <th>Pago Profesor</th>
                <th>Ganancia</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {clases.map(clase => {
                const pagoProfesor = clasesService.calcularPagoProfesor(clase);
                const ganancia = clase.precio - pagoProfesor;

                return (
                  <tr key={clase.id}>
                    <td className="text-center">
                      {clase.imagen_url ? (
                        <a
                          href={clase.imagen_url}
                          target="_blank"
                          rel="noreferrer"
                          title="Abrir imagen"
                          className="clase-thumb-link"
                        >
                          <img
                            src={clase.imagen_url}
                            alt={`Imagen ${clase.asignatura?.nombre || ''}`}
                            className="clase-thumb"
                            loading="lazy"
                            onError={(e) => { e.currentTarget.style.display = 'none'; }}
                          />
                        </a>
                      ) : (
                        <span className="clase-thumb-fallback">—</span>
                      )}
                    </td>

                    <td>
                      <div className="asignatura-cell">
                        <strong>{clase.asignatura.nombre}</strong>
                        <small>{clase.asignatura.descripcion}</small>
                      </div>
                    </td>

                    <td className="text-center">
                      <span className="badge-duracion">{clase.duracion_horas}h</span>
                    </td>

                    <td className="text-right">
                      <strong>{clasesService.formatearPrecio(clase.precio)}</strong>
                    </td>

                    <td className="text-center">
                      <span className={`badge-tipo ${clase.tipo_pago_profesor}`}>
                        {clase.tipo_pago_profesor === 'porcentaje' ? '📊 Porcentaje' : '💵 Monto Fijo'}
                      </span>
                    </td>

                    <td className="text-right">
                      {clase.tipo_pago_profesor === 'porcentaje'
                        ? `${clase.valor_pago_profesor}%`
                        : clasesService.formatearPrecio(clase.valor_pago_profesor)
                      }
                    </td>

                    <td className="text-right pago-profesor">
                      <strong>{clasesService.formatearPrecio(pagoProfesor)}</strong>
                    </td>

                    <td className="text-right ganancia">
                      <strong>{clasesService.formatearPrecio(ganancia)}</strong>
                    </td>

                    <td>
                      <div className="acciones-cell">
                        <button
                          className="btn-accion btn-editar"
                          onClick={() => handleEditarClase(clase)}
                          title="Editar clase"
                        >
                          ✏️
                        </button>
                        <button
                          className="btn-accion btn-eliminar"
                          onClick={() => handleEliminarClase(clase)}
                          title="Eliminar clase"
                        >
                          🗑️
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Mensaje cuando no hay clases */}
      {!loading && clases.length === 0 && (
        <div className="mensaje-vacio">
          <h3>📚 No hay clases personalizadas</h3>
          <p>Crea tu primera clase personalizada para empezar</p>
          <button className="btn-crear-grande" onClick={handleCrearClase}>
            + Crear Primera Clase
          </button>
        </div>
      )}

      {/* Paginación */}
      {pagination.total_pages > 1 && !loading && (
        <div className="pagination">
          <button
            className="btn-page"
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
          >
            ← Anterior
          </button>

          <span className="page-info">
            Página {page} de {pagination.total_pages}
          </span>

          <button
            className="btn-page"
            disabled={page === pagination.total_pages}
            onClick={() => setPage(page + 1)}
          >
            Siguiente →
          </button>
        </div>
      )}

      {/* Modal para crear/editar clase */}
      <ModalClasePersonalizada
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        claseEditar={claseEditar}
        asignaturas={asignaturas}
        onClaseSaved={handleClaseSaved}
      />
    </div>
  );
};

export default ClasesPersonalizadasAdmin;
