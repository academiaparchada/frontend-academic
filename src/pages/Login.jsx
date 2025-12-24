// src/pages/Login.jsx
import { useState } from 'react';
import '../styles/Login.css';

export const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí irá la lógica de autenticación
    console.log('Login:', { email, password });
  };

  const handleSocialLogin = (provider) => {
    console.log(`Login con ${provider}`);
    // Aquí irá la lógica de autenticación social
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1 className="login-title">AQUÍ INICIA ALGO GRANDE.</h1>
        <p className="login-subtitle">
          Estás dando el primer paso para transformar tu forma de aprender.
        </p>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Correo Electrónico:
            </label>
            <input
              type="email"
              id="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Contraseña:
            </label>
            <input
              type="password"
              id="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="btn-login">
            Iniciar Sesión
          </button>

          <div className="forgot-password">
            ¿Olvidaste tu contraseña?{' '}
            <a href="#" className="link-recovery">
              Recupérala aquí.
            </a>
          </div>
        </form>

        <div className="divider">
          <span className="divider-line"></span>
          <span className="divider-text">O Inicia Con</span>
          <span className="divider-line"></span>
        </div>

        <div className="social-login">
          <button
            className="btn-social btn-microsoft"
            onClick={() => handleSocialLogin('Microsoft')}
            aria-label="Iniciar sesión con Microsoft"
          >
            <span className="social-emoji">🪟</span>
          </button>
          <button
            className="btn-social btn-google"
            onClick={() => handleSocialLogin('Google')}
            aria-label="Iniciar sesión con Google"
          >
            <span className="social-emoji">G</span>
          </button>
          <button
            className="btn-social btn-facebook"
            onClick={() => handleSocialLogin('Facebook')}
            aria-label="Iniciar sesión con Facebook"
          >
            <span className="social-emoji">f</span>
          </button>
        </div>
      </div>
    </div>
  );
};
