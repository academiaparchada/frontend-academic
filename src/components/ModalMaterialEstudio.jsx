// src/components/ModalMaterialEstudio.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../context/auth_context';
import materialEstudioService from '../services/material_estudio_service';
import { ModalSubirMaterial } from './ModalSubirMaterial';
import { createPortal } from 'react-dom';
import '../styles/components-css/ModalMaterialEstudio.css';

export const ModalMaterialEstudio = ({ isOpen, onClose, curso }) => {
  const { user } = useAuth();
  const [materiales, setMateriales] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [descargando, setDescargando] = useState(null);
  const [eliminando, setEliminando] = useState(null);
  const [mensaje, setMensaje] = useState('');
  const [modalSubirOpen, setModalSubirOpen] = useState(false);

  // Verificar si el usuario puede gestionar material (admin o profesor del curso)
  const puedeGestionarMaterial = () => {
  if (!user || !curso) {
    console.log('No hay usuario o curso', { user, curso });
    return false;
  }
  
  console.log('Verificando permisos:', {
    userRol: user.rol,
    userId: user.id,
    profesorId: curso.profesor_id,
    cursoProfesor: curso.profesor
  });
  
  if (user.rol === 'administrador') return true;
  if (user.rol === 'profesor') {
    // Intentar obtener el profesor_id de diferentes lugares
    const profesorId = curso.profesor_id || curso.profesor?.id;
    return profesorId === user.id;
  }
  return false;
};

  useEffect(() => {
    if (isOpen && curso?.id) {
      cargarMaterial();
    }
    
    // Resetear cuando se cierra
    if (!isOpen) {
      setMateriales([]);
      setError('');
      setMensaje('');
      setModalSubirOpen(false);
    }
  }, [isOpen, curso?.id]);

  const cargarMaterial = async () => {
    try {
      setLoading(true);
      setError('');
      setMensaje('');

      const resultado = await materialEstudioService.listarMaterial(curso.id);

      if (resultado.success) {
        // Asegurarse de que siempre sea un array
        const materialesData = resultado.data?.materiales || resultado.data || [];
        
        // Validar que sea un array
        if (Array.isArray(materialesData)) {
          setMateriales(materialesData);
          if (materialesData.length === 0) {
            setMensaje('Este curso aún no tiene material disponible.');
          }
        } else {
          console.error('La respuesta no es un array:', materialesData);
          setMateriales([]);
          setMensaje('Este curso aún no tiene material disponible.');
        }
      } else {
        setError(resultado.message);
        setMateriales([]);
      }
    } catch (err) {
      console.error('Error al cargar material:', err);
      setError('Error al cargar el material del curso');
      setMateriales([]);
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
      setTimeout(() => {
        setDescargando(null);
      }, 1000);
    }
  };

  const handleEliminar = async (materialId) => {
    const confirmacion = window.confirm(
      '¿Estás seguro de que deseas eliminar este material? Esta acción no se puede deshacer.'
    );

    if (!confirmacion) return;

    try {
      setEliminando(materialId);
      setError('');

      const resultado = await materialEstudioService.eliminarMaterial(materialId);

      if (resultado.success) {
        // Actualizar lista de materiales
        setMateriales(prev => prev.filter(m => m.id !== materialId));
        
        // Mostrar mensaje si ya no hay materiales
        if (materiales.length === 1) {
          setMensaje('Este curso aún no tiene material disponible.');
        }
      } else {
        setError(resultado.message);
      }
    } catch (err) {
      console.error('Error al eliminar:', err);
      setError('Error al eliminar el material');
    } finally {
      setEliminando(null);
    }
  };

  const handleMaterialSubido = () => {
    // Recargar lista de materiales después de subir uno nuevo
    cargarMaterial();
  };

  const handleAbrirModalSubir = () => {
    setModalSubirOpen(true);
  };

  const handleCerrarModalSubir = () => {
    setModalSubirOpen(false);
  };

  if (!isOpen) return null;

  const mostrarBotonSubir = puedeGestionarMaterial();

  // AQUÍ ESTÁ EL CAMBIO: envolver todo en createPortal
  return createPortal(
    <>
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
            {/* Botón para subir material (solo admin/profesor) */}
            {mostrarBotonSubir && (
              <div className="acciones-material">
                <button 
                  className="btn-subir-material-header"
                  onClick={handleAbrirModalSubir}
                  disabled={loading}
                >
                  📤 Subir Material
                </button>
              </div>
            )}

            {error && (
              <div className="mensaje-error">
                {error}
              </div>
            )}

            {mensaje && !error && materiales.length === 0 && (
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
                {Array.isArray(materiales) && materiales.length > 0 ? (
                  materiales.map((material) => (
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

                      <div className="material-acciones">
                        {/* Botón descargar (todos) */}
                        <button
                          className={`btn-descargar ${descargando === material.id ? 'descargando' : ''}`}
                          onClick={() => handleDescargar(material.id)}
                          disabled={descargando === material.id || eliminando === material.id}
                          title="Descargar material"
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

                        {/* Botón eliminar (solo admin/profesor) */}
                        {mostrarBotonSubir && (
                          <button
                            className={`btn-eliminar ${eliminando === material.id ? 'eliminando' : ''}`}
                            onClick={() => handleEliminar(material.id)}
                            disabled={eliminando === material.id || descargando === material.id}
                            title="Eliminar material"
                          >
                            {eliminando === material.id ? (
                              <>
                                <span className="spinner-small"></span>
                                Eliminando...
                              </>
                            ) : (
                              '🗑️'
                            )}
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                ) : null}
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

      {/* Modal para subir material */}
      <ModalSubirMaterial
        isOpen={modalSubirOpen}
        onClose={handleCerrarModalSubir}
        cursoId={curso?.id}
        onMaterialSubido={handleMaterialSubido}
      />
    </>,
    document.body // ESTO MONTA EL MODAL DIRECTAMENTE EN EL BODY
  );
};
