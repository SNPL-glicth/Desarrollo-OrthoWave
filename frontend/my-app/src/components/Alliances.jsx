import React from 'react';
import { motion } from 'framer-motion';
import { BuildingOffice2Icon, ShieldCheckIcon } from '@heroicons/react/24/outline';

const Alliances = () => {
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white py-20" id="alianzas">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Nuestras Alianzas Estratégicas
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Trabajamos con las mejores aseguradoras y centros médicos para brindarte la mejor atención
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Aseguradoras */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="flex items-center space-x-4 mb-8">
              <ShieldCheckIcon className="h-8 w-8 text-primary" />
              <h3 className="text-2xl font-bold text-gray-900">Aseguradoras Aliadas</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {insurers.map((insurer) => (
                <motion.div
                  key={insurer.name}
                  variants={itemVariants}
                  className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 overflow-hidden group"
                >
                  <a 
                    href={insurer.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="p-6 block"
                  >
                    <div className="h-20 flex items-center justify-center mb-4 relative overflow-hidden bg-white">
                      <img
                        src={insurer.logo}
                        alt={insurer.name}
                        className="h-16 w-auto object-contain transition-transform duration-300 group-hover:scale-110"
                      />
                    </div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-2 text-center">
                      {insurer.name}
                    </h4>
                    <p className="text-gray-600 text-sm text-center">
                      {insurer.description}
                    </p>
                  </a>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Clínicas y Hospitales */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            className="space-y-8"
          >
            <div className="flex items-center space-x-4 mb-8">
              <BuildingOffice2Icon className="h-8 w-8 text-primary" />
              <h3 className="text-2xl font-bold text-gray-900">Centros Médicos Aliados</h3>
            </div>
            <div className="grid grid-cols-1 gap-6">
              {hospitals.map((hospital) => (
                <motion.div
                  key={hospital.name}
                  variants={itemVariants}
                  className="relative h-64 rounded-xl shadow-lg overflow-hidden group"
                  style={{
                    backgroundImage: `linear-gradient(rgba(0, 0, 0, 0.3), rgba(0, 0, 0, 0.3)), url(${hospital.backgroundImage})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundColor: '#f3f4f6'
                  }}
                >
                  <div className="absolute inset-0 bg-black bg-opacity-30 transition-opacity duration-300 group-hover:bg-opacity-20" />
                  <div className="relative h-full p-8 flex flex-col justify-end">
                    <h4 className="text-2xl font-semibold text-white mb-3">
                      {hospital.name}
                    </h4>
                    <p className="text-white text-opacity-90">
                      {hospital.description}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Alliances; 