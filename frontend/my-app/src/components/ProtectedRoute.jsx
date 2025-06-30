import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg text-gray-600">Cargando...</div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  // Si se requiere cualquier rol autenticado
  if (requiredRole === 'any') {
    return children;
  }

  // Si se especifica un rol requerido, verificar que el usuario tenga ese rol
  const userRole = user.rol?.toLowerCase();
  const requiredRoleLower = requiredRole?.toLowerCase();

  if (requiredRole && userRole !== requiredRoleLower) {
    // Si el usuario no tiene el rol requerido, redirigir a su dashboard correspondiente
    const dashboardPath = getDashboardPath(userRole);
    console.log('Redirigiendo a:', dashboardPath, 'Usuario:', user);
    return <Navigate to={dashboardPath} />;
  }

  return children;
};

// Función auxiliar para obtener la ruta del dashboard según el rol
const getDashboardPath = (rol) => {
  switch (rol?.toLowerCase()) {
    case 'administrador':
      return '/dashboard/admin';
    case 'doctor':
      return '/dashboard/doctor';
    case 'paciente':
      return '/dashboard/patient';
    default:
      console.log('Rol no reconocido en ProtectedRoute:', rol);
      return '/dashboard';
  }
};

export default ProtectedRoute; 