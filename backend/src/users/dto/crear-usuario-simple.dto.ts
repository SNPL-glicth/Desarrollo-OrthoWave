import { IsNotEmpty, IsString, IsEmail, IsNumber } from 'class-validator';

export class CrearUsuarioSimpleDto {
  @IsNotEmpty({ message: 'El nombre es requerido' })
  @IsString({ message: 'El nombre debe ser una cadena de texto' })
  nombre: string;

  @IsNotEmpty({ message: 'El correo electrónico es requerido' })
  @IsEmail({}, { message: 'Debe ser un correo electrónico válido' })
  email: string;

  @IsNotEmpty({ message: 'La contraseña es requerida' })
  @IsString({ message: 'La contraseña debe ser una cadena de texto' })
  password: string;

  @IsNotEmpty({ message: 'El teléfono es requerido' })
  @IsString({ message: 'El teléfono debe ser una cadena de texto' })
  telefono: string;

  @IsNotEmpty({ message: 'El rol es requerido' })
  @IsNumber({}, { message: 'El rol debe ser un número' })
  rolId: number;
}
