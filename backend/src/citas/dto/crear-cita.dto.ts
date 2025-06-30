import { IsNotEmpty, IsNumber, IsDateString, IsOptional, IsEnum, IsString, IsDecimal } from 'class-validator';

export class CrearCitaDto {
  @IsNotEmpty()
  @IsNumber()
  pacienteId: number;

  @IsNotEmpty()
  @IsNumber()
  doctorId: number;

  @IsNotEmpty()
  @IsDateString()
  fechaHora: string;

  @IsOptional()
  @IsNumber()
  duracion?: number = 60;

  @IsOptional()
  @IsEnum(['primera_vez', 'control', 'seguimiento', 'urgencia'])
  tipoConsulta?: string = 'primera_vez';

  @IsOptional()
  @IsString()
  motivoConsulta?: string;

  @IsOptional()
  @IsString()
  notasPaciente?: string;

  @IsOptional()
  @IsDecimal()
  costo?: number;
}
