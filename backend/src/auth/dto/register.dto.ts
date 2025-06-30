import { IsEmail, IsNotEmpty, IsString, MinLength, IsOptional, IsNumber, Min, Max } from 'class-validator';

export class RegisterDto {
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El nombre es requerido' })
  nombre: string;

  @IsString({ message: 'El apellido debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'El apellido es requerido' })
  apellido: string;

  @IsEmail({}, { message: 'Debe ser un correo electrónico válido' })
  @IsNotEmpty({ message: 'El correo electrónico es requerido' })
  email: string;

  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @MinLength(6, { message: 'La contraseña debe tener al menos 6 caracteres' })
  password: string;

  @IsOptional()
  @IsString({ message: 'El teléfono debe ser una cadena de texto' })
  telefono?: string;

  @IsOptional()
  @IsString({ message: 'La dirección debe ser una cadena de texto' })
  direccion?: string;

  @IsOptional()
  @IsNumber({}, { message: 'El rol debe ser un número' })
  @Min(1, { message: 'El rol debe ser mayor a 0' })
  @Max(3, { message: 'El rol debe ser válido (1-3)' })
  rolId?: number;
}
