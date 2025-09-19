import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService, RegisterData, RegisterResponse } from '../services/auth.service';
import { User } from '../types/user';
import { clearAuthData, isTokenExpired, getStoredToken } from '../utils/auth';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<any>;
  register: (userData: RegisterData) => Promise<RegisterResponse>;
  logout: () => void;
  isAuthenticated: boolean;
  verifyCode: (email: string, code: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  const mapRoleToValidRole = (rol: string): 'admin' | 'doctor' | 'paciente' => {
    if (!rol) return 'paciente';
    
    switch (rol.toLowerCase().trim()) {
      case 'admin':
      case 'administrador':
        return 'admin';
      case 'doctor':
      case 'medico':
      case 'doctor especialista':
        return 'doctor';
      case 'paciente':
      case 'patient':
        return 'paciente';
      default:
        console.warn(`Rol desconocido: ${rol}, asignando 'paciente' por defecto`);
        return 'paciente';
    }
  };

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedToken = getStoredToken();
        if (storedToken) {
          // Verificar si el token está expirado
          if (isTokenExpired(storedToken)) {
            console.log('Token expirado, limpiando sesión');
            clearAuthData();
            setUser(null);
            setToken(null);
            setIsAuthenticated(false);
            setLoading(false);
            return;
          }
          
          setToken(storedToken);
          // Obtener usuario desde localStorage en lugar de hacer llamada API
          const currentUser = authService.getCurrentUser();
          if (currentUser) {
            const userWithRole: User = {
              ...currentUser,
              rol: mapRoleToValidRole(currentUser.rol || ''),
              id: currentUser.id.toString(),
            };
            setUser(userWithRole);
            setIsAuthenticated(true);
            console.log('Usuario autenticado desde localStorage:', {
              id: userWithRole.id,
              email: userWithRole.email,
              nombre: userWithRole.nombre,
              rol: userWithRole.rol
            });
          } else {
            console.log('No se pudo obtener el usuario desde localStorage');
            clearAuthData();
            setUser(null);
            setToken(null);
            setIsAuthenticated(false);
          }
        } else {
        // No hay token almacenado
          setUser(null);
          setToken(null);
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error('Error al verificar autenticación:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
        setUser(null);
        setIsAuthenticated(false);
        clearAuthData();
        // No llamar authService.logout() aquí para evitar redirecciones innecesarias
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.login(email, password);
      const userWithRole: User = {
        ...response.user,
        rol: mapRoleToValidRole(response.user.rol || ''),
        id: response.user.id.toString(),
      };
      setUser(userWithRole);
      setToken(response.access_token);
      setIsAuthenticated(true);
      
      console.log('Login exitoso:', {
        id: userWithRole.id,
        email: userWithRole.email,
        nombre: userWithRole.nombre,
        rol: userWithRole.rol
      });
      
      return { ...response, user: userWithRole };
    } catch (err) {
      console.error('Error en login:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    setError(null);
    setIsAuthenticated(false);
    // Limpiar todos los datos de autenticación
    clearAuthData();
    authService.logout();
    console.log('Sesión cerrada correctamente');
  };

  const register = async (userData: RegisterData) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.register(userData);
      return response;
    } catch (err) {
      console.error('Error en registro:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const verifyCode = async (email: string, code: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authService.verifyCode(email, code);
      return response;
    } catch (err) {
      console.error('Error en verificación:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const value = {
    user,
    token,
    loading,
    error,
    login,
    register,
    logout,
    isAuthenticated,
    verifyCode
  };

  if (loading) {
    // Puedes personalizar esto con un componente de loading más elaborado
    return <div>Cargando...</div>;
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
