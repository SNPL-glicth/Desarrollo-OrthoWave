import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, In } from 'typeorm';
import { Cita } from './entities/cita.entity';
import { PerfilMedico } from '../perfil-medico/entities/perfil-medico.entity';
import { User } from '../users/entities/user.entity';
import { DashboardDisponibilidadDto } from './dto/dashboard-disponibilidad.dto';
import { RealtimeWebSocketGateway } from '../websocket/websocket.gateway';
import { CacheService } from '../cache/cache.service';
import { getCurrentColombiaDateTime, getStartOfToday, getEndOfToday, parseColombiaDateTime } from '../utils/timezone.utils';

export interface DoctorDisponibilidad {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  especialidad: string;
  subespecialidades: string[];
  tarifaConsulta: number;
  duracionConsultaDefault: number;
  aceptaNuevosPacientes: boolean;
  verificadoColegio: boolean;
  telefono: string;
  direccionConsultorio: string;
  ciudad: string;
  diasAtencion: string[];
  horaInicio: string;
  horaFin: string;
  horaAlmuerzoInicio: string;
  horaAlmuerzoFin: string;
  disponibilidad: {
    fecha: string;
    horariosDisponibles: string[];
    citasOcupadas: number;
  }[];
}

export interface EstadisticasCitas {
  totalCitas: number;
  citasPendientes: number;
  citasAprobadas: number;
  citasConfirmadas: number;
  citasCompletadas: number;
  citasCanceladas: number;
  citasNoAsistio: number;
  citasHoy: number;
  citasEstaSemana: number;
  citasEsteMes: number;
  promedioConsultasPorDia: number;
  doctorConMasCitas: {
    nombre: string;
    apellido: string;
    especialidad: string;
    totalCitas: number;
  };
}

@Injectable()
export class DashboardCitasService {
  constructor(
    @InjectRepository(Cita)
    private citasRepository: Repository<Cita>,
    @InjectRepository(PerfilMedico)
    private perfilMedicoRepository: Repository<PerfilMedico>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private webSocketGateway: RealtimeWebSocketGateway,
    private cacheService: CacheService,
  ) {}

  async obtenerDoctoresDisponibles(dashboardDto: DashboardDisponibilidadDto): Promise<DoctorDisponibilidad[]> {
    const { fechaInicio, fechaFin, especialidad, doctoresIds, duracionConsulta } = dashboardDto;
    
    // Construir consulta base para doctores
    const queryBuilder = this.perfilMedicoRepository.createQueryBuilder('perfil')
      .leftJoinAndSelect('perfil.usuario', 'usuario')
      .leftJoinAndSelect('usuario.rol', 'rol')
      .where('rol.nombre = :rolDoctor', { rolDoctor: 'doctor' })
      .andWhere('perfil.activo = true')
      .andWhere('perfil.aceptaNuevosPacientes = true');

    // Filtrar por especialidad si se proporciona
    if (especialidad) {
      queryBuilder.andWhere('perfil.especialidad = :especialidad', { especialidad });
    }

    // Filtrar por IDs de doctores específicos si se proporciona
    if (doctoresIds && doctoresIds.length > 0) {
      queryBuilder.andWhere('perfil.usuarioId IN (:...doctoresIds)', { doctoresIds });
    }

    const perfilesMedicos = await queryBuilder.getMany();

    // Generar información de disponibilidad para cada doctor
    const doctoresConDisponibilidad: DoctorDisponibilidad[] = [];

    for (const perfil of perfilesMedicos) {
      const disponibilidad = await this.calcularDisponibilidadDoctor(
        perfil.usuarioId,
        fechaInicio,
        fechaFin,
        duracionConsulta || perfil.duracionConsultaDefault
      );

      doctoresConDisponibilidad.push({
        id: perfil.usuarioId,
        nombre: perfil.usuario.nombre,
        apellido: perfil.usuario.apellido,
        email: perfil.usuario.email,
        especialidad: perfil.especialidad,
        subespecialidades: perfil.subespecialidades || [],
        tarifaConsulta: perfil.tarifaConsulta,
        duracionConsultaDefault: perfil.duracionConsultaDefault,
        aceptaNuevosPacientes: perfil.aceptaNuevosPacientes,
        verificadoColegio: perfil.verificadoColegio,
        telefono: perfil.usuario.telefono,
        direccionConsultorio: perfil.direccionConsultorio,
        ciudad: perfil.ciudad,
        diasAtencion: perfil.diasAtencion || [],
        horaInicio: perfil.horaInicio,
        horaFin: perfil.horaFin,
        horaAlmuerzoInicio: perfil.horaAlmuerzoInicio,
        horaAlmuerzoFin: perfil.horaAlmuerzoFin,
        disponibilidad
      });
    }

    // Ordenar por disponibilidad (más horarios disponibles primero)
    return doctoresConDisponibilidad.sort((a, b) => {
      const totalHorariosA = a.disponibilidad.reduce((acc, dia) => acc + dia.horariosDisponibles.length, 0);
      const totalHorariosB = b.disponibilidad.reduce((acc, dia) => acc + dia.horariosDisponibles.length, 0);
      return totalHorariosB - totalHorariosA;
    });
  }

