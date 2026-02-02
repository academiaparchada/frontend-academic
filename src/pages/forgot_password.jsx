// src/pages/forgot_password.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/header';
import { Footer } from '../components/footer';
import { ErrorModal } from '../components/ErrorModal'; // NUEVO
import { SuccessModal } from '../components/SuccessModal'; // NUEVO
import '../styles/forgot_password.css';

export const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);

  // NUEVO: Estados para modals
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorModalData, setErrorModalData] = useState({
    title: '',
    message: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validación del email
    if (!email.trim()) {
      setErrorModalData({
        title: 'Campo Requerido',
        message: 'Por favor ingresa tu correo electrónico para continuar.'
      });
      setShowErrorModal(true);
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setErrorModalData({
        title: 'Email Inválido',
        message: 'Por favor ingresa un correo electrónico válido.'
      });
      setShowErrorModal(true);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('https://academiaparchada.onrender.com/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // NUEVO: Mostrar modal de éxito
        setShowSuccessModal(true);
      } else {
        // NUEVO: Mostrar modal de error
        let errorTitle = 'Error al Enviar';
        let errorMessage = data.message || 'No se pudo enviar el correo de recuperación';

        if (errorMessage.toLowerCase().includes('no encontrado') || 
            errorMessage.toLowerCase().includes('no existe')) {
          errorTitle = 'Email No Encontrado';
          errorMessage = 'No existe una cuenta registrada con este correo electrónico. Verifica que esté escrito correctamente.';
        } else if (errorMessage.toLowerCase().includes('conexión') || 
                   errorMessage.toLowerCase().includes('red')) {
          errorTitle = 'Error de Conexión';
          errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
        } else if (errorMessage.toLowerCase().includes('servidor')) {
          errorTitle = 'Error del Servidor';
          errorMessage = 'Ocurrió un error en el servidor. Por favor, intenta más tarde.';
        }

        setErrorModalData({
          title: errorTitle,
          message: errorMessage
        });
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error('Error:', error);
      setErrorModalData({
        title: 'Error de Conexión',
        message: 'No se pudo conectar con el servidor. Verifica tu conexión a internet e intenta nuevamente.'
      });
      setShowErrorModal(true);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    // Redirigir al login después de cerrar el modal de éxito
    navigate('/login');
  };

  return (
    <div className="page">
      <Header />

      <main className="main">
        <div className="forgot-password-container">
          <div className="forgot-password-card">
            <h1 className="forgot-password-title">¿Olvidaste tu Contraseña?</h1>
            <p className="forgot-password-subtitle">
              No te preocupes, ingresa tu correo electrónico y te enviaremos un enlace para recuperarla.
            </p>

            <form onSubmit={handleSubmit} className="forgot-password-form">
              <div className="form-group">
                <label className="form-label">Correo Electrónico</label>
                <input
                  type="email"
                  className="form-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@email.com"
                  disabled={loading}
                  required
                />
              </div>

              <button 
                type="submit" 
                className="btn-submit" 
                disabled={loading}
              >
                {loading ? 'Enviando...' : 'Enviar Enlace de Recuperación'}
              </button>
            </form>

            <div className="back-to-login">
              ¿Recordaste tu contraseña?{' '}
              <button 
                onClick={() => navigate('/login')} 
                className="link-login"
                disabled={loading}
              >
                Volver al Login
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />

      {/* NUEVO: Modal de Error */}
      <ErrorModal
        isOpen={showErrorModal}
        onClose={() => setShowErrorModal(false)}
        title={errorModalData.title}
        message={errorModalData.message}
        buttonText="Entendido"
      />

      {/* NUEVO: Modal de Éxito */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleSuccessClose}
        title="¡Correo Enviado!"
        message="Te hemos enviado un correo electrónico con las instrucciones para restablecer tu contraseña. Revisa tu bandeja de entrada y sigue los pasos indicados."
        buttonText="Ir al Login"
        onConfirm={handleSuccessClose}
      />
    </div>
  );
};
