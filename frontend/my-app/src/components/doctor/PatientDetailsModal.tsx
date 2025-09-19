import React, { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { citasService } from '../../services/citasService';
import { documentService, PatientDocument } from '../../services/documentService';
import { productsService, ProductReservation } from '../../services/productsService';
import { API_CONFIG } from '../../config/api.js';

interface Paciente {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono: string;
  fechaNacimiento?: string;
  edad?: number;
  eps?: string;
  tipoAfiliacion?: string;
}

interface Cita {
  id: number;
  fechaHora: string;
  duracion: number;
  estado: string;
  tipoConsulta: string;
  motivoConsulta: string;
  notasDoctor?: string;
  costo?: number;
}

interface PatientDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  paciente: Paciente;
}

const PatientDetailsModal: React.FC<PatientDetailsModalProps> = ({
  isOpen,
  onClose,
  paciente
}) => {
  const [citas, setCitas] = useState<Cita[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Estados para documentos
  const [documents, setDocuments] = useState<PatientDocument[]>([]);
  const [documentsLoading, setDocumentsLoading] = useState(false);
  const [documentsError, setDocumentsError] = useState<string | null>(null);

  // Estados para reservas de productos
  const [reservations, setReservations] = useState<ProductReservation[]>([]);
  const [reservationsLoading, setReservationsLoading] = useState(false);
  const [reservationsError, setReservationsError] = useState<string | null>(null);

  const fetchPatientAppointments = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const appointments = await citasService.obtenerCitasPorPaciente(paciente.id);
      setCitas(appointments.sort((a, b) => new Date(b.fechaHora).getTime() - new Date(a.fechaHora).getTime()));
    } catch (err: any) {
      console.error('Error al obtener citas del paciente:', err);
      setError('Error al cargar el historial de citas');
    } finally {
      setLoading(false);
    }
  }, [paciente.id]);

  const fetchPatientDocuments = useCallback(async () => {
    setDocumentsLoading(true);
    setDocumentsError(null);
    try {
      const patientDocuments = await documentService.getDocumentsByPatientId(paciente.id);
      setDocuments(patientDocuments.sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime()));
    } catch (err: any) {
      console.error('Error al obtener documentos del paciente:', err);
      setDocumentsError('Error al cargar los documentos del paciente');
    } finally {
      setDocumentsLoading(false);
    }
  }, [paciente.id]);

  const fetchPatientReservations = useCallback(async () => {
    setReservationsLoading(true);
    setReservationsError(null);
    try {
      const patientReservations = await productsService.getPatientReservations(paciente.id);
      setReservations(patientReservations.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()));
    } catch (err: any) {
      console.error('Error al obtener reservas del paciente:', err);
      setReservationsError('Error al cargar las reservas de productos del paciente');
    } finally {
      setReservationsLoading(false);
    }
  }, [paciente.id]);

  useEffect(() => {
    if (isOpen && paciente.id) {
      fetchPatientAppointments();
      fetchPatientDocuments();
      fetchPatientReservations();
    }
  }, [isOpen, paciente.id, fetchPatientAppointments, fetchPatientDocuments, fetchPatientReservations]);

  // Obtener color por estado
  const getEstadoColor = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'confirmada':
        return 'bg-green-100 text-green-800';
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelada':
        return 'bg-red-100 text-red-800';
      case 'completada':
        return 'bg-blue-100 text-blue-800';
      case 'en_curso':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Obtener estadísticas del paciente
  const getPatientStats = () => {
    const total = citas.length;
    const completadas = citas.filter(c => c.estado === 'completada').length;
    const canceladas = citas.filter(c => c.estado === 'cancelada').length;
    const pendientes = citas.filter(c => ['pendiente', 'confirmada'].includes(c.estado)).length;
    
    return { total, completadas, canceladas, pendientes };
  };

  const handleViewDocument = (document: PatientDocument) => {
    const url = `${API_CONFIG.BASE_URL}/api/patient-documents/${document.id}/view`;
    window.open(url, '_blank');
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Función para actualizar estado de reserva
  const handleUpdateReservationStatus = async (reservationId: number, status: string, notes?: string) => {
    try {
      await productsService.updateReservationStatus(reservationId, status, notes);
      // Recargar las reservas para mostrar el cambio
      await fetchPatientReservations();
    } catch (error: any) {
      console.error('Error updating reservation status:', error);
      setReservationsError('Error al actualizar el estado de la reserva');
    }
  };

  // Función para obtener el color del estado de reserva
  const getReservationStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'confirmed':
        return 'bg-green-100 text-green-800';
      case 'delivered':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Función para traducir estado al español
  const translateStatus = (status: string) => {
    switch (status.toLowerCase()) {
      case 'pending':
        return 'Pendiente';
      case 'confirmed':
        return 'Confirmada';
      case 'delivered':
        return 'Entregada';
      case 'cancelled':
        return 'Cancelada';
      default:
        return status;
    }
  };

  if (!isOpen) return null;

  const stats = getPatientStats();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-center space-x-4">
            <div className="bg-gray-200 p-3 rounded-full">
              <svg className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {paciente.nombre} {paciente.apellido}
              </h2>
              <p className="text-sm text-gray-600">{paciente.email}</p>
              {paciente.telefono && (
                <p className="text-sm text-gray-600">{paciente.telefono}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-2xl font-bold transition-colors"
          >
            ×
          </button>
        </div>

        <div className="p-6">
          {/* Información personal del paciente */}
          <div className="bg-gray-50 p-4 rounded-lg mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <svg className="h-5 w-5 text-gray-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Información Personal
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-3 rounded-lg">
                <p className="text-sm font-medium text-gray-500">Edad</p>
                <p className="text-lg font-semibold text-gray-900">
                  {paciente.edad ? `${paciente.edad} años` : 'No especificada'}
                </p>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <p className="text-sm font-medium text-gray-500">Fecha de Nacimiento</p>
                <p className="text-lg font-semibold text-gray-900">
                  {paciente.fechaNacimiento 
                    ? format(new Date(paciente.fechaNacimiento), "d 'de' MMMM 'de' yyyy", { locale: es })
                    : 'No especificada'
                  }
                </p>
              </div>
              <div className="bg-white p-3 rounded-lg">
                <p className="text-sm font-medium text-gray-500">Tipo de Afiliación</p>
                <p className="text-lg font-semibold text-gray-900">
                  <span className={`inline-flex px-2 py-1 rounded-full text-sm font-medium ${
                    paciente.tipoAfiliacion === 'EPS' 
                      ? 'bg-blue-100 text-blue-800'
                      : paciente.tipoAfiliacion === 'Particular'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {paciente.tipoAfiliacion || 'No especificada'}
                  </span>
                </p>
              </div>
              {paciente.eps && (
                <div className="bg-white p-3 rounded-lg md:col-span-3">
                  <p className="text-sm font-medium text-gray-500">EPS</p>
                  <p className="text-lg font-semibold text-gray-900">{paciente.eps}</p>
                </div>
              )}
            </div>
          </div>

          {/* Estadísticas del paciente */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-gray-100 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Citas</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                </div>
                <div className="bg-gray-200 p-2 rounded">
                  <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gray-100 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Completadas</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.completadas}</p>
                </div>
                <div className="bg-gray-200 p-2 rounded">
                  <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gray-100 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Pendientes</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.pendientes}</p>
                </div>
                <div className="bg-gray-200 p-2 rounded">
                  <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="bg-gray-100 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Canceladas</p>
                  <p className="text-2xl font-bold text-gray-900">{stats.canceladas}</p>
                </div>
                <div className="bg-gray-200 p-2 rounded">
                  <svg className="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Historial de citas */}
          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Historial de Citas</h3>
              <button
                onClick={fetchPatientAppointments}
                disabled={loading}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                {loading ? 'Actualizando...' : 'Actualizar'}
              </button>
            </div>

            {loading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 mx-auto"></div>
                <p className="mt-2 text-gray-600">Cargando historial...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8 text-red-600">
                {error}
              </div>
            ) : citas.length === 0 ? (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-gray-600">Este paciente no tiene citas registradas</p>
              </div>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {citas.map(cita => (
                  <div key={cita.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <h4 className="font-medium text-gray-900">
                            {format(new Date(cita.fechaHora), "EEEE, d 'de' MMMM 'de' yyyy", { locale: es })}
                          </h4>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getEstadoColor(cita.estado)}`}>
                            {cita.estado}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                          <div>
                            <p><strong>Hora:</strong> {format(new Date(cita.fechaHora), 'HH:mm')} ({cita.duracion} min)</p>
                            <p><strong>Tipo:</strong> {cita.tipoConsulta || 'No especificado'}</p>
                            {cita.costo && (
                              <p><strong>Costo:</strong> ${cita.costo.toLocaleString()}</p>
                            )}
                          </div>
                          <div>
                            <p><strong>Motivo:</strong></p>
                            <p className="text-gray-700 mt-1">{cita.motivoConsulta}</p>
                          </div>
                        </div>

                        {cita.notasDoctor && (
                          <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                            <p className="text-sm font-medium text-gray-700 mb-1">Notas del Doctor:</p>
                            <p className="text-sm text-gray-600">{cita.notasDoctor}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Documentos del paciente */}
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <svg className="h-5 w-5 text-gray-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Documentos del Paciente
              </h3>
              <button
                onClick={fetchPatientDocuments}
                disabled={documentsLoading}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                {documentsLoading ? 'Actualizando...' : 'Actualizar'}
              </button>
            </div>

            {documentsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 mx-auto"></div>
                <p className="mt-2 text-gray-600">Cargando documentos...</p>
              </div>
            ) : documentsError ? (
              <div className="text-center py-8 text-red-600">
                {documentsError}
              </div>
            ) : documents.length === 0 ? (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-gray-600">El paciente no ha subido documentos</p>
                <p className="text-sm text-gray-500 mt-2">Los documentos PDF aparecerán aquí cuando el paciente los suba.</p>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {documents.map((document) => (
                    <div key={document.id} className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          <svg className="h-8 w-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium text-gray-900 truncate" title={document.originalName}>
                            {document.originalName}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {formatFileSize(document.size)} • {formatDate(document.uploadDate)}
                          </p>
                          <div className="mt-3 flex space-x-2">
                            <button
                              onClick={() => handleViewDocument(document)}
                              className="inline-flex items-center px-2 py-1 text-xs font-medium rounded text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors"
                            >
                              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                              </svg>
                              Ver
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {documents.length > 6 && (
                  <div className="text-center mt-4">
                    <p className="text-sm text-gray-600">
                      Mostrando todos los {documents.length} documentos
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Reservas de Productos */}
          <div className="mt-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <svg className="h-5 w-5 text-gray-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M8 11v6h8v-6M8 11h8" />
                </svg>
                Reservas de Productos
              </h3>
              <button
                onClick={fetchPatientReservations}
                disabled={reservationsLoading}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                {reservationsLoading ? 'Actualizando...' : 'Actualizar'}
              </button>
            </div>

            {reservationsLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-400 mx-auto"></div>
                <p className="mt-2 text-gray-600">Cargando reservas...</p>
              </div>
            ) : reservationsError ? (
              <div className="text-center py-8 text-red-600">
                {reservationsError}
              </div>
            ) : reservations.length === 0 ? (
              <div className="text-center py-8">
                <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M8 11v6h8v-6M8 11h8" />
                </svg>
                <p className="text-gray-600">El paciente no tiene reservas de productos</p>
                <p className="text-sm text-gray-500 mt-2">Las reservas de productos aparecerán aquí cuando el paciente reserve productos.</p>
              </div>
            ) : (
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="space-y-4">
                  {reservations.map((reservation) => (
                    <div key={reservation.id} className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
                      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
                        <div className="flex-1">
                          <div className="flex items-start space-x-4">
                            <img
                              src={reservation.product?.image_url || '/images/products/default.png'}
                              alt={reservation.product?.name}
                              className="w-16 h-16 object-cover rounded-lg flex-shrink-0"
                              onError={(e) => {
                                e.currentTarget.src = 'https://via.placeholder.com/64x64/E5E7EB/9CA3AF?text=Producto';
                              }}
                            />
                            <div className="flex-1 min-w-0">
                              <h4 className="text-lg font-medium text-gray-900 mb-1">
                                {reservation.product?.name || 'Producto no disponible'}
                              </h4>
                              <p className="text-sm text-gray-600 mb-2">
                                {reservation.product?.description || 'Sin descripción'}
                              </p>
                              <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                                <span><strong>Cantidad:</strong> {reservation.quantity}</span>
                                <span><strong>Precio unitario:</strong> ${Number(reservation.unit_price).toLocaleString()}</span>
                                <span><strong>Total:</strong> ${Number(reservation.total_price).toLocaleString()}</span>
                                <span><strong>Reservado:</strong> {formatDate(reservation.created_at)}</span>
                              </div>
                              {reservation.notes && (
                                <div className="mt-2 p-2 bg-blue-50 rounded border">
                                  <p className="text-xs font-medium text-blue-700">Notas del paciente:</p>
                                  <p className="text-sm text-blue-600">{reservation.notes}</p>
                                </div>
                              )}
                              {reservation.doctor_notes && (
                                <div className="mt-2 p-2 bg-green-50 rounded border">
                                  <p className="text-xs font-medium text-green-700">Notas del doctor:</p>
                                  <p className="text-sm text-green-600">{reservation.doctor_notes}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex flex-col items-end space-y-3 lg:ml-6">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getReservationStatusColor(reservation.status)}`}>
                            {translateStatus(reservation.status)}
                          </span>
                          
                          {/* Botones de acción */}
                          <div className="flex flex-wrap gap-2">
                            {reservation.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => handleUpdateReservationStatus(reservation.id, 'confirmed')}
                                  className="inline-flex items-center px-3 py-1 bg-green-600 text-white text-xs font-medium rounded hover:bg-green-700 transition-colors"
                                >
                                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                  </svg>
                                  Confirmar
                                </button>
                                <button
                                  onClick={() => handleUpdateReservationStatus(reservation.id, 'cancelled', 'Cancelada por el doctor')}
                                  className="inline-flex items-center px-3 py-1 bg-red-600 text-white text-xs font-medium rounded hover:bg-red-700 transition-colors"
                                >
                                  <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                  </svg>
                                  Cancelar
                                </button>
                              </>
                            )}
                            {reservation.status === 'confirmed' && (
                              <button
                                onClick={() => handleUpdateReservationStatus(reservation.id, 'delivered', 'Producto entregado al paciente')}
                                className="inline-flex items-center px-3 py-1 bg-blue-600 text-white text-xs font-medium rounded hover:bg-blue-700 transition-colors"
                              >
                                <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                                </svg>
                                Marcar como Entregado
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {reservations.length > 0 && (
                  <div className="mt-4 p-3 bg-primary-50 rounded-lg">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-primary-700 font-medium">
                        Total reservas: {reservations.length}
                      </span>
                      <span className="text-primary-600">
                        Total valor: ${reservations.reduce((total, r) => total + Number(r.total_price), 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
};

export default PatientDetailsModal;
