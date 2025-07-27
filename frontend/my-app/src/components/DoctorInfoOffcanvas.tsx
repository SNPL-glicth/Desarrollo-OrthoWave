import React from 'react';
import './DoctorInfoOffcanvas.css';

interface Doctor {
  id: number;
  nombre: string;
  especialidad: string;
  telefono?: string;
  email?: string;
  horarioAtencion?: string;
  experiencia?: string;
  consultorio?: string;
}

interface DoctorInfoOffcanvasProps {
  doctor: Doctor | null;
  isOpen: boolean;
  onClose: () => void;
}

const DoctorInfoOffcanvas: React.FC<DoctorInfoOffcanvasProps> = ({
  doctor,
  isOpen,
  onClose
}) => {
  if (!doctor) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`offcanvas-backdrop ${isOpen ? 'show' : ''}`}
        onClick={onClose}
      />
      
      {/* Offcanvas */}
      <div className={`offcanvas offcanvas-end ${isOpen ? 'show' : ''}`}>
        <div className="offcanvas-header">
          <h5 className="offcanvas-title">
            <i className="fas fa-user-md me-2"></i>
            Información del Doctor
          </h5>
          <button 
            type="button" 
            className="btn-close"
            onClick={onClose}
            aria-label="Cerrar"
          />
        </div>
        
        <div className="offcanvas-body">
          {/* Información básica del doctor */}
          <div className="doctor-info">
            <div className="doctor-avatar">
              <i className="fas fa-user-md"></i>
            </div>
            
            <div className="doctor-details">
              <h6 className="doctor-name">{doctor.nombre}</h6>
              <p className="doctor-specialty">{doctor.especialidad}</p>
            </div>
          </div>

          <hr />

          {/* Detalles de contacto */}
          <div className="contact-details">
            <h6 className="section-title">
              <i className="fas fa-address-card me-2"></i>
              Información de Contacto
            </h6>
            
            {doctor.telefono && (
              <div className="contact-item">
                <i className="fas fa-phone"></i>
                <span>{doctor.telefono}</span>
              </div>
            )}
            
            {doctor.email && (
              <div className="contact-item">
                <i className="fas fa-envelope"></i>
                <span>{doctor.email}</span>
              </div>
            )}
            
            {doctor.consultorio && (
              <div className="contact-item">
                <i className="fas fa-map-marker-alt"></i>
                <span>{doctor.consultorio}</span>
              </div>
            )}
          </div>

          <hr />

          {/* Información profesional */}
          <div className="professional-info">
            <h6 className="section-title">
              <i className="fas fa-briefcase me-2"></i>
              Información Profesional
            </h6>
            
            {doctor.experiencia && (
              <div className="info-item">
                <strong>Experiencia:</strong>
                <p>{doctor.experiencia}</p>
              </div>
            )}
            
            {doctor.horarioAtencion && (
              <div className="info-item">
                <strong>Horario de Atención:</strong>
                <p>{doctor.horarioAtencion}</p>
              </div>
            )}
          </div>

          <hr />

          {/* Acciones */}
          <div className="offcanvas-actions">
            <button 
              className="btn btn-primary btn-sm"
              onClick={() => {
                // Aquí puedes agregar funcionalidad para agendar cita
                console.log('Agendar cita con:', doctor.nombre);
              }}
            >
              <i className="fas fa-calendar-plus me-2"></i>
              Agendar Cita
            </button>
            
            <button 
              className="btn btn-outline-secondary btn-sm"
              onClick={() => {
                // Aquí puedes agregar funcionalidad para enviar mensaje
                console.log('Enviar mensaje a:', doctor.nombre);
              }}
            >
              <i className="fas fa-comment me-2"></i>
              Enviar Mensaje
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default DoctorInfoOffcanvas;
