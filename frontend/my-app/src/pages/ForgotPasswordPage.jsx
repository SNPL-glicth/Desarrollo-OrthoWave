import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { EnvelopeIcon, ArrowLeftIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import api from '../services/api';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEmailSent, setIsEmailSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      const response = await api.post('/auth/forgot-password', {
        email: email.trim().toLowerCase()
      });

      console.log('Respuesta de forgot-password:', response.data);
      setIsEmailSent(true);
    } catch (error) {
      console.error('Error en forgot-password:', error);
      
      if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('Error al enviar el correo de recuperación. Intenta nuevamente.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (isEmailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-gray-100"
        >
          <div className="text-center">
            <div className="mx-auto h-20 w-20 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <CheckCircleIcon className="h-10 w-10 text-green-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              ¡Email Enviado!
            </h2>
            <p className="text-gray-600 mb-6">
              Si el correo <span className="font-semibold text-gray-900">{email}</span> está registrado, 
              recibirás un enlace para restablecer tu contraseña.
            </p>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <EnvelopeIcon className="h-5 w-5 text-blue-400 mt-0.5" />
                </div>
                <div className="ml-3 text-sm">
                  <p className="text-blue-800 font-medium mb-1">Revisa tu bandeja de entrada</p>
                  <p className="text-blue-700">
                    El enlace de recuperación expira en <strong>1 hora</strong>. 
                    Si no ves el correo, revisa tu carpeta de spam.
                  </p>
                </div>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <Link
              to="/login"
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-300 transform hover:scale-[1.02]"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Volver al Login
            </Link>
            
            <button
              onClick={() => {
                setIsEmailSent(false);
                setEmail('');
                setError('');
              }}
              className="w-full flex justify-center py-3 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
            >
              Enviar a otro correo
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-gray-100"
      >
        <div className="text-center relative">
          <Link
            to="/login"
            className="absolute -top-2 left-0 inline-flex items-center text-sm text-gray-500 hover:text-primary transition-colors group"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-1 group-hover:transform group-hover:-translate-x-1 transition-transform" />
            Volver al login
          </Link>
          
          <div className="mx-auto h-20 w-20 bg-gradient-to-br from-blue-100 to-cyan-100 rounded-full flex items-center justify-center mb-6 shadow-lg">
            <EnvelopeIcon className="h-10 w-10 text-blue-600" />
          </div>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            ¿Olvidaste tu contraseña?
          </h2>
          <p className="text-gray-600">
            No te preocupes, ingresa tu correo y te enviaremos un enlace para recuperarla.
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
                placeholder="Ingresa tu correo electrónico"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                }}
                disabled={isLoading}
                autoComplete="email"
                autoCapitalize="off"
                autoCorrect="off"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading || !email.trim()}
              className={`group relative w-full flex justify-center py-3 sm:py-2.5 px-4 border border-transparent rounded-lg text-base sm:text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-300 transform hover:scale-[1.02] touch-manipulation min-h-[44px] ${isLoading || !email.trim() ? 'opacity-75 cursor-not-allowed' : ''}`}
            >
              {isLoading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Enviando...
                </span>
              ) : (
                'Enviar Enlace de Recuperación'
              )}
            </button>
          </div>

          <div className="text-center">
            <p className="text-sm text-gray-600">
              ¿Recordaste tu contraseña?{' '}
              <Link to="/login" className="font-medium text-primary hover:text-primary-dark transition-colors">
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default ForgotPasswordPage;
