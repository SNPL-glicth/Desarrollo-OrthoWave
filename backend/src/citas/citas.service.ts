import { Injectable, NotFoundException, BadRequestException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual, LessThanOrEqual, Between } from 'typeorm';
import { Cita } from './entities/cita.entity';
import { PerfilMedico } from '../perfil-medico/entities/perfil-medico.entity';
import { User } from '../users/entities/user.entity';
import { CrearCitaDto } from './dto/crear-cita.dto';
import { ActualizarEstadoCitaDto } from './dto/actualizar-estado-cita.dto';
import { BuscarDisponibilidadDto } from './dto/buscar-disponibilidad.dto';

@Injectable()
export class CitasService {
  constructor(
    @InjectRepository(Cita)
    private citasRepository: Repository<Cita>,
    @InjectRepository(PerfilMedico)
    private perfilMedicoRepository: Repository<PerfilMedico>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
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

    // Verificar disponibilidad del horario
    const fechaHora = new Date(crearCitaDto.fechaHora);
    const fechaFin = new Date(fechaHora.getTime() + (crearCitaDto.duracion || 60) * 60000);

    const citaConflicto = await this.citasRepository.findOne({
      where: {
        doctorId: crearCitaDto.doctorId,
        fechaHora: Between(
          new Date(fechaHora.getTime() - 59 * 60000), // 59 minutos antes
          new Date(fechaFin.getTime() + 59 * 60000)   // 59 minutos después
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

    return await this.citasRepository.save(nuevaCita);
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

  async actualizarEstadoCita(id: number, actualizarEstadoDto: ActualizarEstadoCitaDto): Promise<Cita> {
    const cita = await this.citasRepository.findOne({
      where: { id },
      relations: ['paciente', 'doctor']
    });

    if (!cita) {
      throw new NotFoundException('Cita no encontrada');
    }

    // Si se está aprobando la cita, agregar fecha de aprobación
    if (actualizarEstadoDto.estado === 'aprobada') {
      cita.fechaAprobacion = new Date();
      if (actualizarEstadoDto.aprobadaPor) {
        cita.aprobadaPor = actualizarEstadoDto.aprobadaPor;
      }
    }

    Object.assign(cita, actualizarEstadoDto);
    return await this.citasRepository.save(cita);
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

    // Obtener citas del doctor para esa fecha
    const fechaInicio = new Date(fecha + 'T00:00:00');
    const fechaFin = new Date(fecha + 'T23:59:59');

    const citasExistentes = await this.citasRepository.find({
      where: {
        doctorId,
        fechaHora: Between(fechaInicio, fechaFin),
        estado: 'cancelada' // Excluir citas canceladas
      },
      order: { fechaHora: 'ASC' }
    });

    // Filtrar citas no canceladas
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
    const intervalos = duracion; // minutos

    let horaActual = this.parseHora(horaInicio);
    const horaLimite = this.parseHora(horaFin);

    while (horaActual < horaLimite) {
      const horaString = this.formatearHora(horaActual);
      const fechaHoraCompleta = new Date(fecha + 'T' + horaString + ':00');

      // Verificar si está en horario de almuerzo
      if (this.estaEnHorarioAlmuerzo(horaString, perfilMedico)) {
        horaActual += intervalos;
        continue;
      }

      // Verificar si hay conflicto con citas existentes
      const hayConflicto = citasOcupadas.some(cita => {
        const inicioCita = new Date(cita.fechaHora);
        const finCita = new Date(inicioCita.getTime() + cita.duracion * 60000);
        const finConsulta = new Date(fechaHoraCompleta.getTime() + duracion * 60000);

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
    await this.citasRepository.remove(cita);
  }
}
