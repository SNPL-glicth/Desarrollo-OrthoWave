import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { EnvelopeIcon, LockClosedIcon, ArrowLeftIcon } from '@heroicons/react/24/outline';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      // Validaciones más detalladas
      if (!email.trim()) {
        throw new Error('El correo electrónico es requerido');
      }

      if (!password.trim()) {
        throw new Error('La contraseña es requerida');
      }

      if (!email.includes('@') || !email.includes('.')) {
        throw new Error('Por favor, ingresa un correo electrónico válido');
      }

      if (password.length < 6) {
        throw new Error('La contraseña debe tener al menos 6 caracteres');
      }

      console.log('Iniciando proceso de login con:', { email });
      
      // Limpiar cualquier error previo
      localStorage.removeItem('auth_error');
      
      const response = await login(email, password);
      console.log('Login exitoso, respuesta:', { 
        hasUser: !!response.user,
        userRole: response.user?.rol
      });

      if (!response.user || !response.user.rol) {
        throw new Error('Error: Respuesta de login inválida');
      }

      // Determinar la ruta según el rol
      const redirectPath = getRedirectPathByRole(response.user.rol);
      console.log('Redirigiendo a:', redirectPath);
      
      // Si todo está bien, redirigir
      navigate(redirectPath);
    } catch (error) {
      console.error('Error en el formulario de login:', error);
      
      // Guardar el error para referencia futura
      localStorage.setItem('auth_error', 'true');
      
      setError(error.message || 'Error al iniciar sesión. Por favor, intenta de nuevo.');
    } finally {
      setIsLoading(false);
    }
  };

  const getRedirectPathByRole = (rol) => {
    const rolePaths = {
      'administrador': '/dashboard/admin',
      'doctor': '/dashboard/doctor',
      'paciente': '/dashboard/patient'
    };
    return rolePaths[rol.toLowerCase()] || '/login';
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-lg relative"
      >
        <Link
          to="/"
          className="absolute top-4 left-4 p-2 text-gray-600 hover:text-primary transition-colors rounded-full hover:bg-gray-100"
        >
          <ArrowLeftIcon className="h-6 w-6" />
        </Link>
        <div>
          <Link to="/" className="flex justify-center mb-8">
            <img
              src="/images/White logo - no background_page-0001.webp"
              alt="OWC Logo"
              className="h-12"
            />
          </Link>
          <h2 className="text-center text-3xl font-bold text-gray-900">
            Bienvenido de nuevo
          </h2>
          <div className="mt-2 text-center text-sm">
            <p className="text-gray-600 mb-2">
              Credenciales de prueba:
            </p>
            <p className="text-gray-600">
              <strong>Administrador:</strong> admin@ortowhite.com / admin123
            </p>
            <p className="text-gray-600">
              <strong>Doctor:</strong> doctor@ortowhite.com / doctor123
            </p>
            <p className="text-gray-600 mb-4">
              <strong>Paciente:</strong> paciente@ortowhite.com / paciente123
            </p>
          </div>
          <p className="mt-2 text-center text-sm text-gray-600">
            ¿No tienes una cuenta?{' '}
            <Link to="/register" className="font-medium text-primary hover:text-primary-dark transition-colors">
              Regístrate aquí
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-red-50 border-l-4 border-red-400 p-4 rounded-md"
            >
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              </div>
            </motion.div>
          )}

          <div className="space-y-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <EnvelopeIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm transition-colors"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError(''); // Limpiar error al escribir
                  }}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  required
                  className="appearance-none block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm transition-colors"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(''); // Limpiar error al escribir
                  }}
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded transition-colors"
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                Recordarme
              </label>
            </div>

            <div className="text-sm">
              <Link
                to="/recuperar-contrasena"
                className="font-medium text-primary hover:text-primary-dark transition-colors"
              >
                ¿Olvidaste tu contraseña?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-300 transform hover:scale-[1.02] ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Iniciando sesión...
                </span>
              ) : (
                'Iniciar Sesión'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default LoginPage; 