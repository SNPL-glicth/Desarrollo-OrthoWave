import { IsNotEmpty, IsString, IsEmail, IsNumber, IsOptional, IsEnum } from 'class-validator';

export class CrearUsuarioAdminDto {
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @IsString()
  password: string;

  @IsNotEmpty()
  @IsString()
  nombre: string;

  @IsNotEmpty()
  @IsString()
  apellido: string;

  @IsNotEmpty()
  @IsNumber()
  rolId: number;

  @IsNotEmpty()
  @IsString()
  telefono: string;

  @IsOptional()
  @IsString()
  direccion?: string;

  // Para doctores
  @IsOptional()
  perfilMedico?: {
    numeroRegistroMedico: string;
    especialidad: string;
    universidadEgreso: string;
    añoGraduacion: number;
    biografia?: string;
    tarifaConsulta?: number;
  };

  // Para pacientes
  @IsOptional()
  perfilPaciente?: {
    numeroIdentificacion: string;
    tipoIdentificacion: string;
    fechaNacimiento: string;
    genero: string;
    eps?: string;
  };
}
