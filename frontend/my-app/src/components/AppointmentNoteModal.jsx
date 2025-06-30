import React, { useState } from 'react';

const AppointmentNoteModal = ({ appointment, isOpen, onClose }) => {
  const [note, setNote] = useState('');

  if (!isOpen) return null;

  const handleSave = () => {
    // Aquí iría la lógica para guardar la nota
    console.log('Guardando nota:', { appointmentId: appointment.id, note });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full mx-4 p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-semibold text-gray-900">
            Agregar Nota - {appointment.patientName}
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
            <p className="text-sm text-gray-500 mb-2">Fecha de la cita</p>
            <p className="font-medium text-gray-900">
              {new Date(appointment.date).toLocaleDateString()}
            </p>
          </div>
          <div>
            <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-2">
              Nota
            </label>
            <textarea
              id="note"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="w-full h-32 p-2 border rounded-lg resize-none focus:ring-2 focus:ring-primary focus:border-primary"
              placeholder="Escriba su nota aquí..."
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 hover:text-gray-800"
            >
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
            >
              Guardar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AppointmentNoteModal; 