// src/components/ModalCurso.jsx
import React, { useState, useEffect } from 'react';
import cursosService from '../services/cursos_service';
import '../styles/ModalCurso.css';

const ModalCurso = ({ isOpen, onClose, cursoEditar, asignaturas, profesores, franjasHorarias, onCursoSaved }) => {
  const [formData, setFormData] = useState({
    nombre: '',
    descripcion: '',
    precio: '',
    duracion_horas: '',
    tipo: 'grupal',
    estado: 'activo',
    tipo_pago_profesor: 'porcentaje',
    valor_pago_profesor: '',
    fecha_inicio: '',
    fecha_fin: '',
    asignatura_id: '',
    profesor_id: '',
    franja_horaria_ids: [],
    image: null, // NUEVO
  });

  const [errores, setErrores] = useState({});
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

  useEffect(() => {
    if (isOpen) {
      if (cursoEditar) {
        setFormData({
          nombre: cursoEditar.nombre || '',
          descripcion: cursoEditar.descripcion || '',
          precio: cursoEditar.precio || '',
          duracion_horas: cursoEditar.duracion_horas || '',
          tipo: cursoEditar.tipo || 'grupal',
          estado: cursoEditar.estado || 'activo',
          tipo_pago_profesor: cursoEditar.tipo_pago_profesor || 'porcentaje',
          valor_pago_profesor: cursoEditar.valor_pago_profesor || '',
          fecha_inicio: cursoEditar.fecha_inicio ? cursoEditar.fecha_inicio.split('T')[0] : '',
          fecha_fin: cursoEditar.fecha_fin ? cursoEditar.fecha_fin.split('T')[0] : '',
          asignatura_id: cursoEditar.asignatura_id || '',
          profesor_id: cursoEditar.profesor_id || '',
          franja_horaria_ids: cursoEditar.franja_horaria_ids || [],
          image: null, // solo si el admin selecciona una nueva
        });
      } else {
        resetForm();
      }
      setErrores({});
      setMensaje({ tipo: '', texto: '' });
    }
  }, [isOpen, cursoEditar]);

  const resetForm = () => {
    setFormData({
      nombre: '',
      descripcion: '',
      precio: '',
      duracion_horas: '',
      tipo: 'grupal',
      estado: 'activo',
      tipo_pago_profesor: 'porcentaje',
      valor_pago_profesor: '',
      fecha_inicio: '',
      fecha_fin: '',
      asignatura_id: '',
      profesor_id: '',
      franja_horaria_ids: [],
      image: null,
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked, files } = e.target;

    if (type === 'file') {
      setFormData(prev => ({
        ...prev,
        [name]: files && files[0] ? files[0] : null
      }));
      return;
    }

    if (name === 'franja_horaria_ids') {
      const franjaId = value;
      const newFranjas = checked
        ? [...formData.franja_horaria_ids, franjaId]
        : formData.franja_horaria_ids.filter(id => id !== franjaId);

      setFormData(prev => ({
        ...prev,
        franja_horaria_ids: newFranjas
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }

    if (errores[name]) {
      setErrores(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMensaje({ tipo: '', texto: '' });

    const cursoData = {
      nombre: formData.nombre.trim(),
      descripcion: formData.descripcion.trim() || null,
      precio: parseFloat(formData.precio),
      duracion_horas: parseInt(formData.duracion_horas),
      tipo: formData.tipo,
      estado: formData.estado,
      asignatura_id: formData.asignatura_id,
      profesor_id: formData.profesor_id || null,
      fecha_inicio: formData.fecha_inicio ? `${formData.fecha_inicio}T00:00:00Z` : null,
      fecha_fin: formData.fecha_fin ? `${formData.fecha_fin}T23:59:59Z` : null,
      tipo_pago_profesor: formData.tipo_pago_profesor || null,
      valor_pago_profesor: formData.valor_pago_profesor ? parseFloat(formData.valor_pago_profesor) : null,
      franja_horaria_ids: formData.franja_horaria_ids.length > 0 ? formData.franja_horaria_ids : null,
      image: formData.image instanceof File ? formData.image : undefined, // NUEVO
    };

    const { valido, errores: erroresValidacion } = cursosService.validarCurso(cursoData);

    if (!valido) {
      setErrores(erroresValidacion);
      setMensaje({ tipo: 'error', texto: 'Por favor corrige los errores del formulario' });
      return;
    }

    setLoading(true);

    try {
      let resultado;

      if (cursoEditar) {
        resultado = await cursosService.actualizarCurso(cursoEditar.id, cursoData);
      } else {
        resultado = await cursosService.crearCurso(cursoData);
      }

      if (resultado.success) {
        setMensaje({
          tipo: 'exito',
          texto: cursoEditar ? 'Curso actualizado exitosamente' : 'Curso creado exitosamente'
        });

        setTimeout(() => {
          onCursoSaved();
          handleClose();
        }, 1500);
      } else {
        setMensaje({ tipo: 'error', texto: resultado.message });
        if (resultado.errors) {
          setErrores(resultado.errors);
        }
      }
    } catch (error) {
      setMensaje({ tipo: 'error', texto: 'Error inesperado. Intenta de nuevo.' });
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    resetForm();
    setErrores({});
    setMensaje({ tipo: '', texto: '' });
    onClose();
  };

  if (!isOpen) return null;

  const franjasDelProfesor = franjasHorarias.filter(
    franja => franja.profesor_id === formData.profesor_id
  );

  const pagoProfesor = formData.precio && formData.valor_pago_profesor
    ? cursosService.calcularPagoProfesor(formData)
    : 0;

  const ganancia = formData.precio && pagoProfesor
    ? parseFloat(formData.precio) - pagoProfesor
    : 0;

  const imagenActual = cursoEditar?.imagen_url || null;

  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-contenido modal-curso" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{cursoEditar ? 'Editar Curso' : 'Crear Nuevo Curso'}</h2>
          <button className="btn-cerrar" onClick={handleClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {mensaje.texto && (
            <div className={`mensaje ${mensaje.tipo}`}>
              {mensaje.texto}
            </div>
          )}

          <div className="form-section">
            <h3>📝 Información Básica</h3>

            <div className="form-group">
              <label>Nombre del Curso *</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="Ej: Matemáticas Avanzadas"
                disabled={loading}
                className={errores.nombre ? 'input-error' : ''}
              />
              {errores.nombre && <span className="error">{errores.nombre}</span>}
            </div>

            <div className="form-group">
              <label>Descripción</label>
              <textarea
                name="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                placeholder="Describe el contenido del curso"
                rows="3"
                disabled={loading}
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Precio (COP) *</label>
                <input
                  type="number"
                  name="precio"
                  value={formData.precio}
                  onChange={handleChange}
                  placeholder="150000"
                  min="0"
                  step="1000"
                  disabled={loading}
                  className={errores.precio ? 'input-error' : ''}
                />
                {errores.precio && <span className="error">{errores.precio}</span>}
              </div>

              <div className="form-group">
                <label>Duración (horas) *</label>
                <input
                  type="number"
                  name="duracion_horas"
                  value={formData.duracion_horas}
                  onChange={handleChange}
                  placeholder="40"
                  min="1"
                  disabled={loading}
                  className={errores.duracion_horas ? 'input-error' : ''}
                />
                {errores.duracion_horas && <span className="error">{errores.duracion_horas}</span>}
              </div>
            </div>

            <div className="form-group">
              <label>Asignatura *</label>
              <select
                name="asignatura_id"
                value={formData.asignatura_id}
                onChange={handleChange}
                disabled={loading || cursoEditar}
                className={errores.asignatura_id ? 'input-error' : ''}
              >
                <option value="">Selecciona una asignatura</option>
                {asignaturas.map(asignatura => (
                  <option key={asignatura.id} value={asignatura.id}>
                    {asignatura.nombre}
                  </option>
                ))}
              </select>
              {errores.asignatura_id && <span className="error">{errores.asignatura_id}</span>}
              {cursoEditar && <span className="help-text">La asignatura no se puede cambiar</span>}
            </div>

            {/* IMAGEN */}
            <div className="form-group">
              <label htmlFor="image">Imagen (opcional)</label>

              {imagenActual && (
                <div className="help-text">
                  Imagen actual: <a href={imagenActual} target="_blank" rel="noreferrer">ver</a>
                </div>
              )}

              <input
                type="file"
                id="image"
                name="image"
                accept="image/*"
                onChange={handleChange}
                disabled={loading}
              />
              <small className="help-text">
                {cursoEditar ? 'Si seleccionas una imagen nueva, se reemplazará la actual.' : 'Puedes crear el curso sin imagen.'}
              </small>
            </div>
          </div>

          <div className="form-section">
            <h3>⚙️ Configuración</h3>

            <div className="form-row">
              <div className="form-group">
                <label>Tipo de Curso *</label>
                <div className="radio-group">
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="tipo"
                      value="grupal"
                      checked={formData.tipo === 'grupal'}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    <span>👥 Grupal (Clases en vivo)</span>
                  </label>
                  <label className="radio-label">
                    <input
                      type="radio"
                      name="tipo"
                      value="pregrabado"
                      checked={formData.tipo === 'pregrabado'}
                      onChange={handleChange}
                      disabled={loading}
                    />
                    <span>🎥 Pregrabado (Videos 24/7)</span>
                  </label>
                </div>
                {errores.tipo && <span className="error">{errores.tipo}</span>}
              </div>

              <div className="form-group">
                <label>Estado</label>
                <select
                  name="estado"
                  value={formData.estado}
                  onChange={handleChange}
                  disabled={loading}
                >
                  <option value="activo">✅ Activo</option>
                  <option value="inactivo">⏸️ Inactivo</option>
                  <option value="finalizado">✔️ Finalizado</option>
                </select>
              </div>
            </div>
          </div>

          {formData.tipo === 'grupal' && (
            <div className="form-section">
              <h3>👨‍🏫 Profesor y Horarios</h3>

              <div className="form-group">
                <label>Profesor {formData.tipo === 'grupal' && '*'}</label>
                <select
                  name="profesor_id"
                  value={formData.profesor_id}
                  onChange={handleChange}
                  disabled={loading}
                  className={errores.profesor_id ? 'input-error' : ''}
                >
                  <option value="">Selecciona un profesor</option>
                  {profesores.map(profesor => (
                    <option key={profesor.id} value={profesor.id}>
                      {profesor.nombre} {profesor.apellido} - {profesor.email}
                    </option>
                  ))}
                </select>
                {errores.profesor_id && <span className="error">{errores.profesor_id}</span>}
              </div>

              {formData.profesor_id && franjasDelProfesor.length > 0 && (
                <div className="form-group">
                  <label>Franjas Horarias</label>
                  <div className="checkbox-group">
                    {franjasDelProfesor.map(franja => (
                      <label key={franja.id} className="checkbox-label">
                        <input
                          type="checkbox"
                          name="franja_horaria_ids"
                          value={franja.id}
                          checked={formData.franja_horaria_ids.includes(franja.id)}
                          onChange={handleChange}
                          disabled={loading}
                        />
                        <span>
                          {franja.dia_semana} {franja.hora_inicio} - {franja.hora_fin}
                        </span>
                      </label>
                    ))}
                  </div>
                  <span className="help-text">
                    Selecciona las franjas horarias para las clases en vivo
                  </span>
                </div>
              )}

              {formData.profesor_id && franjasDelProfesor.length === 0 && (
                <div className="mensaje-info">
                  ℹ️ Este profesor no tiene franjas horarias configuradas
                </div>
              )}
            </div>
          )}

          <div className="form-section">
            <h3>📅 Fechas</h3>

            <div className="form-row">
              <div className="form-group">
                <label>Fecha de Inicio</label>
                <input
                  type="date"
                  name="fecha_inicio"
                  value={formData.fecha_inicio}
                  onChange={handleChange}
                  disabled={loading}
                  className={errores.fecha_inicio ? 'input-error' : ''}
                />
                {errores.fecha_inicio && <span className="error">{errores.fecha_inicio}</span>}
              </div>

              <div className="form-group">
                <label>Fecha de Fin</label>
                <input
                  type="date"
                  name="fecha_fin"
                  value={formData.fecha_fin}
                  onChange={handleChange}
                  disabled={loading}
                  className={errores.fecha_fin ? 'input-error' : ''}
                />
                {errores.fecha_fin && <span className="error">{errores.fecha_fin}</span>}
              </div>
            </div>
          </div>

          <div className="form-section">
            <h3>💵 Pago al Profesor</h3>

            <div className="form-group">
              <label>Tipo de Pago</label>
              <div className="radio-group">
                <label className="radio-label">
                  <input
                    type="radio"
                    name="tipo_pago_profesor"
                    value="porcentaje"
                    checked={formData.tipo_pago_profesor === 'porcentaje'}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  <span>📊 Porcentaje del precio</span>
                </label>
                <label className="radio-label">
                  <input
                    type="radio"
                    name="tipo_pago_profesor"
                    value="monto_fijo"
                    checked={formData.tipo_pago_profesor === 'monto_fijo'}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  <span>💵 Monto Fijo</span>
                </label>
              </div>
            </div>

            <div className="form-group">
              <label>
                {formData.tipo_pago_profesor === 'porcentaje' ? 'Porcentaje (0-100)' : 'Monto Fijo (COP)'}
              </label>
              <input
                type="number"
                name="valor_pago_profesor"
                value={formData.valor_pago_profesor}
                onChange={handleChange}
                placeholder={formData.tipo_pago_profesor === 'porcentaje' ? '65' : '90000'}
                min="0"
                max={formData.tipo_pago_profesor === 'porcentaje' ? '100' : undefined}
                step={formData.tipo_pago_profesor === 'porcentaje' ? '1' : '1000'}
                disabled={loading}
                className={errores.valor_pago_profesor ? 'input-error' : ''}
              />
              {errores.valor_pago_profesor && <span className="error">{errores.valor_pago_profesor}</span>}
            </div>

            {formData.precio && formData.valor_pago_profesor && (
              <div className="pago-preview">
                <h4>💰 Vista Previa de Pagos</h4>
                <div className="pago-detalle">
                  <div className="pago-item">
                    <span>Precio del Curso:</span>
                    <strong>{cursosService.formatearPrecio(parseFloat(formData.precio))}</strong>
                  </div>
                  <div className="pago-item">
                    <span>Pago al Profesor:</span>
                    <strong className="pago-profesor">
                      {cursosService.formatearPrecio(pagoProfesor)}
                      {formData.tipo_pago_profesor === 'porcentaje' && ` (${formData.valor_pago_profesor}%)`}
                    </strong>
                  </div>
                  <div className="pago-item">
                    <span>Ganancia Plataforma:</span>
                    <strong className="ganancia">
                      {cursosService.formatearPrecio(ganancia)}
                    </strong>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="modal-acciones">
            <button
              type="button"
              className="btn-cancelar"
              onClick={handleClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-guardar"
              disabled={loading}
            >
              {loading ? 'Guardando...' : (cursoEditar ? 'Actualizar Curso' : 'Crear Curso')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalCurso;
