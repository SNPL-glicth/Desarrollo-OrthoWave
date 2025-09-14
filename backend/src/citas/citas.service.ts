import { Injectable, NotFoundException, BadRequestException, ConflictException, Inject, forwardRef } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, LessThanOrEqual, Between } from 'typeorm';
import { Cita } from './entities/cita.entity';
import { PerfilMedico } from '../perfil-medico/entities/perfil-medico.entity';
import { User } from '../users/entities/user.entity';
import { CrearCitaDto } from './dto/crear-cita.dto';
import { ActualizarEstadoCitaDto } from './dto/actualizar-estado-cita.dto';
import { BuscarDisponibilidadDto } from './dto/buscar-disponibilidad.dto';
import { RealtimeWebSocketGateway } from '../websocket/websocket.gateway';
import { NotificationsService } from '../notifications/notifications.service';
import { MailService } from '../mail/mail.service';
import { getCurrentColombiaDateTime, parseColombiaDateTime, isInPast, getMinutesToNow } from '../utils/timezone.utils';

@Injectable()
export class CitasService {
  constructor(
    @InjectRepository(Cita)
    private citasRepository: Repository<Cita>,
    @InjectRepository(PerfilMedico)
    private perfilMedicoRepository: Repository<PerfilMedico>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @Inject(forwardRef(() => RealtimeWebSocketGateway))
    private websocketGateway: RealtimeWebSocketGateway,
    private notificationsService: NotificationsService,
    private mailService: MailService,
  ) {}

  async crearCita(crearCitaDto: CrearCitaDto): Promise<Cita> {
    // Validar que el doctor existe y es doctor
    const doctor = await this.usersRepository.findOne({
      where: { id: crearCitaDto.doctorId },
      relations: ['rol']
    });

    if (!doctor || doctor.rol.nombre !== 'doctor') {
      throw new NotFoundException('Doctor no encontrado');
    }

    // Validar que el paciente existe y es paciente
    const paciente = await this.usersRepository.findOne({
      where: { id: crearCitaDto.pacienteId },
      relations: ['rol']
    });

    if (!paciente || paciente.rol.nombre !== 'paciente') {
      throw new NotFoundException('Paciente no encontrado');
    }

    // Validar antelación mínima de 20 minutos usando timezone de Colombia
    const fechaHora = parseColombiaDateTime(crearCitaDto.fechaHora);
    const minutosAnticipoRequeridos = getMinutesToNow(fechaHora);

    if (minutosAnticipoRequeridos < 20) {
      throw new BadRequestException('Las citas deben solicitarse con al menos 20 minutos de antelación');
    }

    // Verificar disponibilidad del horario
    // Ya tenemos fechaHora definida arriba
    const fechaFin = getCurrentColombiaDateTime();
    fechaFin.setTime(fechaHora.getTime() + (crearCitaDto.duracion || 60) * 60000);

    const citaConflicto = await this.citasRepository.findOne({
      where: {
        doctorId: crearCitaDto.doctorId,
        fechaHora: Between(
          (() => {
            const inicio = getCurrentColombiaDateTime();
            inicio.setTime(fechaHora.getTime() - 59 * 60000);
            return inicio;
          })(), // 59 minutos antes
          (() => {
            const fin = getCurrentColombiaDateTime();
            fin.setTime(fechaFin.getTime() + 59 * 60000);
            return fin;
          })()   // 59 minutos después
        ),
        estado: 'cancelada' // Excluir citas canceladas
      }
    });

    if (citaConflicto && citaConflicto.estado !== 'cancelada') {
      throw new ConflictException('El horario solicitado no está disponible');
    }

    // Verificar horario de atención del doctor
    const perfilMedico = await this.perfilMedicoRepository.findOne({
      where: { usuarioId: crearCitaDto.doctorId }
    });

    if (perfilMedico && !this.verificarHorarioAtencion(fechaHora, perfilMedico)) {
      throw new BadRequestException('El horario solicitado está fuera del horario de atención del doctor');
    }

    // Crear la cita
    const nuevaCita = this.citasRepository.create({
      ...crearCitaDto,
      fechaHora,
      estado: 'pendiente' // Las citas inician como pendientes para aprobación
    });

    const citaGuardada = await this.citasRepository.save(nuevaCita);
    
    // Emitir eventos WebSocket CRÍTICOS SOLAMENTE
    try {
      // 1. ESENCIAL: Notificar al doctor que tiene una nueva solicitud pendiente
      this.websocketGateway.notifyCounterUpdate(
        'pending_appointments', 
        await this.obtenerSolicitudesPendientesDoctor(crearCitaDto.doctorId).then(s => s.length),
        crearCitaDto.doctorId
      );
      
      // 2. IMPORTANTE: Solo actualizar disponibilidad si realmente afecta horarios
      this.websocketGateway.notifyCalendarSync(crearCitaDto.doctorId);
      
    } catch (error) {
      console.error('Error al enviar eventos WebSocket críticos:', error);
    }
    
    return citaGuardada;
  }

