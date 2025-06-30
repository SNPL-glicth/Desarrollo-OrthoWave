import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline';

const AppointmentForm = ({ isOpen, onClose, onSubmit, doctors, initialData = null }) => {
  const [formData, setFormData] = useState(initialData || {
    doctorId: '',
    date: '',
    time: '',
    type: 'Consulta General',
    notes: ''
  });

  const appointmentTypes = [
    'Consulta General',
    'Control de Brackets',
    'Limpieza Dental',
    'Extracción',
    'Radiografía',
    'Blanqueamiento',
    'Ortodoncia'
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      dateTime: `${formData.date}T${formData.time}`
    });
  };

  if (!isOpen) return null;

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
        className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <XMarkIcon className="h-6 w-6" />
        </button>

        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          {initialData ? 'Editar Cita' : 'Nueva Cita'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Doctor
            </label>
            <select
              value={formData.doctorId}
              onChange={(e) => setFormData({ ...formData, doctorId: e.target.value })}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              required
            >
              <option value="">Seleccionar doctor</option>
              {doctors.map((doctor) => (
                <option key={doctor.id} value={doctor.id}>
                  Dr. {doctor.firstName} {doctor.lastName} - {doctor.specialty}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fecha
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                required
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Hora
              </label>
              <input
                type="time"
                value={formData.time}
                onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
                required
                min="08:00"
                max="18:00"
                step="1800"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tipo de Cita
            </label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value })}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              required
            >
              {appointmentTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notas Adicionales
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              className="w-full rounded-lg border-gray-300 shadow-sm focus:border-primary focus:ring-primary"
              rows="3"
              placeholder="Escriba cualquier información adicional relevante..."
            />
          </div>

          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90"
            >
              {initialData ? 'Actualizar' : 'Agendar'} Cita
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default AppointmentForm; 