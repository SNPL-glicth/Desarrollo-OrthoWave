import { IsOptional, IsNumber, IsDateString, IsString, IsArray } from 'class-validator';

export class DashboardDisponibilidadDto {
  @IsOptional()
  @IsDateString()
  fechaInicio?: string;

  @IsOptional()
  @IsDateString()
  fechaFin?: string;

  @IsOptional()
  @IsString()
  especialidad?: string;

  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  doctoresIds?: number[];

  @IsOptional()
  @IsNumber()
  duracionConsulta?: number = 60;
}
