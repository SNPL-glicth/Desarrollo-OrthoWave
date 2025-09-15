import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Button, Badge, Spinner } from 'react-bootstrap';
import { userService, User as ServiceUser } from '../../services/userService';
import { appointmentService, CreateAppointmentData } from '../../services/appointmentService';
import { toast } from 'react-toastify';
import DoctorInfoModal from './DoctorInfoModal';
import api from '../../services/api';
import './DoctorSummaryCard.css';

// Componentes simples para reemplazar los íconos
const UserMdIcon = () => <span className="me-2">👩‍⚕️</span>;
const CalendarPlusIcon = () => <span className="me-1">📅</span>;
const EnvelopeIcon = ({ size = 12 }: { size?: number }) => <span className="me-1" style={{ fontSize: size }}>📧</span>;
const PhoneIcon = ({ size = 12 }: { size?: number }) => <span className="me-1" style={{ fontSize: size }}>📞</span>;

interface DoctorSummaryCardProps {
  onScheduleAppointment?: (doctorId: string) => void;
}

const DoctorSummaryCard: React.FC<DoctorSummaryCardProps> = ({ onScheduleAppointment }) => {
  const [doctors, setDoctors] = useState<ServiceUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDoctor, setSelectedDoctor] = useState<ServiceUser | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    loadDoctors();
  }, []);

  const loadDoctors = async () => {
    try {
      setLoading(true);
      // Usar el endpoint que trae doctores con perfil médico completo
      const response = await api.get('/perfil-medico/doctores-disponibles');
      
      // Convertir los datos al formato ServiceUser
      const doctorsWithProfile = response.data.map((doctor: any) => ({
        id: doctor.usuarioId.toString(),
        firstName: doctor.usuario?.nombre || '',
        lastName: doctor.usuario?.apellido || '',
        email: doctor.usuario?.email || '',
        phone: doctor.usuario?.telefono || '',
        role: 'doctor' as const,
        specialization: doctor.especialidad || '',
        consultationFee: doctor.tarifaConsulta || 0,
        biography: doctor.biografia || '',
        createdAt: doctor.fechaCreacion || new Date().toISOString(),
        updatedAt: doctor.fechaActualizacion || new Date().toISOString(),
      }));
      
      setDoctors(doctorsWithProfile);
    } catch (error) {
      console.error('Error loading doctors:', error);
      toast.error('Error al cargar los doctores');
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleAppointment = async (doctorId: string) => {
    try {
      if (onScheduleAppointment) {
        onScheduleAppointment(doctorId);
      } else {
        // Implementación por defecto si no se proporciona callback
        const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
        const currentDate = new Date();
        const appointmentData: CreateAppointmentData = {
          patientId: currentUser.id,
          doctorId: doctorId,
          date: currentDate.toISOString().split('T')[0], // Solo la fecha
          time: currentDate.toTimeString().slice(0, 5), // Solo la hora HH:MM
          service: 'Consulta general',
          notes: 'Cita agendada desde el dashboard'
        };
        
        await appointmentService.createAppointment(appointmentData);
        toast.success('Cita agendada exitosamente');
      }
    } catch (error) {
      console.error('Error scheduling appointment:', error);
      toast.error('Error al agendar la cita');
    }
  };

  const handleDoctorClick = (doctor: ServiceUser) => {
    setSelectedDoctor(doctor);
    setShowModal(true);
  };

  if (loading) {
    return (
      <Card className="h-100">
        <Card.Header className="bg-secondary text-white">
          <div className="d-flex align-items-center">
            <UserMdIcon />
            <h5 className="mb-0">Doctores Disponibles</h5>
          </div>
        </Card.Header>
        <Card.Body className="d-flex justify-content-center align-items-center">
          <Spinner animation="border" variant="secondary" />
        </Card.Body>
      </Card>
    );
  }

  return (
    <>
      <Card className="h-100">
        <Card.Header className="bg-secondary text-white">
          <div className="d-flex align-items-center">
            <UserMdIcon />
            <h5 className="mb-0">Doctores Disponibles</h5>
            <Badge bg="light" text="secondary" className="ms-auto">
              {doctors.length}
            </Badge>
          </div>
        </Card.Header>
        <Card.Body className="p-0">
          {doctors.length === 0 ? (
            <div className="text-center py-4">
              <div className="text-muted mb-3" style={{ fontSize: '48px' }}>
                👩‍⚕️
              </div>
              <p className="text-muted mb-0">No hay doctores disponibles</p>
            </div>
          ) : (
            <div className="list-group list-group-flush">
              {doctors.map((doctor) => (
                <div key={doctor.id} className="list-group-item list-group-item-action border-0">
                  <Row className="align-items-center">
                    <Col xs={12} md={8}>
                      <div className="d-flex align-items-center">
                        <div className="avatar-circle bg-secondary text-white me-3">
                          <div style={{ fontSize: '20px' }}>
                            👩‍⚕️
                          </div>
                        </div>
                        <div>
                          <h6 className="mb-1 fw-bold">Dr. {doctor.firstName} {doctor.lastName}</h6>
                          {/* Especialidad */}
                          {doctor.specialization && (
                            <div className="mb-1">
                              <small className="text-secondary fw-medium">{doctor.specialization}</small>
                            </div>
                          )}
                          {/* Tarifa */}
                          {doctor.consultationFee && (
                            <div className="mb-2">
                              <span className="badge bg-light text-dark">
                                ${doctor.consultationFee.toLocaleString()} por consulta
                              </span>
                            </div>
                          )}
                          <div className="d-flex align-items-center text-muted small">
                            <EnvelopeIcon size={12} />
                            <span className="me-3">{doctor.email}</span>
                            {doctor.phone && (
                              <>
                                <PhoneIcon size={12} />
                                <span>{doctor.phone}</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </Col>
                    <Col xs={12} md={4} className="text-end">
                      <div className="d-flex flex-column flex-md-row gap-2">
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          onClick={() => handleDoctorClick(doctor)}
                        >
                          Ver Info
                        </Button>
                        <Button
                          variant="secondary"
                          size="sm"
          onClick={() => handleScheduleAppointment(doctor.id)}
                        >
                          <CalendarPlusIcon />
                          Agendar
                        </Button>
                      </div>
                    </Col>
                  </Row>
                </div>
              ))}
            </div>
          )}
        </Card.Body>
      </Card>

      <DoctorInfoModal
        show={showModal}
        onHide={() => setShowModal(false)}
        doctor={selectedDoctor}
      />
    </>
  );
};

export default DoctorSummaryCard;
