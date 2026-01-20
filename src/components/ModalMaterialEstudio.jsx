// src/components/ModalMaterialEstudio.jsx
import { useState, useEffect } from 'react';
import materialEstudioService from '../services/material_estudio_service';
import '../styles/components-css/ModalMaterialEstudio.css';

export const ModalMaterialEstudio = ({ isOpen, onClose, curso }) => {
  const [materiales, setMateriales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [descargando, setDescargando] = useState(null);
  const [mensaje, setMensaje] = useState('');

  useEffect(() => {
    if (isOpen && curso?.id) {
      cargarMaterial();
    }
  }, [isOpen, curso]);

  const cargarMaterial = async () => {
    try {
      setLoading(true);
      setError('');
      setMensaje('');

      const resultado = await materialEstudioService.listarMaterial(curso.id);

      if (resultado.success) {
        setMateriales(resultado.data || []);
        if (resultado.data.length === 0) {
          setMensaje('Este curso aún no tiene material disponible.');
        }
      } else {
        setError(resultado.message);
      }
    } catch (err) {
      console.error('Error al cargar material:', err);
      setError('Error al cargar el material del curso');
    } finally {
      setLoading(false);
    }
  };

  const handleDescargar = async (materialId) => {
    try {
      setDescargando(materialId);
      setError('');

      const resultado = await materialEstudioService.descargarMaterial(materialId);

      if (!resultado.success) {
        setError(resultado.message);
      }
    } catch (err) {
      console.error('Error al descargar:', err);
      setError('Error al descargar el archivo');
    } finally {
      // Mantener el estado de descargando por 1 segundo para dar feedback visual
      setTimeout(() => {
        setDescargando(null);
      }, 1000);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-material" onClick={(e) => e.stopPropagation()}>
        <div className="modal-material-header">
          <div>
            <h2>📚 Material de Estudio</h2>
            <p>{curso?.nombre}</p>
          </div>
          <button className="btn-close-modal" onClick={onClose}>
            ✕
          </button>
        </div>

        <div className="modal-material-body">
          {error && (
            <div className="mensaje-error">
              {error}
            </div>
          )}

          {mensaje && !error && (
            <div className="mensaje-info">
              {mensaje}
            </div>
          )}

          {loading ? (
            <div className="loading-material">
              <div className="spinner"></div>
              <p>Cargando material...</p>
            </div>
          ) : (
            <div className="material-lista">
              {materiales.map((material) => (
                <div key={material.id} className="material-item">
                  <div className="material-icono">
                    {materialEstudioService.obtenerIconoTipo(material.tipo)}
                  </div>
                  
                  <div className="material-info">
                    <h4>{material.titulo}</h4>
                    {material.descripcion && (
                      <p className="material-descripcion">{material.descripcion}</p>
                    )}
                    <div className="material-meta">
                      <span className="material-tipo">{material.tipo?.toUpperCase()}</span>
                      {material.tamano && (
                        <>
                          <span className="separador">•</span>
                          <span className="material-tamano">
                            {materialEstudioService.formatearTamano(material.tamano)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  <button
                    className={`btn-descargar ${descargando === material.id ? 'descargando' : ''}`}
                    onClick={() => handleDescargar(material.id)}
                    disabled={descargando === material.id}
                  >
                    {descargando === material.id ? (
                      <>
                        <span className="spinner-small"></span>
                        Abriendo...
                      </>
                    ) : (
                      <>
                        ⬇️ Descargar
                      </>
                    )}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="modal-material-footer">
          <button className="btn-cerrar" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};
