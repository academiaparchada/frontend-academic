// src/pages/admin/FranjasHorariasAdmin.jsx
import React, { useState, useEffect } from 'react';
import CalendarioSemanal from '../../components/CalendarioSemanal';
import ModalFranja from '../../components/ModalFranja';
import franjasService from '../../services/franjas_service';
import '../../styles/FranjasHorarias.css';

const FranjasHorariasAdmin = () => {
  const [profesores, setProfesores] = useState([]);
  const [profesorSeleccionado, setProfesorSeleccionado] = useState(null);
  const [franjasPorDia, setFranjasPorDia] = useState({});
  const [todasLasFranjas, setTodasLasFranjas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Estados del modal
  const [modalAbierto, setModalAbierto] = useState(false);
  const [franjaEditar, setFranjaEditar] = useState(null);
  const [diaSeleccionado, setDiaSeleccionado] = useState(null);

  // Cargar lista de profesores al montar el componente
  useEffect(() => {
    cargarProfesores();
  }, []);

  // Cargar franjas cuando se selecciona un profesor
  useEffect(() => {
    if (profesorSeleccionado) {
      cargarFranjasProfesor(profesorSeleccionado.id);
    }
  }, [profesorSeleccionado]);

  // Cargar lista de profesores desde el backend
  const cargarProfesores = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      // 🔧 CORRECCIÓN: Endpoint correcto es /api/profesores
      const response = await fetch('https://academiaparchada.onrender.com/api/profesores', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      console.log('Respuesta de profesores:', data); // Para debug
      
      if (response.ok && data.success) {
        // 🔧 CORRECCIÓN: Verificar que data.data.profesores sea un array
        const listaProfesores = Array.isArray(data.data?.profesores) 
          ? data.data.profesores 
          : [];
        
        setProfesores(listaProfesores);
        
        // Obtener usuario actual para preseleccionar si es admin
        const userStr = localStorage.getItem('user');
        const user = userStr ? JSON.parse(userStr) : null;
        
        // Si el admin quiere gestionar sus propias franjas, preseleccionarlo
        if (user && user.rol === 'administrador' && listaProfesores.length > 0) {
          const adminEnLista = listaProfesores.find(p => p.id === user.id);
          if (adminEnLista) {
            setProfesorSeleccionado(adminEnLista);
          } else {
            // Si no está en la lista, seleccionar el primero
            setProfesorSeleccionado(listaProfesores[0]);
          }
        }
      } else {
        setError(data.message || 'Error al cargar profesores');
      }
    } catch (err) {
      console.error('Error al cargar profesores:', err);
      setError('Error de conexión al cargar profesores');
    } finally {
      setLoading(false);
    }
  };

  // Cargar franjas de un profesor específico
  const cargarFranjasProfesor = async (profesorId) => {
    try {
      setLoading(true);
      setError('');
      
      const resultado = await franjasService.listarFranjasProfesor(profesorId);
      
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
        await cargarFranjasProfesor(profesorSeleccionado.id);
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
    if (profesorSeleccionado) {
      cargarFranjasProfesor(profesorSeleccionado.id);
    }
  };

  return (
    <div className="franjas-horarias-container">
      <div className="franjas-header">
        <h1>Gestión de Franjas Horarias</h1>
        <p className="subtitulo">Administra las franjas horarias de todos los profesores</p>
      </div>

      {/* Selector de profesor */}
      <div className="selector-profesor">
        <label htmlFor="profesor-select">Seleccionar Profesor:</label>
        <select
          id="profesor-select"
          value={profesorSeleccionado?.id || ''}
          onChange={(e) => {
            const profesor = profesores.find(p => p.id === e.target.value);
            setProfesorSeleccionado(profesor);
          }}
          disabled={loading || profesores.length === 0}
        >
          <option value="">-- Selecciona un profesor --</option>
          {profesores.map(profesor => (
            <option key={profesor.id} value={profesor.id}>
              {profesor.nombre} {profesor.apellido} - {profesor.email}
            </option>
          ))}
        </select>
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

      {/* Mensaje cuando no hay profesores */}
      {!loading && profesores.length === 0 && (
        <div className="mensaje-info">
          <p>⚠️ No hay profesores registrados en el sistema</p>
        </div>
      )}

      {/* Calendario semanal */}
      {profesorSeleccionado && !loading && (
        <div className="calendario-section">
          <div className="profesor-info">
            <h2>
              Horario de: {profesorSeleccionado.nombre} {profesorSeleccionado.apellido}
            </h2>
          </div>
          
          <CalendarioSemanal
            franjasPorDia={franjasPorDia}
            onAgregarFranja={handleAgregarFranja}
            onEditarFranja={handleEditarFranja}
            onEliminarFranja={handleEliminarFranja}
          />
        </div>
      )}

      {/* Mensaje cuando no hay profesor seleccionado */}
      {!profesorSeleccionado && !loading && profesores.length > 0 && (
        <div className="mensaje-info">
          <p>👆 Selecciona un profesor para gestionar sus franjas horarias</p>
        </div>
      )}

      {/* Modal para crear/editar franja */}
      <ModalFranja
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        franjaEditar={franjaEditar}
        diaSeleccionado={diaSeleccionado}
        profesorId={profesorSeleccionado?.id}
        todasLasFranjas={todasLasFranjas}
        onFranjaSaved={handleFranjaSaved}
      />
    </div>
  );
};

export default FranjasHorariasAdmin;
