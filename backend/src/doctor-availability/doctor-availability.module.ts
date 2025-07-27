import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DoctorAvailabilityController } from '../controllers/doctor-availability.controller';
import { DoctorAvailabilityService } from '../services/doctor-availability.service';
import { DoctorAvailability } from './entities/doctor-availability.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([DoctorAvailability, User]),
  ],
  controllers: [DoctorAvailabilityController],
  providers: [DoctorAvailabilityService],
  exports: [DoctorAvailabilityService],
})
export class DoctorAvailabilityModule {}
