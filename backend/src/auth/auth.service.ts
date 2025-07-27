import { Injectable, UnauthorizedException, ConflictException, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { MailerService } from '@nestjs-modules/mailer';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
    private mailerService: MailerService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    this.logger.log(`Intentando validar usuario: ${email}`);
    this.logger.log(`DEBUG: Función validateUser actualizada - SIN BLOQUEO DE ADMIN`);

    try {
      const user = await this.usersRepository.findOne({
        where: { email },
        relations: ['rol'],
      });

      if (!user) {
        this.logger.warn(`Usuario no encontrado: ${email}`);
        // Devolver un objeto con información del error específico
        return { error: 'USER_NOT_FOUND', message: 'No existe una cuenta registrada con este correo electrónico.' };
      }

      // Comentado: Verificaciones de aprobación eliminadas para permitir login sin burocracia
      // Los usuarios pueden iniciar sesión inmediatamente después del registro
      /*
      if (!user.isVerified) {
        this.logger.warn(`Intento de login con cuenta no verificada: ${email}`);
        throw new UnauthorizedException('La cuenta no ha sido verificada. Por favor revisa tu correo electrónico y completa el proceso de verificación.');
      }
      */

      // Usar bcrypt para comparar contraseñas
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (isPasswordValid) {
        this.logger.log(`Validación exitosa para usuario: ${email} con rol: ${user.rol.nombre}`);
        const { password, ...result } = user;
        return result;
      } else {
        this.logger.warn(`Contraseña incorrecta para usuario: ${email}`);
        // Devolver un objeto con información del error específico
        return { error: 'INVALID_PASSWORD', message: 'La contraseña ingresada es incorrecta. Por favor verifica e intenta nuevamente.' };
      }
    } catch (error) {
      this.logger.error(`Error en validateUser para ${email}:`, error.message);
      throw error;
    }
  }

  async login(user: any) {
    this.logger.log(`Generando token JWT para usuario: ${user.email} (ID: ${user.id})`);

    try {
      const payload = {
        email: user.email,
        sub: user.id,
        rol: user.rol.nombre,
      };

      const token = this.jwtService.sign(payload);
      this.logger.log(`Token JWT generado exitosamente para usuario: ${user.email}`);

      return {
        access_token: token,
        user: {
          id: user.id,
          email: user.email,
          nombre: user.nombre,
          apellido: user.apellido,
          rol: user.rol.nombre,
        },
        redirect: this.getRedirectPath(user.rol.nombre),
      };
    } catch (error) {
      this.logger.error(`Error generando token JWT para usuario: ${user.email}`, error.message);
      throw error;
    }
  }

  async register(userData: any) {
    // Validar campos obligatorios
    if (!userData.nombre || !userData.apellido || !userData.email || !userData.password) {
      throw new BadRequestException('Todos los campos (nombre, apellido, email y contraseña) son obligatorios.');
    }

    const existingUser = await this.usersRepository.findOne({
      where: { email: userData.email },
    });

    if (existingUser) {
      throw new ConflictException('El correo electrónico ya está registrado');
    }

    // Asignar rolId=3 (paciente) por defecto si no se especifica
    const rolId = userData.rolId || 3;

    // Generar código de verificación de 6 dígitos
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Usar bcrypt para hashear la contraseña de forma segura
    const saltRounds = 12; // Usar 12 rounds para mayor seguridad
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

    // Determinar el estado de aprobación según el rol
    const isPatientRole = rolId === 3; // Rol 3 = paciente
    
    const newUser = this.usersRepository.create({
      ...userData,
      password: hashedPassword,
      rolId,
      isVerified: true,
      verificationCode,
      // Pacientes aprobados inmediatamente
      isApproved: true, // Todos los usuarios aprobados inmediatamente
      approvalStatus: 'approved',
    });

    await this.usersRepository.save(newUser);

    // Comentado: Envío de correo de verificación eliminado

    // Mensaje único para registro exitoso
    const message = 'Usuario registrado exitosamente. Ya puedes acceder a tu cuenta.';
    
    return {
      message,
      email: userData.email,
      requiresApproval: false,
    };
  }

  async verifyCode(email: string, code: string) {
    const user = await this.usersRepository.findOne({ 
      where: { email },
      relations: ['rol']
    });
    if (!user) {
      throw new UnauthorizedException('Usuario no encontrado');
    }
    if (user.isVerified) {
      // Si ya está verificado, verificar si es paciente pendiente
      if (user.rol?.nombre === 'paciente' && user.approvalStatus === 'pending') {
        return { 
          message: 'Tu cuenta ha sido verificada pero está pendiente de aprobación. Será revisada en un plazo máximo de 48 horas.',
          requiresApproval: true
        };
      }
      return { message: 'La cuenta ya está verificada.' };
    }
    if (user.verificationCode !== code) {
      throw new UnauthorizedException('Código de verificación incorrecto');
    }
    
    user.isVerified = true;
    user.verificationCode = null;
    await this.usersRepository.save(user);
    
    // Si es un paciente, mostrar mensaje de aprobación pendiente
    if (user.rol?.nombre === 'paciente' && user.approvalStatus === 'pending') {
      return { 
        message: 'Cuenta verificada exitosamente. Tu solicitud está pendiente de aprobación y será revisada en un plazo máximo de 48 horas. Para agilizar el proceso, puedes contactarnos por nuestros canales oficiales.',
        requiresApproval: true
      };
    }
    
    return { message: 'Cuenta verificada exitosamente.' };
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<{ message: string }> {
    const { email } = forgotPasswordDto;
    this.logger.log(`Solicitud de recuperación de contraseña para: ${email}`);

    try {
      const user = await this.usersRepository.findOne({ where: { email } });

      if (!user) {
        this.logger.warn(`Solicitud de reset para email no existente: ${email}`);
        // Por seguridad, siempre devolvemos el mismo mensaje
        return { message: 'Si el correo existe, recibirás un enlace de recuperación.' };
      }

      // Generar token seguro
      const resetToken = crypto.randomBytes(32).toString('hex');
      const resetTokenExpires = new Date();
      resetTokenExpires.setHours(resetTokenExpires.getHours() + 1); // Token válido por 1 hora

      // Guardar token en la base de datos
      user.resetPasswordToken = resetToken;
      user.resetPasswordExpires = resetTokenExpires;
      await this.usersRepository.save(user);

      // Enviar correo con enlace de recuperación
      const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password?token=${resetToken}`;

      try {
        await this.mailerService.sendMail({
          to: email,
          subject: 'Recuperación de contraseña - Orto-Whave',
          template: './reset-password',
          context: {
            resetUrl,
            email,
            expiresIn: '1 hora',
          },
        });

        this.logger.log(`Email de recuperación enviado a: ${email}`);
      } catch (emailError) {
        this.logger.error(`Error al enviar email de recuperación a ${email}:`, emailError.message);
        // Limpiar el token si no se pudo enviar el email
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await this.usersRepository.save(user);
        throw new BadRequestException('Error al enviar el correo de recuperación.');
      }

      return { message: 'Si el correo existe, recibirás un enlace de recuperación.' };
    } catch (error) {
      this.logger.error(`Error en forgotPassword para ${email}:`, error.message);
      throw error;
    }
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto): Promise<{ message: string }> {
    const { token, newPassword, confirmPassword } = resetPasswordDto;
    this.logger.log('Intento de reset de contraseña con token');

    try {
      // Validar que las contraseñas coinciden
      if (newPassword !== confirmPassword) {
        throw new BadRequestException('Las contraseñas no coinciden.');
      }

      // Buscar usuario por token y verificar que no haya expirado
      const user = await this.usersRepository.findOne({
        where: {
          resetPasswordToken: token,
        },
      });

      if (!user) {
        this.logger.warn('Intento de reset con token inválido');
        throw new BadRequestException('Token de recuperación inválido.');
      }

      // Verificar si el token ha expirado
      if (user.resetPasswordExpires < new Date()) {
        this.logger.warn(`Token expirado para usuario: ${user.email}`);
        // Limpiar token expirado
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await this.usersRepository.save(user);
        throw new BadRequestException('El token de recuperación ha expirado.');
      }

      // Hashear la nueva contraseña
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      // Actualizar contraseña y limpiar tokens
      user.password = hashedPassword;
      user.resetPasswordToken = null;
      user.resetPasswordExpires = null;
      await this.usersRepository.save(user);

      this.logger.log(`Contraseña restablecida exitosamente para usuario: ${user.email}`);

      // Enviar confirmación por email
      try {
        await this.mailerService.sendMail({
          to: user.email,
          subject: 'Contraseña restablecida - Orto-Whave',
          template: './password-changed',
          context: {
            email: user.email,
            date: new Date().toLocaleString('es-CO'),
          },
        });
      } catch (emailError) {
        this.logger.error(`Error al enviar confirmación de cambio de contraseña:`, emailError.message);
        // No fallar el proceso por error de email
      }

      return { message: 'Contraseña restablecida exitosamente.' };
    } catch (error) {
      this.logger.error('Error en resetPassword:', error.message);
      throw error;
    }
  }

  private getRedirectPath(rol: string): string {
    const redirectPaths = {
      admin: '/dashboard/admin',
      doctor: '/dashboard/doctor',
      paciente: '/dashboard/patient',
    };
    return redirectPaths[rol] || '/';
  }
}
