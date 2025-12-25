// src/services/auth_service.js
const API_URL = 'https://academiaparchadaback.onrender.com/api/auth';

class AuthService {
  // Registrar nuevo usuario
  async register(user_data) {
    try {
      const response = await fetch(`${API_URL}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: user_data.email,
          password: user_data.password,
          nombre: user_data.nombre,
          apellido: user_data.apellido,
          telefono: user_data.telefono || ''
        })
      });

      const data = await response.json();

      if (response.ok) {
        // Guardar token y usuario en localStorage
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        return { success: true, data: data.data };
      } else {
        return { 
          success: false, 
          message: data.message || 'Error al registrar usuario',
          errors: data.errors || []
        };
      }
    } catch (error) {
      console.error('Error en registro:', error);
      return { 
        success: false, 
        message: 'Error de conexión. Verifica tu internet o intenta más tarde.' 
      };
    }
  }

  // Iniciar sesión
  async login(email, password) {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok) {
        // Guardar token y usuario en localStorage
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        return { success: true, data: data.data };
      } else {
        return { 
          success: false, 
          message: data.message || 'Credenciales inválidas',
          errors: data.errors || []
        };
      }
    } catch (error) {
      console.error('Error en login:', error);
      return { 
        success: false, 
        message: 'Error de conexión. Verifica tu internet o intenta más tarde.' 
      };
    }
  }

  // Obtener usuario actual
  async get_me() {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        return { success: false, message: 'No hay token de autenticación' };
      }

      const response = await fetch(`${API_URL}/me`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (response.ok) {
        // Actualizar usuario en localStorage
        localStorage.setItem('user', JSON.stringify(data.data.user));
        return { success: true, data: data.data.user };
      } else {
        // Token inválido o expirado
        if (response.status === 401) {
          this.logout();
        }
        return { success: false, message: data.message };
      }
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      return { success: false, message: 'Error de conexión' };
    }
  }

  // Cerrar sesión
  async logout() {
    try {
      const token = localStorage.getItem('token');
      
      if (token) {
        await fetch(`${API_URL}/logout`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
      }
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    } finally {
      // Limpiar localStorage independientemente del resultado
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  }

  // Verificar si hay sesión activa
  is_authenticated() {
    const token = localStorage.getItem('token');
    return !!token;
  }

  // Obtener usuario del localStorage
  get_current_user() {
    const user_str = localStorage.getItem('user');
    if (user_str) {
      try {
        return JSON.parse(user_str);
      } catch (error) {
        return null;
      }
    }
    return null;
  }

  // Obtener token
  get_token() {
    return localStorage.getItem('token');
  }
}

export default new AuthService();
