// src/pages/register.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/header';
import { Footer } from '../components/footer';
import { useAuth } from '../context/auth_context';
import '../styles/register.css';

export const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  // Recuperar datos del sessionStorage o usar valores vacíos
  const [nombre, set_nombre] = useState(() => sessionStorage.getItem('register_nombre') || '');
  const [apellido, set_apellido] = useState(() => sessionStorage.getItem('register_apellido') || '');
  const [email, set_email] = useState(() => sessionStorage.getItem('register_email') || '');
  const [telefono, set_telefono] = useState(() => sessionStorage.getItem('register_telefono') || '');
  const [password, set_password] = useState(() => sessionStorage.getItem('register_password') || '');
  const [confirm_password, set_confirm_password] = useState(() => sessionStorage.getItem('register_confirm_password') || '');
  const [accept_terms, set_accept_terms] = useState(() => sessionStorage.getItem('register_accept_terms') === 'true');
  const [error, set_error] = useState('');
  const [loading, set_loading] = useState(false);

  // Guardar datos en sessionStorage cuando cambien
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

    // Validaciones frontend
    if (password !== confirm_password) {
      set_error('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      set_error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (!accept_terms) {
      set_error('Debes aceptar los términos y condiciones');
      return;
    }

    set_loading(true);

    const user_data = {
      nombre,
      apellido,
      email,
      telefono,
      password
    };

    const result = await register(user_data);
    
    set_loading(false);

    if (result.success) {
      // Limpiar sessionStorage después del registro exitoso
      sessionStorage.removeItem('register_nombre');
      sessionStorage.removeItem('register_apellido');
      sessionStorage.removeItem('register_email');
      sessionStorage.removeItem('register_telefono');
      sessionStorage.removeItem('register_password');
      sessionStorage.removeItem('register_confirm_password');
      sessionStorage.removeItem('register_accept_terms');
      
      // Redirigir al dashboard de estudiante
      navigate('/estudiante/dashboard');
    } else {
      // Mostrar errores
      if (result.errors && result.errors.length > 0) {
        const error_messages = result.errors.map(err => err.message).join(', ');
        set_error(error_messages);
      } else {
        set_error(result.message);
      }
    }
  };

  const handle_social = (provider) => {
    set_error(`Registro con ${provider} aún no disponible`);
  };

  return (
    <div className="page">
      <Header />

      <main className="main">
        <div className="register_container">
          <div className="register_card">
            <h1 className="register_title">AQUÍ INICIA ALGO GRANDE.</h1>
            <p className="register_subtitle">
              Estás dando el primer paso para transformar tu forma de aprender.
            </p>

            {error && (
              <div className="error_message">
                {error}
              </div>
            )}

            <form onSubmit={handle_submit} className="register_form">
              <div className="form_group">
                <label htmlFor="nombre" className="form_label">
                  Nombre:
                </label>
                <input
                  type="text"
                  id="nombre"
                  className="form_input"
                  value={nombre}
                  onChange={(e) => set_nombre(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="form_group">
                <label htmlFor="apellido" className="form_label">
                  Apellido:
                </label>
                <input
                  type="text"
                  id="apellido"
                  className="form_input"
                  value={apellido}
                  onChange={(e) => set_apellido(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="form_group">
                <label htmlFor="email" className="form_label">
                  Correo Electronico:
                </label>
                <input
                  type="email"
                  id="email"
                  className="form_input"
                  value={email}
                  onChange={(e) => set_email(e.target.value)}
                  required
                  disabled={loading}
                />
              </div>

              <div className="form_group">
                <label htmlFor="telefono" className="form_label">
                  Teléfono (Opcional):
                </label>
                <input
                  type="tel"
                  id="telefono"
                  className="form_input"
                  value={telefono}
                  onChange={(e) => set_telefono(e.target.value)}
                  disabled={loading}
                />
              </div>

              <div className="form_group">
                <label htmlFor="password" className="form_label">
                  Contraseña:
                </label>
                <input
                  type="password"
                  id="password"
                  className="form_input"
                  value={password}
                  onChange={(e) => set_password(e.target.value)}
                  required
                  disabled={loading}
                  minLength={6}
                />
              </div>

              <div className="form_group">
                <label htmlFor="confirm_password" className="form_label">
                  Confirmar Contraseña:
                </label>
                <input
                  type="password"
                  id="confirm_password"
                  className="form_input"
                  value={confirm_password}
                  onChange={(e) => set_confirm_password(e.target.value)}
                  required
                  disabled={loading}
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
                    Términos y Condiciones y Política de Privacidad.
                  </a>
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
                onClick={() => handle_social('Microsoft')}
                aria-label="Registrarse con Microsoft"
                disabled={loading}
              >
                <img 
                  src="/images/image.png" 
                  alt="Microsoft" 
                  className="social_icon"
                />
              </button>
              <button
                className="btn_social"
                onClick={() => handle_social('Google')}
                aria-label="Registrarse con Google"
                disabled={loading}
              >
                <img 
                  src="/images/google.png" 
                  alt="Google" 
                  className="social_icon"
                />
              </button>
              <button
                className="btn_social"
                onClick={() => handle_social('Facebook')}
                aria-label="Registrarse con Facebook"
                disabled={loading}
              >
                <img 
                  src="/images/facebook.png" 
                  alt="Facebook" 
                  className="social_icon"
                />
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
