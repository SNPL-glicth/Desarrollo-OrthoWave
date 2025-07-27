import React from 'react';
import { Offcanvas, Card, Row, Col, Badge } from 'react-bootstrap';
import { User as ServiceUser } from '../../services/userService';
// Reemplazamos React Icons con emojis para evitar errores
const UserIcon = () => <span className="me-2">👤</span>;
const UserCircleIcon = ({ size = 60 }: { size?: number }) => <span className="text-primary mb-2" style={{ fontSize: size }}>👤</span>;
const IdCardIcon = () => <span className="text-muted me-2">🪪</span>;
const EnvelopeIcon = () => <span className="text-muted me-2">📧</span>;
const PhoneIcon = () => <span className="text-muted me-2">📞</span>;

interface UserInfoOffcanvasProps {
  show: boolean;
  onHide: () => void;
  user: ServiceUser | null;
}

const UserInfoOffcanvas: React.FC<UserInfoOffcanvasProps> = ({ show, onHide, user }) => {
  if (!user) return null;

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'administrador':
        return 'danger';
      case 'doctor':
        return 'success';
      case 'paciente':
        return 'primary';
      default:
        return 'secondary';
    }
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'administrador':
        return 'Administrador';
      case 'doctor':
        return 'Doctor';
      case 'paciente':
        return 'Paciente';
      default:
        return 'Usuario';
    }
  };

  return (
    <Offcanvas show={show} onHide={onHide} placement="end" className="user-info-offcanvas">
      <Offcanvas.Header closeButton className="bg-primary text-white">
        <Offcanvas.Title className="d-flex align-items-center">
          <UserIcon />
          Información del Usuario
        </Offcanvas.Title>
      </Offcanvas.Header>
      <Offcanvas.Body className="p-0">
        <div className="p-3">
          <Card className="border-0 shadow-sm">
            <Card.Body>
              <div className="text-center mb-3">
                <UserCircleIcon size={60} />
                <h5 className="mb-1">{user.firstName} {user.lastName}</h5>
                <Badge bg={getRoleBadgeColor(user.role)} className="mb-2">
                  {getRoleDisplayName(user.role)}
                </Badge>
              </div>
              
              <hr />
              
              <Row className="g-3">
                <Col xs={12}>
                  <div className="d-flex align-items-center">
                    <IdCardIcon />
                    <div>
                      <small className="text-muted d-block">ID</small>
                      <span className="fw-medium">{user.id}</span>
                    </div>
                  </div>
                </Col>
                
                <Col xs={12}>
                  <div className="d-flex align-items-center">
                    <EnvelopeIcon />
                    <div>
                      <small className="text-muted d-block">Email</small>
                      <span className="fw-medium">{user.email}</span>
                    </div>
                  </div>
                </Col>
                
                {user.phone && (
                  <Col xs={12}>
                    <div className="d-flex align-items-center">
                      <PhoneIcon />
                      <div>
                        <small className="text-muted d-block">Teléfono</small>
                        <span className="fw-medium">{user.phone}</span>
                      </div>
                    </div>
                  </Col>
                )}
                
                {user.specialization && (
                  <Col xs={12}>
                    <div className="d-flex align-items-center">
                      <IdCardIcon />
                      <div>
                        <small className="text-muted d-block">Especialización</small>
                        <span className="fw-medium">{user.specialization}</span>
                      </div>
                    </div>
                  </Col>
                )}
                
                <Col xs={12}>
                  <div className="d-flex align-items-center">
                    <UserIcon />
                    <div>
                      <small className="text-muted d-block">Usuario desde</small>
                      <span className="fw-medium">
                        {new Date(user.createdAt).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </span>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </div>
      </Offcanvas.Body>
    </Offcanvas>
  );
};

export default UserInfoOffcanvas;
