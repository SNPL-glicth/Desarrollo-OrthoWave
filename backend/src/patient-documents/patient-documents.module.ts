import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientDocumentsController } from './patient-documents.controller';
import { PatientDocumentsService } from './patient-documents.service';
import { PacientesService } from '../pacientes/pacientes.service';
import { PatientDocument } from './entities/patient-document.entity';
import { Paciente } from '../pacientes/entities/paciente.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PatientDocument, Paciente, User]),
  ],
  controllers: [PatientDocumentsController],
  providers: [PatientDocumentsService, PacientesService],
  exports: [PatientDocumentsService],
})
export class PatientDocumentsModule {}
