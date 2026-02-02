// src/components/ProtectedRoute.jsx
import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useSessionModal } from '../context/session_modal_context';

export const ProtectedRoute = ({ 
  children, 
  requiredRole = null,
  requireAuth = true 
}) => {
  const { showInsufficientPermissions } = useSessionModal();
  const [checking, setChecking] = useState(true);
  const [hasAccess, setHasAccess] = useState(false);

  useEffect(() => {
    const checkAccess = () => {
      // Verificar si requiere autenticación
      if (requireAuth) {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        
        if (!token || !userStr) {
          setHasAccess(false);
          setChecking(false);
          return;
        }

        // Verificar rol si es necesario
        if (requiredRole) {
          try {
            const user = JSON.parse(userStr);
            const userRole = user.rol || user.role;
            
            // Normalizar roles para comparación
            const normalizedUserRole = userRole?.toLowerCase();
            const normalizedRequiredRole = requiredRole.toLowerCase();
            
            if (normalizedUserRole !== normalizedRequiredRole) {
              // Mostrar modal de permisos insuficientes
              showInsufficientPermissions(
                `Esta sección es solo para usuarios con rol de ${requiredRole}.`,
                requiredRole
              );
              setHasAccess(false);
              setChecking(false);
              return;
            }
          } catch (error) {
            console.error('Error parseando usuario:', error);
            setHasAccess(false);
            setChecking(false);
            return;
          }
        }

        setHasAccess(true);
      } else {
        setHasAccess(true);
      }
      
      setChecking(false);
    };

    checkAccess();
  }, [requireAuth, requiredRole, showInsufficientPermissions]);

  if (checking) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh' 
      }}>
        <div>Verificando acceso...</div>
      </div>
    );
  }

  if (!hasAccess) {
    return <Navigate to="/login" replace />;
  }

  return children;
};
