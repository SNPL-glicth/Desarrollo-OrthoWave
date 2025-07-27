import React from 'react';
import { Doctor } from '../types/user';

interface OffcanvasDoctorProps {
  isOpen: boolean;
  onClose: () => void;
  doctor: Doctor | null;
}

const OffcanvasDoctor: React.FC<OffcanvasDoctorProps> = ({ isOpen, onClose, doctor }) => {
  if (!isOpen || !doctor) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      <div className="absolute inset-0 bg-black bg-opacity-50" onClick={onClose}></div>
      <div className="absolute right-0 top-0 h-full w-96 bg-white shadow-xl transform transition-transform duration-300 ease-in-out">
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">Información del Doctor</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <span className="sr-only">Cerrar</span>
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-4">
              <div className="text-center">
                <div className="w-20 h-20 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                  {doctor.profileImage ? (
                    <img 
                      src={doctor.profileImage} 
                      alt={`${doctor.nombre} ${doctor.apellido}`}
                      className="w-20 h-20 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-2xl">👨‍⚕️</span>
                  )}
                </div>
                <h3 className="text-xl font-semibold text-gray-900">
                  Dr. {doctor.nombre} {doctor.apellido}
                </h3>
                <p className="text-gray-600">{doctor.especialidad}</p>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-900 mb-2">Información de Contacto</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Email:</strong> {doctor.email}</p>
                  <p><strong>Teléfono:</strong> {doctor.telefono || 'No disponible'}</p>
                  {doctor.telefonoConsultorio && (
                    <p><strong>Teléfono Consultorio:</strong> {doctor.telefonoConsultorio}</p>
                  )}
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="font-semibold text-gray-900 mb-2">Información Profesional</h4>
                <div className="space-y-2 text-sm">
                  <p><strong>Registro Médico:</strong> {doctor.numeroRegistroMedico}</p>
                  <p><strong>Experiencia:</strong> {doctor.experienciaAnios} años</p>
                  <p><strong>Rating:</strong> {doctor.rating}/5 ⭐</p>
                  <p><strong>Verificado:</strong> {doctor.verificadoColegio ? 'Sí' : 'No'}</p>
                  {doctor.subespecialidades && doctor.subespecialidades.length > 0 && (
                    <div>
                      <strong>Subespecialidades:</strong>
                      <ul className="list-disc list-inside ml-2">
                        {doctor.subespecialidades.map((sub, index) => (
                          <li key={index}>{sub}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              {doctor.biografia && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Biografía</h4>
                  <p className="text-sm text-gray-600">{doctor.biografia}</p>
                </div>
              )}

              {doctor.direccionConsultorio && (
                <div className="border-t pt-4">
                  <h4 className="font-semibold text-gray-900 mb-2">Consultorio</h4>
                  <div className="space-y-2 text-sm">
                    <p><strong>Dirección:</strong> {doctor.direccionConsultorio}</p>
                    {doctor.ciudad && <p><strong>Ciudad:</strong> {doctor.ciudad}</p>}
                    {doctor.horaInicio && doctor.horaFin && (
                      <p><strong>Horario:</strong> {doctor.horaInicio} - {doctor.horaFin}</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OffcanvasDoctor;
