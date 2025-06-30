import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CitasService } from './citas.service';
import { CitasController } from './citas.controller';
import { Cita } from './entities/cita.entity';
import { PerfilMedico } from '../perfil-medico/entities/perfil-medico.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Cita, PerfilMedico, User])
  ],
  controllers: [CitasController],
  providers: [CitasService],
  exports: [CitasService]
})
export class CitasModule {}
