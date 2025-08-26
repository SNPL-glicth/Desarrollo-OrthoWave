import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/auth.service';
import { motion } from 'framer-motion';
import { 
  ArrowLeftIcon,
  EnvelopeIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';

const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  useAuth();

  const email = searchParams.get('email');

  useEffect(() => {
    if (!email) {
      navigate('/register');
    }
  }, [email, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!code || code.length !== 6) {
      setError('El código debe tener 6 dígitos');
      setLoading(false);
      return;
    }

    try {
      const response = await authService.verifyCode(email, code);
      
      if (response.message) {
        toast.success(response.message);
        setSuccess(true);
        
        // Esperar un momento y redirigir al login
        setTimeout(() => {
          navigate('/login', { 
            state: { 
              message: 'Cuenta verificada exitosamente. Puedes iniciar sesión.',
              email: email 
            }
          });
        }, 2000);
      }
    } catch (err) {
      console.error('Error en verificación:', err);
      setError(err.message || 'Error al verificar el código. Por favor intente nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = async () => {
    try {
      setLoading(true);
      // Aquí podrías implementar un endpoint para reenviar el código
      toast.success('Si necesitas reenviar el código, puedes intentar registrarte nuevamente.');
    } catch (err) {
      toast.error('Error al reenviar el código');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-lg text-center"
        >
          <div className="flex justify-center">
            <CheckCircleIcon className="h-16 w-16 text-green-500" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">
            ¡Verificación Exitosa!
          </h2>
          <p className="text-gray-600">
            Tu cuenta ha sido verificada correctamente. Serás redirigido al login en unos segundos...
          </p>
          <div className="animate-spin h-8 w-8 border-b-2 border-primary mx-auto"></div>
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
        <Link
          to="/register"
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
            Verificar tu cuenta
          </h2>
          <div className="mt-4 flex items-center justify-center">
            <EnvelopeIcon className="h-6 w-6 text-primary mr-2" />
            <p className="text-center text-sm text-gray-600">
              Hemos enviado un código de verificación a:
            </p>
          </div>
          <p className="text-center text-sm font-medium text-gray-900 mt-1">
            {email}
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
            <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
              Código de verificación
            </label>
            <input
              id="code"
              name="code"
              type="text"
              maxLength="6"
              pattern="[0-9]{6}"
              required
              className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-lg placeholder-gray-400 focus:outline-none focus:ring-primary focus:border-primary text-center text-2xl font-mono tracking-widest"
              placeholder="000000"
              value={code}
              onChange={(e) => {
                const value = e.target.value.replace(/\D/g, '');
                if (value.length <= 6) {
                  setCode(value);
                }
              }}
            />
            <p className="mt-2 text-xs text-gray-500">
              Ingresa el código de 6 dígitos que enviamos a tu correo
            </p>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="group relative w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin h-5 w-5 border-b-2 border-white mr-2"></div>
                  Verificando...
                </div>
              ) : (
                'Verificar código'
              )}
            </button>
          </div>

          <div className="text-center">
            <button
              type="button"
              onClick={handleResendCode}
              disabled={loading}
              className="text-sm text-primary hover:text-primary-dark transition-colors disabled:opacity-50"
            >
              ¿No recibiste el código? Solicitar ayuda
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default VerifyEmailPage;
