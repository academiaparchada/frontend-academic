// src/pages/login.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/header';
import { Footer } from '../components/footer';
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
      // Redirigir según el rol del usuario
      const user_role = result.data.user.rol;
      if (user_role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user_role === 'profesor') {
        navigate('/profesor/dashboard');
      } else {
        navigate('/estudiante/dashboard');
      }
    } else {
      set_error(result.message);
    }
  };

  const handle_social = (provider) => {
    set_error(`Inicio de sesi\u00f3n con ${provider} a\u00fan no disponible`);
  };

  return (
    <div className="page">
      <Header />

      <main className="main">
        <div className="login_container">
          <div className="login_card">
            <h1 className="login_title">AQUI INICIA ALGO GRANDE.</h1>
            <p className="login_subtitle">
              Estas dando el primer paso para transformar tu forma de aprender.
            </p>

            {error && (
              <div className="error_message">
                {error}
              </div>
            )}

            <form onSubmit={handle_submit} className="login_form">
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
                />
              </div>

              <button type="submit" className="btn_login" disabled={loading}>
                {loading ? 'Iniciando sesi\u00f3n...' : 'Iniciar Sesi\u00f3n'}
              </button>

              <div className="forgot_pass">
                ¿Olvidaste tu contraseña?{' '}
                <a href="#" className="link_recovery">
                  Recuperala aqui.
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
                className="btn_social btn_microsoft"
                onClick={() => handle_social('Microsoft')}
                aria-label="Iniciar sesi\u00f3n con Microsoft"
                disabled={loading}
              >
                <span className="social_emoji">M</span>
              </button>
              <button
                className="btn_social btn_google"
                onClick={() => handle_social('Google')}
                aria-label="Iniciar sesi\u00f3n con Google"
                disabled={loading}
              >
                <span className="social_emoji">G</span>
              </button>
              <button
                className="btn_social btn_facebook"
                onClick={() => handle_social('Facebook')}
                aria-label="Iniciar sesi\u00f3n con Facebook"
                disabled={loading}
              >
                <span className="social_emoji">f</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
