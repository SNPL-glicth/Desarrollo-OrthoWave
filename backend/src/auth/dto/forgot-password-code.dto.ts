import { IsEmail, IsNotEmpty } from 'class-validator';

export class ForgotPasswordCodeDto {
  @IsEmail({}, { message: 'Debe proporcionar un email válido' })
  @IsNotEmpty({ message: 'El email es requerido' })
  email: string;
}
