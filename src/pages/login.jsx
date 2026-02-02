// src/pages/login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/header';
import { Footer } from '../components/footer';
import { PasswordInput } from '../components/PasswordInput';
import { ErrorModal } from '../components/ErrorModal'; // NUEVO
import { useAuth } from '../context/auth_context';
import googleAuthService from '../services/google_auth_service';
import analyticsService from '../services/analytics_service';
import '../styles/login.css';

export const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, set_email] = useState('');
  const [password, set_password] = useState('');
  const [error, set_error] = useState('');
  const [loading, set_loading] = useState(false);
  
  // NUEVO: Estado para el modal de error
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorModalData, setErrorModalData] = useState({
    title: '',
    message: ''
  });

  const handle_submit = async (e) => {
    e.preventDefault();
    set_error('');
    set_loading(true);

    const result = await login(email, password);
    set_loading(false);

    if (result.success) {
      analyticsService.event('login', { method: 'email_password' });

      console.log('Login exitoso - Datos completos:', result);
      console.log('Usuario:', result.data?.user);
      console.log('Rol del usuario:', result.data?.user?.rol);

      let user_role = result.data?.user?.rol || result.data?.rol || result.user?.rol;
      console.log('Rol detectado:', user_role);

      if (user_role === 'admin' || user_role === 'administrador') {
        console.log('Redirigiendo a dashboard de admin');
        navigate('/admin/dashboard');
      } else if (user_role === 'profesor' || user_role === 'teacher') {
        console.log('Redirigiendo a dashboard de profesor');
        navigate('/profesor/dashboard');
      } else {
        console.log('Redirigiendo a dashboard de estudiante');
        navigate('/estudiante/dashboard');
      }
    } else {
      // NUEVO: Mostrar error en modal en lugar de inline
      let errorTitle = 'Error al Iniciar Sesión';
      let errorMessage = result.message || 'Ocurrió un error inesperado';

      // Personalizar mensaje según el tipo de error
      if (errorMessage.toLowerCase().includes('credenciales')) {
        errorTitle = 'Credenciales Incorrectas';
        errorMessage = 'El correo electrónico o la contraseña son incorrectos. Por favor, verifica tus datos.';
      } else if (errorMessage.toLowerCase().includes('usuario no encontrado')) {
        errorTitle = 'Usuario No Encontrado';
        errorMessage = 'No existe una cuenta asociada a este correo electrónico.';
      } else if (errorMessage.toLowerCase().includes('conexión') || errorMessage.toLowerCase().includes('red')) {
        errorTitle = 'Error de Conexión';
        errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
      }

      setErrorModalData({
        title: errorTitle,
        message: errorMessage
      });
      setShowErrorModal(true);
    }
  };

  const handle_google_login = async () => {
    try {
      set_error('');
      set_loading(true);
      console.log('🔐 Iniciando login con Google...');

      analyticsService.event('login', { method: 'google' });

      const result = await googleAuthService.signInWithGoogle();

      if (!result.success) {
        // NUEVO: Mostrar error de Google en modal
        setErrorModalData({
          title: 'Error con Google',
          message: result.message || 'No se pudo iniciar sesión con Google. Intenta nuevamente.'
        });
        setShowErrorModal(true);
        set_loading(false);
      }
    } catch (err) {
      console.error('❌ Error al iniciar login con Google:', err);
      setErrorModalData({
        title: 'Error con Google',
        message: 'Ocurrió un error al conectar con Google. Por favor, intenta más tarde.'
      });
      setShowErrorModal(true);
      set_loading(false);
    }
  };

  const handle_forgot_password = (e) => {
    e.preventDefault();
    navigate('/forgot-password');
  };

  return (
    <div className="page">
      <Header />

      <main className="login-page">
        <div className="login-container">
          <div className="login-card">
            <h1 className="login-title">AQUÍ INICIA ALGO GRANDE.</h1>

            <p className="login-subtitle">
              Estás dando el primer paso para transformar tu forma de aprender.
            </p>

            <form onSubmit={handle_submit} className="login-form">
              <div className="form-group">
                <label className="form-label">Correo Electronico:</label>
                <input
                  type="email"
                  className="form-input"
                  value={email}
                  onChange={(e) => set_email(e.target.value)}
                  placeholder="Ingresa tu correo electrónico"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Contraseña:</label>
                <PasswordInput
                  name="password"
                  value={password}
                  onChange={(e) => set_password(e.target.value)}
                  placeholder="Ingresa tu contraseña"
                  disabled={loading}
                  required={true}
                />
              </div>

              <button type="submit" className="btn-login" disabled={loading}>
                {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </button>
            </form>

            <div className="forgot-password">
              ¿Olvidaste tu contraseña?{' '}
              <a href="#" onClick={handle_forgot_password} className="link-recovery">
                Recupérala aquí.
              </a>
            </div>

            <div className="divider">
              <span className="divider-line"></span>
              <span className="divider-text">O Inicia Con</span>
              <span className="divider-line"></span>
            </div>

            <div className="social-login">
              <button
                className="btn-social"
                onClick={handle_google_login}
                aria-label="Iniciar sesión con Google"
                disabled={loading}
              >
                <img src="/images/google.png" alt="Google" className="social-icon" />
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
    </div>
  );
};
