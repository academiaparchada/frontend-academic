// src/pages/ClasesPersonalizadasPublico.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import clasesPersonalizadasService from '../services/clases_personalizadas_service';
import comprasService from '../services/compras_service';
import '../styles/ClasesPublico.css';

const ClasesPersonalizadasPublico = () => {
  const navigate = useNavigate();
  const [clases, setClases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    cargarClases();
  }, []);

  const cargarClases = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Usar el servicio que ya maneja la estructura correcta
      const resultado = await clasesPersonalizadasService.listarClases();
      
      console.log('Resultado completo:', resultado);

      if (resultado.success) {
        // El servicio ya devuelve la estructura correcta en resultado.data.clases
        setClases(resultado.data.clases || []);
        console.log('Clases cargadas:', resultado.data.clases);
      } else {
        setError(resultado.message || 'Error al cargar las clases');
        console.error('Error en la respuesta:', resultado.message);
      }
    } catch (err) {
      console.error('Error al cargar clases:', err);
      setError('Error de conexión. Por favor, intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const handleComprarClase = (clase) => {
    navigate(`/checkout/clase/${clase.id}`);
  };

  const handleComprarPaquete = (clase) => {
    navigate(`/checkout/paquete/${clase.id}`);
  };

  if (loading) {
    return (
      <div className="clases-publico-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Cargando clases...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="clases-publico-container">
        <div className="error-container">
          <h3>❌ Error</h3>
          <p>{error}</p>
          <button onClick={cargarClases} className="btn-retry">
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="clases-publico-container">
      <header className="clases-header">
        <h1>Clases Personalizadas</h1>
        <p>Clases individuales adaptadas a tus necesidades</p>
      </header>

      <div className="clases-grid">
        {clases.map((clase) => (
          <div key={clase.id} className="clase-card">
            <div className="clase-icon">
              📚
            </div>

            <h3>{clase.asignatura?.nombre || 'Asignatura'}</h3>

            <div className="clase-info">
              <div className="info-item">
                <span className="icon">⏱️</span>
                <span>{clase.duracion_horas} hora(s)</span>
              </div>

              <div className="info-item">
                <span className="icon">👥</span>
                <span>Individual</span>
              </div>

              <div className="info-item">
                <span className="icon">🎯</span>
                <span>Virtual</span>
              </div>
            </div>

            <div className="precio-container">
              <span className="precio-label">Precio por clase</span>
              <span className="precio-valor">
                {clasesPersonalizadasService.formatearPrecio(clase.precio)}
              </span>
            </div>

            <div className="clase-acciones">
              <button 
                className="btn-comprar-clase"
                onClick={() => handleComprarClase(clase)}
              >
                Comprar 1 Clase
              </button>
              <button 
                className="btn-comprar-paquete"
                onClick={() => handleComprarPaquete(clase)}
              >
                📦 Comprar Paquete
              </button>
            </div>

            <p className="ventaja-paquete">
              💡 Con el paquete puedes agendar tus clases cuando quieras
            </p>
          </div>
        ))}
      </div>

      {clases.length === 0 && (
        <div className="sin-clases">
          <h3>📝 No hay clases disponibles</h3>
          <p>Pronto agregaremos nuevas materias</p>
        </div>
      )}
    </div>
  );
};

export default ClasesPersonalizadasPublico;
