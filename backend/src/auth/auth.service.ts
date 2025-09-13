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
import { ForgotPasswordCodeDto } from './dto/forgot-password-code.dto';
import { VerifyResetCodeDto } from './dto/verify-reset-code.dto';
import { ResetPasswordWithCodeDto } from './dto/reset-password-with-code.dto';
import { getCurrentColombiaDateTime } from '../utils/timezone.utils';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
    private mailerService: MailerService,
    private notificationsService: NotificationsService,
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

      // Verificar que la cuenta esté verificada por email
      if (!user.isVerified) {
        this.logger.warn(`Intento de login con cuenta no verificada: ${email}`);
        return { 
          error: 'EMAIL_NOT_VERIFIED', 
          message: 'La cuenta no ha sido verificada. Por favor revisa tu correo electrónico y completa el proceso de verificación con el código que te enviamos.'
        };
      }

      // Usar bcrypt para comparar contraseñas
      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (isPasswordValid) {
        const roleName = user.rol?.nombre || 'Sin rol asignado';
        this.logger.log(`Validación exitosa para usuario: ${email} con rol: ${roleName}`);
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
      // Validar que el usuario tenga un rol asignado
      if (!user.rol || !user.rol.nombre) {
        this.logger.error(`Usuario ${user.email} no tiene rol asignado`);
        throw new UnauthorizedException('El usuario no tiene un rol asignado. Contacta al administrador.');
      }

      const roleName = user.rol.nombre;
      this.logger.log(`Usuario ${user.email} tiene rol: ${roleName}`);

      const payload = {
        email: user.email,
        sub: user.id,
        rol: roleName,
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
          rol: roleName,
        },
        redirect: this.getRedirectPath(roleName),
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

    // Generar código de verificación de 6 dígitos - asegurar que siempre sean exactamente 6 dígitos
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const verificationCode = randomNum.toString().padStart(6, '0'); // Asegurar 6 dígitos con ceros a la izquierda si es necesario
    this.logger.log(`Código generado para ${userData.email}: ${verificationCode}`);
    
    // Validar que el código tiene exactamente 6 dígitos
    if (verificationCode.length !== 6 || !/^\d{6}$/.test(verificationCode)) {
      this.logger.error(`Error: Código generado inválido: ${verificationCode}`);
      throw new BadRequestException('Error interno al generar el código de verificación.');
    }

    // Usar bcrypt para hashear la contraseña de forma segura
    const saltRounds = 12; // Usar 12 rounds para mayor seguridad
    const hashedPassword = await bcrypt.hash(userData.password, saltRounds);

    // Determinar el estado de aprobación según el rol
    const isPatientRole = rolId === 3; // Rol 3 = paciente
    
    const newUser = this.usersRepository.create({
      ...userData,
      password: hashedPassword,
      rolId,
      isVerified: false, // Usuario no verificado hasta que ingrese el código
      verificationCode,
      // Pacientes aprobados una vez verificados
      isApproved: false,
      approvalStatus: 'pending',
    });

    await this.usersRepository.save(newUser);

    // Enviar código de verificación por correo
    try {
      this.logger.log(`Enviando email con código ${verificationCode} a: ${userData.email}`);
      
      // Asegurar que el código sea exactamente el mismo que se guardó en la BD
      const codeToSend = verificationCode.toString().trim();
      this.logger.log(`Código a enviar (procesado): '${codeToSend}' (longitud: ${codeToSend.length})`);
      
      await this.mailerService.sendMail({
        to: userData.email,
        subject: 'Código de verificación - Orto-Whave',
        template: './verification-code',
        context: {
          name: userData.nombre,
          verificationCode: codeToSend, // Usar la variable procesada
          email: userData.email,
        },
      });
      this.logger.log(`Código de verificación enviado a: ${userData.email}`);
    } catch (emailError) {
      this.logger.error(`Error al enviar código de verificación a ${userData.email}:`, emailError.message);
      // Si no se puede enviar el email, eliminar el usuario creado
      await this.usersRepository.remove(newUser);
      throw new BadRequestException('Error al enviar el código de verificación. Por favor, intenta nuevamente.');
    }

    // Mensaje para verificación de correo
    const message = 'Usuario registrado exitosamente. Hemos enviado un código de verificación a tu correo electrónico.';
    
    return {
      message,
      email: userData.email,
      requiresVerification: true,
    };
  }

  async verifyCode(email: string, code: string) {
    this.logger.log(`Verificando código para: ${email}`);
    
    const user = await this.usersRepository.findOne({ 
      where: { email },
      relations: ['rol']
    });
    
    if (!user) {
      this.logger.warn(`Usuario no encontrado para verificación: ${email}`);
      throw new UnauthorizedException('Usuario no encontrado');
    }
    
    if (user.isVerified) {
      this.logger.log(`Usuario ${email} ya está verificado`);
      // Si ya está verificado, verificar si es paciente pendiente
      if (user.rol?.nombre === 'paciente' && user.approvalStatus === 'pending') {
        return { 
          message: 'Tu cuenta ha sido verificada pero está pendiente de aprobación. Será revisada en un plazo máximo de 48 horas.',
          requiresApproval: true
        };
      }
      return { message: 'La cuenta ya está verificada.' };
    }
    
    // Limpiar y normalizar ambos códigos para comparación
    const storedCode = (user.verificationCode || '').toString().trim();
    const receivedCode = (code || '').toString().trim();
    
    this.logger.log(`Comparando códigos para ${email}:`);
    this.logger.log(`  - Código almacenado: '${storedCode}' (longitud: ${storedCode.length})`);
    this.logger.log(`  - Código recibido: '${receivedCode}' (longitud: ${receivedCode.length})`);
    
    // Validar que ambos códigos sean numéricos de 6 dígitos
    if (!/^\d{6}$/.test(storedCode)) {
      this.logger.error(`Código almacenado inválido para ${email}: '${storedCode}'`);
      throw new UnauthorizedException('Error interno. Código de verificación corrupto.');
    }
    
    if (!/^\d{6}$/.test(receivedCode)) {
      this.logger.warn(`Código recibido inválido para ${email}: '${receivedCode}'`);
      throw new UnauthorizedException('El código debe ser de exactamente 6 dígitos numéricos.');
    }
    
    if (storedCode !== receivedCode) {
      this.logger.warn(`Código incorrecto para ${email}. Esperado: '${storedCode}', Recibido: '${receivedCode}'`);
      throw new UnauthorizedException('Código de verificación incorrecto');
    }
    
    this.logger.log(`Código verificado correctamente para: ${email}`);
    
    user.isVerified = true;
    user.verificationCode = null;
    await this.usersRepository.save(user);
    
    // Si es un paciente, crear notificación para completar perfil y mostrar mensaje de aprobación pendiente
    if (user.rol?.nombre === 'paciente') {
      try {
        await this.notificationsService.crearNotificacionCompletarPerfil(user.id);
        this.logger.log(`Notificación de completar perfil creada para paciente: ${user.email}`);
      } catch (notificationError) {
        this.logger.error(`Error al crear notificación de completar perfil para ${user.email}:`, notificationError.message);
        // No fallar el proceso de verificación por error de notificación
      }
      
      if (user.approvalStatus === 'pending') {
        return { 
          message: 'Cuenta verificada exitosamente. Tu solicitud está pendiente de aprobación y será revisada en un plazo máximo de 48 horas. Para agilizar el proceso, puedes contactarnos por nuestros canales oficiales.',
          requiresApproval: true
        };
      }
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
      const resetTokenExpires = getCurrentColombiaDateTime();
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
      if (user.resetPasswordExpires < getCurrentColombiaDateTime()) {
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
            date: getCurrentColombiaDateTime().toLocaleString('es-CO'),
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

  // Nuevos métodos para recuperación con código numérico
  async forgotPasswordWithCode(forgotPasswordCodeDto: ForgotPasswordCodeDto): Promise<{ message: string }> {
    const { email } = forgotPasswordCodeDto;
    this.logger.log(`Solicitud de recuperación de contraseña con código para: ${email}`);

    try {
      const user = await this.usersRepository.findOne({ where: { email } });

      if (!user) {
        this.logger.warn(`Solicitud de reset para email no existente: ${email}`);
        // Por seguridad, siempre devolvemos el mismo mensaje
        return { message: 'Si el correo existe, recibirás un código de recuperación.' };
      }

      if (!user.isVerified) {
        this.logger.warn(`Intento de recuperación para cuenta no verificada: ${email}`);
        throw new BadRequestException('La cuenta debe estar verificada para poder recuperar la contraseña.');
      }

      // Generar código de recuperación de 6 dígitos
      const randomNum = Math.floor(100000 + Math.random() * 900000);
      const resetCode = randomNum.toString().padStart(6, '0');
      this.logger.log(`Código de recuperación generado para ${email}: ${resetCode}`);

      // Establecer expiración del código (15 minutos)
      const resetCodeExpires = getCurrentColombiaDateTime();
      resetCodeExpires.setMinutes(resetCodeExpires.getMinutes() + 15);

      // Guardar código en la base de datos
      user.passwordResetCode = resetCode;
      user.passwordResetCodeExpires = resetCodeExpires;
      await this.usersRepository.save(user);

      // Enviar correo con código de recuperación
      try {
        await this.mailerService.sendMail({
          to: email,
          subject: 'Código de recuperación de contraseña - Orto-Whave',
          template: './password-reset-code',
          context: {
            name: user.nombre,
            resetCode,
            email,
            expiresIn: '15 minutos',
          },
        });

        this.logger.log(`Código de recuperación enviado a: ${email}`);
      } catch (emailError) {
        this.logger.error(`Error al enviar código de recuperación a ${email}:`, emailError.message);
        // Limpiar el código si no se pudo enviar el email
        user.passwordResetCode = null;
        user.passwordResetCodeExpires = null;
        await this.usersRepository.save(user);
        throw new BadRequestException('Error al enviar el código de recuperación. Por favor, intenta nuevamente.');
      }

      return { message: 'Si el correo existe, recibirás un código de recuperación de 6 dígitos.' };
    } catch (error) {
      this.logger.error(`Error en forgotPasswordWithCode para ${email}:`, error.message);
      throw error;
    }
  }

  async verifyResetCode(verifyResetCodeDto: VerifyResetCodeDto): Promise<{ message: string; isValid: boolean }> {
    const { email, code } = verifyResetCodeDto;
    this.logger.log(`Verificando código de recuperación para: ${email}`);

    try {
      const user = await this.usersRepository.findOne({ where: { email } });

      if (!user) {
        this.logger.warn(`Usuario no encontrado para verificación de código: ${email}`);
        throw new UnauthorizedException('Usuario no encontrado.');
      }

      if (!user.passwordResetCode) {
        this.logger.warn(`No hay código de recuperación activo para: ${email}`);
        throw new BadRequestException('No hay un código de recuperación activo. Solicita uno nuevo.');
      }

      // Verificar si el código ha expirado
      if (user.passwordResetCodeExpires < getCurrentColombiaDateTime()) {
        this.logger.warn(`Código de recuperación expirado para: ${email}`);
        // Limpiar código expirado
        user.passwordResetCode = null;
        user.passwordResetCodeExpires = null;
        await this.usersRepository.save(user);
        throw new BadRequestException('El código de recuperación ha expirado. Solicita uno nuevo.');
      }

      // Limpiar y normalizar códigos para comparación
      const storedCode = (user.passwordResetCode || '').toString().trim();
      const receivedCode = (code || '').toString().trim();

      this.logger.log(`Comparando códigos de recuperación para ${email}:`);
      this.logger.log(`  - Código almacenado: '${storedCode}'`);
      this.logger.log(`  - Código recibido: '${receivedCode}'`);

      if (storedCode !== receivedCode) {
        this.logger.warn(`Código de recuperación incorrecto para ${email}`);
        throw new UnauthorizedException('Código de recuperación incorrecto.');
      }

      this.logger.log(`Código de recuperación verificado correctamente para: ${email}`);
      return { message: 'Código verificado correctamente. Ahora puedes cambiar tu contraseña.', isValid: true };
    } catch (error) {
      this.logger.error(`Error en verifyResetCode para ${email}:`, error.message);
      throw error;
    }
  }

  async resetPasswordWithCode(resetPasswordWithCodeDto: ResetPasswordWithCodeDto): Promise<{ message: string }> {
    const { email, code, newPassword, confirmPassword } = resetPasswordWithCodeDto;
    this.logger.log(`Intento de cambio de contraseña con código para: ${email}`);

    try {
      // Validar que las contraseñas coinciden
      if (newPassword !== confirmPassword) {
        throw new BadRequestException('Las contraseñas no coinciden.');
      }

      const user = await this.usersRepository.findOne({ where: { email } });

      if (!user) {
        this.logger.warn(`Usuario no encontrado para reset con código: ${email}`);
        throw new UnauthorizedException('Usuario no encontrado.');
      }

      if (!user.passwordResetCode) {
        this.logger.warn(`No hay código de recuperación activo para: ${email}`);
        throw new BadRequestException('No hay un código de recuperación activo. Solicita uno nuevo.');
      }

      // Verificar si el código ha expirado
      if (user.passwordResetCodeExpires < getCurrentColombiaDateTime()) {
        this.logger.warn(`Código de recuperación expirado para: ${email}`);
        // Limpiar código expirado
        user.passwordResetCode = null;
        user.passwordResetCodeExpires = null;
        await this.usersRepository.save(user);
        throw new BadRequestException('El código de recuperación ha expirado. Solicita uno nuevo.');
      }

      // Verificar el código
      const storedCode = (user.passwordResetCode || '').toString().trim();
      const receivedCode = (code || '').toString().trim();

      if (storedCode !== receivedCode) {
        this.logger.warn(`Código de recuperación incorrecto para cambio de contraseña: ${email}`);
        throw new UnauthorizedException('Código de recuperación incorrecto.');
      }

      // Hashear la nueva contraseña
      const saltRounds = 12;
      const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

      // Actualizar contraseña y limpiar código de recuperación
      user.password = hashedPassword;
      user.passwordResetCode = null;
      user.passwordResetCodeExpires = null;
      await this.usersRepository.save(user);

      this.logger.log(`Contraseña restablecida exitosamente con código para usuario: ${email}`);

      // Enviar confirmación por email
      try {
        await this.mailerService.sendMail({
          to: email,
          subject: 'Contraseña restablecida - Orto-Whave',
          template: './password-changed',
          context: {
            email,
            date: getCurrentColombiaDateTime().toLocaleString('es-CO'),
          },
        });
      } catch (emailError) {
        this.logger.error(`Error al enviar confirmación de cambio de contraseña:`, emailError.message);
        // No fallar el proceso por error de email
      }

      return { message: 'Contraseña restablecida exitosamente.' };
    } catch (error) {
      this.logger.error(`Error en resetPasswordWithCode para ${email}:`, error.message);
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
