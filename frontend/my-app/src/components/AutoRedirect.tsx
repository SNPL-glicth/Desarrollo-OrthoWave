import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getRoleRoute } from '../hooks/useRoleRedirect.ts';

const AutoRedirect: React.FC = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && isAuthenticated && user?.rol) {
      const dashboardPath = getRoleRoute(user.rol);
      console.log(`Redirigiendo automáticamente a ${dashboardPath} para rol: ${user.rol}`);
      navigate(dashboardPath, { replace: true });
    } else if (!loading && !isAuthenticated) {
      console.log('Usuario no autenticado, redirigiendo a login');
      navigate('/login', { replace: true });
    }
  }, [isAuthenticated, user?.rol, loading, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600">Verificando credenciales...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirigiendo...</p>
      </div>
    </div>
  );
};

export default AutoRedirect;