  async obtenerCitasPorPaciente(pacienteId: number): Promise<Cita[]> {
    return await this.citasRepository.find({
      where: { pacienteId },
      relations: ['doctor', 'doctor.rol'],
      order: { fechaHora: 'DESC' }
    });
  }

  async obtenerCitasPorDoctor(doctorId: number): Promise<Cita[]> {
    return await this.citasRepository.find({
      where: { doctorId },
      relations: ['paciente', 'paciente.rol'],
      order: { fechaHora: 'ASC' }
    });
  }

  async obtenerCitasPendientesAprobacion(): Promise<Cita[]> {
    return await this.citasRepository.find({
      where: { estado: 'pendiente' },
      relations: ['paciente', 'doctor', 'paciente.rol', 'doctor.rol'],
      order: { fechaCreacion: 'ASC' }
    });
  }

  async obtenerSolicitudesPendientesDoctor(doctorId: number): Promise<Cita[]> {
    return await this.citasRepository.find({
      where: { 
        doctorId,
        estado: 'pendiente' 
      },
      relations: ['paciente', 'doctor', 'paciente.rol', 'doctor.rol'],
      order: { fechaCreacion: 'ASC' }
    });
  }

  async actualizarEstadoCita(id: number, actualizarEstadoDto: ActualizarEstadoCitaDto): Promise<Cita> {
    const cita = await this.citasRepository.findOne({
      where: { id },
      relations: ['paciente', 'doctor']
    });

    if (!cita) {
      throw new NotFoundException('Cita no encontrada');
    }

    // Guardar estado anterior para eventos WebSocket
    const estadoAnterior = cita.estado;
    const citaAnterior = { ...cita };

    // Si se está aprobando la cita, agregar fecha de aprobación
    if (actualizarEstadoDto.estado === 'aprobada') {
      cita.fechaAprobacion = getCurrentColombiaDateTime();
      if (actualizarEstadoDto.aprobadaPor) {
        cita.aprobadaPor = actualizarEstadoDto.aprobadaPor;
      }
    }

    Object.assign(cita, actualizarEstadoDto);
    const citaActualizada = await this.citasRepository.save(cita);
    
    // Crear notificación y enviar email para el paciente según el cambio de estado
    try {
      if (actualizarEstadoDto.estado === 'aprobada') {
        await this.notificationsService.crearNotificacionConfirmacionCita(citaActualizada.id);
        // Enviar email de confirmación al paciente
        await this.mailService.enviarConfirmacionCita(citaActualizada);
      } else if (actualizarEstadoDto.estado === 'cancelada' || actualizarEstadoDto.estado === 'rechazada') {
        await this.notificationsService.crearNotificacionCancelacionCita(
          citaActualizada.id, 
          actualizarEstadoDto.razonRechazo
        );
      }
    } catch (error) {
      console.error('Error al crear notificación o enviar email:', error);
    }
    
    // Emitir solo eventos WebSocket CRÍTICOS
    try {
      // 1. ESENCIAL: Solo notificar cambios de estado importantes
      if (estadoAnterior !== citaActualizada.estado) {
        // Solo estados que realmente importan para notificaciones inmediatas
        if (['aprobada', 'rechazada', 'cancelada', 'confirmada'].includes(citaActualizada.estado)) {
          this.websocketGateway.notifyAppointmentStatusChange(
            citaActualizada, 
            estadoAnterior, 
            citaActualizada.estado
          );
        }
      }
      
      // 2. ESENCIAL: Actualizar contador de solicitudes pendientes del doctor
      if (citaActualizada.estado === 'aprobada' && estadoAnterior === 'pendiente') {
        const pendingCount = await this.obtenerSolicitudesPendientesDoctor(citaActualizada.doctorId).then(s => s.length);
        this.websocketGateway.notifyCounterUpdate('pending_appointments', pendingCount, citaActualizada.doctorId);
      }
      
      // 3. IMPORTANTE: Actualizar disponibilidad solo en cambios críticos
      if (['aprobada', 'cancelada', 'rechazada'].includes(citaActualizada.estado) && 
          estadoAnterior === 'pendiente') {
        this.websocketGateway.notifyCalendarSync(citaActualizada.doctorId);
      }
      
    } catch (error) {
      console.error('Error al enviar eventos WebSocket críticos:', error);
    }
    
    return citaActualizada;
  }

