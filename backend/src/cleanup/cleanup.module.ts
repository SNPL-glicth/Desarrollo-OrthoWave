import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { CleanupService } from './cleanup.service';
import { CleanupController } from './cleanup.controller';
import { User } from '../users/entities/user.entity';
import { Paciente } from '../pacientes/entities/paciente.entity';
import { PatientDocument } from '../patient-documents/entities/patient-document.entity';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    TypeOrmModule.forFeature([User, Paciente, PatientDocument])
  ],
  controllers: [CleanupController],
  providers: [CleanupService],
  exports: [CleanupService]
})
export class CleanupModule {}
