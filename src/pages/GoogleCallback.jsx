// src/pages/GoogleCallback.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import googleAuthService from '../services/google_auth_service';
import '../styles/login.css';

export const GoogleCallback = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState(true);
  const [debugInfo, setDebugInfo] = useState('');

  useEffect(() => {
    const processCallback = async () => {
      try {
        console.log('🔄 Procesando callback de Google...');
        console.log('📍 URL actual:', window.location.href);
        console.log('🔍 Hash:', window.location.hash);
        console.log('🔍 Search:', window.location.search);
        
        setDebugInfo(`URL: ${window.location.href}`);
        
        const result = await googleAuthService.handleGoogleCallback();

        if (result.success) {
          console.log('✅ Autenticación exitosa, redirigiendo...');
          
          // Determinar a dónde redirigir según el rol
          const userRole = result.data?.user?.rol;
          
          setTimeout(() => {
            if (userRole === 'admin' || userRole === 'administrador') {
              navigate('/admin/dashboard');
            } else if (userRole === 'profesor' || userRole === 'teacher') {
              navigate('/profesor/dashboard');
            } else {
              navigate('/estudiante/dashboard');
            }
          }, 500);
        } else {
          console.error('❌ Error en autenticación:', result.message);
          setError(result.message || 'Error al procesar la autenticación');
          setDebugInfo(`Error: ${result.message}`);
          setProcessing(false);
        }
      } catch (err) {
        console.error('❌ Error inesperado:', err);
        setError('Error inesperado al procesar la autenticación');
        setDebugInfo(`Error inesperado: ${err.message}`);
        setProcessing(false);
      }
    };

    // Esperar un momento para que Supabase procese el hash
    const timer = setTimeout(() => {
      processCallback();
    }, 500);

    return () => clearTimeout(timer);
  }, [navigate]);

  if (processing) {
    return (
      <div className="page">
        <main className="main">
          <div className="login_container">
            <div className="login_card">
              <h2 className="login_title">Procesando...</h2>
              <div className="loading-spinner">
                <div className="spinner"></div>
                <p>Completando tu inicio de sesión con Google</p>
                {debugInfo && (
                  <p style={{ fontSize: '12px', marginTop: '10px', color: '#666' }}>
                    {debugInfo}
                  </p>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="page">
      <main className="main">
        <div className="login_container">
          <div className="login_card">
            <h2 className="login_title">Error de Autenticación</h2>
            <div className="error_message">
              {error}
            </div>
            {debugInfo && (
              <div style={{ 
                marginTop: '15px', 
                padding: '10px', 
                background: '#f5f5f5', 
                borderRadius: '5px',
                fontSize: '12px',
                wordBreak: 'break-all'
              }}>
                {debugInfo}
              </div>
            )}
            <button
              onClick={() => navigate('/login')}
              className="btn_login"
              style={{ marginTop: '20px' }}
            >
              Volver al Login
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
