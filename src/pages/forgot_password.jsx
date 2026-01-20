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
  const [is_google_account, set_is_google_account] = useState(false);

  const handle_submit = async (e) => {
    e.preventDefault();
    set_error('');
    set_message('');
    set_is_google_account(false);
    set_loading(true);

    try {
      const response = await fetch('https://api.parcheacademico.com/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      const data = await response.json().catch(() => ({}));

      // Caso cuenta Google (400)
      if (!response.ok) {
        const backend_message = data?.message || 'No fue posible procesar la solicitud.';
        set_error(backend_message);

        if (
          typeof backend_message === 'string' &&
          backend_message.toLowerCase().includes('google')
        ) {
          set_is_google_account(true);
        }

        return;
      }

      // 200 OK (si existe o no existe, el backend responde genérico)
      set_message(
        data?.message ||
          'Si el correo existe, se enviará un link para restablecer la contraseña. Revisa tu correo.'
      );
    } catch (err) {
      set_error('Error al enviar el correo. Por favor intenta de nuevo.');
    } finally {
      set_loading(false);
    }
  };

  const handle_go_to_google_login = () => {
    // Ya tienes login con Google en /login; para no duplicar lógica, enviamos al usuario allá.
    navigate('/login');
  };

  return (
    <div className="page">
      <Header />

      <main className="login-page">
        <div className="login-container">
          <div className="login-card">
            <h1 className="login-title">GUARDA BIEN TUS CREDENCIALES.</h1>

            <p className="login-subtitle">
              Recuerda guardar bien tus contraseñas y no compartirlas con nadie.
            </p>

            {message && <div className="success-message">{message}</div>}
            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handle_submit} className="login-form">
              <div className="form-group">
                <label className="form-label">Correo Electronico:</label>
                <input
                  type="email"
                  className="form-input"
                  value={email}
                  onChange={(e) => set_email(e.target.value)}
                  placeholder="usuario@dominio.com"
                  required
                  disabled={loading}
                />
              </div>

              <button type="submit" className="btn-login" disabled={loading}>
                {loading ? 'Enviando...' : 'Enviar link'}
              </button>
            </form>

            {is_google_account && (
              <div style={{ marginTop: '1rem', textAlign: 'center' }}>
                <button
                  type="button"
                  className="btn-login"
                  onClick={handle_go_to_google_login}
                  disabled={loading}
                >
                  Iniciar sesión con Google
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
