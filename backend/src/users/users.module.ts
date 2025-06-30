import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { Role } from '../roles/entities/role.entity';
import { PerfilMedico } from '../perfil-medico/entities/perfil-medico.entity';
import { Paciente } from '../pacientes/entities/paciente.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Role, PerfilMedico, Paciente])
  ],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [TypeOrmModule, UsersService],
})
export class UsersModule {}
