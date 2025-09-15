import React from 'react';
import { User as ServiceUser } from '../../services/userService';

interface DoctorInfoModalProps {
  show: boolean;
  onHide: () => void;
  doctor: ServiceUser | null;
}

const DoctorInfoModal: React.FC<DoctorInfoModalProps> = ({ show, onHide, doctor }) => {
  if (!show || !doctor) return null;

  const formatCurrency = (value: number | undefined) => {
    if (!value) return 'No especificada';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[95vh] overflow-y-auto">
        <div className="max-h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200 sticky top-0 bg-white z-10">
          <h3 className="text-lg font-semibold text-gray-900">
            Información del Doctor
          </h3>
          <button
            onClick={onHide}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

          {/* Content */}
          <div className="p-4 sm:p-6 lg:p-8">
            {/* Doctor Avatar and Name */}
            <div className="text-center mb-6 lg:mb-8">
              <div className="w-20 h-20 sm:w-24 sm:h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
                <svg className="w-10 h-10 sm:w-12 sm:h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <h4 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-2">
                Dr. {doctor.firstName} {doctor.lastName}
              </h4>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-700">
                Doctor
              </span>
            </div>

            {/* Information Cards - Responsive Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              {/* Especialidad */}
              {doctor.specialization && (
                <div className="bg-gray-50 rounded-lg p-4 sm:p-5">
                  <div className="flex items-center mb-3">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 mr-2 sm:mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <h5 className="text-base sm:text-lg font-medium text-gray-900">Especialidad</h5>
                  </div>
                  <p className="text-sm sm:text-base text-gray-700">{doctor.specialization}</p>
                </div>
              )}

              {/* Tarifa de Consulta */}
              <div className="bg-gray-100 rounded-lg p-4 sm:p-5">
                <div className="flex items-center mb-3">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 mr-2 sm:mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  <h5 className="text-base sm:text-lg font-medium text-gray-900">Tarifa de Consulta</h5>
                </div>
                <p className="text-lg sm:text-xl font-semibold text-gray-700">
                  {formatCurrency(doctor.consultationFee)}
                </p>
              </div>

              {/* Biografía */}
              {doctor.biography && (
                <div className="bg-gray-50 rounded-lg p-4 sm:p-5">
                  <div className="flex items-center mb-3">
                    <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 mr-2 sm:mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <h5 className="text-base sm:text-lg font-medium text-gray-900">Acerca del Doctor</h5>
                  </div>
                  <p className="text-sm sm:text-base text-gray-700 leading-relaxed">{doctor.biography}</p>
                </div>
              )}

              {/* Información de contacto básica */}
              <div className="bg-gray-50 rounded-lg p-4 sm:p-5">
                <div className="flex items-center mb-4">
                  <svg className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600 mr-2 sm:mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  <h5 className="text-base sm:text-lg font-medium text-gray-900">Información de Contacto</h5>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 mr-2 sm:mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm sm:text-base text-gray-700 break-all">{doctor.email}</span>
                  </div>
                  {doctor.phone && (
                    <div className="flex items-center">
                      <svg className="w-4 h-4 sm:w-5 sm:h-5 text-gray-500 mr-2 sm:mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span className="text-sm sm:text-base text-gray-700">{doctor.phone}</span>
                    </div>
                  )}
                </div>
              </div>
          </div>
        </div>

          {/* Footer */}
          <div className="flex justify-center sm:justify-end px-4 sm:px-6 lg:px-8 py-4 sm:py-6 bg-gray-50 border-t border-gray-200 sticky bottom-0">
            <button
              onClick={onHide}
              className="w-full sm:w-auto px-6 py-3 bg-gray-600 text-white text-base font-medium rounded-lg hover:bg-gray-700 transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DoctorInfoModal;