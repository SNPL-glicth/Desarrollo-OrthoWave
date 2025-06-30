import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PerfilMedicoService } from './perfil-medico.service';
import { PerfilMedicoController } from './perfil-medico.controller';
import { PerfilMedico } from './entities/perfil-medico.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([PerfilMedico, User])
  ],
  controllers: [PerfilMedicoController],
  providers: [PerfilMedicoService],
  exports: [PerfilMedicoService]
})
export class PerfilMedicoModule {}
