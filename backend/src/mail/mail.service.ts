import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';

@Injectable()
export class MailService {
  constructor(private mailerService: MailerService) {}

  async sendVerificationEmail(email: string, verificationCode: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: 'Verifica tu cuenta en Orto-Whave',
      template: 'verification',
      context: {
        verificationCode,
        email,
      },
    });
  }

  async sendWelcomeEmail(email: string, name: string) {
    await this.mailerService.sendMail({
      to: email,
      subject: '¡Bienvenido a Orto-Whave!',
      template: 'welcome',
      context: {
        name,
        email,
      },
    });
  }
} 