import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { Cita } from '../citas/entities/cita.entity';

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

  async enviarNotificacionCitaExpirada(cita: Cita) {
    try {
      // Notificar al paciente
      if (cita.paciente?.email) {
        await this.mailerService.sendMail({
          to: cita.paciente.email,
          subject: 'Cita Expirada - Orto-Whave',
          html: `
            <h3>Notificación de Cita Expirada</h3>
            <p>Estimado/a ${cita.paciente.nombre},</p>
            <p>Su cita programada para el ${new Date(cita.fechaHora).toLocaleString('es-ES')} ha expirado debido a que no fue confirmada a tiempo.</p>
            <p>Si desea reagendar su cita, por favor contacte con nosotros.</p>
            <p>Atentamente,<br>Equipo Orto-Whave</p>
          `,
        });
      }

      // Notificar al doctor
      if (cita.doctor?.email) {
        await this.mailerService.sendMail({
          to: cita.doctor.email,
          subject: 'Cita Expirada - Orto-Whave',
          html: `
            <h3>Cita Expirada</h3>
            <p>Doctor/a ${cita.doctor.nombre},</p>
            <p>La cita con el paciente ${cita.paciente?.nombre} programada para el ${new Date(cita.fechaHora).toLocaleString('es-ES')} ha expirado.</p>
            <p>El horario queda disponible nuevamente.</p>
            <p>Atentamente,<br>Sistema Orto-Whave</p>
          `,
        });
      }
    } catch (error) {
      console.error('Error enviando notificación de cita expirada:', error);
    }
  }

  async enviarRecordatorioCita(cita: Cita) {
    try {
      // Recordatorio al paciente
      if (cita.paciente?.email) {
        await this.mailerService.sendMail({
          to: cita.paciente.email,
          subject: 'Recordatorio de Cita - Orto-Whave',
          html: `
            <h3>Recordatorio de Cita</h3>
            <p>Estimado/a ${cita.paciente.nombre},</p>
            <p>Le recordamos que tiene una cita programada para el ${new Date(cita.fechaHora).toLocaleString('es-ES')}.</p>
            <p><strong>Doctor:</strong> ${cita.doctor?.nombre}</p>
            <p><strong>Motivo:</strong> ${cita.motivoConsulta || 'Consulta general'}</p>
            <p>Por favor, llegue con 15 minutos de anticipación.</p>
            <p>Atentamente,<br>Equipo Orto-Whave</p>
          `,
        });
      }
    } catch (error) {
      console.error('Error enviando recordatorio de cita:', error);
    }
  }
}
