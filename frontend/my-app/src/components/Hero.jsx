import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const Hero = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

const slides = [
  {
      image: '/images/slider1.webp',
      title: 'Bienvenidos a OWC Colombia',
      subtitle: 'Expertos en Ortopedia y Traumatología',
      description: 'Brindamos atención especializada con los más altos estándares de calidad'
  },
  {
      image: '/images/slider2.webp',
      title: 'Tecnología de Vanguardia',
      subtitle: 'Equipos de última generación',
      description: 'Contamos con la más avanzada tecnología para tu tratamiento'
  },
  {
      image: '/images/slider3.webp',
      title: 'Atención Personalizada',
      subtitle: 'Equipo médico especializado',
      description: 'Nuestro equipo está comprometido con tu bienestar'
    }
  ];

  useEffect(() => {
    let interval;
    if (isAutoPlaying) {
      interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % slides.length);
      }, 5000);
    }
    return () => clearInterval(interval);
  }, [isAutoPlaying, slides.length]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
    setIsAutoPlaying(false);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
    setIsAutoPlaying(false);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
    setIsAutoPlaying(false);
  };

  return (
    <div className="relative h-[calc(100vh-4rem)] sm:h-screen pt-16" id="inicio">
      <div className="absolute inset-0 top-16 overflow-hidden">
        <AnimatePresence initial={false}>
        <motion.div
            key={currentSlide}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5 }}
          className="absolute inset-0"
        >
      <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${slides[currentSlide].image})` }}
      >
              <div className="absolute inset-0 bg-black bg-opacity-50" />
      </div>
          </motion.div>
        </AnimatePresence>

        {/* Contenido del slide */}
        <div className="relative h-full flex items-center justify-center text-white px-4 sm:px-6">
          <motion.div
            key={`content-${currentSlide}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            className="text-center max-w-4xl mx-auto px-4 sm:px-6"
            >
            <h1 className="text-3xl sm:text-4xl md:text-6xl font-bold mb-2 sm:mb-4">
              {slides[currentSlide].title}
            </h1>
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold mb-2 sm:mb-4 text-primary">
              {slides[currentSlide].subtitle}
              </h2>
            <p className="text-base sm:text-lg md:text-xl mb-6 sm:mb-8">
              {slides[currentSlide].description}
            </p>
            <a
              href="#contacto"
              className="inline-block bg-primary hover:bg-primary-dark text-white font-bold py-2 sm:py-3 px-6 sm:px-8 rounded-lg transition-colors duration-300 text-sm sm:text-base"
            >
              Agenda tu Cita
            </a>
          </motion.div>
        </div>

        {/* Controles del carrusel */}
        <div className="absolute bottom-4 sm:bottom-8 left-0 right-0 flex justify-center space-x-3 sm:space-x-4">
        {slides.map((_, index) => (
          <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full transition-all duration-300 ${
                currentSlide === index ? 'bg-primary scale-125' : 'bg-white opacity-50 hover:opacity-75'
            }`}
          />
        ))}
      </div>

        {/* Botones de navegación */}
      <button
          onClick={prevSlide}
          className="absolute left-2 sm:left-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 rounded-full p-1.5 sm:p-2 transition-all duration-300"
      >
          <ChevronLeftIcon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
      </button>
      <button
          onClick={nextSlide}
          className="absolute right-2 sm:right-4 top-1/2 transform -translate-y-1/2 bg-black bg-opacity-50 hover:bg-opacity-75 rounded-full p-1.5 sm:p-2 transition-all duration-300"
      >
          <ChevronRightIcon className="h-6 w-6 sm:h-8 sm:w-8 text-white" />
      </button>
      </div>
    </div>
  );
};

export default Hero; 