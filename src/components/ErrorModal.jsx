// src/components/ErrorModal.jsx
import React from 'react';
import { Modal } from './Modal';
import '../styles/components-css/ErrorModal.css';

export const ErrorModal = ({ 
  isOpen, 
  onClose, 
  title = 'Error', 
  message,
  errors = [], // Array de errores múltiples
  buttonText = 'Aceptar',
  onConfirm
}) => {
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      type="error"
      closeOnOverlayClick={true}
      closeOnEsc={true}
    >
      <div className="error-modal-content">
        <div className="error-modal-icon">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
        </div>

        <h2 className="error-modal-title">{title}</h2>
        
        {message && (
          <p className="error-modal-message">{message}</p>
        )}

        {errors.length > 0 && (
          <ul className="error-modal-list">
            {errors.map((error, index) => (
              <li key={index}>{error}</li>
            ))}
          </ul>
        )}

        <button 
          className="error-modal-button" 
          onClick={handleConfirm}
        >
          {buttonText}
        </button>
      </div>
    </Modal>
  );
};
