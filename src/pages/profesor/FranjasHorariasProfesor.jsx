// src/pages/profesor/FranjasHorariasProfesor.jsx
import React, { useState, useEffect } from 'react';
import CalendarioSemanal from '../../components/CalendarioSemanal';
import ModalFranja from '../../components/ModalFranja';
import franjasService from '../../services/franjas_service';
import authService from '../../services/auth_service';
import '../../styles/profesor-css/FranjasHorarias.css';

const FranjasHorariasProfesor = () => {
  const [franjasPorDia, setFranjasPorDia] = useState({});
  const [todasLasFranjas, setTodasLasFranjas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [profesorId, setProfesorId] = useState(null);
  
  // Estados del modal
  const [modalAbierto, setModalAbierto] = useState(false);
  const [franjaEditar, setFranjaEditar] = useState(null);
  const [diaSeleccionado, setDiaSeleccionado] = useState(null);

  // Obtener ID del profesor actual y cargar sus franjas
  useEffect(() => {
    const user = authService.get_current_user();
    if (user && user.id) {
      setProfesorId(user.id);
      cargarFranjasProfesor(user.id);
    } else {
      setError('No se pudo obtener la información del usuario');
    }
  }, []);

  // Cargar franjas del profesor actual
  const cargarFranjasProfesor = async (id) => {
    try {
      setLoading(true);
      setError('');
      
      const resultado = await franjasService.listarFranjasProfesor(id);
      
      if (resultado.success) {
        setFranjasPorDia(resultado.data.franjasPorDia || {});
        setTodasLasFranjas(resultado.data.franjas || []);
      } else {
        setError(resultado.message);
        setFranjasPorDia({});
        setTodasLasFranjas([]);
      }
    } catch (err) {
      console.error('Error al cargar franjas:', err);
      setError('Error al cargar las franjas horarias');
      setFranjasPorDia({});
      setTodasLasFranjas([]);
    } finally {
      setLoading(false);
    }
  };

  // Abrir modal para agregar franja
  const handleAgregarFranja = (dia) => {
    setDiaSeleccionado(dia);
    setFranjaEditar(null);
    setModalAbierto(true);
  };

  // Abrir modal para editar franja
  const handleEditarFranja = (franja) => {
    setFranjaEditar(franja);
    setDiaSeleccionado(null);
    setModalAbierto(true);
  };

  // Eliminar franja
  const handleEliminarFranja = async (franja) => {
    const confirmacion = window.confirm(
      `¿Estás seguro de eliminar la franja del ${franja.dia_semana} (${franja.hora_inicio} - ${franja.hora_fin})?`
    );

    if (!confirmacion) return;

    try {
      setLoading(true);
      const resultado = await franjasService.eliminarFranja(franja.id);
      
      if (resultado.success) {
        // Recargar franjas
        await cargarFranjasProfesor(profesorId);
        alert(resultado.message);
      } else {
        alert(`Error: ${resultado.message}`);
      }
    } catch (err) {
      console.error('Error al eliminar franja:', err);
      alert('Error al eliminar la franja horaria');
    } finally {
      setLoading(false);
    }
  };

  // Callback cuando se guarda una franja
  const handleFranjaSaved = () => {
    // Recargar franjas
    if (profesorId) {
      cargarFranjasProfesor(profesorId);
    }
  };

  return (
    <div className="franjas-horarias-container">
      <div className="franjas-header">
        <h1>Mi Disponibilidad Horaria</h1>
        <p className="subtitulo">Gestiona tus franjas horarias disponibles para dar clases</p>
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

      {/* Calendario semanal */}
      {!loading && profesorId && (
        <div className="calendario-section">
          <CalendarioSemanal
            franjasPorDia={franjasPorDia}
            onAgregarFranja={handleAgregarFranja}
            onEditarFranja={handleEditarFranja}
            onEliminarFranja={handleEliminarFranja}
          />
        </div>
      )}

      {/* Modal para crear/editar franja */}
      <ModalFranja
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        franjaEditar={franjaEditar}
        diaSeleccionado={diaSeleccionado}
        profesorId={profesorId}
        todasLasFranjas={todasLasFranjas}
        onFranjaSaved={handleFranjaSaved}
      />
    </div>
  );
};

export default FranjasHorariasProfesor;
