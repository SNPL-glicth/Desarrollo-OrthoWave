import { User as ServiceUser } from '../services/userService';
import { User as LocalUser, Doctor } from '../types/user';

// Mapear User del servicio a User local
export const mapServiceUserToLocalUser = (serviceUser: ServiceUser): LocalUser => {
  return {
    id: serviceUser.id,
    nombre: serviceUser.firstName,
    apellido: serviceUser.lastName,
    nombreCompleto: `${serviceUser.firstName} ${serviceUser.lastName}`,
    email: serviceUser.email,
    telefono: serviceUser.phone,
    rol: serviceUser.role,
    especialidad: serviceUser.specialization,
    rating: serviceUser.rating,
    profileImage: serviceUser.profileImage,
    createdAt: serviceUser.createdAt,
    updatedAt: serviceUser.updatedAt,
    activo: true, // Asumimos que usuarios del servicio están activos
    experienciaAnios: serviceUser.experience ? parseInt(serviceUser.experience) : undefined,
    verificadoColegio: serviceUser.role === 'doctor' ? true : false,
    numeroRegistroMedico: serviceUser.role === 'doctor' ? `REG-${serviceUser.id}` : undefined,
    subespecialidades: serviceUser.specialization ? [serviceUser.specialization] : [],
    aceptaNuevosPacientes: serviceUser.role === 'doctor' ? true : undefined,
    tarifaConsulta: serviceUser.role === 'doctor' ? 50000 : undefined,
    duracionConsultaDefault: serviceUser.role === 'doctor' ? 30 : undefined,
  };
};

// Mapear User del servicio a Doctor local
export const mapServiceUserToDoctor = (serviceUser: ServiceUser): Doctor => {
  const localUser = mapServiceUserToLocalUser(serviceUser);
  
  return {
    ...localUser,
    especialidad: serviceUser.specialization || 'Medicina General',
    numeroRegistroMedico: `REG-${serviceUser.id}`,
    verificadoColegio: true,
    experienciaAnios: serviceUser.experience ? parseInt(serviceUser.experience) : 5,
    rating: serviceUser.rating || 4.5,
    subespecialidades: serviceUser.specialization ? [serviceUser.specialization] : ['Medicina General'],
  };
};

// Mapear User local a User del servicio (para actualizaciones)
export const mapLocalUserToServiceUser = (localUser: LocalUser): Partial<ServiceUser> => {
  return {
    id: localUser.id.toString(),
    firstName: localUser.nombre,
    lastName: localUser.apellido,
    email: localUser.email,
    phone: localUser.telefono,
    role: localUser.rol as 'administrador' | 'doctor' | 'paciente',
    specialization: localUser.especialidad,
    rating: localUser.rating,
    experience: localUser.experienciaAnios?.toString(),
    profileImage: localUser.profileImage,
  };
};

// Mapear array de usuarios del servicio a usuarios locales
export const mapServiceUsersToLocalUsers = (serviceUsers: ServiceUser[]): LocalUser[] => {
  return serviceUsers.map(mapServiceUserToLocalUser);
};

// Mapear array de usuarios del servicio a doctores locales
export const mapServiceUsersToDoctors = (serviceUsers: ServiceUser[]): Doctor[] => {
  return serviceUsers.filter(user => user.role === 'doctor').map(mapServiceUserToDoctor);
};
