// src/hooks/useSessionCheck.js
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSessionModal } from '../context/session_modal_context';

export const useSessionCheck = () => {
  const navigate = useNavigate();
  const { showSessionExpired } = useSessionModal();

  // Verificar si el token es válido
  const checkSession = async () => {
    const token = localStorage.getItem('token');
    
    if (!token) {
      return false;
    }

    try {
      // Hacer una petición simple para verificar el token
      const response = await fetch('https://academiaparchada.onrender.com/api/auth/verify', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error verificando sesión:', error);
      return false;
    }
  };

  // Interceptor para manejar errores 401 (no autorizado)
  const setupInterceptor = () => {
    const originalFetch = window.fetch;
    
    window.fetch = async (...args) => {
      const response = await originalFetch(...args);
      
      // Si es 401, la sesión expiró
      if (response.status === 401) {
        const url = args[0];
        // Solo mostrar modal si no es la petición de login/register
        if (typeof url === 'string' && 
            !url.includes('/login') && 
            !url.includes('/register') &&
            !url.includes('/forgot-password')) {
          showSessionExpired();
        }
      }
      
      return response;
    };
  };

  useEffect(() => {
    setupInterceptor();
  }, []);

  return { checkSession };
};
