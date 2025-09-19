import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { initDevEnvironment } from './utils/devInit';
import { CartProvider } from './context/CartContext';
import { CitaProvider } from './contexts/CitasContext';
import { useColombiaTimezone } from './hooks/useColombiaTimezone';
import VerificationPage from './pages/VerificationPage';
import RegisterPage from './pages/RegisterPage';
import RegistroPendientePage from './pages/RegistroPendientePage';
import VerifyEmailPage from './pages/VerifyEmailPage';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import ResetPasswordPage from './pages/ResetPasswordPage';
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
import DoctorSchedulePage from './pages/DoctorSchedulePage';


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

initDevEnvironment();

const App: React.FC = () => {
  // Inicializar timezone de Colombia para toda la aplicación
  useColombiaTimezone();
  
  return (
    <AuthProvider>
      <CartProvider>
        <Router>
          <Routes>
            {/* Rutas públicas sin CitaProvider */}
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/registro-pendiente" element={<RegistroPendientePage />} />
            <Route path="/verify-email" element={<VerifyEmailPage />} />
            <Route path="/verification" element={<VerificationPage />} />
            <Route path="/recuperar-contrasena" element={<ForgotPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/dashboard" element={<AutoRedirect />} />
            <Route path="/debug" element={<DebugInfo />} />
            
            {/* Rutas protegidas CON CitaProvider */}
            <Route
              path="/dashboard/admin"
              element={
                <CitaProvider>
                  <ProtectedRoute role="admin">
                    <AdminDashboard />
                  </ProtectedRoute>
                </CitaProvider>
              }
            />
            <Route
              path="/dashboard/doctor"
              element={
                <CitaProvider>
                  <ProtectedRoute role="doctor">
                    <GoogleCalendarPage />
                  </ProtectedRoute>
                </CitaProvider>
              }
            />
            <Route
              path="/dashboard/doctor/pacientes"
              element={
                <CitaProvider>
                  <ProtectedRoute role="doctor">
                    <DoctorDashboard />
                  </ProtectedRoute>
                </CitaProvider>
              }
            />
            <Route
              path="/dashboard/patient"
              element={
                <CitaProvider>
                  <ProtectedRoute role="paciente">
                    <PatientDashboardRouter />
                  </ProtectedRoute>
                </CitaProvider>
              }
            />
            <Route
              path="/dashboard/patient/agendar"
              element={
                <CitaProvider>
                  <ProtectedRoute role="paciente">
                    <PatientDashboardRouter />
                  </ProtectedRoute>
                </CitaProvider>
              }
            />
            <Route
              path="/dashboard/patient/perfil"
              element={
                <CitaProvider>
                  <ProtectedRoute role="paciente">
                    <PatientDashboardRouter />
                  </ProtectedRoute>
                </CitaProvider>
              }
            />
            <Route
              path="/dashboard/patient/estados-citas"
              element={
                <CitaProvider>
                  <ProtectedRoute role="paciente">
                    <PatientDashboardRouter />
                  </ProtectedRoute>
                </CitaProvider>
              }
            />
            <Route
              path="/dashboard/patient/documentos"
              element={
                <CitaProvider>
                  <ProtectedRoute role="paciente">
                    <PatientDashboardRouter />
                  </ProtectedRoute>
                </CitaProvider>
              }
            />
            <Route
              path="/usuarios/crear"
              element={
                <CitaProvider>
                  <ProtectedRoute role="admin">
                    <CreateUserPage />
                  </ProtectedRoute>
                </CitaProvider>
              }
            />
            <Route
              path="/usuarios"
              element={
                <CitaProvider>
                  <ProtectedRoute role="admin">
                    <UserManagement />
                  </ProtectedRoute>
                </CitaProvider>
              }
            />
            <Route
              path="/calendar"
              element={
                <CitaProvider>
                  <ProtectedRoute role="doctor">
                    <GoogleCalendarPage />
                  </ProtectedRoute>
                </CitaProvider>
              }
            />
            <Route
              path="/doctor/schedule"
              element={
                <CitaProvider>
                  <ProtectedRoute role="doctor">
                    <DoctorSchedulePage />
                  </ProtectedRoute>
                </CitaProvider>
              }
            />
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;
