// src/pages/login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/header';
import { Footer } from '../components/footer';
import { PasswordInput } from '../components/PasswordInput';
import { useAuth } from '../context/auth_context';
import '../styles/login.css';

export const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [email, set_email] = useState('');
  const [password, set_password] = useState('');
  const [error, set_error] = useState('');
  const [loading, set_loading] = useState(false);

  const handle_submit = async (e) => {
    e.preventDefault();
    set_error('');
    set_loading(true);

    const result = await login(email, password);
    
    set_loading(false);

    if (result.success) {
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
      set_error(result.message);
    }
  };

  const handle_social = (provider) => {
    set_error(`Inicio de sesión con ${provider} aún no disponible`);
  };

  const handle_forgot_password = (e) => {
    e.preventDefault();
    navigate('/forgot-password');
  };

  return (
    <div className="page">
      <Header />

      <main className="main">
        <div className="login_container">
          <div className="login_card">
            <h1 className="login_title">AQUÍ INICIA ALGO GRANDE.</h1>
            <p className="login_subtitle">
              Estás dando el primer paso para transformar tu forma de aprender.
            </p>

            {error && (
              <div className="error_message">
                {error}
              </div>
            )}

            <form onSubmit={handle_submit} className="login_form">
              <div className="form_group">
                <label htmlFor="email" className="form_label">
                  Correo Electrónico:
                </label>
                <input
                  type="email"
                  id="email"
                  className="form_input"
                  value={email}
                  onChange={(e) => set_email(e.target.value)}
                  placeholder="Ingresa tu correo electrónico "
                  required
                  disabled={loading}
                />
              </div>

              <div className="form_group">
                <label htmlFor="password" className="form_label">
                  Contraseña:
                </label>
                <PasswordInput
                  name="password"
                  value={password}
                  onChange={(e) => set_password(e.target.value)}
                  placeholder="Ingresa tu contraseña"
                  disabled={loading}
                  required={true}
                />
              </div>

              <button type="submit" className="btn_login" disabled={loading}>
                {loading ? 'Iniciando sesión...' : 'Iniciar Sesión'}
              </button>

              <div className="forgot_pass">
                ¿Olvidaste tu contraseña?{' '}
                <a href="#" onClick={handle_forgot_password} className="link_recovery">
                  Recupérala aquí.
                </a>
              </div>
            </form>

            <div className="divider">
              <span className="divider_line"></span>
              <span className="divider_text">O Inicia Con</span>
              <span className="divider_line"></span>
            </div>

            <div className="social_login">
              <button
                className="btn_social"
                onClick={() => handle_social('Microsoft')}
                aria-label="Iniciar sesión con Microsoft"
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
                aria-label="Iniciar sesión con Google"
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
                aria-label="Iniciar sesión con Facebook"
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
