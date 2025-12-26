// src/pages/forgot_password.jsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Header } from '../components/header';
import { Footer } from '../components/footer';
import '../styles/forgot_password.css';

export const ForgotPassword = () => {
  const navigate = useNavigate();
  const [email, set_email] = useState('');
  const [loading, set_loading] = useState(false);
  const [message, set_message] = useState('');
  const [error, set_error] = useState('');

  const handle_submit = async (e) => {
    e.preventDefault();
    set_error('');
    set_message('');
    set_loading(true);

    try {
      // Aquí irá la integración con el backend cuando esté disponible
      // Por ahora simularemos el envío
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      set_message(`Se ha enviado un correo a ${email} con las instrucciones para recuperar tu contraseña.`);
      
      // Redirigir después de 3 segundos
      setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      set_error('Error al enviar el correo. Por favor intenta de nuevo.');
    } finally {
      set_loading(false);
    }
  };

  return (
    <div className="page">
      <Header />

      <main className="main">
        <div className="forgot_password_container">
          <div className="forgot_password_card">
            <h1 className="forgot_password_title">GUARDA BIEN TUS CREDENCIALES.</h1>
            <p className="forgot_password_subtitle">
              Recuerda guardar bien tus contraseñas y no compartirlas con nadie.
            </p>

            {message && (
              <div className="success_message">
                {message}
              </div>
            )}

            {error && (
              <div className="error_message">
                {error}
              </div>
            )}

            <form onSubmit={handle_submit} className="forgot_password_form">
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

              <button type="submit" className="btn_send" disabled={loading}>
                {loading ? 'Enviando...' : 'Enviar Correo'}
              </button>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
