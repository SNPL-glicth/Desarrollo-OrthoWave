import { Controller, Get, Patch, Param, ParseIntPipe, Request, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { NotificationsService } from './notifications.service';

@Controller('notifications')
@UseGuards(JwtAuthGuard)
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  async obtenerNotificaciones(@Request() req) {
    const usuarioId = req.user.id;
    return await this.notificationsService.obtenerNotificacionesUsuario(usuarioId);
  }

  @Get('unread-count')
  async obtenerConteoNoLeidas(@Request() req) {
    const usuarioId = req.user.id;
    const count = await this.notificationsService.contarNotificacionesNoLeidas(usuarioId);
    return { unreadCount: count };
  }

  @Patch(':id/read')
  async marcarComoLeida(@Param('id', ParseIntPipe) id: number, @Request() req) {
    const usuarioId = req.user.id;
    const notification = await this.notificationsService.marcarComoLeida(id, usuarioId);
    
    if (!notification) {
      return { success: false, message: 'Notificación no encontrada' };
    }

    return { success: true, message: 'Notificación marcada como leída' };
  }

  @Patch('read-all')
  async marcarTodasComoLeidas(@Request() req) {
    const usuarioId = req.user.id;
    await this.notificationsService.marcarTodasComoLeidas(usuarioId);
    return { success: true, message: 'Todas las notificaciones marcadas como leídas' };
  }
}
