export interface User {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  rol: 'admin' | 'doctor' | 'paciente';
  telefono?: string;
  direccion?: string;
  especialidad?: string; // Solo para doctores
  historialMedico?: string[]; // Solo para pacientes
  citas?: string[]; // IDs de citas
  tratamientos?: string[]; // IDs de tratamientos
}
