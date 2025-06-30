import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PerfilMedico } from './entities/perfil-medico.entity';
import { User } from '../users/entities/user.entity';

@Injectable()
export class PerfilMedicoService {
  constructor(
    @InjectRepository(PerfilMedico)
    private perfilMedicoRepository: Repository<PerfilMedico>,
    @InjectRepository(User)
    private usersRepository: Repository<User>,
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
    return await this.perfilMedicoRepository.save(perfil);
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
        aceptaNuevosPacientes: true
      },
      relations: ['usuario'],
      order: { fechaCreacion: 'DESC' }
    });
  }
}