  async obtenerEstadisticasCitas(usuarioId?: number, rolUsuario?: string): Promise<EstadisticasCitas> {
    // Verificar cache primero
    if (usuarioId && rolUsuario) {
      const cachedData = this.cacheService.getStatsData(usuarioId, rolUsuario);
      if (cachedData) {
        return cachedData;
      }
    }

    // Construir consulta base
    const queryBuilder = this.citasRepository.createQueryBuilder('cita')
      .leftJoinAndSelect('cita.doctor', 'doctor')
      .leftJoinAndSelect('cita.paciente', 'paciente');

    // Filtrar por usuario según el rol
    if (usuarioId && rolUsuario) {
      if (rolUsuario === 'doctor') {
        queryBuilder.andWhere('cita.doctorId = :usuarioId', { usuarioId });
      } else if (rolUsuario === 'paciente') {
        queryBuilder.andWhere('cita.pacienteId = :usuarioId', { usuarioId });
      }
      // Los admins pueden ver todas las citas
    }

    const todasLasCitas = await queryBuilder.getMany();

    // Si no hay citas, retornar estadísticas vacías
    if (todasLasCitas.length === 0) {
      return {
        totalCitas: 0,
        citasPendientes: 0,
        citasAprobadas: 0,
        citasConfirmadas: 0,
        citasCompletadas: 0,
        citasCanceladas: 0,
        citasNoAsistio: 0,
        citasHoy: 0,
        citasEstaSemana: 0,
        citasEsteMes: 0,
        promedioConsultasPorDia: 0,
        doctorConMasCitas: {
          nombre: 'N/A',
          apellido: '',
          especialidad: 'Sin datos',
          totalCitas: 0
        }
      };
    }

    // Calcular estadísticas usando timezone de Colombia
    const ahora = getCurrentColombiaDateTime();
    const hoy = getStartOfToday();
    const inicioSemana = getCurrentColombiaDateTime();
    inicioSemana.setTime(hoy.getTime());
    inicioSemana.setDate(hoy.getDate() - hoy.getDay());
    const inicioMes = getCurrentColombiaDateTime();
    inicioMes.setFullYear(ahora.getFullYear(), ahora.getMonth(), 1);

    const estadisticas: EstadisticasCitas = {
      totalCitas: todasLasCitas.length,
      citasPendientes: todasLasCitas.filter(c => c.estado === 'pendiente').length,
      citasAprobadas: todasLasCitas.filter(c => c.estado === 'aprobada').length,
      citasConfirmadas: todasLasCitas.filter(c => c.estado === 'confirmada').length,
      citasCompletadas: todasLasCitas.filter(c => c.estado === 'completada').length,
      citasCanceladas: todasLasCitas.filter(c => c.estado === 'cancelada').length,
      citasNoAsistio: todasLasCitas.filter(c => c.estado === 'no_asistio').length,
      citasHoy: todasLasCitas.filter(c => {
        const fechaCita = parseColombiaDateTime(c.fechaHora.toISOString());
        const finHoy = getCurrentColombiaDateTime();
        finHoy.setTime(hoy.getTime() + 24 * 60 * 60 * 1000);
        return fechaCita >= hoy && fechaCita < finHoy;
      }).length,
      citasEstaSemana: todasLasCitas.filter(c => {
        const fechaCita = parseColombiaDateTime(c.fechaHora.toISOString());
        return fechaCita >= inicioSemana && fechaCita <= ahora;
      }).length,
      citasEsteMes: todasLasCitas.filter(c => {
        const fechaCita = parseColombiaDateTime(c.fechaHora.toISOString());
        return fechaCita >= inicioMes && fechaCita <= ahora;
      }).length,
      promedioConsultasPorDia: 0,
      doctorConMasCitas: {
        nombre: '',
        apellido: '',
        especialidad: '',
        totalCitas: 0
      }
    };

    // Calcular promedio de consultas por día solo si hay datos
    if (todasLasCitas.length > 0) {
      const fechasPrimera = todasLasCitas.map(c => parseColombiaDateTime(c.fechaHora.toISOString()));
      const fechaMasAntigua = getCurrentColombiaDateTime();
      fechaMasAntigua.setTime(Math.min(...fechasPrimera.map(f => f.getTime())));
      const diasTranscurridos = Math.ceil((ahora.getTime() - fechaMasAntigua.getTime()) / (1000 * 60 * 60 * 24));
      estadisticas.promedioConsultasPorDia = diasTranscurridos > 0 ? Math.round((todasLasCitas.length / diasTranscurridos) * 100) / 100 : 0;
    }

    // Encontrar doctor con más citas solo si hay datos
    if (todasLasCitas.length > 0) {
      const citasPorDoctor = todasLasCitas.reduce((acc, cita) => {
        const doctorId = cita.doctorId;
        if (!acc[doctorId]) {
          acc[doctorId] = {
            doctor: cita.doctor,
            count: 0
          };
        }
        acc[doctorId].count++;
        return acc;
      }, {} as Record<number, { doctor: User; count: number }>);

      const doctorConMasCitas = Object.values(citasPorDoctor).reduce((max, current) => {
        return current.count > max.count ? current : max;
      }, { count: 0, doctor: null as User | null });

      if (doctorConMasCitas.doctor) {
        const perfilDoctor = await this.perfilMedicoRepository.findOne({
          where: { usuarioId: doctorConMasCitas.doctor.id }
        });

        estadisticas.doctorConMasCitas = {
          nombre: doctorConMasCitas.doctor.nombre,
          apellido: doctorConMasCitas.doctor.apellido,
          especialidad: perfilDoctor?.especialidad || 'No especificada',
          totalCitas: doctorConMasCitas.count
        };
      }
    }

    // Guardar en cache
    if (usuarioId && rolUsuario) {
      this.cacheService.setStatsData(usuarioId, rolUsuario, estadisticas, 45000);
    }

    return estadisticas;
  }

