import React from 'react';
import { useLocation } from 'react-router-dom';
import PatientDashboardNew from './PatientDashboardNew';
import PatientDashboardOriginal from './PatientDashboardOriginal';
import PatientProfile from '../patient/PatientProfile';

const PatientDashboardRouter: React.FC = () => {
  const location = useLocation();
  
  // Si la ruta es /dashboard/patient/agendar, mostrar el dashboard original
  if (location.pathname === '/dashboard/patient/agendar') {
    return <PatientDashboardOriginal />;
  }
  
  // Si la ruta es /dashboard/patient/perfil, mostrar el perfil del paciente
  if (location.pathname === '/dashboard/patient/perfil') {
    return <PatientProfile />;
  }
  
  // Si la ruta es /dashboard/patient, mostrar el nuevo dashboard
      return <PatientDashboardNew />;
};

export default PatientDashboardRouter;
