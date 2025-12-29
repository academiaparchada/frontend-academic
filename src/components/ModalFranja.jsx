// src/components/ModalFranja.jsx
import React, { useState, useEffect } from 'react';
import '../styles/ModalFranja.css';
import franjasService from '../services/franjas_service';

const DIAS_SEMANA = [
  { value: 'lunes', label: 'Lunes' },
  { value: 'martes', label: 'Martes' },
  { value: 'miercoles', label: 'Miércoles' },
  { value: 'jueves', label: 'Jueves' },
  { value: 'viernes', label: 'Viernes' },
  { value: 'sabado', label: 'Sábado' },
  { value: 'domingo', label: 'Domingo' }
];

const ModalFranja = ({ 
  isOpen, 
  onClose, 
  franjaEditar, 
  diaSeleccionado, 
  profesorId,
  todasLasFranjas,
  onFranjaSaved 
}) => {
  const [formData, setFormData] = useState({
    dia_semana: '',
    hora_inicio: '',
    hora_fin: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState({ tipo: '', texto: '' });

  // Inicializar formulario cuando se abre el modal
  useEffect(() => {
    if (isOpen) {
      if (franjaEditar) {
        // Modo edición
        setFormData({
          dia_semana: franjaEditar.dia_semana,
          hora_inicio: franjaEditar.hora_inicio,
          hora_fin: franjaEditar.hora_fin
        });
      } else if (diaSeleccionado) {
        // Modo creación con día preseleccionado
        setFormData({
          dia_semana: diaSeleccionado,
          hora_inicio: '',
          hora_fin: ''
        });
      } else {
        // Modo creación desde cero
        setFormData({
          dia_semana: 'lunes',
          hora_inicio: '',
          hora_fin: ''
        });
      }
      setErrors({});
      setMensaje({ tipo: '', texto: '' });
    }
  }, [isOpen, franjaEditar, diaSeleccionado]);

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

  // Validar formulario
  const validarFormulario = () => {
    const nuevosErrors = {};

    if (!formData.dia_semana) {
      nuevosErrors.dia_semana = 'Selecciona un día';
    }

    if (!formData.hora_inicio) {
      nuevosErrors.hora_inicio = 'Ingresa la hora de inicio';
    } else if (!franjasService.validarFormatoHora(formData.hora_inicio)) {
      nuevosErrors.hora_inicio = 'Formato inválido (debe ser HH:MM)';
    }

    if (!formData.hora_fin) {
      nuevosErrors.hora_fin = 'Ingresa la hora de fin';
    } else if (!franjasService.validarFormatoHora(formData.hora_fin)) {
      nuevosErrors.hora_fin = 'Formato inválido (debe ser HH:MM)';
    }

    // Validar que hora_fin > hora_inicio
    if (formData.hora_inicio && formData.hora_fin) {
      if (!franjasService.validarRangoHoras(formData.hora_inicio, formData.hora_fin)) {
        nuevosErrors.hora_fin = 'La hora de fin debe ser mayor que la hora de inicio';
      }
    }

    // Validar solapamiento
    const franjaEditandoId = franjaEditar ? franjaEditar.id : null;
    if (todasLasFranjas && franjasService.detectarSolapamiento(formData, todasLasFranjas, franjaEditandoId)) {
      nuevosErrors.general = 'Esta franja se solapa con otra existente en el mismo día';
    }

    setErrors(nuevosErrors);
    return Object.keys(nuevosErrors).length === 0;
  };

  // Enviar formulario
 // Enviar formulario
const handleSubmit = async (e) => {
  e.preventDefault();

  if (!validarFormulario()) {
    return;
  }

  setLoading(true);
  setMensaje({ tipo: '', texto: '' });

  try {
    let resultado;

    // 🔧 CORRECCIÓN: Normalizar horas a formato HH:MM:SS
    const dataNormalizada = {
      ...formData,
      hora_inicio: franjasService.normalizarHora(formData.hora_inicio),
      hora_fin: franjasService.normalizarHora(formData.hora_fin)
    };

    if (franjaEditar) {
      // Editar franja existente
      resultado = await franjasService.editarFranja(franjaEditar.id, dataNormalizada);
    } else {
      // Crear nueva franja
      const dataConProfesor = {
        ...dataNormalizada,
        profesor_id: profesorId
      };
      resultado = await franjasService.crearFranja(dataConProfesor);
    }

    if (resultado.success) {
      setMensaje({ 
        tipo: 'exito', 
        texto: franjaEditar ? 'Franja actualizada exitosamente' : 'Franja creada exitosamente' 
      });
      
      // Notificar al componente padre
      if (onFranjaSaved) {
        onFranjaSaved(resultado.data);
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
          <h2>{franjaEditar ? 'Editar Franja Horaria' : 'Nueva Franja Horaria'}</h2>
          <button className="btn-cerrar" onClick={onClose}>×</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-form">
          {/* Mensaje de éxito/error */}
          {mensaje.texto && (
            <div className={`mensaje ${mensaje.tipo}`}>
              {mensaje.texto}
            </div>
          )}

          {/* Error general */}
          {errors.general && (
            <div className="error-general">
              {errors.general}
            </div>
          )}

          {/* Día de la semana */}
          <div className="form-group">
            <label htmlFor="dia_semana">Día de la Semana *</label>
            <select
              id="dia_semana"
              name="dia_semana"
              value={formData.dia_semana}
              onChange={handleChange}
              className={errors.dia_semana ? 'input-error' : ''}
              disabled={loading}
            >
              {DIAS_SEMANA.map(dia => (
                <option key={dia.value} value={dia.value}>
                  {dia.label}
                </option>
              ))}
            </select>
            {errors.dia_semana && <span className="error">{errors.dia_semana}</span>}
          </div>

          {/* Hora de inicio */}
          <div className="form-group">
            <label htmlFor="hora_inicio">Hora de Inicio *</label>
            <input
              type="time"
              id="hora_inicio"
              name="hora_inicio"
              value={formData.hora_inicio}
              onChange={handleChange}
              className={errors.hora_inicio ? 'input-error' : ''}
              disabled={loading}
              placeholder="08:00"
            />
            {errors.hora_inicio && <span className="error">{errors.hora_inicio}</span>}
          </div>

          {/* Hora de fin */}
          <div className="form-group">
            <label htmlFor="hora_fin">Hora de Fin *</label>
            <input
              type="time"
              id="hora_fin"
              name="hora_fin"
              value={formData.hora_fin}
              onChange={handleChange}
              className={errors.hora_fin ? 'input-error' : ''}
              disabled={loading}
              placeholder="10:00"
            />
            {errors.hora_fin && <span className="error">{errors.hora_fin}</span>}
          </div>

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
              {loading ? 'Guardando...' : (franjaEditar ? 'Actualizar' : 'Crear Franja')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ModalFranja;
