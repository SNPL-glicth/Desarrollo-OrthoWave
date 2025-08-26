import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Paciente } from '../pacientes/entities/paciente.entity';
import { PatientDocument } from '../patient-documents/entities/patient-document.entity';
import * as fs from 'fs';

@Injectable()
export class CleanupService {
  private readonly logger = new Logger(CleanupService.name);

  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Paciente)
    private pacientesRepository: Repository<Paciente>,
    @InjectRepository(PatientDocument)
    private documentsRepository: Repository<PatientDocument>,
  ) {}

  // Ejecutar cada domingo a las 2:00 AM
  @Cron('0 2 * * 0')
  async cleanupOldPatients() {
    this.logger.log('Iniciando limpieza automática de pacientes antiguos...');

    try {
      // Fecha límite: 6 meses atrás
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      this.logger.log(`Buscando pacientes creados antes de: ${sixMonthsAgo.toISOString()}`);

      // Encontrar usuarios pacientes antiguos (excluyendo usuarios demo)
      const oldPatients = await this.usersRepository.find({
        where: {
          rol: { nombre: 'paciente' },
          fechaCreacion: LessThan(sixMonthsAgo),
          // Excluir usuarios demo - asumiendo que contienen 'demo' en el email
          email: undefined // Usaremos un filtro manual después
        },
        relations: ['rol', 'paciente']
      });

      // Filtrar manualmente para excluir usuarios demo
      const patientsToDelete = oldPatients.filter(patient => {
        const isDemo = patient.email.toLowerCase().includes('demo') || 
                      patient.email.toLowerCase().includes('test') ||
                      patient.nombre.toLowerCase().includes('demo') ||
                      patient.nombre.toLowerCase().includes('test');
        return !isDemo;
      });

      this.logger.log(`Encontrados ${patientsToDelete.length} pacientes para eliminar`);

      let deletedCount = 0;
      let deletedDocuments = 0;

      for (const patient of patientsToDelete) {
        try {
          // 1. Eliminar documentos físicos y registros de documentos
          if (patient.paciente) {
            const documents = await this.documentsRepository.find({
              where: { patientId: patient.paciente.id }
            });

            for (const doc of documents) {
              // Eliminar archivo físico
              if (fs.existsSync(doc.filePath)) {
                fs.unlinkSync(doc.filePath);
                this.logger.debug(`Archivo eliminado: ${doc.filePath}`);
              }
              
              // Eliminar registro
              await this.documentsRepository.remove(doc);
              deletedDocuments++;
            }

            // 2. Eliminar perfil de paciente
            await this.pacientesRepository.remove(patient.paciente);
          }

          // 3. Eliminar usuario
          await this.usersRepository.remove(patient);
          deletedCount++;

          this.logger.debug(`Paciente eliminado: ${patient.email} (creado: ${patient.fechaCreacion})`);

        } catch (error) {
          this.logger.error(`Error eliminando paciente ${patient.email}:`, error.message);
        }
      }

      this.logger.log(`Limpieza completada: ${deletedCount} pacientes y ${deletedDocuments} documentos eliminados`);

    } catch (error) {
      this.logger.error('Error durante la limpieza automática:', error.message);
    }
  }

  // Método manual para ejecutar la limpieza (para testing)
  async runCleanupManually(): Promise<{ deletedPatients: number; deletedDocuments: number }> {
    this.logger.log('Ejecutando limpieza manual...');
    
    // Llamar al mismo método que usa el cron
    await this.cleanupOldPatients();
    
    return { deletedPatients: 0, deletedDocuments: 0 }; // Simplificado para el ejemplo
  }

  // Método para obtener estadísticas de limpieza
  async getCleanupStats(): Promise<{
    totalPatients: number;
    oldPatients: number;
    demoPatients: number;
    eligibleForDeletion: number;
  }> {
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const totalPatients = await this.usersRepository.count({
      where: { rol: { nombre: 'paciente' } },
      relations: ['rol']
    });

    const oldPatients = await this.usersRepository.count({
      where: {
        rol: { nombre: 'paciente' },
        fechaCreacion: LessThan(sixMonthsAgo)
      },
      relations: ['rol']
    });

    const allOldPatients = await this.usersRepository.find({
      where: {
        rol: { nombre: 'paciente' },
        fechaCreacion: LessThan(sixMonthsAgo)
      },
      relations: ['rol']
    });

    const demoPatients = allOldPatients.filter(patient => {
      return patient.email.toLowerCase().includes('demo') || 
             patient.email.toLowerCase().includes('test') ||
             patient.nombre.toLowerCase().includes('demo') ||
             patient.nombre.toLowerCase().includes('test');
    }).length;

    const eligibleForDeletion = oldPatients - demoPatients;

    return {
      totalPatients,
      oldPatients,
      demoPatients,
      eligibleForDeletion
    };
  }
}
