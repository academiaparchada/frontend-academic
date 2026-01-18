// src/services/auth_service.js
import { getBrowserTimeZone } from '../utils/timezone';

// Backend producción
const API_URL = 'https://api.parcheacademico.com/api/auth';

class AuthService {
  async register(user_data) {
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: user_data.email,
          password: user_data.password,
          nombre: user_data.nombre,
          apellido: user_data.apellido,
          telefono: user_data.telefono || '',
          timezone: user_data.timezone || getBrowserTimeZone(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        return { success: true, data: data.data };
      }

      return {
        success: false,
        message: data.message || 'Error al registrar usuario',
        errors: data.errors || [],
      };
    } catch (error) {
      console.error('Error en registro:', error);
      return { success: false, message: 'Error de conexión. Por favor intenta de nuevo más tarde.' };
    }
  }

  async login(email, password) {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        return { success: true, data: data.data };
      }

      return {
        success: false,
        message: data.message || 'Credenciales inválidas',
        errors: data.errors || [],
      };
    } catch (error) {
      console.error('Error en login:', error);
      return { success: false, message: 'Error de conexión. Por favor intenta de nuevo más tarde.' };
    }
  }

  async get_me() {
    try {
      const token = localStorage.getItem('token');
      if (!token) return { success: false, message: 'No hay token de autenticación' };

      const response = await fetch(`${API_URL}/me`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('user', JSON.stringify(data.data.user));
        return { success: true, data: data.data.user };
      }

      if (response.status === 401) this.logout();
      return { success: false, message: data.message };
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      return { success: false, message: 'Error de conexión' };
    }
  }

  async logout() {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        await fetch(`${API_URL}/logout`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });
      }
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }

  is_authenticated() {
    return !!localStorage.getItem('token');
  }

  get_current_user() {
    const user_str = localStorage.getItem('user');
    if (!user_str) return null;
    try { return JSON.parse(user_str); } catch { return null; }
  }

  get_token() {
    return localStorage.getItem('token');
  }
}

export default new AuthService();
