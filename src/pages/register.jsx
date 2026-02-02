// src/pages/register.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/header';
import { Footer } from '../components/footer';
import { PasswordInput } from '../components/PasswordInput';
import { ErrorModal } from '../components/ErrorModal'; // NUEVO
import { useAuth } from '../context/auth_context';
import { getBrowserTimeZone, getAllTimeZoneOptions } from '../utils/timezone';
import googleAuthService from '../services/google_auth_service';
import analyticsService from '../services/analytics_service';
import '../styles/register.css';

export const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();

  const [nombre, set_nombre] = useState(() => sessionStorage.getItem('register_nombre') || '');
  const [apellido, set_apellido] = useState(() => sessionStorage.getItem('register_apellido') || '');
  const [email, set_email] = useState(() => sessionStorage.getItem('register_email') || '');
  const [telefono, set_telefono] = useState(() => sessionStorage.getItem('register_telefono') || '');
  const [timezone, set_timezone] = useState(() => sessionStorage.getItem('register_timezone') || getBrowserTimeZone());
  const [password, set_password] = useState(() => sessionStorage.getItem('register_password') || '');
  const [confirm_password, set_confirm_password] = useState(() => sessionStorage.getItem('register_confirm_password') || '');
  const [accept_terms, set_accept_terms] = useState(() => sessionStorage.getItem('register_accept_terms') === 'true');
  const [error, set_error] = useState('');
  const [loading, set_loading] = useState(false);

  // NUEVO: Estados para el modal de error
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorModalData, setErrorModalData] = useState({
    title: '',
    message: '',
    errors: []
  });

  useEffect(() => {
    sessionStorage.setItem('register_nombre', nombre);
  }, [nombre]);

  useEffect(() => {
    sessionStorage.setItem('register_apellido', apellido);
  }, [apellido]);

  useEffect(() => {
    sessionStorage.setItem('register_email', email);
  }, [email]);

  useEffect(() => {
    sessionStorage.setItem('register_telefono', telefono);
  }, [telefono]);

  useEffect(() => {
    sessionStorage.setItem('register_timezone', timezone);
  }, [timezone]);

  useEffect(() => {
    sessionStorage.setItem('register_password', password);
  }, [password]);

  useEffect(() => {
    sessionStorage.setItem('register_confirm_password', confirm_password);
  }, [confirm_password]);

  useEffect(() => {
    sessionStorage.setItem('register_accept_terms', accept_terms);
  }, [accept_terms]);

  const handle_submit = async (e) => {
    e.preventDefault();
    set_error('');

    // NUEVO: Validación con array de errores
    const validationErrors = [];

    if (!nombre.trim()) {
      validationErrors.push('El nombre es obligatorio');
    }

    if (!apellido.trim()) {
      validationErrors.push('El apellido es obligatorio');
    }

    if (!email.trim()) {
      validationErrors.push('El correo electrónico es obligatorio');
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      validationErrors.push('El formato del correo electrónico no es válido');
    }

    if (!password) {
      validationErrors.push('La contraseña es obligatoria');
    } else if (password.length < 6) {
      validationErrors.push('La contraseña debe tener al menos 6 caracteres');
    }

    if (password !== confirm_password) {
      validationErrors.push('Las contraseñas no coinciden');
    }

    if (!accept_terms) {
      validationErrors.push('Debes aceptar los términos y condiciones');
    }

    if (!timezone) {
      validationErrors.push('Debes seleccionar una zona horaria');
    }

    // NUEVO: Si hay errores de validación, mostrar modal
    if (validationErrors.length > 0) {
      setErrorModalData({
        title: 'Errores en el Formulario',
        message: 'Por favor corrige los siguientes errores antes de continuar:',
        errors: validationErrors
      });
      setShowErrorModal(true);
      return;
    }

    set_loading(true);

    const user_data = {
      nombre,
      apellido,
      email,
      telefono,
      password,
      timezone
    };

    const result = await register(user_data);
    set_loading(false);

    if (result.success) {
      analyticsService.event('sign_up', { method: 'email_password' });

      // Limpiar sessionStorage
      sessionStorage.removeItem('register_nombre');
      sessionStorage.removeItem('register_apellido');
      sessionStorage.removeItem('register_email');
      sessionStorage.removeItem('register_telefono');
      sessionStorage.removeItem('register_timezone');
      sessionStorage.removeItem('register_password');
      sessionStorage.removeItem('register_confirm_password');
      sessionStorage.removeItem('register_accept_terms');

      navigate('/estudiante/dashboard');
    } else {
      // NUEVO: Manejar errores del servidor con modal
      let errorTitle = 'Error al Registrarse';
      let errorMessage = '';
      let errorList = [];

      // Si el servidor devuelve múltiples errores
      if (result.errors && result.errors.length > 0) {
        errorMessage = 'Se encontraron los siguientes problemas:';
        errorList = result.errors.map(err => err.message || err);
      } else {
        // Error único del servidor
        errorMessage = result.message || 'Ocurrió un error al crear tu cuenta';

        // Personalizar mensajes comunes
        if (errorMessage.toLowerCase().includes('email') && errorMessage.toLowerCase().includes('existe')) {
          errorTitle = 'Cuenta Ya Existente';
          errorMessage = 'Ya existe una cuenta registrada con este correo electrónico. ¿Deseas iniciar sesión?';
        } else if (errorMessage.toLowerCase().includes('conexión') || errorMessage.toLowerCase().includes('red')) {
          errorTitle = 'Error de Conexión';
          errorMessage = 'No se pudo conectar con el servidor. Verifica tu conexión a internet.';
        }
      }

      setErrorModalData({
        title: errorTitle,
        message: errorMessage,
        errors: errorList
      });
      setShowErrorModal(true);
    }
  };

  const handle_google_register = async () => {
    try {
      set_error('');
      set_loading(true);
      console.log('🔐 Iniciando registro con Google...');

      analyticsService.event('sign_up', { method: 'google' });

      const result = await googleAuthService.signInWithGoogle();
      if (!result.success) {
        // NUEVO: Mostrar error de Google en modal
        setErrorModalData({
          title: 'Error con Google',
          message: result.message || 'No se pudo completar el registro con Google. Intenta nuevamente.',
          errors: []
        });
        setShowErrorModal(true);
        set_loading(false);
      }
    } catch (err) {
      console.error('❌ Error al iniciar registro:', err);
      setErrorModalData({
        title: 'Error con Google',
        message: 'Ocurrió un error al conectar con Google. Por favor, intenta más tarde.',
        errors: []
      });
      setShowErrorModal(true);
      set_loading(false);
    }
  };

  return (
    <div className="page">
      <Header />

      <main className="main">
        <div className="register_container">
          <div className="register_card">
            <h1 className="register_title">AQUÍ INICIA ALGO GRANDE.</h1>
            <p className="register_subtitle">Estás dando el primer paso para transformar tu forma de aprender.</p>

            <form onSubmit={handle_submit} className="register_form">
              <div className="form_group">
                <label htmlFor="nombre" className="form_label">Nombre</label>
                <input
                  type="text"
                  id="nombre"
                  className="form_input"
                  value={nombre}
                  onChange={(e) => set_nombre(e.target.value)}
                  placeholder="Ingresa tu nombre"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form_group">
                <label htmlFor="apellido" className="form_label">Apellido</label>
                <input
                  type="text"
                  id="apellido"
                  className="form_input"
                  value={apellido}
                  onChange={(e) => set_apellido(e.target.value)}
                  placeholder="Ingresa tu apellido"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form_group">
                <label htmlFor="email" className="form_label">Correo Electrónico</label>
                <input
                  type="email"
                  id="email"
                  className="form_input"
                  value={email}
                  onChange={(e) => set_email(e.target.value)}
                  placeholder="Ingresa tu correo electrónico"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form_group">
                <label htmlFor="telefono" className="form_label">Teléfono</label>
                <input
                  type="tel"
                  id="telefono"
                  className="form_input"
                  value={telefono}
                  onChange={(e) => set_telefono(e.target.value)}
                  placeholder="Ingresa tu número telefónico"
                  disabled={loading}
                />
              </div>

              <div className="form_group">
                <label htmlFor="timezone" className="form_label">Zona Horaria</label>
                <select
                  id="timezone"
                  className="form_input"
                  value={timezone}
                  onChange={(e) => set_timezone(e.target.value)}
                  disabled={loading}
                  required
                >
                  {getAllTimeZoneOptions().map((tz) => (
                    <option key={tz.value} value={tz.value}>
                      {tz.label}
                    </option>
                  ))}
                </select>
                <small className="form_hint">Se detectó automáticamente tu zona horaria actual</small>
              </div>

              <div className="form_group">
                <label htmlFor="password" className="form_label">Contraseña</label>
                <PasswordInput
                  name="password"
                  value={password}
                  onChange={(e) => set_password(e.target.value)}
                  placeholder="Ingresa tu contraseña"
                  disabled={loading}
                  required={true}
                  minLength={6}
                />
              </div>

              <div className="form_group">
                <label htmlFor="confirm_password" className="form_label">Confirmar Contraseña</label>
                <PasswordInput
                  name="confirm_password"
                  value={confirm_password}
                  onChange={(e) => set_confirm_password(e.target.value)}
                  placeholder="Repite tu contraseña"
                  disabled={loading}
                  required={true}
                />
              </div>

              <div className="terms_group">
                <input
                  type="checkbox"
                  id="terms"
                  className="terms_checkbox"
                  checked={accept_terms}
                  onChange={(e) => set_accept_terms(e.target.checked)}
                  required
                  disabled={loading}
                />
                <label htmlFor="terms" className="terms_label">
                  Al registrarse y utilizar los servicios, usted confirma que ha aceptado nuestros{' '}
                  <a href="/terms-and-policies" className="terms_link" target="_blank" rel="noopener noreferrer">
                    Términos y Condiciones y Política de Privacidad
                  </a>.
                </label>
              </div>

              <button type="submit" className="btn_register" disabled={loading}>
                {loading ? 'Registrando...' : 'Registrarse'}
              </button>
            </form>

            <div className="divider">
              <span className="divider_line"></span>
              <span className="divider_text">O Inicia Con</span>
              <span className="divider_line"></span>
            </div>

            <div className="social_register">
              <button
                className="btn_social"
                onClick={handle_google_register}
                aria-label="Registrarse con Google"
                disabled={loading}
              >
                <img src="/images/google.png" alt="Google" className="social_icon" />
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
        errors={errorModalData.errors}
        buttonText="Entendido"
      />
    </div>
  );
};
