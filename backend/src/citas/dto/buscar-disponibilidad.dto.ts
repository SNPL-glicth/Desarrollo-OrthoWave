import { IsNotEmpty, IsNumber, IsDateString, IsOptional } from 'class-validator';

export class BuscarDisponibilidadDto {
  @IsNotEmpty()
  @IsNumber()
  doctorId: number;

  @IsNotEmpty()
  @IsDateString()
  fecha: string;

  @IsOptional()
  @IsNumber()
  duracion?: number = 60;
}
