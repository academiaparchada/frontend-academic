// src/pages/admin/CursosAdmin.jsx
import React, { useState, useEffect } from 'react';
import ModalCurso from '../../components/ModalCurso';
import cursosService from '../../services/cursos_service';
import '../../styles/admin-css/CursosAdmin.css';

const CursosAdmin = () => {
  const [cursos, setCursos] = useState([]);
  const [asignaturas, setAsignaturas] = useState([]);
  const [profesores, setProfesores] = useState([]);
  const [franjasHorarias, setFranjasHorarias] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({});
  const [page, setPage] = useState(1);

  const [filtros, setFiltros] = useState({
    estado: '',
    tipo: '',
    asignatura_id: '',
    profesor_id: ''
  });

  const [modalAbierto, setModalAbierto] = useState(false);
  const [cursoEditar, setCursoEditar] = useState(null);

  const limit = 12;

  useEffect(() => {
    cargarAsignaturas();
    cargarProfesores();
    cargarFranjasHorarias();
    cargarCursos();
  }, []);

  useEffect(() => {
    cargarCursos();
  }, [page, filtros]);

  const cargarAsignaturas = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://academiaparchada.onrender.com/api/asignaturas?limit=100', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setAsignaturas(data.data?.asignaturas || []);
      }
    } catch (err) {
      console.error('Error al cargar asignaturas:', err);
    }
  };

  const cargarProfesores = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://academiaparchada.onrender.com/api/profesores?limit=100', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setProfesores(data.data?.profesores || []);
      }
    } catch (err) {
      console.error('Error al cargar profesores:', err);
    }
  };

  const cargarFranjasHorarias = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('https://academiaparchada.onrender.com/api/franjas-horarias?limit=100', {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        setFranjasHorarias(data.data?.franjas_horarias || data.data?.franjasHorarias || []);
      }
    } catch (err) {
      console.error('Error al cargar franjas horarias:', err);
    }
  };

  const cargarCursos = async () => {
    try {
      setLoading(true);
      setError('');

      const filtrosLimpios = {
        page,
        limit,
        ...Object.fromEntries(
          Object.entries(filtros).filter(([_, v]) => v !== '')
        )
      };

      const resultado = await cursosService.listarCursos(filtrosLimpios);

      if (resultado.success) {
        setCursos(resultado.data.cursos || []);
        setPagination(resultado.data.pagination || {});
      } else {
        setError(resultado.message);
        setCursos([]);
      }
    } catch (err) {
      console.error('Error al cargar cursos:', err);
      setError('Error al cargar los cursos');
      setCursos([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCrearCurso = () => {
    setCursoEditar(null);
    setModalAbierto(true);
  };

  const handleEditarCurso = (curso) => {
    setCursoEditar(curso);
    setModalAbierto(true);
  };

  const handleEliminarCurso = async (curso) => {
    const confirmacion = window.confirm(
      `¿Estás seguro de eliminar el curso "${curso.nombre}"?\n\n` +
      `Precio: ${cursosService.formatearPrecio(curso.precio)}\n` +
      `Duración: ${curso.duracion_horas}h\n` +
      `Tipo: ${curso.tipo}`
    );

    if (!confirmacion) return;

    try {
      setLoading(true);
      const resultado = await cursosService.eliminarCurso(curso.id);

      if (resultado.success) {
        alert(resultado.message);
        await cargarCursos();
      } else {
        alert(`Error: ${resultado.message}`);
      }
    } catch (err) {
      console.error('Error al eliminar curso:', err);
      alert('Error al eliminar el curso');
    } finally {
      setLoading(false);
    }
  };

  const handleCursoSaved = () => {
    cargarCursos();
  };

  const handleFiltroChange = (campo, valor) => {
    setFiltros(prev => ({
      ...prev,
      [campo]: valor
    }));
    setPage(1);
  };

  const limpiarFiltros = () => {
    setFiltros({
      estado: '',
      tipo: '',
      asignatura_id: '',
      profesor_id: ''
    });
    setPage(1);
  };

  return (
    <div className="cursos-admin-container">
      <div className="cursos-header">
        <div>
          <h1>Gestión de Cursos</h1>
          <p className="subtitulo">Administra los cursos grupales y pregrabados de la plataforma</p>
        </div>
        <button className="btn-crear" onClick={handleCrearCurso}>
          + Nuevo Curso
        </button>
      </div>

      <div className="filtros-container">
        <div className="filtros-grid">
          <div className="filtro-item">
            <label>Estado:</label>
            <select
              value={filtros.estado}
              onChange={(e) => handleFiltroChange('estado', e.target.value)}
              disabled={loading}
            >
              <option value="">Todos</option>
              <option value="activo">✅ Activo</option>
              <option value="inactivo">⏸️ Inactivo</option>
              <option value="finalizado">✔️ Finalizado</option>
            </select>
          </div>

          <div className="filtro-item">
            <label>Tipo:</label>
            <select
              value={filtros.tipo}
              onChange={(e) => handleFiltroChange('tipo', e.target.value)}
              disabled={loading}
            >
              <option value="">Todos</option>
              <option value="grupal">👥 Grupal</option>
              <option value="pregrabado">🎥 Pregrabado</option>
            </select>
          </div>

          <div className="filtro-item">
            <label>Asignatura:</label>
            <select
              value={filtros.asignatura_id}
              onChange={(e) => handleFiltroChange('asignatura_id', e.target.value)}
              disabled={loading}
            >
              <option value="">Todas</option>
              {asignaturas.map(asignatura => (
                <option key={asignatura.id} value={asignatura.id}>
                  {asignatura.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="filtro-item">
            <label>Profesor:</label>
            <select
              value={filtros.profesor_id}
              onChange={(e) => handleFiltroChange('profesor_id', e.target.value)}
              disabled={loading}
            >
              <option value="">Todos</option>
              {profesores.map(profesor => (
                <option key={profesor.id} value={profesor.id}>
                  {profesor.nombre} {profesor.apellido}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="filtros-acciones">
          <button
            className="btn-limpiar-filtros"
            onClick={limpiarFiltros}
            disabled={loading}
          >
            🗑️ Limpiar Filtros
          </button>

          {pagination.total > 0 && (
            <div className="resultados-info">
              Mostrando {cursos.length} de {pagination.total} cursos
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="mensaje-error">
          {error}
        </div>
      )}

      {loading && (
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Cargando...</p>
        </div>
      )}

      {!loading && cursos.length > 0 && (
        <div className="cursos-grid">
          {cursos.map(curso => {
            const badgeTipo = cursosService.obtenerBadgeTipo(curso.tipo);
            const badgeEstado = cursosService.obtenerBadgeEstado(curso.estado);
            const pagoProfesor = cursosService.calcularPagoProfesor(curso);
            const ganancia = curso.precio - pagoProfesor;

            return (
              <div key={curso.id} className="curso-card">
                <div className="curso-badges">
                  <span className={`badge ${badgeTipo.class}`}>{badgeTipo.text}</span>
                  <span className={`badge ${badgeEstado.class}`}>{badgeEstado.text}</span>
                </div>

                {/* IMAGEN */}
                {curso.imagen_url ? (
                  <div className="curso-imagen">
                    <img
                      src={curso.imagen_url}
                      alt={`Portada del curso ${curso.nombre}`}
                      loading="lazy"
                      onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                  </div>
                ) : null}

                <div className="curso-header">
                  <h3>{curso.nombre}</h3>
                  <span className="duracion">⏱️ {curso.duracion_horas}h</span>
                </div>

                <p className="curso-descripcion">
                  {curso.descripcion || 'Sin descripción'}
                </p>

                <div className="curso-info">
                  <div className="info-row">
                    <span className="info-label">📚 Asignatura:</span>
                    <span className="info-value">{curso.asignatura?.nombre || 'N/A'}</span>
                  </div>

                  {curso.profesor && (
                    <div className="info-row">
                      <span className="info-label">👨‍🏫 Profesor:</span>
                      <span className="info-value">
                        {curso.profesor.nombre} {curso.profesor.apellido}
                      </span>
                    </div>
                  )}

                  {curso.fecha_inicio && (
                    <div className="info-row">
                      <span className="info-label">📅 Inicio:</span>
                      <span className="info-value">
                        {cursosService.formatearFecha(curso.fecha_inicio)}
                      </span>
                    </div>
                  )}

                  {curso.franjas_horarias && curso.franjas_horarias.length > 0 && (
                    <div className="info-row full-width">
                      <span className="info-label">🕐 Horarios:</span>
                      <div className="franjas-list">
                        {curso.franjas_horarias.slice(0, 2).map((franja, idx) => (
                          <span key={idx} className="franja-badge">
                            {franja.dia_semana} {franja.hora_inicio}
                          </span>
                        ))}
                        {curso.franjas_horarias.length > 2 && (
                          <span className="franja-badge">
                            +{curso.franjas_horarias.length - 2} más
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                <div className="curso-financiero">
                  <div className="precio-row">
                    <span>Precio:</span>
                    <strong className="precio">
                      {cursosService.formatearPrecio(curso.precio)}
                    </strong>
                  </div>

                  {pagoProfesor > 0 && (
                    <>
                      <div className="precio-row">
                        <span>Pago Profesor:</span>
                        <strong className="pago-profesor">
                          {cursosService.formatearPrecio(pagoProfesor)}
                        </strong>
                      </div>
                      <div className="precio-row">
                        <span>Ganancia:</span>
                        <strong className="ganancia">
                          {cursosService.formatearPrecio(ganancia)}
                        </strong>
                      </div>
                    </>
                  )}
                </div>

                <div className="curso-acciones">
                  <button
                    className="btn-editar"
                    onClick={() => handleEditarCurso(curso)}
                    title="Editar curso"
                  >
                    ✏️ Editar
                  </button>
                  <button
                    className="btn-eliminar"
                    onClick={() => handleEliminarCurso(curso)}
                    title="Eliminar curso"
                  >
                    🗑️ Eliminar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {!loading && cursos.length === 0 && (
        <div className="mensaje-vacio">
          <h3>📚 No hay cursos</h3>
          <p>
            {Object.values(filtros).some(v => v !== '')
              ? 'No se encontraron cursos con los filtros aplicados'
              : 'Crea tu primer curso para empezar'
            }
          </p>

          {Object.values(filtros).some(v => v !== '') ? (
            <button className="btn-limpiar-grande" onClick={limpiarFiltros}>
              🗑️ Limpiar Filtros
            </button>
          ) : (
            <button className="btn-crear-grande" onClick={handleCrearCurso}>
              + Crear Primer Curso
            </button>
          )}
        </div>
      )}

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

      <ModalCurso
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        cursoEditar={cursoEditar}
        asignaturas={asignaturas}
        profesores={profesores}
        franjasHorarias={franjasHorarias}
        onCursoSaved={handleCursoSaved}
      />
    </div>
  );
};

export default CursosAdmin;
