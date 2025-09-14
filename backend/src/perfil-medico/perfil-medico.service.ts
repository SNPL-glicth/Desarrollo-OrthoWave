import { Injectable, NotFoundException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PerfilMedico } from './entities/perfil-medico.entity';
import { User } from '../users/entities/user.entity';
// import { RealtimeWebSocketGateway } from '../websocket/websocket.gateway';

@Injectable()
export class PerfilMedicoService {
  constructor(
    @InjectRepository(PerfilMedico)
    private perfilMedicoRepository: Repository<PerfilMedico>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    // @Inject(forwardRef(() => RealtimeWebSocketGateway))
    // private websocketGateway: RealtimeWebSocketGateway,
  ) {}

  async crearPerfilMedico(perfilData: Partial<PerfilMedico>): Promise<PerfilMedico> {
    const perfil = this.perfilMedicoRepository.create(perfilData);
    return await this.perfilMedicoRepository.save(perfil);
  }

  async obtenerPorUsuarioId(usuarioId: number): Promise<PerfilMedico> {
    const perfil = await this.perfilMedicoRepository.findOne({
      where: { usuarioId },
      relations: ['usuario']
    });

    if (!perfil) {
      throw new NotFoundException('Perfil médico no encontrado');
    }

    return perfil;
  }

  async actualizarPerfil(usuarioId: number, actualizarData: Partial<PerfilMedico>): Promise<PerfilMedico> {
    const perfil = await this.obtenerPorUsuarioId(usuarioId);
    Object.assign(perfil, actualizarData);
    const perfilActualizado = await this.perfilMedicoRepository.save(perfil);
    
    // Emitir eventos WebSocket SOLO para cambios CRÍTICOS
    try {
      // ESENCIAL: Solo notificar si cambian horarios/disponibilidad (afecta a pacientes)
      if (actualizarData.horaInicio || actualizarData.horaFin || 
          actualizarData.diasAtencion || actualizarData.horaAlmuerzoInicio || 
          actualizarData.horaAlmuerzoFin || actualizarData.aceptaNuevosPacientes) {
        
        // Notificar cambio de horarios (importante para disponibilidad)
        // this.websocketGateway.notifyScheduleUpdated(usuarioId, perfilActualizado);
        
        // Sincronizar calendario solo para cambios de disponibilidad
        // this.websocketGateway.notifyCalendarSync(usuarioId);
      }
      
    } catch (error) {
      console.error('Error al enviar eventos WebSocket críticos para perfil médico:', error);
    }
    
    return perfilActualizado;
  }

  async obtenerTodosLosDoctores(): Promise<PerfilMedico[]> {
    return await this.perfilMedicoRepository.find({
      where: { activo: true },
      relations: ['usuario'],
      order: { fechaCreacion: 'DESC' }
    });
  }

  async obtenerDoctoresDisponibles(): Promise<PerfilMedico[]> {
    return await this.perfilMedicoRepository.find({
      where: {
        activo: true,
        aceptaNuevosPacientes: true,
        usuario: {
          rol: {
            nombre: 'doctor'
          }
        }
      },
      relations: ['usuario', 'usuario.rol'],
      order: { fechaCreacion: 'DESC' }
    });
  }
}
