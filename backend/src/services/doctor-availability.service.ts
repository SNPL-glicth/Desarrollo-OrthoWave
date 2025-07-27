import { Injectable } from '@nestjs/common';

@Injectable()
export class DoctorAvailabilityService {
  constructor() {}

  async test(): Promise<{ message: string }> {
    return { message: 'Doctor availability service is working' };
  }
}
