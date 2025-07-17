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
}
