import React from 'react';
import { motion } from 'framer-motion';
import DoctorsCarousel from './DoctorsCarousel';
import { doctors } from '../data/doctors';

const AboutUs = () => {
  const insurers = [
    {
      name: "EPS SURA",
      logo: "/images/Logos/sura.webp",
      description: "Aliado estratégico en servicios de salud",
      url: "https://www.epssura.com/"
    },
    {
      name: "Allianz",
      logo: "/images/Logos/allianz.webp",
      description: "Cobertura internacional en servicios médicos",
      url: "https://www.allianz.co/"
    },
    {
      name: "Positiva",
      logo: "/images/Logos/positiva.webp",
      description: "Especialistas en seguros de riesgos laborales",
      url: "https://www.positiva.gov.co/"
    },
    {
      name: "AXA Colpatria",
      logo: "/images/Logos/logo-axa-colpatria.webp",
      description: "Soluciones integrales en salud",
      url: "https://www.axacolpatria.co/"
    },
    {
      name: "Seguros Bolivar",
      logo: "/images/Logos/seguros bolivar.webp",
      description: "Respaldo y confianza en servicios médicos",
      url: "https://www.segurosbolivar.com/"
    }
  ];

  const hospitals = [
    {
      name: "Los Cobos Medical Center",
      logo: "/images/Logos/cobos.webp",
      description: "Centro médico de alta complejidad",
      backgroundImage: "/images/Logos/cobos.webp"
    },
    {
      name: "Clínica Azul",
      logo: "/images/Logos/clinicaazul.webp",
      description: "Excelencia en atención hospitalaria",
      backgroundImage: "/images/Logos/clinicaazul.webp"
    }
  ];

  return (
    <div className="bg-white py-8 sm:py-16" id="nosotros">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Encabezado con animación */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-8 sm:mb-16"
        >
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">
            OWC Colombia SAS
          </h2>
          <p className="text-base sm:text-lg md:text-xl text-gray-600 max-w-3xl mx-auto px-4">
            Somos una IPS especializada en servicios de salud con énfasis en Ortopedia y Traumatología,
            comprometidos con la excelencia y el bienestar de nuestros pacientes.
          </p>
        </motion.div>

        {/* Grid de información institucional */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 sm:gap-12 mb-8 sm:mb-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="space-y-6 sm:space-y-8"
          >
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-primary mb-2 sm:mb-4">Misión</h3>
              <p className="text-sm sm:text-base text-gray-600">
                Somos una IPS de Ortopedia y Traumatología de alta calidad que busca satisfacer y mejorar 
                la calidad de vida de nuestros pacientes física y emocionalmente. Ofrecemos atención 
                personalizada enfocada en la calidez y el trato humano.
              </p>
            </div>
            <div>
              <h3 className="text-xl sm:text-2xl font-bold text-primary mb-2 sm:mb-4">Visión</h3>
              <p className="text-sm sm:text-base text-gray-600">
                En el 2030 seremos un centro de vanguardia líder en Bogotá, con reconocimiento nacional 
                e internacional, superando las expectativas de nuestros pacientes en las áreas de Ortopedia, 
                Neurocirugía y Medicina General.
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6"
          >
            <div className="bg-gray-50 p-4 sm:p-6 rounded-lg">
              <h4 className="text-lg sm:text-xl font-bold text-primary mb-1 sm:mb-2">Experiencia</h4>
              <p className="text-sm sm:text-base text-gray-600">Más de 10 años brindando atención especializada</p>
            </div>
            <div className="bg-gray-50 p-4 sm:p-6 rounded-lg">
              <h4 className="text-lg sm:text-xl font-bold text-primary mb-1 sm:mb-2">Pacientes</h4>
              <p className="text-sm sm:text-base text-gray-600">Miles de pacientes satisfechos con nuestros servicios</p>
            </div>
            <div className="bg-gray-50 p-4 sm:p-6 rounded-lg">
              <h4 className="text-lg sm:text-xl font-bold text-primary mb-1 sm:mb-2">Especialistas</h4>
              <p className="text-sm sm:text-base text-gray-600">Equipo médico altamente calificado y especializado</p>
            </div>
            <div className="bg-gray-50 p-4 sm:p-6 rounded-lg">
              <h4 className="text-lg sm:text-xl font-bold text-primary mb-1 sm:mb-2">Tecnología</h4>
              <p className="text-sm sm:text-base text-gray-600">Equipamiento de última generación para diagnóstico y tratamiento</p>
            </div>
          </motion.div>
        </div>

        {/* Sección de doctores */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-8 sm:mb-16"
        >
          <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-6 sm:mb-8 text-center">
            Nuestro Equipo Médico
          </h3>
          <DoctorsCarousel doctors={doctors} />
        </motion.div>

        {/* Sección de aseguradoras */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-16 sm:mb-24"
        >
          <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 sm:mb-12 text-center">
            Aseguradoras Aliadas
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 sm:gap-6">
            {insurers.map((insurer, index) => (
              <motion.a
                key={index}
                href={insurer.url}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <div className="bg-white rounded-xl p-4 sm:p-6 shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100">
                  <div className="aspect-w-16 aspect-h-9 mb-3 sm:mb-4">
                    <img
                      src={insurer.logo}
                      alt={insurer.name}
                      className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300"
                    />
                  </div>
                  <div className="text-center">
                    <p className="text-xs sm:text-sm text-gray-600 font-medium mt-1 sm:mt-2">{insurer.description}</p>
                  </div>
                </div>
              </motion.a>
            ))}
          </div>
        </motion.div>

        {/* Sección de hospitales */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="mb-8 sm:mb-16"
        >
          <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-8 sm:mb-12 text-center">
            Centros Médicos Asociados
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-12">
            {hospitals.map((hospital, index) => (
              <motion.div
                key={index}
                className="relative overflow-hidden rounded-xl sm:rounded-2xl shadow-xl group"
                initial={{ opacity: 0, scale: 0.95 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
              >
                <div className="relative h-60 sm:h-80">
                  <div
                    className="absolute inset-0 bg-cover bg-center transform group-hover:scale-110 transition-transform duration-700"
                    style={{ backgroundImage: `url(${hospital.backgroundImage})` }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent group-hover:from-black/90 transition-all duration-300">
                    <div className="absolute inset-0 flex flex-col justify-end p-4 sm:p-8">
                      <div className="transform group-hover:-translate-y-4 transition-transform duration-300">
                        <h4 className="text-2xl sm:text-3xl font-bold text-white mb-2 sm:mb-3 text-center">{hospital.name}</h4>
                        <p className="text-base sm:text-lg text-gray-200 text-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          {hospital.description}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AboutUs; 