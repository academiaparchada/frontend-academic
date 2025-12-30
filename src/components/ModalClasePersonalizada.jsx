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
    valor_pago_profesor: ''
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

  // Inicializar formulario cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      if (claseEditar) {
        // Modo edición
        setFormData({
          asignatura_id: claseEditar.asignatura_id || '',
          precio: claseEditar.precio || '',
          duracion_horas: claseEditar.duracion_horas || '',
          tipo_pago_profesor: claseEditar.tipo_pago_profesor || 'porcentaje',
          valor_pago_profesor: claseEditar.valor_pago_profesor || ''
        });
      } else {
        // Modo creación
        setFormData({
          asignatura_id: '',
          precio: '',
          duracion_horas: '',
          tipo_pago_profesor: 'porcentaje',
          valor_pago_profesor: ''
        });
      }
      setErrors({});
      setMensaje({ tipo: '', texto: '' });
    }
  }, [isOpen, claseEditar]);

  // Manejar cambios en inputs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error del campo
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  // Calcular pago estimado al profesor
  const calcularPagoEstimado = () => {
    if (!formData.precio || !formData.valor_pago_profesor) return 0;
    
    const precio = parseFloat(formData.precio);
    const valor = parseFloat(formData.valor_pago_profesor);
    
    if (formData.tipo_pago_profesor === 'porcentaje') {
      return precio * (valor / 100);
    }
    return valor;
  };

  // Enviar formulario
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar datos
    const dataParaValidar = {
      ...formData,
      precio: parseFloat(formData.precio),
      duracion_horas: parseInt(formData.duracion_horas),
      valor_pago_profesor: parseFloat(formData.valor_pago_profesor)
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
        // Editar clase existente
        resultado = await clasesService.actualizarClase(claseEditar.id, dataParaValidar);
      } else {
        // Crear nueva clase
        resultado = await clasesService.crearClase(dataParaValidar);
      }

      if (resultado.success) {
        setMensaje({ 
          tipo: 'exito', 
          texto: claseEditar ? 'Clase actualizada exitosamente' : 'Clase creada exitosamente' 
        });
        
        // Notificar al componente padre
        if (onClaseSaved) {
          onClaseSaved(resultado.data);
        }

        // Cerrar modal después de 1 segundo
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

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-contenido" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{claseEditar ? 'Editar Clase Personalizada' : 'Nueva Clase Personalizada'}</h2>
          <button className="btn-cerrar" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {/* Mensaje de éxito/error */}
          {mensaje.texto && (
            <div className={`mensaje ${mensaje.tipo}`}>
              {mensaje.texto}
            </div>
          )}

          {/* Asignatura */}
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

          {/* Precio */}
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

          {/* Duración */}
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

          {/* Tipo de pago profesor */}
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

          {/* Valor pago profesor */}
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

          {/* Vista previa del pago */}
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

          {/* Botones */}
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
