import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { authService } from '../services/auth.service';

const VerificationPage = () => {
  const [email, setEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (!email.trim() || !verificationCode.trim()) {
        throw new Error('Por favor ingresa tu correo y el código de verificación');
      }
      const response = await authService.verifyCode(email, verificationCode);
      if (response.message === 'Cuenta verificada exitosamente.') {
        setSuccess(true);
      } else {
        setError('Código incorrecto o cuenta ya verificada.');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Error al verificar el código.');
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-lg relative"
        >
          <h2 className="text-center text-3xl font-bold text-green-600 mb-4">¡Cuenta verificada!</h2>
          <p className="text-center text-gray-700 mb-6">Tu cuenta ha sido verificada exitosamente. Ahora puedes iniciar sesión.</p>
          <button
            onClick={() => navigate('/login')}
            className="w-full py-2.5 px-4 rounded-lg text-white bg-primary hover:bg-primary-dark font-medium transition-all"
          >
            Ir a iniciar sesión
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-lg relative"
      >
        <button
          onClick={() => navigate('/register')}
          className="absolute top-4 left-4 p-2 text-gray-600 hover:text-primary transition-colors rounded-full hover:bg-gray-100"
        >
          <ArrowLeftIcon className="h-6 w-6" />
        </button>

        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900">
            Verifica tu cuenta
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Ingresa el correo y el código de verificación que te enviamos
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
              Correo electrónico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm transition-colors"
              placeholder="tucorreo@ejemplo.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setError('');
              }}
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="verificationCode" className="block text-sm font-medium text-gray-700 mb-1">
              Código de verificación
            </label>
            <input
              id="verificationCode"
              name="verificationCode"
              type="text"
              required
              maxLength={6}
              className="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary sm:text-sm transition-colors"
              placeholder="Ingresa el código de 6 dígitos"
              value={verificationCode}
              onChange={(e) => {
                setVerificationCode(e.target.value.replace(/[^0-9]/g, ''));
                setError('');
              }}
              disabled={isLoading}
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Verificando...' : 'Verificar cuenta'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default VerificationPage; 