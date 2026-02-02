// src/components/LoadingModal.jsx
import React from 'react';
import { Modal } from './Modal';
import '../styles/components-css/LoadingModal.css';

export const LoadingModal = ({ 
  isOpen, 
  title = 'Procesando...', 
  message = 'Por favor espera un momento'
}) => {
  return (
    <Modal 
      isOpen={isOpen} 
      onClose={() => {}} // No se puede cerrar
      showCloseButton={false}
      closeOnOverlayClick={false}
      closeOnEsc={false}
    >
      <div className="loading-modal-content">
        <div className="loading-modal-spinner">
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
        </div>

        <h2 className="loading-modal-title">{title}</h2>
        
        {message && (
          <p className="loading-modal-message">{message}</p>
        )}
      </div>
    </Modal>
  );
};
