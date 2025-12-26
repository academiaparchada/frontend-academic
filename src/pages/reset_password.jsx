// src/pages/reset_password.jsx
import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Header } from '../components/header';
import { Footer } from '../components/footer';
import '../styles/reset_password.css';

export const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token'); // Token del correo

  const [password, set_password] = useState('');
  const [confirm_password, set_confirm_password] = useState('');
  const [loading, set_loading] = useState(false);
  const [error, set_error] = useState('');

  const handle_submit = async (e) => {
    e.preventDefault();
    set_error('');

    // Validaciones
    if (password !== confirm_password) {
      set_error('Las contraseñas no coinciden');
      return;
    }

    if (password.length < 6) {
      set_error('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    set_loading(true);

    try {
      // Aquí irá la integración con el backend cuando esté disponible
      // Por ahora simularemos el cambio
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      alert('Contraseña cambiada exitosamente');
      navigate('/login');
    } catch (err) {
      set_error('Error al cambiar la contraseña. Por favor intenta de nuevo.');
    } finally {
      set_loading(false);
    }
  };

  return (
    <div className="page">
      <Header />

      <main className="main">
        <div className="reset_password_container">
          <div className="reset_password_card">
            <h1 className="reset_password_title">GUARDA BIEN TUS CREDENCIALES.</h1>
            <p className="reset_password_subtitle">
              Recuerda guardar bien tus contraseñas y no compartirlas con nadie.
            </p>

            {error && (
              <div className="error_message">
                {error}
              </div>
            )}

            <form onSubmit={handle_submit} className="reset_password_form">
              <div className="form_group">
                <label htmlFor="password" className="form_label">
                  Contraseña Nueva:
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

              <button type="submit" className="btn_reset" disabled={loading}>
                {loading ? 'Cambiando...' : 'Cambiar Contraseña'}
              </button>
            </form>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
