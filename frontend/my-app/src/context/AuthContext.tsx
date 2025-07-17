import React, { createContext, useContext, useState, useEffect } from 'react';
import { authService } from '../services/auth.service';
import { User } from '../types/User';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<any>;
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
        const storedToken = localStorage.getItem('token');
        if (storedToken) {
          setToken(storedToken);
          const currentUser = await authService.getCurrentUser();
          if (currentUser) {
            const userWithRole: User = {
              ...currentUser,
              rol: mapRoleToValidRole(currentUser.rol || ''),
              id: currentUser.id.toString(),
            };
            setUser(userWithRole);
            setIsAuthenticated(true);
            console.log('Usuario autenticado:', {
              id: userWithRole.id,
              email: userWithRole.email,
              nombre: userWithRole.nombre,
              rol: userWithRole.rol
            });
        } else {
          console.log('No hay sesión activa');
          setUser(null);
          setToken(null);
            setIsAuthenticated(false);
          }
        }
      } catch (err) {
        console.error('Error al verificar autenticación:', err);
        setError(err instanceof Error ? err.message : 'Error desconocido');
        setUser(null);
        setIsAuthenticated(false);
        authService.logout();
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
    authService.logout();
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
