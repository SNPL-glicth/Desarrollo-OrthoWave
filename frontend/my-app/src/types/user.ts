export interface User {
  id: number | string;
  nombre: string;
  apellido: string;
  nombreCompleto?: string;
  email: string;
  telefono?: string;
  rol: string;
  especialidad?: string;
  activo?: boolean;
  documento?: string;
  fechaNacimiento?: string;
  subespecialidades?: string[];
  numeroRegistroMedico?: string;
  verificadoColegio?: boolean;
  experienciaAnios?: number;
  rating?: number;
  profileImage?: string;
  createdAt?: string;
  updatedAt?: string;
  biografia?: string;
  aceptaNuevosPacientes?: boolean;
  tarifaConsulta?: number;
  duracionConsultaDefault?: number;
  telefonoConsultorio?: string;
  direccionConsultorio?: string;
  ciudad?: string;
  diasAtencion?: string[];
  horaInicio?: string;
  horaFin?: string;
  direccion?: string;
}

export interface Doctor extends User {
  especialidad: string;
  numeroRegistroMedico: string;
  verificadoColegio: boolean;
  experienciaAnios: number;
  rating: number;
  subespecialidades: string[];
}

export interface Patient extends User {
  historialMedico?: string;
  alergias?: string;
  medicamentos?: string;
  contactoEmergencia?: string;
}
