import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { 
  UserIcon, 
  EnvelopeIcon, 
  LockClosedIcon,
  PhoneIcon,
  ArrowLeftIcon,
  EyeIcon,
  EyeSlashIcon
} from '@heroicons/react/24/outline';

const RegisterPage = () => {
  const location = useLocation();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { register, login } = useAuth();
  
  // useEffect para cargar datos del formulario de contacto
  useEffect(() => {
    const state = location.state;
    if (state?.prefilledData && state?.message) {
      const { nombre, email, telefono } = state.prefilledData;
      
      // Dividir el nombre completo en nombre y apellido
      const nombreCompleto = nombre.trim().split(' ');
      const firstName = nombreCompleto[0] || '';
      const lastName = nombreCompleto.slice(1).join(' ') || '';
      
      // Precargar los datos en el formulario
      setFormData(prev => ({
        ...prev,
        firstName,
        lastName,
        email: email || '',
        phone: telefono?.replace(/\D/g, '') || '' // Remover caracteres no numéricos del teléfono
      }));
      
      // Mostrar mensaje de éxito del contacto
      setSuccessMessage(state.message);
      
      // Limpiar el state para evitar que persista en recargas
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleChange = (e) => {
    // Limpiar error al escribir
    if (error) {
      setError('');
    }
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    // Prevenir múltiples submissions
    if (isLoading) {
      return;
    }

    // Validaciones del frontend
    if (!formData.firstName.trim()) {
      setError('El nombre es requerido');
      return;
    }
    
    if (!formData.lastName.trim()) {
      setError('El apellido es requerido');
      return;
    }
    
    if (!formData.email.trim()) {
      setError('El correo electrónico es requerido');
      return;
    }
    
    if (!formData.phone.trim()) {
      setError('El teléfono es requerido');
      return;
    }
    
    if (formData.phone.length < 10) {
      setError('El teléfono debe tener al menos 10 dígitos');
      return;
    }
    
    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }
    
    setIsLoading(true);

    // Transformar los nombres de los campos al formato que espera el backend
    const userData = {                          
      nombre: formData.firstName.trim(),                                       
      apellido: formData.lastName.trim(),
      email: formData.email.trim().toLowerCase(),
      telefono: formData.phone.trim(),
      password: formData.password,
      rolId: 3 // Siempre paciente para registro público
    };

    try {
      console.log('Enviando datos de registro:', { ...userData, password: '[OCULTA]' });
      const response = await register(userData);
      console.log('Respuesta de registro completa:', response);
      console.log('requiresVerification:', response?.requiresVerification);
      console.log('Tipo de requiresVerification:', typeof response?.requiresVerification);
      
      // Si requiere verificación por código de email
      if (response && response.requiresVerification === true) {
        console.log('Redirigiendo a verificación de email con URL:', `/verify-email?email=${encodeURIComponent(userData.email)}`);
        // Redirigir a la página de verificación
        navigate(`/verify-email?email=${encodeURIComponent(userData.email)}`);
      } else {
        console.log('No requiere verificación o respuesta inesperada, haciendo login automático');
        console.log('Valor de requiresVerification:', response?.requiresVerification);
        // Si no requiere verificación (usuarios creados por admin), hacer login
        await login(userData.email, userData.password);
        navigate('/dashboard/patient');
      }
    } catch (err) {
      console.error('Error en registro:', err);
      setError(err.message || 'Error al registrar usuario. Por favor intente nuevamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-white py-4 sm:py-12 px-2 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md space-y-6 sm:space-y-8 bg-white p-4 sm:p-8 rounded-xl sm:rounded-2xl shadow-lg relative mx-2 sm:mx-0"
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
            Crear una cuenta
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            ¿Ya tienes una cuenta?{' '}
            <Link to="/login" className="font-medium text-primary hover:text-primary-dark transition-colors">
              Inicia sesión aquí
            </Link>
          </p>
        </div>
        
        {successMessage && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-50 border-l-4 border-green-400 p-4 rounded-md"
          >
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm text-green-700">{successMessage}</p>
              </div>
            </div>
          </motion.div>
        )}

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
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                  Nombre
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="firstName"
                    name="firstName"
                    type="text"
                    required
                    disabled={isLoading}
                    className="appearance-none block w-full pl-10 pr-3 py-3 sm:py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary text-base sm:text-sm transition-colors touch-manipulation disabled:bg-gray-50 disabled:cursor-not-allowed"
                    placeholder="Tu nombre"
                    value={formData.firstName}
                    onChange={handleChange}
                    autoComplete="given-name"
                    autoCapitalize="words"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                  Apellido
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <UserIcon className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="lastName"
                    name="lastName"
                    type="text"
                    required
                    disabled={isLoading}
                    className="appearance-none block w-full pl-10 pr-3 py-3 sm:py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary text-base sm:text-sm transition-colors touch-manipulation disabled:bg-gray-50 disabled:cursor-not-allowed"
                    placeholder="Tu apellido"
                    value={formData.lastName}
                    onChange={handleChange}
                    autoComplete="family-name"
                    autoCapitalize="words"
                  />
                </div>
              </div>
            </div>

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
                  disabled={isLoading}
                  className="appearance-none block w-full pl-10 pr-3 py-3 sm:py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary text-base sm:text-sm transition-colors touch-manipulation disabled:bg-gray-50 disabled:cursor-not-allowed"
                  placeholder="tu@email.com"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  autoCapitalize="off"
                  autoCorrect="off"
                />
              </div>
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Teléfono
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <PhoneIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  pattern="[0-9]{10}"
                  disabled={isLoading}
                  className="appearance-none block w-full pl-10 pr-3 py-3 sm:py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary text-base sm:text-sm transition-colors touch-manipulation disabled:bg-gray-50 disabled:cursor-not-allowed"
                  placeholder="3001234567"
                  value={formData.phone}
                  onChange={handleChange}
                  autoComplete="tel"
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
                  disabled={isLoading}
                  className="appearance-none block w-full pl-10 pr-12 py-3 sm:py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary text-base sm:text-sm transition-colors touch-manipulation disabled:bg-gray-50 disabled:cursor-not-allowed"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
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

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                Confirmar Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  disabled={isLoading}
                  className="appearance-none block w-full pl-10 pr-12 py-3 sm:py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary text-base sm:text-sm transition-colors touch-manipulation disabled:bg-gray-50 disabled:cursor-not-allowed"
                  placeholder="••••••••"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                  ) : (
                    <EyeIcon className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                  )}
                </button>
              </div>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className={`group relative w-full flex justify-center py-3 sm:py-2.5 px-4 border border-transparent rounded-lg text-base sm:text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-300 transform hover:scale-[1.02] touch-manipulation min-h-[48px] ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l-3-2.647z"></path>
                  </svg>
                  Creando cuenta...
                </span>
              ) : (
                'Crear cuenta'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default RegisterPage;
