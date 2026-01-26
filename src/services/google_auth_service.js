// src/services/google_auth_service.js
import { supabase } from '../config/supabase';

const API_URL = 'https://api.parcheacademico.com/api/auth';

class GoogleAuthService {
  /**
   * Inicia el flujo de OAuth con Google vía Supabase
   */
  async signInWithGoogle() {
    try {
      // Determinar la URL de callback según el entorno
      const isDevelopment = window.location.hostname === 'localhost';
      const redirectTo = isDevelopment
        ? `${window.location.origin}/auth/google/callback`
        : 'https://parcheacademico.com/auth/google/callback';

      console.log('🔐 Iniciando login con Google, redirectTo:', redirectTo);

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      });

      if (error) {
        console.error('❌ Error en signInWithOAuth:', error);
        throw error;
      }

      console.log('✅ OAuth iniciado correctamente:', data);
      return { success: true, data };
    } catch (error) {
      console.error('❌ Error al iniciar Google OAuth:', error);
      return {
        success: false,
        message: error.message || 'Error al iniciar sesión con Google',
      };
    }
  }

  /**
   * Maneja el callback de Google OAuth
   * Supabase maneja automáticamente el intercambio PKCE cuando se redirige de vuelta
   */
  async handleGoogleCallback() {
    try {
      console.log('📥 URL completa del callback:', window.location.href);

      // Obtener la sesión actual de Supabase
      // Supabase automáticamente procesa el hash fragment (#access_token=...)
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();

      console.log('📦 Sesión obtenida:', session);
      console.log('❌ Error de sesión:', sessionError);

      if (sessionError) {
        console.error('❌ Error al obtener sesión:', sessionError);
        throw sessionError;
      }

      if (!session) {
        // Intentar verificar si hay hash parameters
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        const accessToken = hashParams.get('access_token');
        const errorParam = hashParams.get('error');
        const errorDescription = hashParams.get('error_description');

        console.log('🔍 Hash params:', {
          accessToken: accessToken ? 'presente' : 'ausente',
          error: errorParam,
          errorDescription
        });

        if (errorParam) {
          throw new Error(errorDescription || errorParam);
        }

        // Si hay access_token en el hash pero no hay sesión, esperar un momento
        if (accessToken) {
          console.log('⏳ Access token encontrado, esperando sesión...');
          await new Promise(resolve => setTimeout(resolve, 1000));

          const { data: { session: retrySession } } = await supabase.auth.getSession();
          if (retrySession) {
            return await this.sendTokenToBackend(retrySession.access_token);
          }
        }

        throw new Error('No se pudo obtener la sesión de Google. Por favor, intenta nuevamente.');
      }

      // Enviar access_token al backend
      return await this.sendTokenToBackend(session.access_token);

    } catch (error) {
      console.error('❌ Error en handleGoogleCallback:', error);
      return {
        success: false,
        message: error.message || 'Error al procesar el callback de Google',
      };
    }
  }

  /**
   * Envía el access_token de Supabase al backend
   */
  async sendTokenToBackend(accessToken) {
    try {
      if (!accessToken) {
        throw new Error('No se obtuvo access_token de Supabase');
      }

      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'America/Bogota';

      console.log('📤 Enviando access_token al backend...');

      const response = await fetch(`${API_URL}/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          access_token: accessToken,
          timezone: timezone,
        }),
      });

      const result = await response.json();
      console.log('📥 Respuesta del backend:', result);

      if (!response.ok) {
        throw new Error(result.message || 'Error al autenticar con el backend');
      }

      if (result.success && result.data) {
        // Guardar token y usuario del backend
        localStorage.setItem('token', result.data.token);
        localStorage.setItem('user', JSON.stringify(result.data.user));

        // Guardar timezone (para que toda la app siga el mismo patrón que login/register)
        localStorage.setItem('timezone', result.data.user?.timezone || timezone || 'America/Bogota');

        console.log('✅ Login con Google completado exitosamente');
        return {
          success: true,
          data: result.data,
        };
      } else {
        throw new Error('Respuesta inválida del backend');
      }
    } catch (error) {
      console.error('❌ Error al enviar token al backend:', error);
      throw error;
    }
  }

  /**
   * Cierra sesión de Supabase
   */
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;

      // Limpiar localStorage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('timezone');

      return { success: true };
    } catch (error) {
      console.error('❌ Error al cerrar sesión de Google:', error);
      return {
        success: false,
        message: error.message,
      };
    }
  }
}

export default new GoogleAuthService();
