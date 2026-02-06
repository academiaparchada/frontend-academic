// src/context/session_modal_context.jsx
import React, { createContext, useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ErrorModal } from '../components/ErrorModal';
import { WarningModal } from '../components/WarningModal';

const SessionModalContext = createContext();

export const useSessionModal = () => {
  const context = useContext(SessionModalContext);
  if (!context) {
    throw new Error('useSessionModal debe usarse dentro de SessionModalProvider');
  }
  return context;
};

export const SessionModalProvider = ({ children }) => {
  const navigate = useNavigate();
  
  const [showSessionExpiredModal, setShowSessionExpiredModal] = useState(false);
  const [showPermissionModal, setShowPermissionModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  
  const [permissionData, setPermissionData] = useState({
    message: '',
    requiredRole: ''
  });

  // Mostrar modal de sesión expirada
  const showSessionExpired = () => {
    setShowSessionExpiredModal(true);
  };

  // Mostrar modal de permisos insuficientes
  const showInsufficientPermissions = (message = '', requiredRole = '') => {
    setPermissionData({ message, requiredRole });
    setShowPermissionModal(true);
  };

  // Mostrar modal de confirmación de logout
  const showLogoutConfirmation = () => {
    setShowLogoutModal(true);
  };

  // Manejar cierre de sesión expirada
  const handleSessionExpiredClose = () => {
    setShowSessionExpiredModal(false);
    // Limpiar almacenamiento local
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Redirigir al login
    navigate('/login');
  };

  // Manejar cierre de permisos insuficientes
  const handlePermissionClose = () => {
    setShowPermissionModal(false);
    // Redirigir según el rol actual
    const userStr = localStorage.getItem('user') || '{}';
    
    try {
      const user = JSON.parse(userStr);
      const role = (user.rol || user.role || '').toLowerCase().trim();
      
      console.log('🚀 Redirigiendo usuario con rol:', role);
      
      // Normalizar rol y redirigir al dashboard correcto
      if (role === 'admin' || role === 'administrador') {
        navigate('/admin/dashboard', { replace: true });
      } else if (role === 'profesor' || role === 'teacher') {
        navigate('/profesor/dashboard', { replace: true });
      } else if (role === 'estudiante' || role === 'student') {
        navigate('/estudiante/dashboard', { replace: true });
      } else {
        // Si no hay rol válido, ir al login
        console.error('❌ Rol no válido, redirigiendo al login');
        navigate('/login', { replace: true });
      }
    } catch (error) {
      console.error('❌ Error parseando usuario, redirigiendo al login');
      navigate('/login', { replace: true });
    }
  };

  // Manejar confirmación de logout
  const handleLogoutConfirm = () => {
    setShowLogoutModal(false);
    // Limpiar almacenamiento local
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    // Redirigir al home o login
    navigate('/');
  };

  const value = {
    showSessionExpired,
    showInsufficientPermissions,
    showLogoutConfirmation
  };

  return (
    <SessionModalContext.Provider value={value}>
      {children}

      {/* Modal de Sesión Expirada */}
      <ErrorModal
        isOpen={showSessionExpiredModal}
        onClose={handleSessionExpiredClose}
        title="Sesión Expirada"
        message="Tu sesión ha expirado por inactividad. Por favor, inicia sesión nuevamente para continuar."
        buttonText="Ir al Login"
        closeOnOverlayClick={false}
        closeOnEsc={false}
      />

      {/* Modal de Permisos Insuficientes */}
      <WarningModal
        isOpen={showPermissionModal}
        onClose={handlePermissionClose}
        title="Acceso Restringido"
        message={
          permissionData.message || 
          `No tienes permisos para acceder a esta sección. ${
            permissionData.requiredRole 
              ? `Se requiere rol: ${permissionData.requiredRole}` 
              : ''
          }`
        }
        buttonText="Volver al Dashboard"
      />

      {/* Modal de Confirmación de Logout */}
      <WarningModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="¿Cerrar Sesión?"
        message="¿Estás seguro que deseas cerrar tu sesión? Tendrás que iniciar sesión nuevamente para acceder."
        buttonText="Sí, Cerrar Sesión"
        onConfirm={handleLogoutConfirm}
      />
    </SessionModalContext.Provider>
  );
};