  async obtenerDisponibilidadSemanal(doctorId: number): Promise<any> {
    const perfil = await this.perfilMedicoRepository.findOne({
      where: { usuarioId: doctorId },
      relations: ['usuario']
    });

    if (!perfil) {
      throw new NotFoundException('Perfil médico no encontrado');
    }

    const hoy = getCurrentColombiaDateTime();
    const disponibilidadSemanal = [];

    // Generar disponibilidad para los próximos 7 días
    for (let i = 0; i < 7; i++) {
      const fecha = getCurrentColombiaDateTime();
      fecha.setTime(hoy.getTime());
      fecha.setDate(hoy.getDate() + i);
      const fechaString = fecha.toISOString().split('T')[0];

      const disponibilidad = await this.calcularDisponibilidadDoctor(
        doctorId,
        fechaString,
        fechaString,
        perfil.duracionConsultaDefault
      );

      disponibilidadSemanal.push({
        fecha: fechaString,
        diaSemana: fecha.toLocaleDateString('es-ES', { weekday: 'long' }),
        disponibilidad: disponibilidad[0] || { 
          fecha: fechaString, 
          horariosDisponibles: [], 
          citasOcupadas: 0 
        }
      });
    }

    return {
      doctor: {
        id: perfil.usuarioId,
        nombre: perfil.usuario.nombre,
        apellido: perfil.usuario.apellido,
        especialidad: perfil.especialidad
      },
      disponibilidadSemanal
    };
  }

