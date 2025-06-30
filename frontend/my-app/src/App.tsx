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

// Dashboards temporales simples
const AdminDashboard = () => (
  <div className="min-h-screen bg-gray-100 p-8">
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Panel de Administración</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-xl font-semibold mb-4">Gestión de Usuarios</h2>
        <a
          href="/usuarios/crear"
          className="inline-block bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Crear Nuevo Usuario
        </a>
      </div>
    </div>
  </div>
);

const DoctorDashboard = () => (
  <div className="min-h-screen bg-gray-100 p-8">
    <h1 className="text-3xl font-bold">Panel del Doctor</h1>
  </div>
);

const PatientDashboard = () => (
  <div className="min-h-screen bg-gray-100 p-8">
    <h1 className="text-3xl font-bold">Panel del Paciente</h1>
  </div>
);

function ProtectedRoute({ children, role }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (role && user.role?.toLowerCase() !== role) return <Navigate to="/" />;
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
            <Route path="/dashboard" element={<AdminDashboard />} />
          </Routes>
        </Router>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;
