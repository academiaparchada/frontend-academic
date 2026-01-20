// src/pages/reset_password.jsx
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Header } from '../components/header';
import { Footer } from '../components/footer';
import '../styles/Login.css';

export const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const email = useMemo(() => searchParams.get('email') || '', [searchParams]);
  const token = useMemo(() => searchParams.get('token') || '', [searchParams]);

  const [new_password, set_new_password] = useState('');
  const [confirm_password, set_confirm_password] = useState('');
  const [loading, set_loading] = useState(false);
  const [message, set_message] = useState('');
  const [error, set_error] = useState('');
  const [is_google_account, set_is_google_account] = useState(false);

  useEffect(() => {
    // Si falta email o token, no tiene sentido mostrar el form
    if (!email || !token) {
      set_error('Link inválido. Solicita un nuevo link para restablecer tu contraseña.');
    }
  }, [email, token]);

  const handle_submit = async (e) => {
    e.preventDefault();
    set_error('');
    set_message('');
    set_is_google_account(false);

    if (!email || !token) {
      set_error('Link inválido. Solicita un nuevo link para restablecer tu contraseña.');
      return;
    }

    if (new_password.length < 6) {
      set_error('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    if (new_password !== confirm_password) {
      set_error('Las contraseñas no coinciden.');
      return;
    }

    set_loading(true);
    try {
      const response = await fetch('https://api.parcheacademico.com/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          token,
          newPassword: new_password,
        }),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        const backend_message = data?.message || 'No fue posible actualizar la contraseña.';
        set_error(backend_message);

        // Token expirado => enviar a forgot-password
        if (
          typeof backend_message === 'string' &&
          backend_message.toLowerCase().includes('expirado')
        ) {
          setTimeout(() => {
            navigate('/forgot-password');
          }, 1200);
        }

        // Cuenta Google => ofrecer login con Google
        if (
          typeof backend_message === 'string' &&
          backend_message.toLowerCase().includes('google')
        ) {
          set_is_google_account(true);
        }

        return;
      }

      set_message(data?.message || 'Contraseña actualizada correctamente.');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      set_error('Error de red. Por favor intenta de nuevo.');
    } finally {
      set_loading(false);
    }
  };

  const handle_go_to_google_login = () => {
    navigate('/login');
  };

  return (
    <div className="page">
      <Header />

      <main className="login-page">
        <div className="login-container">
          <div className="login-card">
            <h1 className="login-title">RESTABLECER CONTRASEÑA</h1>

            <p className="login-subtitle">
              {email ? `Cuenta: ${email}` : 'Ingresa desde el link enviado al correo.'}
            </p>

            {message && <div className="success-message">{message}</div>}
            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handle_submit} className="login-form">
              <div className="form-group">
                <label className="form-label">Nueva contraseña:</label>
                <input
                  type="password"
                  className="form-input"
                  value={new_password}
                  onChange={(e) => set_new_password(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Confirmar contraseña:</label>
                <input
                  type="password"
                  className="form-input"
                  value={confirm_password}
                  onChange={(e) => set_confirm_password(e.target.value)}
                  placeholder="Repite la contraseña"
                  required
                  disabled={loading}
                />
              </div>

              <button type="submit" className="btn-login" disabled={loading}>
                {loading ? 'Actualizando...' : 'Actualizar contraseña'}
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
