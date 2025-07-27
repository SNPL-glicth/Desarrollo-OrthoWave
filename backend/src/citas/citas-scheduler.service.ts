import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThan, Between, In } from 'typeorm';
import { Cita } from './entities/cita.entity';
import { MailService } from '../mail/mail.service';

@Injectable()
export class CitasSchedulerService {
  private readonly logger = new Logger(CitasSchedulerService.name);

  constructor(
    @InjectRepository(Cita)
    private citasRepository: Repository<Cita>,
    private mailService: MailService,
  ) {}

  // Ejecutar cada 10 minutos para marcar citas expiradas
  @Cron('*/10 * * * *')
  async marcarCitasExpiradas() {
    this.logger.log('Ejecutando tarea: Marcar citas expiradas');
    
    try {
      const fechaActual = new Date();
      
      // Buscar citas que ya pasaron su fecha/hora y están pendientes o aprobadas
      const citasExpiradas = await this.citasRepository.find({
        where: {
          fechaHora: LessThan(fechaActual),
          estado: In(['pendiente', 'aprobada'])
        },
        relations: ['paciente', 'doctor']
      });

      if (citasExpiradas.length > 0) {
        // Actualizar estado de las citas a 'expirada'
        await this.citasRepository.update(
          { id: In(citasExpiradas.map(cita => cita.id)) },
          { estado: 'expirada' }
        );

        this.logger.log(`Se marcaron ${citasExpiradas.length} citas como expiradas`);
        
        // Opcional: Enviar notificación sobre citas expiradas
        for (const cita of citasExpiradas) {
          try {
            await this.mailService.enviarNotificacionCitaExpirada(cita);
          } catch (error) {
            this.logger.error(`Error al enviar notificación de cita expirada (ID: ${cita.id}):`, error);
          }
        }
      }
    } catch (error) {
      this.logger.error('Error al marcar citas expiradas:', error);
    }
  }

  // Ejecutar cada 5 minutos para enviar recordatorios
  @Cron('*/5 * * * *')
  async enviarRecordatoriosCitas() {
    this.logger.log('Ejecutando tarea: Enviar recordatorios de citas');
    
    try {
      const fechaActual = new Date();
      const fecha30MinutosAdelante = new Date(fechaActual.getTime() + 30 * 60 * 1000);
      const fecha25MinutosAdelante = new Date(fechaActual.getTime() + 25 * 60 * 1000);

      // Buscar citas aprobadas que estén entre 25 y 30 minutos de comenzar
      // (ventana de 5 minutos para evitar duplicados)
      const citasParaRecordatorio = await this.citasRepository.find({
        where: {
          fechaHora: Between(fecha25MinutosAdelante, fecha30MinutosAdelante),
          estado: 'aprobada',
          recordatorioEnviado: false // Nuevo campo para evitar duplicados
        },
        relations: ['paciente', 'doctor']
      });

      if (citasParaRecordatorio.length > 0) {
        this.logger.log(`Enviando recordatorios para ${citasParaRecordatorio.length} citas`);
        
        for (const cita of citasParaRecordatorio) {
          try {
            await this.mailService.enviarRecordatorioCita(cita);
            
            // Marcar recordatorio como enviado
            await this.citasRepository.update(cita.id, { 
              recordatorioEnviado: true 
            });
            
            this.logger.log(`Recordatorio enviado para cita ID: ${cita.id}`);
          } catch (error) {
            this.logger.error(`Error al enviar recordatorio para cita ID: ${cita.id}:`, error);
          }
        }
      }
    } catch (error) {
      this.logger.error('Error al enviar recordatorios de citas:', error);
    }
  }

  // Ejecutar diariamente a las 2:00 AM para limpiar citas muy antiguas (opcional)
  @Cron('0 2 * * *')
  async limpiarCitasAntiguas() {
    this.logger.log('Ejecutando tarea: Limpiar citas antiguas');
    
    try {
      // Eliminar citas expiradas o canceladas de más de 6 meses
      const fecha6MesesAtras = new Date();
      fecha6MesesAtras.setMonth(fecha6MesesAtras.getMonth() - 6);
      
      const citasEliminadas = await this.citasRepository.delete({
        fechaHora: LessThan(fecha6MesesAtras),
        estado: In(['expirada', 'cancelada'])
      });

      if (citasEliminadas.affected && citasEliminadas.affected > 0) {
        this.logger.log(`Se eliminaron ${citasEliminadas.affected} citas antiguas`);
      }
    } catch (error) {
      this.logger.error('Error al limpiar citas antiguas:', error);
    }
  }
}
