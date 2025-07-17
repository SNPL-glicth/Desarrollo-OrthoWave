import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const useRoleRedirect = () => {
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const redirectToDashboard = useCallback(() => {
    if (!isAuthenticated || !user?.rol) {
      return;
    }

    const rolePaths = {
      'admin': '/dashboard/admin',
      'administrador': '/dashboard/admin', // Mantener compatibilidad
      'doctor': '/dashboard/doctor',
      'paciente': '/dashboard/patient'
    };

    const dashboardPath = rolePaths[user.rol.toLowerCase()];
    if (dashboardPath) {
      navigate(dashboardPath);
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    if (isAuthenticated && user?.rol) {
      redirectToDashboard();
    }
  }, [isAuthenticated, user?.rol, redirectToDashboard]);

  return { redirectToDashboard };
};

export const getRoleRoute = (rol: string): string => {
  const rolePaths = {
    'admin': '/dashboard/admin',
    'administrador': '/dashboard/admin', // Mantener compatibilidad
    'doctor': '/dashboard/doctor',
    'paciente': '/dashboard/patient'
  };

  return rolePaths[rol.toLowerCase()] || '/dashboard';
};
