import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HistoriaClinicaService } from './historia-clinica.service';
import { HistoriaClinicaController } from './historia-clinica.controller';
import { HistoriaClinica } from './entities/historia-clinica.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([HistoriaClinica, User])
  ],
  controllers: [HistoriaClinicaController],
  providers: [HistoriaClinicaService],
  exports: [HistoriaClinicaService]
})
export class HistoriaClinicaModule {}
