import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { User } from '../../../../types/user';

interface ConfirmationProps {
  selectedDoctor?: User;
  selectedDateTime?: Date;
  appointmentType?: string;
  notes?: string;
  onConfirm: () => void;
  onPrevious?: () => void;
  isLoading?: boolean;
}

const Confirmation: React.FC<ConfirmationProps> = ({
  selectedDoctor,
  selectedDateTime,
  appointmentType = 'Consulta general',
  notes,
  onConfirm,
  onPrevious,
  isLoading = false
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold mb-4">Confirmar Cita</h3>
        <p className="text-gray-600 mb-6">
          Por favor, revisa los detalles de tu cita antes de confirmar:
        </p>
        
        {/* Detalles de la cita */}
        <div className="bg-gray-50 rounded-lg p-6 space-y-4">
          {/* Doctor */}
          <div className="flex items-start space-x-3">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <span className="text-blue-600 font-semibold text-sm">
                {selectedDoctor?.nombre?.charAt(0) || 'D'}
                {selectedDoctor?.apellido?.charAt(0) || 'R'}
              </span>
            </div>
            <div>
              <h4 className="font-medium text-gray-900">
                Dr. {selectedDoctor?.nombre} {selectedDoctor?.apellido}
              </h4>
              <p className="text-sm text-gray-600">
                {selectedDoctor?.especialidad || 'Ortodoncista'}
              </p>
            </div>
          </div>

          {/* Fecha y hora */}
          <div className="border-t pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha
                </label>
                <p className="text-gray-900">
                  {selectedDateTime ? 
                    format(selectedDateTime, 'EEEE, dd \'de\' MMMM \'de\' yyyy', { locale: es }) : 
                    'No seleccionada'
                  }
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Hora
                </label>
                <p className="text-gray-900">
                  {selectedDateTime ? 
                    format(selectedDateTime, 'HH:mm', { locale: es }) : 
                    'No seleccionada'
                  }
                </p>
              </div>
            </div>
          </div>

          {/* Tipo de cita */}
          <div className="border-t pt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tipo de cita
            </label>
            <p className="text-gray-900">{appointmentType}</p>
          </div>

          {/* Notas */}
          {notes && (
            <div className="border-t pt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notas adicionales
              </label>
              <p className="text-gray-900">{notes}</p>
            </div>
          )}
        </div>

        {/* Información importante */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-6">
          <h4 className="font-medium text-yellow-800 mb-2">
            Información importante:
          </h4>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Llega 15 minutos antes de tu cita</li>
            <li>• Trae una identificación válida</li>
            <li>• Si necesitas cancelar, hazlo con al menos 24 horas de anticipación</li>
            <li>• Recibirás un recordatorio por email y SMS</li>
          </ul>
        </div>
      </div>

      {/* Botones de navegación */}
      <div className="flex justify-between pt-6">
        <button
          onClick={onPrevious}
          disabled={isLoading}
          className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
        >
          Anterior
        </button>
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className={`px-6 py-2 rounded-lg font-medium ${
            isLoading
              ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
              : 'bg-green-500 text-white hover:bg-green-600'
          }`}
        >
          {isLoading ? (
            <span className="flex items-center">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Confirmando...
            </span>
          ) : (
            'Confirmar Cita'
          )}
        </button>
      </div>
    </div>
  );
};

export default Confirmation;
