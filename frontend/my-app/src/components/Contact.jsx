import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPinIcon, PhoneIcon } from '@heroicons/react/24/outline';
import { useNavigate } from 'react-router-dom';

const Contact = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nombre: '',
    email: '',
    telefono: '',
    mensaje: '',
  });
  
  const [enviado, setEnviado] = useState(false);
  const [error, setError] = useState(false);

  // Añadir hook para manejar el scroll cuando se carga la página con hash #contacto
  useEffect(() => {
    const handleHashChange = () => {
      if (window.location.hash === '#contacto') {
        setTimeout(() => {
          const element = document.getElementById('contacto');
          if (element) {
            const headerOffset = 80; // Altura aproximada del navbar
            const elementPosition = element.getBoundingClientRect().top + window.scrollY;
            const offsetPosition = elementPosition - headerOffset;
            
            window.scrollTo({
              top: offsetPosition,
              behavior: 'smooth'
            });
          }
        }, 100);
      }
    };

    // Ejecutar una vez al cargar si ya hay un hash
    handleHashChange();

    // Añadir event listener para cambios en el hash
    window.addEventListener('hashchange', handleHashChange);
    
    // Limpiar event listener
    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Aquí iría la lógica para enviar el formulario a un backend
    try {
      // Simulación de envío exitoso
      console.log('Formulario enviado:', formData);
      
      // Guardar los datos antes de resetear el formulario
      const datosParaRegistro = {
        nombre: formData.nombre,
        email: formData.email,
        telefono: formData.telefono
      };
      
      setEnviado(true);
      setError(false);
      
      // Resetear formulario después de envío exitoso
      setFormData({
        nombre: '',
        email: '',
        telefono: '',
        mensaje: '',
      });
      
      // Redirigir al registro después de 2 segundos con los datos guardados
      setTimeout(() => {
        navigate('/register', {
          state: {
            message: 'Gracias por contactarnos. Tu mensaje ha sido enviado exitosamente. Completa tu registro para acceder a nuestros servicios.',
            prefilledData: datosParaRegistro
          }
        });
      }, 2000);
      
    } catch (err) {
      console.error('Error al enviar formulario:', err);
      setError(true);
      setTimeout(() => setError(false), 5000);
    }
  };

  // Animaciones para componentes
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
      },
    },
  };

  return (
    <div id="contacto" className="container mx-auto px-4 py-8 sm:py-12">
      <motion.div
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={containerVariants}
        className="text-center mb-8 sm:mb-12"
      >
        <motion.h2 variants={itemVariants} className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-800 mb-2 sm:mb-4">
          Contáctanos
        </motion.h2>
        <motion.p variants={itemVariants} className="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto px-4">
          Estamos aquí para resolver todas tus dudas. Completa el formulario y nos pondremos en contacto contigo lo antes posible.
        </motion.p>
      </motion.div>

      {/* Sección superior: Formulario y Mapa */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-start mb-12">
        {/* Formulario de contacto */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
          className="bg-white rounded-xl shadow-xl p-4 sm:p-6 md:p-8"
        >
          {enviado && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-green-100 border border-green-400 text-green-700 rounded text-sm sm:text-base">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="font-semibold">¡Mensaje enviado exitosamente!</p>
                  <p className="text-sm">Te responderemos pronto. Serás redirigido al registro en un momento...</p>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-red-100 border border-red-400 text-red-700 rounded text-sm sm:text-base">
              Hubo un error al enviar el formulario. Por favor, intenta nuevamente.
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <motion.div variants={itemVariants} className="mb-4 sm:mb-6">
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Nombre completo*
              </label>
              <input
                type="text"
                id="nombre"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                required
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="Tu nombre"
              />
            </motion.div>

            <motion.div variants={itemVariants} className="mb-4 sm:mb-6">
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Correo electrónico*
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="tucorreo@ejemplo.com"
              />
            </motion.div>

            <motion.div variants={itemVariants} className="mb-4 sm:mb-6">
              <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Teléfono
              </label>
              <input
                type="tel"
                id="telefono"
                name="telefono"
                value={formData.telefono}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="+57 300 123 4567"
              />
            </motion.div>

            <motion.div variants={itemVariants} className="mb-4 sm:mb-6">
              <label htmlFor="mensaje" className="block text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                Mensaje*
              </label>
              <textarea
                id="mensaje"
                name="mensaje"
                rows="4"
                value={formData.mensaje}
                onChange={handleChange}
                required
                className="w-full px-3 sm:px-4 py-2 sm:py-3 text-sm sm:text-base border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary"
                placeholder="¿En qué podemos ayudarte?"
              ></textarea>
            </motion.div>

            <motion.div variants={itemVariants}>
              <button
                type="submit"
                className="w-full bg-primary hover:bg-primary-dark text-white font-bold py-2 sm:py-3 px-4 sm:px-6 rounded-lg transition-colors duration-300 text-sm sm:text-base"
              >
                Enviar mensaje
              </button>
            </motion.div>
          </form>
        </motion.div>

        {/* Mapa de Google */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
          className="bg-white rounded-xl shadow-xl p-4 sm:p-6 md:p-8"
        >
          <motion.div variants={itemVariants}>
            <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">
              Nuestra Ubicación
            </h3>
            <div className="relative w-full h-64 sm:h-80 rounded-lg overflow-hidden">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3976.3!2d-74.0351!3d4.7231!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8e3f85b123456789%3A0x123456789abcdef0!2sCalle%20134%20%237B-83%2C%20Bogot%C3%A1%2C%20Colombia!5e0!3m2!1ses!2sco!4v1700000000000!5m2!1ses!2sco"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                title="Ubicación OrthoWave - Cll. 134 # 7 B - 83 Of. 122, Bogotá"
              ></iframe>
            </div>
            <p className="text-sm text-gray-600 mt-3">
              <MapPinIcon className="h-4 w-4 inline mr-1" />
              Cll. 134 # 7 B - 83 Of. 122, Bogotá, Colombia
            </p>
          </motion.div>
        </motion.div>
      </div>

      {/* Sección inferior: Información de contacto */}
      <div className="max-w-4xl mx-auto">
        {/* Información de contacto */}
        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.2 }}
          variants={containerVariants}
          className="bg-white rounded-xl shadow-xl p-4 sm:p-6 md:p-8"
        >
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
            {/* Información de contacto */}
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">
                Información de contacto
              </h3>
              <div className="space-y-4 sm:space-y-6">
                <div className="flex items-start">
                  <MapPinIcon className="h-6 w-6 text-primary mt-1" />
                  <div className="ml-3">
                    <h4 className="text-sm sm:text-base font-medium text-gray-800">Dirección</h4>
                    <p className="text-sm sm:text-base text-gray-600 mt-1">
                      Cll. 134 # 7 B - 83 Of. 122, Bogotá, Colombia
                    </p>
                  </div>
                </div>
                <div className="flex items-start">
                  <PhoneIcon className="h-6 w-6 text-primary mt-1" />
                  <div className="ml-3">
                    <h4 className="text-sm sm:text-base font-medium text-gray-800">Teléfono</h4>
                    <p className="text-sm sm:text-base text-gray-600 mt-1">
                      6015200010 - 6015200010
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Horario de atención */}
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-gray-800 mb-4 sm:mb-6">
                Horario de atención
              </h3>
              <div className="space-y-3 sm:space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm sm:text-base text-gray-700 font-medium">Lunes - Viernes</span>
                  <span className="text-sm sm:text-base text-primary font-semibold">8:00 AM - 6:00 PM</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-sm sm:text-base text-gray-700 font-medium">Sábados</span>
                  <span className="text-sm sm:text-base text-primary font-semibold">9:00 AM - 1:00 PM</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-sm sm:text-base text-gray-700 font-medium">Domingos</span>
                  <span className="text-sm sm:text-base text-red-600 font-semibold">Cerrado</span>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default Contact; 