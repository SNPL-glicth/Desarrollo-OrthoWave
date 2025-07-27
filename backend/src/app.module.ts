import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { MailModule } from './mail/mail.module';
import { CitasModule } from './citas/citas.module';
import { DoctorAvailabilityModule } from './doctor-availability/doctor-availability.module';
import { PerfilMedicoModule } from './perfil-medico/perfil-medico.module';
import { PacientesModule } from './pacientes/pacientes.module';
import { HistoriaClinicaModule } from './historia-clinica/historia-clinica.module';
import { WebSocketModule } from './websocket/websocket.module';
import { CacheModule } from './cache/cache.module';
import { databaseConfig } from './config/database.config';

@Module({
  imports: [
    TypeOrmModule.forRoot(databaseConfig),
    ScheduleModule.forRoot(), // Reactivado para tareas programadas
    AuthModule,
    UsersModule,
    RolesModule,
    MailModule, // Reactivado para envío de correos
    CitasModule,
    DoctorAvailabilityModule,
    PerfilMedicoModule,
    PacientesModule,
    HistoriaClinicaModule, // Reactivado para historias clínicas
    WebSocketModule, // Reactivado para notificaciones en tiempo real
    CacheModule, // Reactivado para optimización
  ],
})
export class AppModule {}
