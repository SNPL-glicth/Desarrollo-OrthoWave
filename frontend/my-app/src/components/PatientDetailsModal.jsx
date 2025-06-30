import React from 'react';

const PatientDetailsModal = ({ patient, isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full mx-4 p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-semibold text-gray-900">
            Detalles del Paciente
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="space-y-4">
          <div>
            <p className="text-sm text-gray-500">Nombre</p>
            <p className="font-medium text-gray-900">{patient.name}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Tratamiento</p>
            <p className="font-medium text-gray-900">{patient.treatment}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Progreso</p>
            <div className="mt-1">
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <div
                  className="bg-primary h-2.5 rounded-full"
                  style={{ width: `${patient.progress}%` }}
                ></div>
              </div>
              <p className="mt-1 text-sm font-medium text-gray-900">{patient.progress}%</p>
            </div>
          </div>
          <div>
            <p className="text-sm text-gray-500">Próxima Cita</p>
            <p className="font-medium text-gray-900">
              {new Date(patient.nextAppointment).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDetailsModal; 