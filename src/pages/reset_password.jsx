// src/pages/reset_password.jsx
import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Header } from '../components/header';
import { Footer } from '../components/footer';
import { PasswordInput } from '../components/PasswordInput';
import { ErrorModal } from '../components/ErrorModal'; // NUEVO
import { SuccessModal } from '../components/SuccessModal'; // NUEVO
import '../styles/reset_password.css';

export const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // NUEVO: Estados para modals
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [errorModalData, setErrorModalData] = useState({
    title: '',
    message: '',
    errors: []
  });

  // Validar que existe el token
  useEffect(() => {
    if (!token) {
      setErrorModalData({
        title: 'Token No Válido',
        message: 'El enlace de recuperación no es válido o ha expirado. Por favor, solicita un nuevo enlace.',
        errors: []
      });
      setShowErrorModal(true);
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // NUEVO: Validación con array de errores
    const validationErrors = [];

    if (!password) {
      validationErrors.push('La contraseña es obligatoria');
    } else if (password.length < 6) {
      validationErrors.push('La contraseña debe tener al menos 6 caracteres');
    }

    if (!confirmPassword) {
      validationErrors.push('Debes confirmar tu contraseña');
    } else if (password !== confirmPassword) {
      validationErrors.push('Las contraseñas no coinciden');
    }

    if (!token) {
      validationErrors.push('El token de recuperación no es válido');
    }

    // NUEVO: Si hay errores de validación, mostrar modal
    if (validationErrors.length > 0) {
      setErrorModalData({
        title: 'Errores en el Formulario',
        message: 'Por favor corrige los siguientes errores:',
        errors: validationErrors
      });
      setShowErrorModal(true);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch('https://academiaparchada.onrender.com/api/auth/reset-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          token, 
          password 
        }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // NUEVO: Mostrar modal de éxito
        setShowSuccessModal(true);
      } else {
        // NUEVO: Mostrar modal de error
        let errorTitle = 'Error al Restablecer';
        let errorMessage = data.message || 'No se pudo restablecer tu contraseña';

        if (errorMessage.toLowerCase().includes('expirado') || 
            errorMessage.toLowerCase().includes('inválido') ||
            errorMessage.toLowerCase().includes('invalido')) {
          errorTitle = 'Token Expirado';
          errorMessage = 'El enlace de recuperación ha expirado o no es válido. Por favor, solicita un nuevo enlace de recuperación.';
        } else if (errorMessage.toLowerCase().includes('conexión') || 
                   errorMessage.toLowerCase().includes('red')) {
          errorTitle = 'Error de Conexión';
          errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
        }

        setErrorModalData({
          title: errorTitle,
          message: errorMessage,
          errors: []
        });
        setShowErrorModal(true);
      }
    } catch (error) {
      console.error('Error:', error);
      setErrorModalData({
        title: 'Error de Conexión',
        message: 'No se pudo conectar con el servidor. Verifica tu conexión a internet e intenta nuevamente.',
        errors: []
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

  const handleErrorWithRedirect = () => {
    setShowErrorModal(false);
    // Si el error es por token inválido, redirigir a forgot-password
    if (errorModalData.title === 'Token No Válido' || 
        errorModalData.title === 'Token Expirado') {
      navigate('/forgot-password');
    }
  };

  return (
    <div className="page">
      <Header />

      <main className="main">
        <div className="reset-password-container">
          <div className="reset-password-card">
            <h1 className="reset-password-title">Restablecer Contraseña</h1>
            <p className="reset-password-subtitle">
              Ingresa tu nueva contraseña a continuación.
            </p>

            <form onSubmit={handleSubmit} className="reset-password-form">
              <div className="form-group">
                <label className="form-label">Nueva Contraseña</label>
                <PasswordInput
                  name="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  disabled={loading}
                  required={true}
                  minLength={6}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Confirmar Contraseña</label>
                <PasswordInput
                  name="confirmPassword"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repite tu contraseña"
                  disabled={loading}
                  required={true}
                />
              </div>

              <button 
                type="submit" 
                className="btn-submit" 
                disabled={loading || !token}
              >
                {loading ? 'Restableciendo...' : 'Restablecer Contraseña'}
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
        onClose={handleErrorWithRedirect}
        title={errorModalData.title}
        message={errorModalData.message}
        errors={errorModalData.errors}
        buttonText={
          errorModalData.title === 'Token No Válido' || 
          errorModalData.title === 'Token Expirado' 
            ? 'Solicitar Nuevo Enlace' 
            : 'Entendido'
        }
      />

      {/* NUEVO: Modal de Éxito */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={handleSuccessClose}
        title="¡Contraseña Restablecida!"
        message="Tu contraseña ha sido restablecida exitosamente. Ya puedes iniciar sesión con tu nueva contraseña."
        buttonText="Ir al Login"
        onConfirm={handleSuccessClose}
      />
    </div>
  );
};