  private async calcularDisponibilidadDoctor(
    doctorId: number,
    fechaInicio: string,
    fechaFin: string,
    duracionConsulta: number
  ): Promise<{ fecha: string; horariosDisponibles: string[]; citasOcupadas: number }[]> {
    const perfil = await this.perfilMedicoRepository.findOne({
      where: { usuarioId: doctorId }
    });

    if (!perfil) {
      return [];
    }

    const resultado = [];
    const fechaActual = parseColombiaDateTime(fechaInicio + 'T00:00:00');
    const fechaFinal = parseColombiaDateTime(fechaFin + 'T23:59:59');

    while (fechaActual <= fechaFinal) {
      const fechaString = fechaActual.toISOString().split('T')[0];
      const diaSemana = fechaActual.toLocaleDateString('es-ES', { weekday: 'long' });

      // Verificar si el doctor atiende este día
      if (perfil.diasAtencion && perfil.diasAtencion.length > 0 && !perfil.diasAtencion.includes(diaSemana)) {
        resultado.push({
          fecha: fechaString,
          horariosDisponibles: [],
          citasOcupadas: 0
        });
        fechaActual.setDate(fechaActual.getDate() + 1);
        continue;
      }

      // Obtener citas ocupadas para este día
      const fechaInicioDia = parseColombiaDateTime(fechaString + 'T00:00:00');
      const fechaFinDia = parseColombiaDateTime(fechaString + 'T23:59:59');

      const citasOcupadas = await this.citasRepository.find({
        where: {
          doctorId,
          fechaHora: Between(fechaInicioDia, fechaFinDia),
        }
      });

      const citasNoCanceladas = citasOcupadas.filter(c => c.estado !== 'cancelada');

      // Generar horarios disponibles
      const horariosDisponibles = this.generarHorariosDisponibles(
        perfil,
        citasNoCanceladas,
        fechaString,
        duracionConsulta
      );

      resultado.push({
        fecha: fechaString,
        horariosDisponibles,
        citasOcupadas: citasNoCanceladas.length
      });

      fechaActual.setDate(fechaActual.getDate() + 1);
    }

    return resultado;
  }

