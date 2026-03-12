// src/components/WarningModal.jsx
import React from 'react';
import { Modal } from './Modal';
import '../styles/components-css/WarningModal.css';

export const WarningModal = ({ 
  isOpen, 
  onClose, 
  title = 'Advertencia', 
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
      type="warning"
      closeOnOverlayClick={true}
      closeOnEsc={true}
    >
      <div className="warning-modal-content">
        <div className="warning-modal-icon">
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
            <line x1="12" y1="9" x2="12" y2="13"></line>
            <line x1="12" y1="17" x2="12.01" y2="17"></line>
          </svg>
        </div>

        <h2 className="warning-modal-title">{title}</h2>
        
        {message && (
          <p className="warning-modal-message">{message}</p>
        )}

        <button 
          className="warning-modal-button" 
          onClick={handleConfirm}
        >
          {buttonText}
        </button>
      </div>
    </Modal>
  );
};
