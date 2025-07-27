import React, { useEffect, useState } from 'react';
import { useCitas } from '../../contexts/CitasContext';
import { useAuth } from '../../context/AuthContext';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface DoctorAppointmentsProps {
  limit?: number;
  showTitle?: boolean;
}

const DoctorAppointments: React.FC<DoctorAppointmentsProps> = ({ 
  limit = 5, 
  showTitle = true 
}) => {
  const { state, fetchCitas, updateCita } = useCitas();
  const { user } = useAuth();
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toISOString().split('T')[0]
  );

  useEffect(() => {
    if (user?.rol === 'doctor') {
      console.log('👨‍⚕️ Usuario doctor detectado, cargando citas...', user);
      fetchCitas();
    }
  }, [user, fetchCitas]);

  // Filtrar citas del doctor actual
  const doctorCitas = state.citas.filter(cita => {
    const doctorId = Number(user?.id);
    const match = cita.doctorId === doctorId;
    console.log('🔍 Filtrar cita:', {
      citaId: cita.id,
      citaDoctorId: cita.doctorId,
      userDoctorId: doctorId,
      match
    });
    return match;
  });

  // Filtrar citas por fecha seleccionada
  const citasDelDia = doctorCitas.filter(cita => {
    const citaDate = new Date(cita.fechaHora).toISOString().split('T')[0];
    const match = citaDate === selectedDate;
    console.log('📅 Filtrar por fecha:', {
      citaId: cita.id,
      citaDate,
      selectedDate,
      match
    });
    return match;
  });

  // Debug info
  console.log('📊 Debug DoctorAppointments:', {
    totalCitas: state.citas.length,
    doctorCitas: doctorCitas.length,
    citasDelDia: citasDelDia.length,
    selectedDate,
    userId: user?.id,
    userRole: user?.rol,
    loading: state.loading,
    error: state.error
  });

  // Ordenar por fecha y hora
  const citasOrdenadas = citasDelDia
    .sort((a, b) => new Date(a.fechaHora).getTime() - new Date(b.fechaHora).getTime())
    .slice(0, limit);

  const handleUpdateStatus = async (citaId: number, newStatus: string) => {
    try {
      await updateCita(citaId, { estado: newStatus });
    } catch (error) {
      console.error('Error al actualizar el estado de la cita:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      'pendiente': 'bg-yellow-100 text-yellow-800',
      'confirmada': 'bg-blue-100 text-blue-800',
      'aprobada': 'bg-green-100 text-green-800',
      'en_curso': 'bg-purple-100 text-purple-800',
      'completada': 'bg-green-100 text-green-800',
      'cancelada': 'bg-red-100 text-red-800',
      'no_asistio': 'bg-gray-100 text-gray-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getStatusText = (status: string) => {
    const texts = {
      'pendiente': 'Pendiente',
      'confirmada': 'Confirmada',
      'aprobada': 'Aprobada',
      'en_curso': 'En Curso',
      'completada': 'Completada',
      'cancelada': 'Cancelada',
      'no_asistio': 'No Asistió'
    };
    return texts[status as keyof typeof texts] || status;
  };

  if (state.loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {showTitle && (
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900">Mis Citas</h2>
          <div className="flex items-center space-x-2">
            <label className="text-sm font-medium text-gray-700">Fecha:</label>
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              onClick={() => fetchCitas()}
              className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={state.loading}
            >
              {state.loading ? 'Cargando...' : 'Recargar'}
            </button>
          </div>
        </div>
      )}

      {state.error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          Error: {state.error}
        </div>
      )}

      {citasOrdenadas.length === 0 ? (
        <div className="text-center py-8">
          <div className="bg-blue-50 p-6 rounded-lg">
            <svg className="mx-auto h-12 w-12 text-blue-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              No tienes citas para {format(new Date(selectedDate), 'dd/MM/yyyy', { locale: es })}
            </h3>
            <p className="text-blue-700">
              Selecciona otra fecha para ver las citas programadas
            </p>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {citasOrdenadas.map((cita) => (
            <div
              key={cita.id}
              className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 mb-1">
                    {cita.paciente?.nombre} {cita.paciente?.apellido}
                  </h4>
                  <p className="text-sm text-gray-600 mb-1">
                    {format(new Date(cita.fechaHora), "HH:mm", { locale: es })} - 
                    {format(new Date(new Date(cita.fechaHora).getTime() + cita.duracion * 60000), "HH:mm", { locale: es })}
                  </p>
                  <p className="text-sm text-gray-600">
                    Tipo: {cita.tipoConsulta || 'Consulta general'}
                  </p>
                  {cita.motivoConsulta && (
                    <p className="text-sm text-gray-600 mt-2">
                      <strong>Motivo:</strong> {cita.motivoConsulta}
                    </p>
                  )}
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(cita.estado)}`}>
                    {getStatusText(cita.estado)}
                  </span>
                  {cita.estado === 'aprobada' && (
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleUpdateStatus(cita.id, 'en_curso')}
                        className="px-2 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700"
                      >
                        Iniciar
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(cita.id, 'completada')}
                        className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Completar
                      </button>
                    </div>
                  )}
                  {cita.estado === 'en_curso' && (
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleUpdateStatus(cita.id, 'completada')}
                        className="px-2 py-1 text-xs bg-green-600 text-white rounded hover:bg-green-700"
                      >
                        Completar
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(cita.id, 'no_asistio')}
                        className="px-2 py-1 text-xs bg-gray-600 text-white rounded hover:bg-gray-700"
                      >
                        No asistió
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Total de citas: {doctorCitas.length}</span>
          <span>Citas del día: {citasDelDia.length}</span>
        </div>
      </div>
    </div>
  );
};

export default DoctorAppointments;
