import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DoctorAvailabilityController } from '../controllers/doctor-availability.controller';
import { DoctorAvailabilityService } from '../services/doctor-availability.service';
import { FlexibleScheduleService } from './flexible-schedule.service';
import { DoctorAvailability } from './entities/doctor-availability.entity';
import { DoctorSchedule } from './entities/doctor-schedule.entity';
import { FlexibleDoctorSchedule } from './entities/flexible-doctor-schedule.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DoctorAvailability, 
      DoctorSchedule,
      FlexibleDoctorSchedule,
      User
    ]),
  ],
  controllers: [DoctorAvailabilityController],
  providers: [
    DoctorAvailabilityService,
    FlexibleScheduleService
  ],
  exports: [
    DoctorAvailabilityService,
    FlexibleScheduleService
  ],
})
export class DoctorAvailabilityModule {}
