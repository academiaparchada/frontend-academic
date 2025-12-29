// src/components/CalendarioSemanal.jsx
import React from 'react';
import '../styles/CalendarioSemanal.css';

const DIAS_SEMANA = [
  'lunes',
  'martes',
  'miercoles',
  'jueves',
  'viernes',
  'sabado',
  'domingo'
];

const CalendarioSemanal = ({ franjasPorDia, onAgregarFranja, onEditarFranja, onEliminarFranja }) => {
  // Convertir hora a formato de 12 horas
 // Convertir hora a formato de 12 horas
const formatearHora = (hora) => {
  // Normalizar formato (puede venir HH:MM o HH:MM:SS)
  const partes = hora.split(':');
  const h = parseInt(partes[0]);
  const m = partes[1];
  
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${m} ${ampm}`;
};


  // Renderizar cada franja
  const renderFranja = (franja) => (
    <div key={franja.id} className="franja-item">
      <div className="franja-horario">
        <span className="hora-inicio">{formatearHora(franja.hora_inicio)}</span>
        <span className="separador">-</span>
        <span className="hora-fin">{formatearHora(franja.hora_fin)}</span>
      </div>
      <div className="franja-acciones">
        <button 
          className="btn-eliminar"
          onClick={() => onEliminarFranja(franja)}
          title="Eliminar franja"
        >
          🗑️
        </button>
      </div>
    </div>
  );

  return (
    <div className="calendario-semanal">
      {DIAS_SEMANA.map(dia => (
        <div key={dia} className="dia-columna">
          <div className="dia-header">
            <h3>{dia.charAt(0).toUpperCase() + dia.slice(1)}</h3>
            <button 
              className="btn-agregar-franja"
              onClick={() => onAgregarFranja(dia)}
              title={`Agregar franja para ${dia}`}
            >
              + Agregar
            </button>
          </div>
          <div className="franjas-lista">
            {franjasPorDia[dia] && franjasPorDia[dia].length > 0 ? (
              franjasPorDia[dia].map(renderFranja)
            ) : (
              <div className="sin-franjas">
                Sin franjas horarias
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default CalendarioSemanal;
