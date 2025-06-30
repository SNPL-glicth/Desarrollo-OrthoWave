import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PacientesService } from './pacientes.service';
import { PacientesController } from './pacientes.controller';
import { Paciente } from './entities/paciente.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Paciente, User])
  ],
  controllers: [PacientesController],
  providers: [PacientesService],
  exports: [PacientesService]
})
export class PacientesModule {}
