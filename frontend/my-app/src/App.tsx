import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { CitaProvider } from './contexts/CitasContext';
import VerificationPage from './pages/VerificationPage';
import RegisterPage from './pages/RegisterPage';
import RegistroPendientePage from './pages/RegistroPendientePage';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import CreateUserForm from './components/CreateUserForm';
import UserManagement from './components/UserManagement';
import AutoRedirect from './components/AutoRedirect';
import DebugInfo from './components/DebugInfo';
import ProtectedRoute from './components/ProtectedRoute';

// Importar dashboards principales
import AdminDashboard from './components/dashboards/AdminDashboard';
import DoctorDashboard from './components/dashboards/DoctorDashboard';
import PatientDashboardRouter from './components/dashboards/PatientDashboardRouter';
import GoogleCalendarPage from './components/calendar/GoogleCalendarPage';


const CreateUserPage = () => {
  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <CreateUserForm
          onClose={() => window.history.back()}
          onUserCreated={() => {}}
        />
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <CitaProvider>
          <Router>
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/registro-pendiente" element={<RegistroPendientePage />} />
              <Route path="/verification" element={<VerificationPage />} />
              <Route
                path="/dashboard/admin"
                element={
                  <ProtectedRoute role="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/doctor"
                element={
                  <ProtectedRoute role="doctor">
                    <GoogleCalendarPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/doctor/pacientes"
                element={
                  <ProtectedRoute role="doctor">
                    <DoctorDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/patient"
                element={
                  <ProtectedRoute role="paciente">
                    <PatientDashboardRouter />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard/patient/agendar"
                element={
                  <ProtectedRoute role="paciente">
                    <PatientDashboardRouter />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/usuarios/crear"
                element={
                  <ProtectedRoute role="admin">
                    <CreateUserPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/usuarios"
                element={
                  <ProtectedRoute role="admin">
                    <UserManagement />
                  </ProtectedRoute>
                }
              />
              <Route path="/dashboard" element={<AutoRedirect />} />
              <Route path="/debug" element={<DebugInfo />} />
            </Routes>
          </Router>
        </CitaProvider>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;
