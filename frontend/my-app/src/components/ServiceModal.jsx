import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const ServiceModal = ({ isOpen, onClose, service }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  // Información detallada para cada servicio
  const serviceDetails = {
    "Rehabilitación Física": {
      slides: [
        {
          title: "Evaluación Inicial",
          description: "Realizamos una evaluación completa de tu condición para desarrollar un plan de tratamiento personalizado.",
          points: [
            "Valoración física detallada",
            "Análisis de historial médico",
            "Establecimiento de objetivos",
            "Plan de tratamiento personalizado"
          ]
        },
        {
          title: "Técnicas de Rehabilitación",
          description: "Utilizamos diversas técnicas terapéuticas para optimizar tu recuperación.",
          points: [
            "Terapia manual especializada",
            "Ejercicios terapéuticos",
            "Electroterapia",
            "Ultrasonido terapéutico"
          ]
        },
        {
          title: "Seguimiento y Progresión",
          description: "Monitoreamos constantemente tu evolución para ajustar el tratamiento.",
          points: [
            "Evaluaciones periódicas",
            "Ajustes del plan de tratamiento",
            "Educación al paciente",
            "Prevención de recaídas"
          ]
        }
      ]
    },
    "Medicina Deportiva": {
      slides: [
        {
          title: "Evaluación Deportiva",
          description: "Evaluación especializada para deportistas de todos los niveles.",
          points: [
            "Análisis biomecánico",
            "Evaluación de rendimiento",
            "Pruebas funcionales",
            "Valoración de capacidades físicas"
          ]
        },
        {
          title: "Prevención de Lesiones",
          description: "Programas específicos para prevenir lesiones deportivas.",
          points: [
            "Análisis de factores de riesgo",
            "Técnicas de entrenamiento preventivo",
            "Educación en mecánica corporal",
            "Programas de fortalecimiento"
          ]
        },
        {
          title: "Rehabilitación Deportiva",
          description: "Recuperación especializada para retorno seguro al deporte.",
          points: [
            "Protocolos específicos por deporte",
            "Rehabilitación funcional",
            "Readaptación deportiva",
            "Evaluación de retorno al deporte"
          ]
        }
      ]
    },
    "Diagnóstico Avanzado": {
      slides: [
        {
          title: "Evaluación Diagnóstica",
          description: "Utilizamos tecnología avanzada para diagnósticos precisos.",
          points: [
            "Análisis postural computarizado",
            "Evaluación de la marcha",
            "Medición de rangos articulares",
            "Valoración muscular digital"
          ]
        },
        {
          title: "Tecnologías Diagnósticas",
          description: "Equipamiento de última generación para evaluaciones precisas.",
          points: [
            "Ecografía musculoesquelética",
            "Análisis de pisada",
            "Evaluación isocinética",
            "Termografía digital"
          ]
        },
        {
          title: "Plan de Intervención",
          description: "Desarrollo de estrategias de tratamiento basadas en evidencia.",
          points: [
            "Interpretación de resultados",
            "Planificación terapéutica",
            "Objetivos de tratamiento",
            "Seguimiento de progreso"
          ]
        }
      ]
    },
    "Terapia Física": {
      slides: [
        {
          title: "Modalidades Terapéuticas",
          description: "Diversas técnicas de terapia física para tu recuperación.",
          points: [
            "Terapia manual avanzada",
            "Ejercicios terapéuticos",
            "Hidroterapia",
            "Vendaje neuromuscular"
          ]
        },
        {
          title: "Rehabilitación Funcional",
          description: "Enfoque en recuperar la funcionalidad y autonomía.",
          points: [
            "Entrenamiento funcional",
            "Reeducación postural",
            "Técnicas de propiocepción",
            "Ejercicios de estabilización"
          ]
        },
        {
          title: "Terapias Especializadas",
          description: "Tratamientos específicos según tu condición.",
          points: [
            "Punción seca",
            "Terapia miofascial",
            "Ejercicios neuromotores",
            "Técnicas de movilización"
          ]
        }
      ]
    }
  };

  const slides = serviceDetails[service?.title]?.slides || [];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center px-4 bg-black bg-opacity-75"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-4xl bg-white rounded-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Botón de cerrar */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
            >
              <XMarkIcon className="w-6 h-6 text-gray-600" />
            </button>

            <div className="p-8">
              {/* Título del servicio */}
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{service?.title}</h2>
              <p className="text-gray-600 mb-8">{service?.description}</p>

              {/* Carrusel */}
              <div className="relative">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentSlide}
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.3 }}
                    className="bg-gray-50 rounded-lg p-8"
                  >
                    <h3 className="text-2xl font-bold text-primary mb-4">
                      {slides[currentSlide]?.title}
                    </h3>
                    <p className="text-gray-700 mb-6">
                      {slides[currentSlide]?.description}
                    </p>
                    
                    <ul className="space-y-4">
                      {slides[currentSlide]?.points.map((point, index) => (
                        <li key={index} className="flex items-start">
                          <span className="w-2 h-2 mt-2 mr-3 bg-primary rounded-full"></span>
                          <span className="text-gray-700">{point}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                </AnimatePresence>

                {/* Navegación */}
                <div className="flex justify-between items-center mt-8">
                  <button
                    onClick={prevSlide}
                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    <ChevronLeftIcon className="w-6 h-6 text-gray-600" />
                  </button>

                  {/* Indicadores */}
                  <div className="flex space-x-2">
                    {slides.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        className={`w-3 h-3 rounded-full transition-all duration-300 ${
                          currentSlide === index
                            ? 'bg-primary scale-125'
                            : 'bg-gray-300 hover:bg-gray-400'
                        }`}
                      />
                    ))}
                  </div>

                  <button
                    onClick={nextSlide}
                    className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors"
                  >
                    <ChevronRightIcon className="w-6 h-6 text-gray-600" />
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ServiceModal; 