  async buscarDisponibilidad(buscarDisponibilidadDto: BuscarDisponibilidadDto): Promise<string[]> {
    const { doctorId, fecha, duracion = 60 } = buscarDisponibilidadDto;

    // Obtener perfil médico para horarios
    const perfilMedico = await this.perfilMedicoRepository.findOne({
      where: { usuarioId: doctorId }
    });

    if (!perfilMedico) {
      throw new NotFoundException('Perfil médico no encontrado');
    }

    // Obtener citas del doctor para esa fecha (EXCLUYENDO las canceladas)
    const fechaInicio = parseColombiaDateTime(fecha + 'T00:00:00');
    const fechaFinBusqueda = parseColombiaDateTime(fecha + 'T23:59:59');

    const citasExistentes = await this.citasRepository.find({
      where: {
        doctorId,
        fechaHora: Between(fechaInicio, fechaFinBusqueda)
      },
      order: { fechaHora: 'ASC' }
    });

    // Filtrar citas no canceladas (estas son las que ocupan horarios)
    const citasOcupadas = citasExistentes.filter(cita => cita.estado !== 'cancelada');

    // Generar horarios disponibles
    return this.generarHorariosDisponibles(perfilMedico, citasOcupadas, fecha, duracion);
  }

  private verificarHorarioAtencion(fechaHora: Date, perfilMedico: PerfilMedico): boolean {
    const diaSemana = fechaHora.toLocaleDateString('es-ES', { weekday: 'long' });

    // Si no tiene días de atención configurados, asumimos que atiende todos los días
    if (!perfilMedico.diasAtencion || perfilMedico.diasAtencion.length === 0) {
      return true;
    }

    // Verificar si el día está en los días de atención
    if (!perfilMedico.diasAtencion.includes(diaSemana)) {
      return false;
    }

    // Verificar horario
    const horaConsulta = fechaHora.toTimeString().substring(0, 5);

    if (perfilMedico.horaInicio && horaConsulta < perfilMedico.horaInicio) {
      return false;
    }

    if (perfilMedico.horaFin && horaConsulta > perfilMedico.horaFin) {
      return false;
    }

    // Verificar horario de almuerzo
    if (perfilMedico.horaAlmuerzoInicio && perfilMedico.horaAlmuerzoFin) {
      if (horaConsulta >= perfilMedico.horaAlmuerzoInicio && horaConsulta <= perfilMedico.horaAlmuerzoFin) {
        return false;
      }
    }

    return true;
  }

