import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/auth.service.js';
import { toast } from 'react-hot-toast';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Verificar el token al cargar la aplicación
  useEffect(() => {
    const checkAuth = async () => {
      const currentUser = authService.getCurrentUser();
      if (currentUser) {
        console.log('Usuario encontrado en localStorage:', {
          id: currentUser.id,
          email: currentUser.email,
          rol: currentUser.rol
        });
        setUser(currentUser);
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (email, password) => {
    try {
      console.log('Iniciando login con:', email);
      const response = await authService.login(email, password);

      if (response.access_token) {
        setUser(response.user);

        // Determinar la URL de redirección basada en el rol
        let redirectUrl = '/dashboard';
        const userRole = response.user.rol?.toLowerCase();

        if (userRole === 'administrador') {
          redirectUrl = '/dashboard/admin';
        } else if (userRole === 'doctor') {
          redirectUrl = '/dashboard/doctor';
        } else if (userRole === 'paciente') {
          redirectUrl = '/dashboard/patient';
        }

        console.log('Login exitoso:', {
          user: response.user,
          redirectUrl,
          token: response.access_token.substring(0, 20) + '...'
        });

        toast.success('¡Inicio de sesión exitoso!');
        return { ...response, redirectUrl };
      } else {
        throw new Error('No se recibió el token de autenticación');
      }
    } catch (error) {
      console.error('Error en login:', error);
      
      // Determinar el mensaje de error apropiado
      let message = 'Error al iniciar sesión. Por favor verifica tus credenciales.';
      
      if (error.message) {
        message = error.message;
      }
      
      // Mostrar toast con el mensaje de error
      toast.error(message);
      
      // Re-lanzar el error para que pueda ser manejado por el componente
      throw error;
    }
  };

  const register = async (userData) => {
    try {
      const response = await authService.register(userData);
      const { message, requiresApproval } = response;
      toast.success(message);
      return { ...response, requiresApproval };
    } catch (error) {
      console.error('Error en registro:', error);
      const message = error.message || 'Error al registrarse';
      toast.error(message);
      throw error;
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const updateProfile = async (userData) => {
    try {
      // TODO: Implementar actualización de perfil cuando esté disponible en el backend
      toast.error('La actualización de perfil no está disponible en este momento');
      throw new Error('La actualización de perfil no está disponible en este momento');
    } catch (error) {
      console.error('Error al actualizar perfil:', error);
      const message = error.response?.data?.message || 'Error al actualizar perfil';
      toast.error(message);
      throw error;
    }
  };

  const value = {
    user,
    loading,
    login,
    logout,
    register,
    updateProfile,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// HOC para envolver componentes que necesitan acceso a la navegación y autenticación
export const withAuthNavigation = (Component) => {
  return function WrappedComponent(props) {
    const auth = useAuth();
    return <Component {...props} auth={auth} />;
  };
};
