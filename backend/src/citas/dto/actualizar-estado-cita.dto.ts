import { IsNotEmpty, IsEnum, IsOptional, IsString, IsNumber } from 'class-validator';

export class ActualizarEstadoCitaDto {
  @IsNotEmpty()
  @IsEnum(['pendiente', 'confirmada', 'aprobada', 'en_curso', 'completada', 'cancelada', 'no_asistio'])
  estado: string;

  @IsOptional()
  @IsString()
  notasDoctor?: string;

  @IsOptional()
  @IsString()
  razonRechazo?: string;

  @IsOptional()
  @IsNumber()
  aprobadaPor?: number;
}
