import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RolesModule } from './roles/roles.module';
import { MailModule } from './mail/mail.module';
import { CitasModule } from './citas/citas.module';
import { PerfilMedicoModule } from './perfil-medico/perfil-medico.module';
import { PacientesModule } from './pacientes/pacientes.module';
import { HistoriaClinicaModule } from './historia-clinica/historia-clinica.module';
import { databaseConfig } from './config/database.config';

@Module({
  imports: [
    TypeOrmModule.forRoot(databaseConfig),
    AuthModule,
    UsersModule,
    RolesModule,
    MailModule,
    CitasModule,
    PerfilMedicoModule,
    PacientesModule,
    HistoriaClinicaModule,
  ],
})
export class AppModule {}
