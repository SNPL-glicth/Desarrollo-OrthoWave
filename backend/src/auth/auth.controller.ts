import { Controller, Post, Body, Get, UseGuards, Request, UnauthorizedException, ValidationPipe } from '@nestjs/common';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { RegisterPatientSimpleDto } from './dto/register-patient-simple.dto';
import { VerifyDto } from './dto/verify.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ForgotPasswordCodeDto } from './dto/forgot-password-code.dto';
import { VerifyResetCodeDto } from './dto/verify-reset-code.dto';
import { ResetPasswordWithCodeDto } from './dto/reset-password-with-code.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body(ValidationPipe) loginDto: LoginDto) {
    const user = await this.authService.validateUser(
      loginDto.email,
      loginDto.password,
    );
    
    // Verificar si el resultado contiene un error específico
    if (user && user.error) {
      throw new UnauthorizedException(user.message);
    }
    
    if (!user) {
      throw new UnauthorizedException('Credenciales inválidas. Por favor verifica tu correo electrónico y contraseña.');
    }
    
    return this.authService.login(user);
  }

  @Post('register')
  async register(@Body(ValidationPipe) registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('register-patient')
  async registerPatient(@Body(ValidationPipe) registerDto: RegisterPatientSimpleDto) {
    // Convertir a RegisterDto completo con valores por defecto
    const fullRegisterDto: RegisterDto = {
      ...registerDto,
      apellido: '', // Se puede completar después en el perfil
      rolId: 3, // Rol de paciente
    };
    return this.authService.register(fullRegisterDto);
  }

  @Post('verify')
  async verify(@Body(ValidationPipe) verifyDto: VerifyDto) {
    return this.authService.verifyCode(verifyDto.email, verifyDto.code);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Request() req) {
    return req.user;
  }

  // Métodos para recuperación con código numérico
  @Post('forgot-password')
  async forgotPassword(@Body(ValidationPipe) forgotPasswordCodeDto: ForgotPasswordCodeDto) {
    return this.authService.forgotPasswordWithCode(forgotPasswordCodeDto);
  }

  @Post('verify-reset-code')
  async verifyResetCode(@Body(ValidationPipe) verifyResetCodeDto: VerifyResetCodeDto) {
    return this.authService.verifyResetCode(verifyResetCodeDto);
  }

  @Post('reset-password')
  async resetPassword(@Body(ValidationPipe) resetPasswordWithCodeDto: ResetPasswordWithCodeDto) {
    return this.authService.resetPasswordWithCode(resetPasswordWithCodeDto);
  }

  // Métodos legacy (si necesitas mantener compatibilidad)
  @Post('forgot-password-legacy')
  async forgotPasswordLegacy(@Body(ValidationPipe) forgotPasswordDto: ForgotPasswordDto) {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @Post('reset-password-legacy')
  async resetPasswordLegacy(@Body(ValidationPipe) resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }
}
