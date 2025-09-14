import {
  WebSocketGateway as WSGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Logger, UseGuards } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

interface ConnectedUser {
  id: number;
  rol: string;
  nombre: string;
  email: string;
}

@WSGateway({
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
    credentials: true
  }
})
export class RealtimeWebSocketGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger: Logger = new Logger('WebSocketGateway');
  private connectedUsers: Map<string, ConnectedUser> = new Map();

  constructor(private jwtService: JwtService) {}

  async handleConnection(client: Socket) {
    try {
      const token = client.handshake.auth.token || client.handshake.headers.authorization?.replace('Bearer ', '');
      
      if (!token) {
        this.logger.warn('Cliente desconectado: No se proporcionó token');
        client.disconnect();
        return;
      }

      const payload = this.jwtService.verify(token);
      const user: ConnectedUser = {
        id: payload.sub,
        rol: payload.rol,
        nombre: payload.nombre,
        email: payload.email
      };

      this.connectedUsers.set(client.id, user);
      
      // Unir al usuario a su sala específica de rol
      client.join(`role_${user.rol}`);
      client.join(`user_${user.id}`);

      this.logger.log(`Usuario conectado: ${user.nombre} (${user.rol}) - Socket: ${client.id}`);
      
      // Notificar a otros usuarios sobre la conexión
      this.server.emit('user_connected', {
        userId: user.id,
        nombre: user.nombre,
        rol: user.rol
      });

    } catch (error) {
      this.logger.error('Error en autenticación WebSocket:', error);
      client.disconnect();
    }
  }

  handleDisconnect(client: Socket) {
    const user = this.connectedUsers.get(client.id);
    if (user) {
      this.logger.log(`Usuario desconectado: ${user.nombre} (${user.rol}) - Socket: ${client.id}`);
      this.connectedUsers.delete(client.id);
      
      // Notificar a otros usuarios sobre la desconexión
      this.server.emit('user_disconnected', {
        userId: user.id,
        nombre: user.nombre,
        rol: user.rol
      });
    }
  }

  @SubscribeMessage('join_room')
  handleJoinRoom(@ConnectedSocket() client: Socket, @MessageBody() data: { room: string }) {
    client.join(data.room);
    this.logger.log(`Usuario se unió a la sala: ${data.room}`);
  }

  @SubscribeMessage('leave_room')
  handleLeaveRoom(@ConnectedSocket() client: Socket, @MessageBody() data: { room: string }) {
    client.leave(data.room);
    this.logger.log(`Usuario salió de la sala: ${data.room}`);
  }

  // Métodos para emitir eventos desde otros servicios
  emitToUser(userId: number, event: string, data: any) {
    this.server.to(`user_${userId}`).emit(event, data);
  }

  emitToRole(role: string, event: string, data: any) {
    this.server.to(`role_${role}`).emit(event, data);
  }

  emitToAll(event: string, data: any) {
    this.server.emit(event, data);
  }

  // Eventos específicos para el dashboard
  notifyDashboardUpdate(targetRole?: string, targetUserId?: number) {
    const event = 'dashboard_update';
    const data = {
      timestamp: new Date().toISOString(),
      message: 'Datos del dashboard actualizados'
    };

    if (targetUserId) {
      this.emitToUser(targetUserId, event, data);
    } else if (targetRole) {
      this.emitToRole(targetRole, event, data);
    } else {
      this.emitToAll(event, data);
    }
  }

  notifyCitaUpdate(citaId: number, doctorId: number, pacienteId: number, action: string) {
    const event = 'cita_update';
    const data = {
      citaId,
      doctorId,
      pacienteId,
      action,
      timestamp: new Date().toISOString()
    };

    // Notificar al doctor y paciente específicos
    this.emitToUser(doctorId, event, data);
    this.emitToUser(pacienteId, event, data);
    
    // Notificar a todos los admins
    this.emitToRole('admin', event, data);
  }

  notifyUserUpdate(userId: number, action: string) {
    const event = 'user_update';
    const data = {
      userId,
      action,
      timestamp: new Date().toISOString()
    };

    // Notificar a todos los admins
    this.emitToRole('admin', event, data);
    
    // Notificar al usuario específico si es una actualización de perfil
    if (action === 'profile_update') {
      this.emitToUser(userId, event, data);
    }
  }

  notifySystemUpdate(message: string) {
    const event = 'system_update';
    const data = {
      message,
      timestamp: new Date().toISOString()
    };

    this.emitToAll(event, data);
  }

  // Método específico para notificaciones
  notifyNewNotification(userId: number, notification: any) {
    const event = 'new_notification';
    const data = {
      notification,
      timestamp: new Date().toISOString()
    };

    this.logger.log(`Enviando nueva notificación a usuario ${userId}:`, notification.titulo);
    this.emitToUser(userId, event, data);
  }

  // Notificar actualización del contador de notificaciones
  notifyNotificationCountUpdate(userId: number, unreadCount: number) {
    const event = 'notification_count_update';
    const data = {
      unreadCount,
      timestamp: new Date().toISOString()
    };

    this.emitToUser(userId, event, data);
  }

  // Obtener usuarios conectados
  getConnectedUsers(): ConnectedUser[] {
    return Array.from(this.connectedUsers.values());
  }

  // Obtener usuarios conectados por rol
  getConnectedUsersByRole(role: string): ConnectedUser[] {
    return Array.from(this.connectedUsers.values()).filter(user => user.rol === role);
  }

  // Verificar si un usuario está conectado
  isUserConnected(userId: number): boolean {
    return Array.from(this.connectedUsers.values()).some(user => user.id === userId);
  }

  // =================== EVENTOS ESPECÍFICOS PARA TIEMPO REAL ===================

  // Eventos para citas
  notifyAppointmentCreated(appointment: any, doctorId: number, pacienteId: number) {
    const event = 'appointment_created';
    const data = {
      appointment,
      timestamp: new Date().toISOString()
    };
    
    this.emitToUser(doctorId, event, data);
    this.emitToUser(pacienteId, event, data);
    this.emitToRole('admin', event, data);
  }

  notifyAppointmentUpdated(appointment: any, previousState?: any) {
    const event = 'appointment_updated';
    const data = {
      appointment,
      previousState,
      timestamp: new Date().toISOString()
    };
    
    this.emitToUser(appointment.doctorId, event, data);
    this.emitToUser(appointment.pacienteId, event, data);
    this.emitToRole('admin', event, data);
  }

  notifyAppointmentDeleted(appointmentId: number, doctorId: number, pacienteId: number) {
    const event = 'appointment_deleted';
    const data = {
      appointmentId,
      doctorId,
      pacienteId,
      timestamp: new Date().toISOString()
    };
    
    this.emitToUser(doctorId, event, data);
    this.emitToUser(pacienteId, event, data);
    this.emitToRole('admin', event, data);
  }

  // Eventos para estados específicos de citas
  notifyAppointmentStatusChange(appointment: any, oldStatus: string, newStatus: string) {
    const event = 'appointment_status_changed';
    const data = {
      appointment,
      oldStatus,
      newStatus,
      timestamp: new Date().toISOString()
    };
    
    this.emitToUser(appointment.doctorId, event, data);
    this.emitToUser(appointment.pacienteId, event, data);
    this.emitToRole('admin', event, data);
  }

  // Eventos para dashboard
  notifyDashboardDataUpdate(userId: number, dataType: string, data: any) {
    const event = 'dashboard_data_update';
    const payload = {
      dataType,
      data,
      timestamp: new Date().toISOString()
    };
    
    this.emitToUser(userId, event, payload);
  }

  notifyRoleDashboardUpdate(role: string, dataType: string, data: any) {
    const event = 'role_dashboard_update';
    const payload = {
      dataType,
      data,
      timestamp: new Date().toISOString()
    };
    
    this.emitToRole(role, event, payload);
  }

  // Eventos para perfiles médicos
  notifyDoctorProfileUpdated(doctorId: number, profileData: any) {
    const event = 'doctor_profile_updated';
    const data = {
      doctorId,
      profileData,
      timestamp: new Date().toISOString()
    };
    
    this.emitToUser(doctorId, event, data);
    this.emitToRole('admin', event, data);
    this.emitToRole('paciente', event, data); // Para que pacientes vean cambios en disponibilidad
  }

  // Eventos para disponibilidad
  notifyScheduleUpdated(doctorId: number, scheduleData: any) {
    const event = 'schedule_updated';
    const data = {
      doctorId,
      scheduleData,
      timestamp: new Date().toISOString()
    };
    
    this.emitToUser(doctorId, event, data);
    this.emitToRole('admin', event, data);
    this.emitToRole('paciente', event, data);
  }

  // Eventos para usuarios
  notifyNewUserRegistered(userData: any) {
    const event = 'new_user_registered';
    const data = {
      userData,
      timestamp: new Date().toISOString()
    };
    
    this.emitToRole('admin', event, data);
    if (userData.rol === 'doctor') {
      this.emitToRole('paciente', event, data);
    }
  }

  // Eventos para productos
  notifyProductUpdated(productData: any) {
    const event = 'product_updated';
    const data = {
      productData,
      timestamp: new Date().toISOString()
    };
    
    this.emitToAll(event, data); // Todos pueden ver productos
  }

  // Eventos para historial clínico
  notifyMedicalRecordUpdated(patientId: number, doctorId: number, recordData: any) {
    const event = 'medical_record_updated';
    const data = {
      patientId,
      doctorId,
      recordData,
      timestamp: new Date().toISOString()
    };
    
    this.emitToUser(patientId, event, data);
    this.emitToUser(doctorId, event, data);
    this.emitToRole('admin', event, data);
  }

  // Eventos para documentos de pacientes
  notifyPatientDocumentUpdated(patientId: number, documentData: any) {
    const event = 'patient_document_updated';
    const data = {
      patientId,
      documentData,
      timestamp: new Date().toISOString()
    };
    
    this.emitToUser(patientId, event, data);
    this.emitToRole('admin', event, data);
    // Notificar a doctores que tengan citas con este paciente podría agregarse
  }

  // Evento genérico para refrescar listas
  notifyListUpdate(listType: string, targetRole?: string, targetUserId?: number, data?: any) {
    const event = 'list_update';
    const payload = {
      listType,
      data,
      timestamp: new Date().toISOString()
    };
    
    if (targetUserId) {
      this.emitToUser(targetUserId, event, payload);
    } else if (targetRole) {
      this.emitToRole(targetRole, event, payload);
    } else {
      this.emitToAll(event, payload);
    }
  }

  // Evento para actualizaciones de contadores
  notifyCounterUpdate(counterType: string, count: number, userId?: number, role?: string) {
    const event = 'counter_update';
    const data = {
      counterType,
      count,
      timestamp: new Date().toISOString()
    };
    
    if (userId) {
      this.emitToUser(userId, event, data);
    } else if (role) {
      this.emitToRole(role, event, data);
    }
  }

  // Evento para sincronización de calendario
  notifyCalendarSync(doctorId?: number, data?: any) {
    const event = 'calendar_sync';
    const payload = {
      doctorId,
      data,
      timestamp: new Date().toISOString()
    };
    
    if (doctorId) {
      this.emitToUser(doctorId, event, payload);
      this.emitToRole('admin', event, payload);
    } else {
      this.emitToAll(event, payload);
    }
  }
}
