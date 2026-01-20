// src/components/ModalSubirMaterial.jsx
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import materialEstudioService from '../services/material_estudio_service';
import '../styles/components-css/ModalSubirMaterial.css';

export const ModalSubirMaterial = ({ isOpen, onClose, cursoId, onMaterialSubido }) => {
  const [formData, setFormData] = useState({
    titulo: '',
    tipo: 'documento',
    file: null,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [archivoSeleccionado, setArchivoSeleccionado] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // Limpiar estado cuando se cierra
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        titulo: '',
        tipo: 'documento',
        file: null,
      });
      setArchivoSeleccionado(null);
      setError('');
      setLoading(false);
    }
  }, [isOpen]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
    setError('');
  };

  const procesarArchivo = (file) => {
    if (!file) return;

    const validacion = materialEstudioService.validarArchivoPermitido(file);
    if (!validacion.valido) {
      setError(validacion.mensaje);
      return;
    }

    setArchivoSeleccionado(file);
    setFormData(prev => ({ ...prev, file }));
    setError('');
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    procesarArchivo(file);
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      procesarArchivo(files[0]);
    }
  };

  const handleRemoverArchivo = () => {
    setArchivoSeleccionado(null);
    setFormData(prev => ({ ...prev, file: null }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.file) {
      setError('Debes seleccionar un archivo');
      return;
    }

    if (!formData.titulo.trim()) {
      setError('El título es obligatorio');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const resultado = await materialEstudioService.crearMaterial({
        file: formData.file,
        titulo: formData.titulo.trim(),
        tipo: formData.tipo,
        curso_id: cursoId,
      });

      if (resultado.success) {
        // Notificar primero
        if (onMaterialSubido) {
          onMaterialSubido(resultado.data);
        }
        
        // Cerrar modal (esto limpiará el estado gracias al useEffect)
        onClose();
      } else {
        setError(resultado.message);
        setLoading(false);
      }
    } catch (err) {
      console.error('Error al subir material:', err);
      setError('Error inesperado al subir el material');
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="modal-overlay modal-subir-overlay" onClick={handleClose}>
      <div className="modal-subir-material" onClick={(e) => e.stopPropagation()}>
        <div className="modal-subir-header">
          <h2>📤 Subir Material de Estudio</h2>
          <button 
            className="btn-close-modal" 
            onClick={handleClose}
            disabled={loading}
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-subir-body">
          {error && (
            <div className="mensaje-error">
              {error}
            </div>
          )}

          <div className="form-group">
            <label htmlFor="titulo">
              Título del Material <span className="required">*</span>
            </label>
            <input
              type="text"
              id="titulo"
              name="titulo"
              value={formData.titulo}
              onChange={handleInputChange}
              placeholder="Ej: Guía de ejercicios semana 1"
              maxLength={200}
              disabled={loading}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="tipo">
              Tipo de Material <span className="required">*</span>
            </label>
            <select
              id="tipo"
              name="tipo"
              value={formData.tipo}
              onChange={handleInputChange}
              disabled={loading}
              required
            >
              <option value="documento">📄 Documento</option>
              <option value="video">🎥 Video</option>
              <option value="imagen">🖼️ Imagen</option>
              <option value="otro">📎 Otro</option>
            </select>
          </div>

          <div className="form-group">
            <label>
              Archivo <span className="required">*</span>
            </label>

            {!archivoSeleccionado ? (
              <div
                className={`dropzone ${isDragging ? 'dragging' : ''}`}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  id="file-input-subir"
                  name="file"
                  onChange={handleFileChange}
                  disabled={loading}
                  accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.webp,.zip,.rar,.txt,.mp4"
                  style={{ display: 'none' }}
                  required
                />
                <div className="dropzone-content">
                  <div className="dropzone-icon">📁</div>
                  <p className="dropzone-text">
                    Arrastra tu archivo aquí o haz clic para seleccionar
                  </p>
                  <button
                    type="button"
                    className="btn-seleccionar-archivo"
                    onClick={() => document.getElementById('file-input-subir').click()}
                    disabled={loading}
                  >
                    Seleccionar Archivo
                  </button>
                  <small className="dropzone-hint">
                    Formatos: PDF, DOC, DOCX, PNG, JPG, WEBP, ZIP, RAR, TXT, MP4 (máx. 50MB)
                  </small>
                </div>
              </div>
            ) : (
              <div className="archivo-seleccionado">
                <div className="archivo-preview">
                  <span className="archivo-icono">
                    {materialEstudioService.obtenerIconoTipo(
                      archivoSeleccionado.name.split('.').pop()
                    )}
                  </span>
                  <div className="archivo-info">
                    <span className="archivo-nombre">{archivoSeleccionado.name}</span>
                    <span className="archivo-tamaño">
                      {materialEstudioService.formatearTamano(archivoSeleccionado.size)}
                    </span>
                  </div>
                  <button
                    type="button"
                    className="btn-remover-archivo"
                    onClick={handleRemoverArchivo}
                    disabled={loading}
                    title="Remover archivo"
                  >
                    ✕
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="info-box">
            <p>ℹ️ <strong>Nota:</strong></p>
            <ul>
              <li>Videos y archivos mayores a 8MB se subirán a Cloudinary</li>
              <li>Otros archivos se subirán a almacenamiento interno</li>
              <li>Los estudiantes podrán descargar este material</li>
            </ul>
          </div>

          <div className="modal-subir-footer">
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
              className="btn-subir"
              disabled={loading || !formData.file}
            >
              {loading ? (
                <>
                  <span className="spinner-small"></span>
                  Subiendo...
                </>
              ) : (
                <>
                  📤 Subir Material
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
};
