import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CitasService } from './citas.service';
import { CitasController } from './citas.controller';
import { DashboardCitasService } from './dashboard-citas.service';
import { DashboardCitasController } from './dashboard-citas.controller';
import { Cita } from './entities/cita.entity';
import { PerfilMedico } from '../perfil-medico/entities/perfil-medico.entity';
import { User } from '../users/entities/user.entity';
import { WebSocketModule } from '../websocket/websocket.module';
import { CacheModule } from '../cache/cache.module';
import { MailModule } from '../mail/mail.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { CitasSchedulerService } from './citas-scheduler.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([Cita, PerfilMedico, User]),
    WebSocketModule,
    CacheModule,
    MailModule, // Para envío de correos
    NotificationsModule, // Para notificaciones de pacientes
  ],
  controllers: [CitasController, DashboardCitasController],
  providers: [CitasService, DashboardCitasService, CitasSchedulerService], // Agregado CitasSchedulerService
  exports: [CitasService, DashboardCitasService]
})
export class CitasModule {}
