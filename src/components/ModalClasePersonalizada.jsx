// src/components/ModalClasePersonalizada.jsx
import React, { useState, useEffect } from 'react';
import '../styles/ModalClasePersonalizada.css';
import clasesService from '../services/clases_personalizadas_service';

const ModalClasePersonalizada = ({
  isOpen,
  onClose,
  claseEditar,
  asignaturas,
  onClaseSaved
}) => {
  const [formData, setFormData] = useState({
    asignatura_id: '',
    precio: '',
    duracion_horas: '',
    tipo_pago_profesor: 'porcentaje',
    valor_pago_profesor: '',
    image: null, // NUEVO
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

  useEffect(() => {
    if (isOpen) {
      if (claseEditar) {
        setFormData({
          asignatura_id: claseEditar.asignatura_id || '',
          precio: claseEditar.precio || '',
          duracion_horas: claseEditar.duracion_horas || '',
          tipo_pago_profesor: claseEditar.tipo_pago_profesor || 'porcentaje',
          valor_pago_profesor: claseEditar.valor_pago_profesor || '',
          image: null, // al editar, solo se setea si el admin elige archivo
        });
      } else {
        setFormData({
          asignatura_id: '',
          precio: '',
          duracion_horas: '',
          tipo_pago_profesor: 'porcentaje',
          valor_pago_profesor: '',
          image: null,
        });
      }
      setErrors({});
      setMensaje({ tipo: '', texto: '' });
    }
  }, [isOpen, claseEditar]);

  const handleChange = (e) => {
    const { name, value, type, files } = e.target;

    if (type === 'file') {
      setFormData(prev => ({
        ...prev,
        [name]: files && files[0] ? files[0] : null
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const calcularPagoEstimado = () => {
    if (!formData.precio || !formData.valor_pago_profesor) return 0;

    const precio = parseFloat(formData.precio);
    const valor = parseFloat(formData.valor_pago_profesor);

    if (formData.tipo_pago_profesor === 'porcentaje') {
      return precio * (valor / 100);
    }
    return valor;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const dataParaValidar = {
      ...formData,
      precio: parseFloat(formData.precio),
      duracion_horas: parseInt(formData.duracion_horas),
      valor_pago_profesor: parseFloat(formData.valor_pago_profesor),
    };

    const { valido, errores } = clasesService.validarClase(dataParaValidar);

    if (!valido) {
      setErrors(errores);
      return;
    }

    setLoading(true);
    setMensaje({ tipo: '', texto: '' });

    try {
      let resultado;

      if (claseEditar) {
        // 1) actualizar datos (JSON)
        resultado = await clasesService.actualizarClase(claseEditar.id, dataParaValidar);

        // 2) si eligió nueva imagen, actualizarla por endpoint dedicado
        if (resultado.success && formData.image instanceof File) {
          const resImg = await clasesService.actualizarImagenClasePersonalizada(claseEditar.id, formData.image);
          if (!resImg.success) {
            setMensaje({
              tipo: 'error',
              texto: resImg.message || 'La clase se actualizó, pero falló la imagen.'
            });
            setLoading(false);
            return;
          }
        }
      } else {
        // Crear (FormData con image opcional)
        resultado = await clasesService.crearClase(dataParaValidar);
      }

      if (resultado.success) {
        setMensaje({
          tipo: 'exito',
          texto: claseEditar ? 'Clase actualizada exitosamente' : 'Clase creada exitosamente'
        });

        if (onClaseSaved) {
          onClaseSaved(resultado.data);
        }

        setTimeout(() => {
          onClose();
        }, 1000);
      } else {
        setMensaje({
          tipo: 'error',
          texto: resultado.message
        });

        if (resultado.errors && resultado.errors.length > 0) {
          const nuevosErrors = {};
          resultado.errors.forEach(error => {
            if (error.field) {
              nuevosErrors[error.field] = error.message;
            }
          });
          setErrors(nuevosErrors);
        }
      }
    } catch (error) {
      setMensaje({
        tipo: 'error',
        texto: 'Error inesperado. Intenta de nuevo.'
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const imagenActual = claseEditar?.imagen_url || null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-contenido" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{claseEditar ? 'Editar Clase Personalizada' : 'Nueva Clase Personalizada'}</h2>
          <button className="btn-cerrar" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {mensaje.texto && (
            <div className={`mensaje ${mensaje.tipo}`}>
              {mensaje.texto}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="asignatura_id">Asignatura *</label>
            <select
              id="asignatura_id"
              name="asignatura_id"
              value={formData.asignatura_id}
              onChange={handleChange}
              className={errors.asignatura_id ? 'input-error' : ''}
              disabled={loading || claseEditar}
            >
              <option value="">-- Selecciona una asignatura --</option>
              {asignaturas.map(asignatura => (
                <option key={asignatura.id} value={asignatura.id}>
                  {asignatura.nombre}
                </option>
              ))}
            </select>
            {errors.asignatura_id && <span className="error">{errors.asignatura_id}</span>}
            {claseEditar && <small className="help-text">No se puede cambiar la asignatura al editar</small>}
          </div>

          <div className="form-group">
            <label htmlFor="precio">Precio para Estudiante (COP) *</label>
            <input
              type="number"
              id="precio"
              name="precio"
              value={formData.precio}
              onChange={handleChange}
              className={errors.precio ? 'input-error' : ''}
              disabled={loading}
              placeholder="50000"
              min="0"
              step="1000"
            />
            {errors.precio && <span className="error">{errors.precio}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="duracion_horas">Duración (horas) *</label>
            <input
              type="number"
              id="duracion_horas"
              name="duracion_horas"
              value={formData.duracion_horas}
              onChange={handleChange}
              className={errors.duracion_horas ? 'input-error' : ''}
              disabled={loading}
              placeholder="2"
              min="1"
              step="1"
            />
            {errors.duracion_horas && <span className="error">{errors.duracion_horas}</span>}
          </div>

          <div className="form-group">
            <label>Tipo de Pago al Profesor *</label>
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
                <span>Porcentaje del precio</span>
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
                <span>Monto fijo</span>
              </label>
            </div>
            {errors.tipo_pago_profesor && <span className="error">{errors.tipo_pago_profesor}</span>}
          </div>

          <div className="form-group">
            <label htmlFor="valor_pago_profesor">
              {formData.tipo_pago_profesor === 'porcentaje' ? 'Porcentaje (%)' : 'Monto (COP)'} *
            </label>
            <input
              type="number"
              id="valor_pago_profesor"
              name="valor_pago_profesor"
              value={formData.valor_pago_profesor}
              onChange={handleChange}
              className={errors.valor_pago_profesor ? 'input-error' : ''}
              disabled={loading}
              placeholder={formData.tipo_pago_profesor === 'porcentaje' ? '60' : '30000'}
              min="0"
              max={formData.tipo_pago_profesor === 'porcentaje' ? '100' : undefined}
              step={formData.tipo_pago_profesor === 'porcentaje' ? '1' : '1000'}
            />
            {errors.valor_pago_profesor && <span className="error">{errors.valor_pago_profesor}</span>}
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
              {claseEditar ? 'Si seleccionas una imagen nueva, se reemplazará la actual.' : 'Puedes crear la clase sin imagen.'}
            </small>
          </div>

          {formData.precio && formData.valor_pago_profesor && (
            <div className="pago-preview">
              <h4>💰 Estimación de Pagos</h4>
              <div className="pago-detalle">
                <div className="pago-item">
                  <span>Precio total:</span>
                  <strong>{clasesService.formatearPrecio(parseFloat(formData.precio))}</strong>
                </div>
                <div className="pago-item">
                  <span>Pago al profesor:</span>
                  <strong className="pago-profesor">
                    {clasesService.formatearPrecio(calcularPagoEstimado())}
                  </strong>
                </div>
                <div className="pago-item">
                  <span>Ganancia plataforma:</span>
                  <strong className="ganancia">
                    {clasesService.formatearPrecio(parseFloat(formData.precio) - calcularPagoEstimado())}
                  </strong>
                </div>
              </div>
            </div>
          )}

          <div className="modal-acciones">
            <button
              type="button"
              className="btn-cancelar"
              onClick={onClose}
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="btn-guardar"
              disabled={loading}
            >
              {loading ? 'Guardando...' : (claseEditar ? 'Actualizar' : 'Crear Clase')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalClasePersonalizada;
