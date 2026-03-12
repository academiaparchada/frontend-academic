// src/components/SuccessModal.jsx
import React from 'react';
import { Modal } from './Modal';
import '../styles/components-css/SuccessModal.css';

export const SuccessModal = ({ 
  isOpen, 
  onClose, 
  title = 'Éxito', 
  message,
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
      type="success"
      closeOnOverlayClick={true}
      closeOnEsc={true}
    >
      <div className="success-modal-content">
        <div className="success-modal-icon">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
          >
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
            <polyline points="22 4 12 14.01 9 11.01"></polyline>
          </svg>
        </div>

        <h2 className="success-modal-title">{title}</h2>
        
        {message && (
          <p className="success-modal-message">{message}</p>
        )}

        <button 
          className="success-modal-button" 
          onClick={handleConfirm}
        >
          {buttonText}
        </button>
      </div>
    </Modal>
  );
};
