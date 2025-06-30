                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                                  import React from 'react';
import { XMarkIcon } from '@heroicons/react/24/outline';
import { motion, AnimatePresence } from 'framer-motion';

const DoctorModal = ({ doctor, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: "spring", duration: 0.5 }}
          onClick={(e) => e.stopPropagation()}
          className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="grid md:grid-cols-3 gap-6">
            {/* Columna de imagen y detalles básicos */}
            <div className="md:col-span-1 bg-gradient-to-b from-gray-900 to-primary rounded-tl-2xl md:rounded-l-2xl p-6">
              <div className="aspect-w-1 aspect-h-1 rounded-xl overflow-hidden mb-6">
                <img
                  src={doctor.imagen}
                  alt={doctor.nombre}
                  className="w-full h-full object-cover"
                />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">{doctor.nombre}</h2>
              <p className="text-gray-200 text-lg mb-4">{doctor.especialidad}</p>
              {doctor.idiomas && (
                <div className="border-t border-gray-700 pt-4 mt-4">
                  <h3 className="text-white font-semibold mb-2">Idiomas</h3>
                  <p className="text-gray-200">{doctor.idiomas}</p>
                </div>
              )}
            </div>

            {/* Columna de información detallada */}
            <div className="md:col-span-2 p-6 pr-12">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>

              {doctor.formacionAcademica && (
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <svg className="w-6 h-6 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-5-9 5 9 5z"/>
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14v7"/>
                    </svg>
                    Formación Académica
                  </h3>
                  <ul className="space-y-3">
                    {doctor.formacionAcademica.map((item, index) => (
                      <motion.li
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        key={index}
                        className="flex items-start"
                      >
                        <span className="h-2 w-2 mt-2 rounded-full bg-primary mr-3 flex-shrink-0"/>
                        <span className="text-gray-600">{item}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              )}

              {doctor.experienciaRelevante && (
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <svg className="w-6 h-6 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                    </svg>
                    Experiencia Relevante
                  </h3>
                  <ul className="space-y-3">
                    {doctor.experienciaRelevante.map((item, index) => (
                      <motion.li
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        key={index}
                        className="flex items-start"
                      >
                        <span className="h-2 w-2 mt-2 rounded-full bg-primary mr-3 flex-shrink-0"/>
                        <span className="text-gray-600">{item}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              )}

              {doctor.produccionAcademica && (
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <svg className="w-6 h-6 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>
                    </svg>
                    Producción Académica y Reconocimientos
                  </h3>
                  <ul className="space-y-3">
                    {doctor.produccionAcademica.map((item, index) => (
                      <motion.li
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        key={index}
                        className="flex items-start"
                      >
                        <span className="h-2 w-2 mt-2 rounded-full bg-primary mr-3 flex-shrink-0"/>
                        <span className="text-gray-600">{item}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              )}

              {doctor.asociaciones && (
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <svg className="w-6 h-6 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
                    </svg>
                    Asociaciones y Membresías
                  </h3>
                  <ul className="space-y-3">
                    {doctor.asociaciones.map((item, index) => (
                      <motion.li
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        key={index}
                        className="flex items-start"
                      >
                        <span className="h-2 w-2 mt-2 rounded-full bg-primary mr-3 flex-shrink-0"/>
                        <span className="text-gray-600">{item}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              )}

              {doctor.habilidadesClave && (
                <div className="mb-8">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <svg className="w-6 h-6 mr-2 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"/>
                    </svg>
                    Habilidades Clave
                  </h3>
                  <ul className="space-y-3">
                    {doctor.habilidadesClave.map((item, index) => (
                      <motion.li
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        key={index}
                        className="flex items-start"
                      >
                        <span className="h-2 w-2 mt-2 rounded-full bg-primary mr-3 flex-shrink-0"/>
                        <span className="text-gray-600">{item}</span>
                      </motion.li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default DoctorModal; 