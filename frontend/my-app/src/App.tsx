import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import VerificationPage from './pages/VerificationPage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import HomePage from './pages/HomePage';
import { useAuth } from './context/AuthContext';
import CreateUserForm from './components/CreateUserForm';
import UserManagement from './components/UserManagement.tsx';
import AutoRedirect from './components/AutoRedirect.tsx';
import DebugInfo from './components/DebugInfo.tsx';

// Importar dashboards principales
import AdminDashboard from './components/dashboards/AdminDashboard.tsx';
import DoctorDashboard from './components/dashboards/DoctorDashboard.tsx';
import PatientDashboard from './components/dashboards/PatientDashboard.tsx';

function ProtectedRoute({ children, role }) {
  const { user, isAuthenticated } = useAuth();
  if (!isAuthenticated) return <Navigate to="/login" />;
  if (role && user?.rol?.toLowerCase() !== role) {
    // Redirigir a su dashboard correspondiente si no tiene permisos para esta ruta
    switch (user?.rol?.toLowerCase()) {
      case 'admin':
        return <Navigate to="/dashboard/admin" />;
      case 'doctor':
        return <Navigate to="/dashboard/doctor" />;
      case 'paciente':
        return <Navigate to="/dashboard/patient" />;
      default:
        return <Navigate to="/" />;
    }
  }
  return children;
}

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
        <Router>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
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
                  <DoctorDashboard />
                </ProtectedRoute>
              }
            />
            <Route
              path="/dashboard/patient"
              element={
                <ProtectedRoute role="paciente">
                  <PatientDashboard />
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
      </CartProvider>
    </AuthProvider>
  );
};

export default App;
