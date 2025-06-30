import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { images } from '../assets';
import { ChevronLeftIcon, ChevronRightIcon, PauseIcon, PlayIcon } from '@heroicons/react/24/outline';

const slides = [
  {
    image: images.medicoClinica,
    title: "Excelencia en OWC Orthowave Colombia",
    description: "Tecnología de vanguardia y atención personalizada para tu bienestar"
  },
  {
    image: images.rehabilitacionFisica,
    title: "Rehabilitación Integral",
    description: "Recupera tu movilidad con nuestro equipo especializado"
  },
  {
    image: images.protesisPierna,
    title: "Soluciones Ortopédicas",
    description: "Prótesis y órtesis de última generación adaptadas a tus necesidades"
  },
  {
    image: images.sesionFisioterapia,
    title: "Fisioterapia Avanzada",
    description: "Tratamientos personalizados para una recuperación efectiva"
  }
];

const ImageCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  const paginate = useCallback((newDirection) => {
    setIsAutoPlaying(false);
    setDirection(newDirection);
    setCurrentIndex((prevIndex) => (prevIndex + newDirection + slides.length) % slides.length);
  }, []);

  useEffect(() => {
    if (!isAutoPlaying) return;

    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prevIndex) => (prevIndex + 1) % slides.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [isAutoPlaying]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        paginate(-1);
      } else if (e.key === 'ArrowRight') {
        paginate(1);
      } else if (e.key === ' ') {
        setIsAutoPlaying(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [paginate]);

  const slideVariants = {
    enter: (direction) => ({
      x: direction > 0 ? '100%' : '-100%',
      opacity: 0
    }),
    center: {
      zIndex: 1,
      x: 0,
      opacity: 1
    },
    exit: (direction) => ({
      zIndex: 0,
      x: direction < 0 ? '100%' : '-100%',
      opacity: 0
    })
  };

  const swipeConfidenceThreshold = 10000;
  const swipePower = (offset, velocity) => {
    return Math.abs(offset) * velocity;
  };

  return (
    <div 
      className="relative h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)] overflow-hidden bg-black"
      role="region"
      aria-label="Image carousel"
    >
      {/* Logo Overlay */}
      <div className="absolute top-8 left-1/2 transform -translate-x-1/2 z-20">
        <img
          src="/images/ortowhite-logo.png"
          alt="OWC Orthowave Colombia"
          className="h-16 md:h-20"
        />
      </div>

      <AnimatePresence initial={false} custom={direction}>
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.5 }
          }}
          drag="x"
          dragConstraints={{ left: 0, right: 0 }}
          dragElastic={1}
          onDragEnd={(e, { offset, velocity }) => {
            const swipe = swipePower(offset.x, velocity.x);
            if (swipe < -swipeConfidenceThreshold) {
              paginate(1);
            } else if (swipe > swipeConfidenceThreshold) {
              paginate(-1);
            }
          }}
          className="absolute inset-0"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
        >
          <div
            className="absolute inset-0 bg-cover bg-center bg-no-repeat transform transition-transform duration-1000"
            style={{ 
              backgroundImage: `url(${slides[currentIndex].image})`,
              backgroundPosition: 'center 20%'
            }}
            onLoad={() => setIsLoading(false)}
          >
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <div className="w-12 h-12 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/60" />
          </div>

          {/* Content Overlay */}
          <div className="absolute inset-0 flex flex-col justify-between py-32 px-4 md:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="text-center mt-20"
            >
              <h2 className="text-4xl md:text-5xl lg:text-6xl font-serif font-bold text-white mb-4 tracking-tight">
                {slides[currentIndex].title}
              </h2>
              <p className="text-xl md:text-2xl text-gray-200 max-w-3xl mx-auto font-light">
                {slides[currentIndex].description}
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-center"
            >
              <button
                onClick={() => {
                  const contactSection = document.querySelector('#contacto');
                  if (contactSection) {
                    contactSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
                className="bg-white text-primary hover:bg-primary hover:text-white px-8 py-3 rounded-full text-lg font-medium transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-black"
              >
                Agenda tu Consulta
              </button>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Progress Bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-800">
        <motion.div
          className="h-full bg-white"
          initial={{ width: "0%" }}
          animate={{ width: isAutoPlaying ? "100%" : "0%" }}
          transition={{ duration: 6, ease: "linear", repeat: isAutoPlaying ? Infinity : 0 }}
          key={currentIndex}
        />
      </div>

      {/* Navigation Dots */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex items-center space-x-3">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setDirection(index > currentIndex ? 1 : -1);
              setCurrentIndex(index);
              setIsAutoPlaying(false);
            }}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentIndex 
                ? 'bg-white w-6' 
                : 'bg-white/50 hover:bg-white/75'
            }`}
            aria-label={`Go to slide ${index + 1}`}
            aria-current={index === currentIndex ? 'true' : 'false'}
          />
        ))}
      </div>

      {/* Play/Pause Button */}
      <button
        className="absolute bottom-8 right-4 p-2 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-colors duration-300 group focus:outline-none focus:ring-2 focus:ring-white"
        onClick={() => setIsAutoPlaying(prev => !prev)}
        aria-label={isAutoPlaying ? 'Pause slideshow' : 'Play slideshow'}
      >
        {isAutoPlaying ? (
          <PauseIcon className="w-6 h-6 text-white opacity-75 group-hover:opacity-100" />
        ) : (
          <PlayIcon className="w-6 h-6 text-white opacity-75 group-hover:opacity-100" />
        )}
      </button>

      {/* Arrow Navigation */}
      <button
        className="absolute left-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-colors duration-300 group focus:outline-none focus:ring-2 focus:ring-white"
        onClick={() => paginate(-1)}
        aria-label="Previous slide"
      >
        <ChevronLeftIcon className="w-6 h-6 text-white opacity-75 group-hover:opacity-100" />
      </button>
      <button
        className="absolute right-4 top-1/2 transform -translate-y-1/2 p-2 rounded-full bg-black/30 backdrop-blur-sm hover:bg-black/50 transition-colors duration-300 group focus:outline-none focus:ring-2 focus:ring-white"
        onClick={() => paginate(1)}
        aria-label="Next slide"
      >
        <ChevronRightIcon className="w-6 h-6 text-white opacity-75 group-hover:opacity-100" />
      </button>
    </div>
  );
};

export default ImageCarousel; 