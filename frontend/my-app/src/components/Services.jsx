import React, { useState } from 'react';
import { motion } from 'framer-motion';
import ServiceModal from './ServiceModal';

const Services = () => {
  const [selectedService, setSelectedService] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const services = [
    {
      title: "Rehabilitación Física",
      subtitle: "Terapia Especializada",
      description: "Programas personalizados de rehabilitación para recuperar tu movilidad y calidad de vida.",
      image: "/images/DoctorAtendiendoPaciente.webp"
    },
    {
      title: "Medicina Deportiva",
      subtitle: "Recuperación Deportiva",
      description: "Tratamientos especializados para atletas y deportistas, enfocados en un retorno seguro a la actividad.",
      image: "/images/primer-plano-de-hombre-con-pierna-mecanica-corriendo-deportista-con-pantalones-cortos-azules-y-zapatillas-blancas-fotografiadas-dur.webp"
    },
    {
      title: "Diagnóstico Avanzado",
      subtitle: "Tecnología de Punta",
      description: "Evaluación precisa de lesiones mediante tecnología de imagen avanzada y diagnóstico experto.",
      image: "/images/medico-con-un-paciente-en-la-clinica-de-fisioterapia.webp"
    },
    {
      title: "Terapia Física",
      subtitle: "Atención Personalizada",
      description: "Tratamientos terapéuticos individualizados para optimizar tu recuperación y bienestar.",
      image: "/images/mujer-que-tiene-una-sesion-de-fisioterapia.webp"
    }
  ];

  const handleServiceClick = (service) => {
    setSelectedService(service);
    setIsModalOpen(true);
  };

  return (
    <div className="bg-white text-black" id="servicios">
      <div className="max-w-[2000px] mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center py-8 sm:py-16 px-4 sm:px-6"
        >
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-2 sm:mb-4">
            Servicios Especializados
          </h2>
          <p className="mt-2 sm:mt-4 max-w-2xl mx-auto text-base sm:text-lg md:text-xl text-gray-600">
            Experiencia médica de clase mundial en ortopedia y rehabilitación
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2">
          {services.map((service, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.2 }}
              className="relative group cursor-pointer h-[400px] sm:h-[500px] md:h-[600px] overflow-hidden"
              onClick={() => handleServiceClick(service)}
            >
              <div 
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-110"
                style={{ backgroundImage: `url(${service.image})` }}
              />
              <div className="absolute inset-0 bg-white bg-opacity-10 transition-opacity duration-500 group-hover:bg-opacity-0" />
              
              <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-8 md:p-12 transition-transform duration-500 group-hover:translate-y-[-10px]">
                <div className="bg-white bg-opacity-90 p-4 sm:p-6 md:p-8 rounded-lg transform transition-all duration-500 group-hover:bg-opacity-95 shadow-lg">
                  <p className="text-base sm:text-lg md:text-xl mb-1 sm:mb-2 text-gray-600">{service.subtitle}</p>
                  <h3 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-2 sm:mb-4 text-black">{service.title}</h3>
                  <p className="text-sm sm:text-base md:text-lg text-gray-800 opacity-90 group-hover:opacity-100 transition-opacity duration-500">
                    {service.description}
                  </p>
                  <button className="mt-4 sm:mt-6 inline-flex items-center text-base sm:text-lg font-semibold text-black hover:text-gray-700 transition-colors duration-300">
                    DESCUBRIR
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 sm:h-6 sm:w-6 ml-2 transition-transform duration-300 group-hover:translate-x-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <ServiceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        service={selectedService}
      />
    </div>
  );
};

export default Services; 