  private generarHorariosDisponibles(
    perfilMedico: PerfilMedico,
    citasOcupadas: Cita[],
    fecha: string,
    duracion: number
  ): string[] {
    const horariosDisponibles: string[] = [];
    const horaInicio = perfilMedico.horaInicio || '08:00';
    const horaFin = perfilMedico.horaFin || '18:00';

    let horaActual = this.parseHora(horaInicio);
    const horaLimite = this.parseHora(horaFin);

    while (horaActual < horaLimite) {
      const horaString = this.formatearHora(horaActual);
      const fechaHoraCompleta = parseColombiaDateTime(fecha + 'T' + horaString + ':00');

      // Verificar si está en horario de almuerzo
      if (this.estaEnHorarioAlmuerzo(horaString, perfilMedico)) {
        horaActual += duracion;
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

      horaActual += duracion;
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

  async obtenerEspecialidades(): Promise<string[]> {
    const especialidades = await this.perfilMedicoRepository
      .createQueryBuilder('perfil')
      .select('DISTINCT perfil.especialidad', 'especialidad')
      .where('perfil.activo = true')
      .getRawMany();

    return especialidades.map(e => e.especialidad).filter(e => e);
  }

  async obtenerResumenPaciente(pacienteId: number): Promise<any> {
    // Verificar cache primero
    const cachedData = this.cacheService.getCitasData(pacienteId, 'paciente');
    if (cachedData) {
      return cachedData;
    }

    const citas = await this.citasRepository.find({
      where: { pacienteId },
      relations: ['doctor'],
      order: { fechaHora: 'DESC' }
    });

    const ahora = getCurrentColombiaDateTime();
    const proximasCitas = citas.filter(c => {
      const fechaCita = parseColombiaDateTime(c.fechaHora.toISOString());
      return fechaCita > ahora && c.estado !== 'cancelada';
    });

    const historialCitas = citas.filter(c => {
      const fechaCita = parseColombiaDateTime(c.fechaHora.toISOString());
      return fechaCita <= ahora || c.estado === 'completada';
    });

    const doctoresVisitados = [...new Set(historialCitas.map(c => c.doctorId))].length;
    
    // Obtener especialidades de los doctores visitados
    const doctoresIds = [...new Set(historialCitas.map(c => c.doctorId))];
    const perfilesMedicos = await this.perfilMedicoRepository.find({
      where: { usuarioId: In(doctoresIds) }
    });
    const especialidadesVisitadas = [...new Set(perfilesMedicos.map(p => p.especialidad).filter(e => e))].length;

    const resultado = {
      totalCitas: citas.length,
      citasCompletadas: citas.filter(c => c.estado === 'completada').length,
      citasPendientes: citas.filter(c => c.estado === 'pendiente').length,
      proximasCitas: proximasCitas.slice(0, 5), // Próximas 5 citas
      doctoresVisitados,
      especialidadesVisitadas,
      ultimasCitas: historialCitas.slice(0, 10) // Últimas 10 citas
    };

    // Guardar en cache
    this.cacheService.setCitasData(pacienteId, 'paciente', resultado, 20000);

    return resultado;
  }

  async obtenerAgendaDoctor(doctorId: number): Promise<any> {
    // Verificar cache primero
    const cachedData = this.cacheService.getCitasData(doctorId, 'doctor');
    if (cachedData) {
      return cachedData;
    }

    const hoy = getCurrentColombiaDateTime();
    const inicioSemana = getCurrentColombiaDateTime();
    inicioSemana.setTime(hoy.getTime());
    inicioSemana.setDate(hoy.getDate() - hoy.getDay());
    const finSemana = getCurrentColombiaDateTime();
    finSemana.setTime(inicioSemana.getTime());
    finSemana.setDate(inicioSemana.getDate() + 6);

    try {
      const citas = await this.citasRepository.find({
        where: {
          doctorId,
          fechaHora: Between(inicioSemana, finSemana)
        },
        relations: ['paciente'],
        order: { fechaHora: 'ASC' }
      });

      const citasHoy = citas.filter(c => {
        const fechaCita = parseColombiaDateTime(c.fechaHora.toISOString());
        return fechaCita.toDateString() === hoy.toDateString();
      });
      const proximasCitas = citas.filter(c => {
        const fechaCita = parseColombiaDateTime(c.fechaHora.toISOString());
        return fechaCita > hoy && c.estado !== 'cancelada';
      });

      const resultado = {
        citasHoy,
        proximasCitas: proximasCitas.slice(0, 10),
        citasEstaSemana: citas,
        estadisticas: {
          citasHoy: citasHoy.length,
          citasPendientes: citas.filter(c => c.estado === 'pendiente').length,
          citasConfirmadas: citas.filter(c => c.estado === 'confirmada').length,
          citasCompletadas: citas.filter(c => c.estado === 'completada').length
        }
      };

      // Guardar en cache
      this.cacheService.setCitasData(doctorId, 'doctor', resultado, 15000);

      return resultado;
    } catch (error) {
      // Si hay un error o no se encuentran datos, devolver una estructura vacía y segura.
      const resultado = {
        citasHoy: [],
        proximasCitas: [],
        citasEstaSemana: [],
        estadisticas: {
          citasHoy: 0,
          citasPendientes: 0,
          citasConfirmadas: 0,
          citasCompletadas: 0
        }
      };

      // Guardar en cache incluso resultado vacío para evitar consultas repetidas
      this.cacheService.setCitasData(doctorId, 'doctor', resultado, 5000);

      return resultado;
    }
  }

  async validarDisponibilidadEspecifica(doctorId: number, fechaHora: string, duracion: number): Promise<any> {
    const fecha = parseColombiaDateTime(fechaHora);
    const fechaString = fecha.toISOString().split('T')[0];
    const horaString = fecha.toTimeString().substring(0, 5);

    const perfil = await this.perfilMedicoRepository.findOne({
      where: { usuarioId: doctorId }
    });

    if (!perfil) {
      return {
        disponible: false,
        razon: 'Doctor no encontrado'
      };
    }

    // Verificar día de atención
    const diaSemana = fecha.toLocaleDateString('es-ES', { weekday: 'long' });
    if (perfil.diasAtencion && perfil.diasAtencion.length > 0 && !perfil.diasAtencion.includes(diaSemana)) {
      return {
        disponible: false,
        razon: 'El doctor no atiende este día'
      };
    }

    // Verificar horario de atención
    const horaInicio = perfil.horaInicio || '08:00';
    const horaFin = perfil.horaFin || '18:00';

    if (horaString < horaInicio || horaString > horaFin) {
      return {
        disponible: false,
        razon: 'Fuera del horario de atención'
      };
    }

    // Verificar horario de almuerzo
    if (this.estaEnHorarioAlmuerzo(horaString, perfil)) {
      return {
        disponible: false,
        razon: 'Horario de almuerzo'
      };
    }

    // Verificar conflictos con citas existentes
    const fechaInicio = parseColombiaDateTime(fechaHora);
    const fechaFinValidacion = getCurrentColombiaDateTime();
    fechaFinValidacion.setTime(fechaInicio.getTime() + duracion * 60000);

    const citaConflicto = await this.citasRepository.findOne({
      where: {
        doctorId,
        fechaHora: Between(
          (() => {
            const inicio = getCurrentColombiaDateTime();
            inicio.setTime(fechaInicio.getTime() - 59 * 60000);
            return inicio;
          })(),
          (() => {
            const fin = getCurrentColombiaDateTime();
            fin.setTime(fechaFinValidacion.getTime() + 59 * 60000);
            return fin;
          })()
        )
      }
    });

    if (citaConflicto && citaConflicto.estado !== 'cancelada') {
      return {
        disponible: false,
        razon: 'Horario ocupado por otra cita'
      };
    }

    return {
      disponible: true,
      razon: 'Horario disponible'
    };
  }

  async obtenerEstadoSistema(usuarioId: number, rolUsuario: string): Promise<any> {
    const estadisticas = await this.obtenerEstadisticasCitas(usuarioId, rolUsuario);
    
    let disponibilidadSemanal = null;
    
    // Solo obtener disponibilidad semanal si es doctor
    if (rolUsuario === 'doctor') {
      try {
        disponibilidadSemanal = await this.obtenerDisponibilidadSemanal(usuarioId);
      } catch (error) {
        disponibilidadSemanal = { message: 'No se pudo obtener disponibilidad semanal' };
      }
    }

    return {
      estadisticas,
      disponibilidadSemanal,
      mensaje: estadisticas.totalCitas === 0 ? 
        'No hay citas registradas en el sistema para este usuario.' : 
        'Información cargada correctamente desde la base de datos.'
    };
  }
  

  async obtenerDoctoresRecomendados(pacienteId: number): Promise<any[]> {
    // Obtener historial de citas del paciente
    const historialCitas = await this.citasRepository.find({
      where: { pacienteId },
      relations: ['doctor']
    });

    // Obtener especialidades que el paciente ha visitado
    const doctoresIds = [...new Set(historialCitas.map(c => c.doctorId))];
    const perfilesMedicos = await this.perfilMedicoRepository.find({
      where: { usuarioId: In(doctoresIds) }
    });
    const especialidadesVisitadas = [...new Set(perfilesMedicos.map(p => p.especialidad).filter(e => e))];

    // Obtener doctores de especialidades visitadas que no sean los mismos
    const doctoresVisitados = [...new Set(historialCitas.map(c => c.doctorId))];

    const queryBuilder = this.perfilMedicoRepository.createQueryBuilder('perfil')
      .leftJoinAndSelect('perfil.usuario', 'usuario')
      .leftJoinAndSelect('usuario.rol', 'rol')
      .where('rol.nombre = :rolDoctor', { rolDoctor: 'doctor' })
      .andWhere('perfil.activo = true')
      .andWhere('perfil.aceptaNuevosPacientes = true')
      .andWhere('perfil.verificadoColegio = true');

    if (especialidadesVisitadas.length > 0) {
      queryBuilder.andWhere('perfil.especialidad IN (:...especialidades)', {
        especialidades: especialidadesVisitadas
      });
    }

    if (doctoresVisitados.length > 0) {
      queryBuilder.andWhere('perfil.usuarioId NOT IN (:...doctoresVisitados)', {
        doctoresVisitados
      });
    }

    const doctoresRecomendados = await queryBuilder.limit(10).getMany();

    return doctoresRecomendados.map(perfil => ({
      id: perfil.usuarioId,
      nombre: perfil.usuario.nombre,
      apellido: perfil.usuario.apellido,
      especialidad: perfil.especialidad,
      tarifaConsulta: perfil.tarifaConsulta,
      verificadoColegio: perfil.verificadoColegio,
      diasAtencion: perfil.diasAtencion,
      horaInicio: perfil.horaInicio,
      horaFin: perfil.horaFin
    }));
  }

  async obtenerPanelMedico(doctorId: number): Promise<any> {
    // Obtener perfil médico del doctor
    const perfilMedico = await this.perfilMedicoRepository.findOne({
      where: { usuarioId: doctorId },
      relations: ['usuario']
    });

    if (!perfilMedico) {
      throw new NotFoundException('Perfil médico no encontrado');
    }

    // Obtener estadísticas de citas del doctor
    const estadisticasCitas = await this.obtenerEstadisticasCitas(doctorId, 'doctor');

    // Obtener citas próximas (siguientes 7 días)
    const ahora = getCurrentColombiaDateTime();
    const enUnaSemana = getCurrentColombiaDateTime();
    enUnaSemana.setTime(ahora.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    const citasProximas = await this.citasRepository.find({
      where: {
        doctorId,
        fechaHora: Between(ahora, enUnaSemana),
        estado: In(['pendiente', 'aprobada', 'confirmada'])
      },
      relations: ['paciente'],
      order: { fechaHora: 'ASC' },
      take: 10
    });

    // Obtener disponibilidad semanal
    const disponibilidadSemanal = await this.obtenerDisponibilidadSemanal(doctorId);

    return {
      perfilMedico: {
        id: perfilMedico.id,
        usuario: {
          nombre: perfilMedico.usuario.nombre,
          apellido: perfilMedico.usuario.apellido,
          email: perfilMedico.usuario.email,
          telefono: perfilMedico.usuario.telefono
        },
        especialidad: perfilMedico.especialidad,
        subespecialidades: perfilMedico.subespecialidades,
        numeroRegistroMedico: perfilMedico.numeroRegistroMedico,
        universidadEgreso: perfilMedico.universidadEgreso,
        añoGraduacion: perfilMedico.añoGraduacion,
        biografia: perfilMedico.biografia,
        tarifaConsulta: perfilMedico.tarifaConsulta,
        duracionConsultaDefault: perfilMedico.duracionConsultaDefault,
        aceptaNuevosPacientes: perfilMedico.aceptaNuevosPacientes,
        verificadoColegio: perfilMedico.verificadoColegio,
        diasAtencion: perfilMedico.diasAtencion,
        horaInicio: perfilMedico.horaInicio,
        horaFin: perfilMedico.horaFin,
        horaAlmuerzoInicio: perfilMedico.horaAlmuerzoInicio,
        horaAlmuerzoFin: perfilMedico.horaAlmuerzoFin,
        direccionConsultorio: perfilMedico.direccionConsultorio,
        ciudad: perfilMedico.ciudad
      },
      estadisticas: estadisticasCitas,
      citasProximas: citasProximas.map(cita => ({
        id: cita.id,
        fechaHora: cita.fechaHora,
        duracion: cita.duracion,
        estado: cita.estado,
        tipoConsulta: cita.tipoConsulta,
        motivoConsulta: cita.motivoConsulta,
        paciente: {
          id: cita.paciente.id,
          nombre: cita.paciente.nombre,
          apellido: cita.paciente.apellido,
          email: cita.paciente.email,
          telefono: cita.paciente.telefono
        }
      })),
      disponibilidadSemanal
    };
  }
}
