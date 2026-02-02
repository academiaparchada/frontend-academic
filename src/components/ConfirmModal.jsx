// src/components/ConfirmModal.jsx
import React from 'react';
import { Modal } from './Modal';
import '../styles/components-css/ConfirmModal.css';

export const ConfirmModal = ({ 
  isOpen, 
  onClose, 
  onConfirm,
  title = 'Confirmar Acción', 
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'warning', // 'warning', 'info', 'danger'
  loading = false
}) => {
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
  };

  const getIcon = () => {
    switch(type) {
      case 'danger':
        return (
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        );
      case 'info':
        return (
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="16" x2="12" y2="12"></line>
            <line x1="12" y1="8" x2="12.01" y2="8"></line>
          </svg>
        );
      default: // warning
        return (
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
        );
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      type={type}
      closeOnOverlayClick={!loading}
      closeOnEsc={!loading}
      showCloseButton={!loading}
    >
      <div className={`confirm-modal-content confirm-modal-${type}`}>
        <div className="confirm-modal-icon">
          {getIcon()}
        </div>

        <h2 className="confirm-modal-title">{title}</h2>
        
        {message && (
          <p className="confirm-modal-message">{message}</p>
        )}

        <div className="confirm-modal-buttons">
          <button 
            className="confirm-modal-button confirm-modal-button--cancel" 
            onClick={onClose}
            disabled={loading}
          >
            {cancelText}
          </button>
          <button 
            className="confirm-modal-button confirm-modal-button--confirm" 
            onClick={handleConfirm}
            disabled={loading}
          >
            {loading ? (
              <>
                <span className="button-spinner"></span>
                Procesando...
              </>
            ) : (
              confirmText
            )}
          </button>
        </div>
      </div>
    </Modal>
  );
};
