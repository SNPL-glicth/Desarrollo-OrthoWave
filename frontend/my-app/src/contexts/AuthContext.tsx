import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types/User';

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Aquí se puede agregar la lógica para verificar el token almacenado
    // y recuperar la información del usuario al cargar la aplicación
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          // Aquí iría la llamada a la API para validar el token
          // y obtener la información del usuario
          setIsAuthenticated(true);
          // setUser con la respuesta de la API
        } catch (error) {
          console.error('Error al verificar autenticación:', error);
          logout();
        }
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    try {
      // Aquí iría la llamada a la API para autenticar
      // const response = await api.login(email, password);
      // localStorage.setItem('token', response.token);
      // setUser(response.user);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}; 