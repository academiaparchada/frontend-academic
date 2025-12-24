// src/pages/register.jsx
import { useState } from 'react';
import { Header } from '../components/header';
import { Footer } from '../components/footer';
import '../styles/register.css';

export const Register = () => {
  const [name, set_name] = useState('');
  const [lastname, set_lastname] = useState('');
  const [email, set_email] = useState('');
  const [password, set_password] = useState('');
  const [confirm_password, set_confirm_password] = useState('');
  const [accept_terms, set_accept_terms] = useState(false);

  const handle_submit = (e) => {
    e.preventDefault();
    if (password !== confirm_password) {
      alert('Las contraseñas no coinciden');
      return;
    }
    if (!accept_terms) {
      alert('Debes aceptar los términos y condiciones');
      return;
    }
    console.log('Registro:', { name, lastname, email, password });
  };

  const handle_social = (provider) => {
    console.log(`Registro con ${provider}`);
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

            <form onSubmit={handle_submit} className="register_form">
              <div className="form_group">
                <label htmlFor="name" className="form_label">
                  Nombre:
                </label>
                <input
                  type="text"
                  id="name"
                  className="form_input"
                  value={name}
                  onChange={(e) => set_name(e.target.value)}
                  required
                />
              </div>

              <div className="form_group">
                <label htmlFor="lastname" className="form_label">
                  Apellido:
                </label>
                <input
                  type="text"
                  id="lastname"
                  className="form_input"
                  value={lastname}
                  onChange={(e) => set_lastname(e.target.value)}
                  required
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

              <button type="submit" className="btn_register">
                Registrarse
              </button>
            </form>

            <div className="divider">
              <span className="divider_line"></span>
              <span className="divider_text">O Inicia Con</span>
              <span className="divider_line"></span>
            </div>

            <div className="social_register">
              <button
                className="btn_social btn_microsoft"
                onClick={() => handle_social('Microsoft')}
                aria-label="Registrarse con Microsoft"
              >
                <span className="social_emoji">🪟</span>
              </button>
              <button
                className="btn_social btn_google"
                onClick={() => handle_social('Google')}
                aria-label="Registrarse con Google"
              >
                <span className="social_emoji">G</span>
              </button>
              <button
                className="btn_social btn_facebook"
                onClick={() => handle_social('Facebook')}
                aria-label="Registrarse con Facebook"
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
