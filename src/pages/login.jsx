// src/pages/login.jsx
import { useState } from 'react';
import { Header } from '../components/header';
import { Footer } from '../components/footer';
import '../styles/login.css';

export const Login = () => {
  const [email, set_email] = useState('');
  const [password, set_password] = useState('');

  const handle_submit = (e) => {
    e.preventDefault();
    console.log('Login:', { email, password });
  };

  const handle_social = (provider) => {
    console.log(`Login con ${provider}`);
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
                  required
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
                />
              </div>

              <button type="submit" className="btn_login">
                Iniciar Sesión
              </button>

              <div className="forgot_pass">
                ¿Olvidaste tu contraseña?{' '}
                <a href="#" className="link_recovery">
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
                className="btn_social btn_microsoft"
                onClick={() => handle_social('Microsoft')}
                aria-label="Iniciar sesión con Microsoft"
              >
                <span className="social_emoji">🪟</span>
              </button>
              <button
                className="btn_social btn_google"
                onClick={() => handle_social('Google')}
                aria-label="Iniciar sesión con Google"
              >
                <span className="social_emoji">G</span>
              </button>
              <button
                className="btn_social btn_facebook"
                onClick={() => handle_social('Facebook')}
                aria-label="Iniciar sesión con Facebook"
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
