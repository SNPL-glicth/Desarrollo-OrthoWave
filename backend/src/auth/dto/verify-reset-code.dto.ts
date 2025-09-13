import { IsEmail, IsNotEmpty, IsString, Length, Matches } from 'class-validator';

export class VerifyResetCodeDto {
  @IsEmail({}, { message: 'Debe proporcionar un email válido' })
  @IsNotEmpty({ message: 'El email es requerido' })
  email: string;

  @IsString({ message: 'El código debe ser una cadena válida' })
  @IsNotEmpty({ message: 'El código es requerido' })
  @Length(6, 6, { message: 'El código debe tener exactamente 6 dígitos' })
  @Matches(/^\d{6}$/, { message: 'El código debe contener solo dígitos numéricos' })
  code: string;
}
