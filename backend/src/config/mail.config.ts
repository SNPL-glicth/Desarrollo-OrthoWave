import { MailerOptions } from '@nestjs-modules/mailer';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { join } from 'path';
import * as dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

export const mailConfig: MailerOptions = {
  transport: {
    host: process.env.MAIL_HOST || 'smtp.ethereal.email',
    port: parseInt(process.env.MAIL_PORT) || 587,
    secure: process.env.MAIL_SECURE === 'true' || false,
    auth: {
      user: process.env.MAIL_USER || 'ethereal.test@example.com',
      pass: process.env.MAIL_PASS || 'test123',
    },
    tls: {
      rejectUnauthorized: false
    }
  },
  defaults: {
    from: process.env.MAIL_FROM || '"Orto-Whave" <noreply@ortowhave.com>',
  },
  template: {
    dir: join(__dirname, '..', 'templates'),
    adapter: new HandlebarsAdapter(),
    options: {
      strict: true,
    },
  },
};
