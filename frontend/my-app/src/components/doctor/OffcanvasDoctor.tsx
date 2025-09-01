import React, { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import AppointmentRequestsAccordion from './AppointmentRequestsAccordion';

interface Doctor {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
  especialidad?: string;
  experiencia?: string;
  descripcion?: string;
  foto?: string;
  horarioConsulta?: string;
  costoConsulta?: number;
  direccion?: string;
  ciudad?: string;
  pais?: string;
  fechaRegistro?: string;
  activo?: boolean;
}

interface Cita {
  id: number;
  fechaHora: string;
  paciente?: {
    id: number;
    nombre: string;
    apellido: string;
  };
  tipoConsulta?: string;
  estado: string;
}

interface OffcanvasDoctorProps {
  doctor: Doctor;
  isOpen: boolean;
  onClose: () => void;
  onScheduleAppointment?: (doctorId: number) => void;
  onSendMessage?: (doctorId: number) => void;
  proximasCitas?: Cita[];
}

const OffcanvasDoctor: React.FC<OffcanvasDoctorProps> = ({
  doctor,
  isOpen,
  onClose,
  onScheduleAppointment,
  onSendMessage,
  proximasCitas = []
}) => {
  const [showAppointmentRequests, setShowAppointmentRequests] = useState(false);

  const formatearFecha = (fecha: string) => {
    return new Date(fecha).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getInitials = (nombre: string, apellido: string) => {
    return `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase();
  };

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 transition-opacity"
          onClick={onClose}
        />
      )}
      
      {/* Offcanvas */}
      <div className={`fixed top-0 right-0 h-full w-80 bg-gray-50 shadow-xl transform transition-transform duration-300 ease-in-out z-50 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h2 className="text-lg font-semibold text-gray-900">
              Información del Doctor
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {/* Doctor Avatar and Basic Info */}
            <div className="text-center mb-6">
              {doctor.foto ? (
                <img
                  src={doctor.foto}
                  alt={`${doctor.nombre} ${doctor.apellido}`}
                  className="w-20 h-20 rounded-full mx-auto mb-3 object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-blue-600 flex items-center justify-center mx-auto mb-3">
                  <span className="text-white text-xl font-semibold">
                    {getInitials(doctor.nombre, doctor.apellido)}
                  </span>
                </div>
              )}
              <h3 className="text-xl font-bold text-gray-900">
                Dr. {doctor.nombre} {doctor.apellido}
              </h3>
              {doctor.especialidad && (
                <p className="text-sm text-gray-600 mt-1">{doctor.especialidad}</p>
              )}
              {doctor.activo !== undefined && (
                <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium mt-2 ${
                  doctor.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                }`}>
                  {doctor.activo ? 'Activo' : 'Inactivo'}
                </span>
              )}
            </div>

            {/* Doctor Details */}
            <div className="space-y-4">
              {/* Contact Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Contacto</h4>
                <div className="space-y-2">
                  <div className="flex items-center">
                    <svg className="w-4 h-4 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-sm text-gray-700">{doctor.email}</span>
                  </div>
                  {doctor.telefono && (
                    <div className="flex items-center">
                      <svg className="w-4 h-4 text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                      <span className="text-sm text-gray-700">{doctor.telefono}</span>
                    </div>
                  )}
                  {doctor.direccion && (
                    <div className="flex items-start">
                      <svg className="w-4 h-4 text-gray-500 mr-2 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <div className="text-sm text-gray-700">
                        <p>{doctor.direccion}</p>
                        {doctor.ciudad && doctor.pais && (
                          <p>{doctor.ciudad}, {doctor.pais}</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Professional Information */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-semibold text-gray-900 mb-3">Información Profesional</h4>
                <div className="space-y-3">
                  {doctor.experiencia && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Experiencia</label>
                      <p className="text-sm text-gray-600 mt-1">{doctor.experiencia}</p>
                    </div>
                  )}
                  {doctor.descripcion && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Descripción</label>
                      <p className="text-sm text-gray-600 mt-1">{doctor.descripcion}</p>
                    </div>
                  )}
                  {doctor.horarioConsulta && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Horario de Consulta</label>
                      <p className="text-sm text-gray-600 mt-1">{doctor.horarioConsulta}</p>
                    </div>
                  )}
                  {doctor.costoConsulta && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Costo de Consulta</label>
                      <p className="text-sm text-green-600 font-semibold mt-1">
                        ${doctor.costoConsulta.toLocaleString()}
                      </p>
                    </div>
                  )}
                  {doctor.fechaRegistro && (
                    <div>
                      <label className="text-sm font-medium text-gray-700">Miembro desde</label>
                      <p className="text-sm text-gray-600 mt-1">{formatearFecha(doctor.fechaRegistro)}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Solicitudes de Citas */}
              <AppointmentRequestsAccordion 
                doctorId={doctor.id}
                isOpen={showAppointmentRequests}
                onToggle={() => setShowAppointmentRequests(!showAppointmentRequests)}
              />

              {/* Próximas Citas */}
              {proximasCitas.length > 0 && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3">Próximas Citas</h4>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {proximasCitas.map((cita) => (
                      <div key={cita.id} className="bg-white rounded-lg p-3 border border-blue-200">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {cita.paciente?.nombre} {cita.paciente?.apellido}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                              {format(new Date(cita.fechaHora), "dd/MM/yyyy 'a las' HH:mm", { locale: es })}
                            </p>
                            {cita.tipoConsulta && (
                              <p className="text-xs text-blue-600 mt-1">
                                {cita.tipoConsulta}
                              </p>
                            )}
                          </div>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            cita.estado === 'confirmada' ? 'bg-blue-100 text-blue-800' :
                            cita.estado === 'aprobada' ? 'bg-green-100 text-green-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {cita.estado}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="border-t p-4">
            <div className="flex gap-2">
              {onScheduleAppointment && (
                <button
                  onClick={() => onScheduleAppointment(doctor.id)}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  Agendar Cita
                </button>
              )}
              {onSendMessage && (
                <button
                  onClick={() => onSendMessage(doctor.id)}
                  className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors text-sm font-medium"
                >
                  Enviar Mensaje
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default OffcanvasDoctor;
