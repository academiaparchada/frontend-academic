// src/context/auth_context.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import auth_service from '../services/auth_service';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, set_user] = useState(null);
  const [loading, set_loading] = useState(true);
  const [is_authenticated, set_is_authenticated] = useState(false);

  // Verificar sesión al cargar
  useEffect(() => {
    check_auth();
  }, []);

  const check_auth = async () => {
    set_loading(true);
    if (auth_service.is_authenticated()) {
      const result = await auth_service.get_me();
      console.log('check_auth result:', result);
      if (result.success) {
        console.log('Usuario autenticado:', result.data);
        set_user(result.data);
        set_is_authenticated(true);
      } else {
        set_user(null);
        set_is_authenticated(false);
      }
    } else {
      set_user(null);
      set_is_authenticated(false);
    }
    set_loading(false);
  };

  const login = async (email, password) => {
    const result = await auth_service.login(email, password);
    console.log('Login result en auth_context:', result);
    if (result.success) {
      // Guardar el usuario completo
      const user_data = result.data?.user || result.data;
      console.log('Datos de usuario guardados:', user_data);
      set_user(user_data);
      set_is_authenticated(true);
    }
    return result;
  };

  const register = async (user_data) => {
    const result = await auth_service.register(user_data);
    if (result.success) {
      const registered_user = result.data?.user || result.data;
      set_user(registered_user);
      set_is_authenticated(true);
    }
    return result;
  };

  const logout = async () => {
    await auth_service.logout();
    set_user(null);
    set_is_authenticated(false);
  };

  const value = {
    user,
    loading,
    is_authenticated,
    login,
    register,
    logout,
    check_auth
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
