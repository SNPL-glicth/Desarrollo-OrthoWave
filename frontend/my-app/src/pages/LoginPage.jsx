import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { EnvelopeIcon, LockClosedIcon, ArrowLeftIcon, CheckCircleIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import LoadingOverlay from '../components/LoadingOverlay';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  useEffect(() => {
    // Verificar si hay un mensaje de éxito desde la verificación
    const state = location.state;
    if (state?.message) {
      setSuccessMessage(state.message);
      if (state.email) {
        setEmail(state.email);
      }
      // Limpiar el state para evitar que persista en recargas
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Prevenir múltiples submissions
    if (isLoading) {
      console.log('Login ya en proceso, ignorando clic adicional');
      return;
    }
    
    setError('');
    setSuccessMessage('');
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
      
      // Redirigir inmediatamente tras el login exitoso
      navigate(redirectPath, { replace: true });
      
    } catch (error) {
      console.error('Error en el formulario de login:', error);
      
      // Guardar el error para referencia futura
      localStorage.setItem('auth_error', 'true');
      
      // Mostrar mensaje de error específico o uno genérico
      let errorMessage = 'Error al iniciar sesión. Por favor, intenta de nuevo.';
      
      if (error.message) {
        errorMessage = error.message;
      }
      
      setError(errorMessage);
      
      // Solo desactivar loading en caso de error
      setIsLoading(false);
    }
    // NO desactivar loading en caso de éxito, dejar que la redirección maneje eso
  };

  const getRedirectPathByRole = (rol) => {
    const rolePaths = {
      'admin': '/dashboard/admin',
      'administrador': '/dashboard/admin', // Mantener compatibilidad
      'doctor': '/dashboard/doctor',
      'paciente': '/dashboard/patient'
    };
    return rolePaths[rol.toLowerCase()] || '/dashboard';
  };


  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-white py-4 sm:py-12 px-2 sm:px-6 lg:px-8 relative">
      {/* Componente de loading reutilizable */}
      <LoadingOverlay 
        isVisible={isLoading}
        title="Iniciando sesión..."
        message="Por favor espere mientras verificamos sus credenciales"
        size="md"
      />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`w-full max-w-md space-y-6 sm:space-y-8 bg-white p-4 sm:p-8 rounded-xl sm:rounded-2xl shadow-lg relative mx-2 sm:mx-0 ${
          isLoading ? 'opacity-75 pointer-events-none' : ''
        }`}
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
          <h2 className="text-center text-2xl sm:text-3xl font-bold text-gray-900">
            Bienvenido de nuevo
          </h2>
          <div className="mt-2 text-center text-xs sm:text-sm">
            <p className="text-gray-600 mb-2">
              Credenciales de prueba:
            </p>
            <div className="space-y-1 text-gray-600">
              <p className="break-all">
                <strong>Admin:</strong> admin@ortowhave.com / admin123
              </p>
              <p className="break-all">
                <strong>Doctor:</strong> doctor@ortowhave.com / doctor123
              </p>
              <p className="break-all mb-4">
                <strong>Paciente:</strong> paciente@ortowhave.com / paciente123
              </p>
            </div>
          </div>
          <p className="mt-2 text-center text-sm text-gray-600">
            ¿No tienes una cuenta?{' '}
            <Link to="/register" className="font-medium text-primary hover:text-primary-dark transition-colors">
              Regístrate aquí
            </Link>
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-green-50 border-l-4 border-green-400 p-4 rounded-md"
            >
              <div className="flex">
                <div className="flex-shrink-0">
                  <CheckCircleIcon className="h-5 w-5 text-green-400" />
                </div>
                <div className="ml-3">
                  <p className="text-sm text-green-700">{successMessage}</p>
                </div>
              </div>
            </motion.div>
          )}
          
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
                  className="appearance-none block w-full pl-10 pr-3 py-3 sm:py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary text-base sm:text-sm transition-colors touch-manipulation"
                  placeholder="tu@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError(''); // Limpiar error al escribir
                  }}
                  disabled={isLoading}
                  autoComplete="email"
                  autoCapitalize="off"
                  autoCorrect="off"
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
                  type={showPassword ? "text" : "password"}
                  required
                  className="appearance-none block w-full pl-10 pr-12 py-3 sm:py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary text-base sm:text-sm transition-colors touch-manipulation"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    setError(''); // Limpiar error al escribir
                  }}
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                  )}
                </button>
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
              className={`group relative w-full flex justify-center py-3 sm:py-2.5 px-4 border border-transparent rounded-lg text-base sm:text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-300 transform hover:scale-[1.02] touch-manipulation min-h-[44px] ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
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