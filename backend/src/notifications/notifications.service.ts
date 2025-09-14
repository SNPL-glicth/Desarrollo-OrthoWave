import { Injectable, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Notification } from './entities/notification.entity';
import { Cita } from '../citas/entities/cita.entity';
import { User } from '../users/entities/user.entity';
import { RealtimeWebSocketGateway } from '../websocket/websocket.gateway';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectRepository(Notification)
    private notificationsRepository: Repository<Notification>,
    @InjectRepository(Cita)
    private citasRepository: Repository<Cita>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @Inject(forwardRef(() => RealtimeWebSocketGateway))
    private webSocketGateway: RealtimeWebSocketGateway,
  ) {}

  async crearNotificacionConfirmacionCita(citaId: number) {
    try {
      // Obtener la cita con detalles del paciente y doctor
      const cita = await this.citasRepository.findOne({
        where: { id: citaId },
        relations: ['paciente', 'doctor'],
      });

      if (!cita || !cita.paciente || !cita.doctor) {
        console.error('Cita, paciente o doctor no encontrado:', citaId);
        return;
      }

      // Crear la notificación
      const notification = this.notificationsRepository.create({
        usuarioId: cita.pacienteId,
        citaId: cita.id,
        tipo: 'cita_confirmada',
        titulo: '¡Tu cita ha sido confirmada!',
        mensaje: `Tu cita para el ${new Date(cita.fechaHora).toLocaleDateString('es-ES', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })} ha sido confirmada.`,
        doctorNombre: `${cita.doctor.nombre} ${cita.doctor.apellido}`,
        fechaCita: cita.fechaHora,
        leida: false,
      });

      const savedNotification = await this.notificationsRepository.save(notification);
      console.log('Notificación de confirmación creada para usuario:', cita.pacienteId);

      // Enviar notificación en tiempo real via WebSocket
      this.webSocketGateway.notifyNewNotification(cita.pacienteId, savedNotification);
      
      // Actualizar contador de notificaciones no leídas
      const unreadCount = await this.contarNotificacionesNoLeidas(cita.pacienteId);
      this.webSocketGateway.notifyNotificationCountUpdate(cita.pacienteId, unreadCount);

    } catch (error) {
      console.error('Error al crear notificación de confirmación:', error);
    }
  }

  async crearNotificacionCompletarPerfil(usuarioId: number) {
    try {
      // Obtener información del usuario
      const usuario = await this.usersRepository.findOne({
        where: { id: usuarioId },
      });

      if (!usuario) {
        console.error('Usuario no encontrado:', usuarioId);
        return;
      }

      // Verificar si ya existe una notificación de este tipo para este usuario
      const notificacionExistente = await this.notificationsRepository.findOne({
        where: {
          usuarioId,
          tipo: 'completar_perfil',
          leida: false
        }
      });

      if (notificacionExistente) {
        console.log('Ya existe una notificación de completar perfil para el usuario:', usuarioId);
        return;
      }

      // Crear la notificación
      const notification = this.notificationsRepository.create({
        usuarioId,
        citaId: null,
        tipo: 'completar_perfil',
        titulo: '¡Completa tu perfil!',
        mensaje: `¡Hola ${usuario.nombre}! Para brindarte una mejor atención, te invitamos a completar tu información personal en la sección "Mi Perfil". Esto nos ayudará a conocerte mejor y ofrecerte un servicio más personalizado.`,
        doctorNombre: null,
        fechaCita: null,
        leida: false,
      });

      const savedNotification = await this.notificationsRepository.save(notification);
      console.log('Notificación de completar perfil creada para usuario:', usuarioId);

      // Enviar notificación en tiempo real via WebSocket
      this.webSocketGateway.notifyNewNotification(usuarioId, savedNotification);
      
      // Actualizar contador de notificaciones no leídas
      const unreadCount = await this.contarNotificacionesNoLeidas(usuarioId);
      this.webSocketGateway.notifyNotificationCountUpdate(usuarioId, unreadCount);

    } catch (error) {
      console.error('Error al crear notificación de completar perfil:', error);
    }
  }

  async crearNotificacionCancelacionCita(citaId: number, razon?: string) {
    try {
      // Obtener la cita con detalles del paciente y doctor
      const cita = await this.citasRepository.findOne({
        where: { id: citaId },
        relations: ['paciente', 'doctor'],
      });

      if (!cita || !cita.paciente || !cita.doctor) {
        console.error('Cita, paciente o doctor no encontrado:', citaId);
        return;
      }

      // Crear la notificación
      const notification = this.notificationsRepository.create({
        usuarioId: cita.pacienteId,
        citaId: cita.id,
        tipo: 'cita_cancelada',
        titulo: 'Tu cita ha sido cancelada',
        mensaje: `Tu cita para el ${new Date(cita.fechaHora).toLocaleDateString('es-ES', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })} ha sido cancelada.${razon ? ` Motivo: ${razon}` : ''}`,
        doctorNombre: `${cita.doctor.nombre} ${cita.doctor.apellido}`,
        fechaCita: cita.fechaHora,
        leida: false,
      });

      const savedNotification = await this.notificationsRepository.save(notification);
      console.log('Notificación de cancelación creada para usuario:', cita.pacienteId);

      // Enviar notificación en tiempo real via WebSocket
      this.webSocketGateway.notifyNewNotification(cita.pacienteId, savedNotification);
      
      // Actualizar contador de notificaciones no leídas
      const unreadCount = await this.contarNotificacionesNoLeidas(cita.pacienteId);
      this.webSocketGateway.notifyNotificationCountUpdate(cita.pacienteId, unreadCount);

    } catch (error) {
      console.error('Error al crear notificación de cancelación:', error);
    }
  }

  async obtenerNotificacionesUsuario(usuarioId: number) {
    return await this.notificationsRepository.find({
      where: { usuarioId },
      order: { fechaCreacion: 'DESC' },
      take: 20, // Límite de 20 notificaciones más recientes
    });
  }

  async marcarComoLeida(notificationId: number, usuarioId: number) {
    const notification = await this.notificationsRepository.findOne({
      where: { id: notificationId, usuarioId },
    });

    if (notification) {
      notification.leida = true;
      const updatedNotification = await this.notificationsRepository.save(notification);
      
      // Actualizar contador de notificaciones no leídas en tiempo real
      const unreadCount = await this.contarNotificacionesNoLeidas(usuarioId);
      this.webSocketGateway.notifyNotificationCountUpdate(usuarioId, unreadCount);
      
      return updatedNotification;
    }

    return null;
  }

  async marcarTodasComoLeidas(usuarioId: number) {
    await this.notificationsRepository.update(
      { usuarioId, leida: false },
      { leida: true }
    );
    
    // Actualizar contador a 0 en tiempo real
    this.webSocketGateway.notifyNotificationCountUpdate(usuarioId, 0);
  }

  async contarNotificacionesNoLeidas(usuarioId: number): Promise<number> {
    return await this.notificationsRepository.count({
      where: { usuarioId, leida: false },
    });
  }

  async eliminarNotificacionesAntiguas() {
    // Eliminar notificaciones más antiguas a 30 días
    const fechaLimite = new Date();
    fechaLimite.setDate(fechaLimite.getDate() - 30);

    await this.notificationsRepository
      .createQueryBuilder()
      .delete()
      .where('fecha_creacion < :fechaLimite', { fechaLimite })
      .execute();
  }
}
