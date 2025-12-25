// src/pages/register.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/header';
import { Footer } from '../components/footer';
import { useAuth } from '../context/auth_context';
import '../styles/register.css';

export const Register = () => {
  const navigate = useNavigate();
  const { register } = useAuth();
  
  const [nombre, set_nombre] = useState('');
  const [apellido, set_apellido] = useState('');
  const [email, set_email] = useState('');
  const [telefono, set_telefono] = useState('');
  const [password, set_password] = useState('');
  const [confirm_password, set_confirm_password] = useState('');
  const [accept_terms, set_accept_terms] = useState(false);
  const [error, set_error] = useState('');
  const [loading, set_loading] = useState(false);

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
                  <a href="#" className="terms_link">
                    Términos y Condiciones
                  </a>{' '}
                  y ha leído nuestra{' '}
                  <a href="#" className="terms_link">
                    Política de Privacidad.
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
