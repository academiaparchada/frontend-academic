// src/components/Modal.jsx
import React, { useEffect } from 'react';
import '../styles/components-css/Modal.css';

export const Modal = ({ 
  isOpen, 
  onClose, 
  children, 
  type = 'default', // 'error', 'success', 'warning', 'info', 'default'
  showCloseButton = true,
  closeOnOverlayClick = true,
  closeOnEsc = true
}) => {
  // Cerrar modal con tecla ESC
  useEffect(() => {
    if (!isOpen || !closeOnEsc) return;

    const handleEsc = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEsc);
    return () => document.removeEventListener('keydown', handleEsc);
  }, [isOpen, onClose, closeOnEsc]);

  // Prevenir scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleOverlayClick = (e) => {
    if (closeOnOverlayClick && e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className={`modal-container modal-${type}`}>
        {showCloseButton && (
          <button 
            className="modal-close-button" 
            onClick={onClose}
            aria-label="Cerrar modal"
          >
            ✕
          </button>
        )}
        <div className="modal-content">
          {children}
        </div>
      </div>
    </div>
  );
};
