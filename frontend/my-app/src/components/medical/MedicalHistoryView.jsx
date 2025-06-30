import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { XMarkIcon, ChevronDownIcon } from '@heroicons/react/24/outline';

const MedicalHistoryView = ({ isOpen, onClose, patient, history }) => {
  const [selectedRecord, setSelectedRecord] = useState(null);

  if (!isOpen) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-50 flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="bg-white rounded-xl shadow-xl max-w-4xl w-full p-6 relative max-h-[90vh] overflow-y-auto"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Historial Médico</h2>
          <div className="mt-2 p-4 bg-gray-50 rounded-lg">
            <h3 className="font-medium text-gray-900">Información del Paciente</h3>
            <div className="mt-2 grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Nombre completo</p>
                <p className="font-medium">{patient.firstName} {patient.lastName}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Documento</p>
                <p className="font-medium">{patient.documentType} {patient.documentId}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Fecha de nacimiento</p>
                <p className="font-medium">{formatDate(patient.birthDate)}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Teléfono</p>
                <p className="font-medium">{patient.phone}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {history.map((record) => (
            <div
              key={record.id}
              className="border rounded-lg overflow-hidden"
            >
              <button
                onClick={() => setSelectedRecord(selectedRecord === record.id ? null : record.id)}
                className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50"
              >
                <div>
                  <p className="font-medium text-gray-900">{formatDate(record.date)}</p>
                  <p className="text-sm text-gray-500">{record.doctorName}</p>
                </div>
                <ChevronDownIcon
                  className={`h-5 w-5 text-gray-400 transition-transform ${
                    selectedRecord === record.id ? 'transform rotate-180' : ''
                  }`}
                />
              </button>

              {selectedRecord === record.id && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="border-t px-4 py-3 bg-gray-50"
                >
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Diagnóstico</h4>
                      <p className="mt-1 text-gray-700">{record.diagnosis}</p>
                    </div>

                    <div>
                      <h4 className="text-sm font-medium text-gray-900">Tratamiento</h4>
                      <p className="mt-1 text-gray-700">{record.treatment}</p>
                    </div>

                    {record.prescription && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Prescripción</h4>
                        <p className="mt-1 text-gray-700">{record.prescription}</p>
                      </div>
                    )}

                    {record.notes && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Notas Adicionales</h4>
                        <p className="mt-1 text-gray-700">{record.notes}</p>
                      </div>
                    )}

                    {record.attachments && record.attachments.length > 0 && (
                      <div>
                        <h4 className="text-sm font-medium text-gray-900">Archivos Adjuntos</h4>
                        <div className="mt-2 grid grid-cols-2 gap-4">
                          {record.attachments.map((attachment, index) => (
                            <a
                              key={index}
                              href={attachment.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center p-2 text-sm text-primary hover:bg-primary/5 rounded"
                            >
                              <span className="truncate">{attachment.name}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default MedicalHistoryView; 