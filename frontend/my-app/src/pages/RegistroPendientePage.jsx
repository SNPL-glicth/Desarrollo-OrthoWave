import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ClockIcon,
  CheckCircleIcon,
  PhoneIcon,
  ChatBubbleBottomCenterTextIcon
} from '@heroicons/react/24/outline';

const RegistroPendientePage = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-white py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-lg"
      >
        <div className="text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-yellow-100 mb-6"
          >
            <ClockIcon className="h-8 w-8 text-yellow-600" />
          </motion.div>
          
          <Link to="/" className="inline-block mb-6">
            <img
              src="/images/White logo - no background_page-0001.webp"
              alt="OWC Logo"
              className="h-12 mx-auto"
            />
          </Link>
          
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            ¡Registro Recibido!
          </h2>
          
          <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-md mb-6">
            <div className="flex">
              <div className="flex-shrink-0">
                <ClockIcon className="h-5 w-5 text-yellow-400" />
              </div>
              <div className="ml-3">
                <p className="text-sm text-yellow-800 font-medium">
                  Tu solicitud de registro está pendiente de aprobación
                </p>
                <p className="text-sm text-yellow-700 mt-1">
                  Será revisada y aprobada en un plazo máximo de 48 horas
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center">
              <CheckCircleIcon className="h-5 w-5 mr-2" />
              ¿Qué sigue?
            </h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start">
                <span className="flex-shrink-0 h-1.5 w-1.5 bg-blue-600 rounded-full mt-2 mr-3"></span>
                Nuestro equipo revisará tu información personal
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 h-1.5 w-1.5 bg-blue-600 rounded-full mt-2 mr-3"></span>
                Recibirás una notificación por correo cuando tu cuenta sea aprobada
              </li>
              <li className="flex items-start">
                <span className="flex-shrink-0 h-1.5 w-1.5 bg-blue-600 rounded-full mt-2 mr-3"></span>
                Podrás acceder al calendario y agendar tu cita
              </li>
            </ul>
          </div>

          <div className="bg-green-50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-green-900 mb-3">
              ¿Necesitas agilizar el proceso?
            </h3>
            <p className="text-sm text-green-800 mb-3">
              Contáctanos por nuestros canales oficiales:
            </p>
            <div className="space-y-2">
              <div className="flex items-center text-sm text-green-700">
                <ChatBubbleBottomCenterTextIcon className="h-4 w-4 mr-2" />
                WhatsApp: +57 300 123 4567
              </div>
              <div className="flex items-center text-sm text-green-700">
                <PhoneIcon className="h-4 w-4 mr-2" />
                Teléfono: (1) 234 5678
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 space-y-3">
          <Link
            to="/login"
            className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg text-sm font-medium text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-all duration-300 transform hover:scale-[1.02]"
          >
            Intentar iniciar sesión
          </Link>
          
          <Link
            to="/"
            className="w-full flex justify-center py-2.5 px-4 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
          >
            Volver al inicio
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default RegistroPendientePage;