  private generarHorariosDisponibles(
    perfilMedico: PerfilMedico,
    citasOcupadas: Cita[],
    fecha: string,
    duracion: number
  ): string[] {
    const horariosDisponibles: string[] = [];

    // Valores por defecto si no están configurados
    const horaInicio = perfilMedico.horaInicio || '08:00';
    const horaFin = perfilMedico.horaFin || '18:00';
    const intervalos = 20; // minutos - intervalos de 20 minutos

    let horaActual = this.parseHora(horaInicio);
    const horaLimite = this.parseHora(horaFin);

    while (horaActual < horaLimite) {
      const horaString = this.formatearHora(horaActual);
      const fechaHoraCompleta = parseColombiaDateTime(fecha + 'T' + horaString + ':00');

      // Verificar si está en horario de almuerzo
      if (this.estaEnHorarioAlmuerzo(horaString, perfilMedico)) {
        horaActual += intervalos;
        continue;
      }

      // Verificar si hay conflicto con citas existentes
      const hayConflicto = citasOcupadas.some(cita => {
        const inicioCita = parseColombiaDateTime(cita.fechaHora.toISOString());
        const finCita = getCurrentColombiaDateTime();
        finCita.setTime(inicioCita.getTime() + cita.duracion * 60000);
        const finConsulta = getCurrentColombiaDateTime();
        finConsulta.setTime(fechaHoraCompleta.getTime() + duracion * 60000);

        return (fechaHoraCompleta < finCita && finConsulta > inicioCita);
      });

      if (!hayConflicto) {
        horariosDisponibles.push(horaString);
      }

      horaActual += intervalos;
    }

    return horariosDisponibles;
  }

  private parseHora(horaString: string): number {
    const [horas, minutos] = horaString.split(':').map(Number);
    return horas * 60 + minutos;
  }

  private formatearHora(minutos: number): string {
    const horas = Math.floor(minutos / 60);
    const mins = minutos % 60;
    return `${horas.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  }

  private estaEnHorarioAlmuerzo(hora: string, perfilMedico: PerfilMedico): boolean {
    if (!perfilMedico.horaAlmuerzoInicio || !perfilMedico.horaAlmuerzoFin) {
      return false;
    }

    return hora >= perfilMedico.horaAlmuerzoInicio && hora <= perfilMedico.horaAlmuerzoFin;
  }

  async obtenerCitaPorId(id: number): Promise<Cita> {
    const cita = await this.citasRepository.findOne({
      where: { id },
      relations: ['paciente', 'doctor', 'paciente.rol', 'doctor.rol']
    });

    if (!cita) {
      throw new NotFoundException('Cita no encontrada');
    }

    return cita;
  }

  async eliminarCita(id: number): Promise<void> {
    const cita = await this.obtenerCitaPorId(id);
    const doctorId = cita.doctorId;
    const pacienteId = cita.pacienteId;
    
    await this.citasRepository.remove(cita);
    
    // Emitir solo eventos WebSocket CRÍTICOS para eliminación
    try {
      // 1. ESENCIAL: Notificar eliminación solo a usuarios directamente involucrados
      this.websocketGateway.notifyAppointmentDeleted(id, doctorId, pacienteId);
      
      // 2. IMPORTANTE: Liberar disponibilidad del doctor
      this.websocketGateway.notifyCalendarSync(doctorId);
      
      // 3. ESENCIAL: Actualizar contador de pendientes si era una cita pendiente
      if (cita.estado === 'pendiente') {
        const pendingCount = await this.obtenerSolicitudesPendientesDoctor(doctorId).then(s => s.length);
        this.websocketGateway.notifyCounterUpdate('pending_appointments', pendingCount, doctorId);
      }
      
    } catch (error) {
      console.error('Error al enviar eventos WebSocket críticos para eliminación:', error);
    }
  }
}
