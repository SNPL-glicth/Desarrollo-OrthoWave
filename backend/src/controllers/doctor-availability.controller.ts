import { Controller, Get } from '@nestjs/common';

@Controller('doctor-availability')
export class DoctorAvailabilityController {
  @Get('test')
  async test() {
    return {
      success: true,
      message: 'Doctor availability controller is working',
    };
  }
}
