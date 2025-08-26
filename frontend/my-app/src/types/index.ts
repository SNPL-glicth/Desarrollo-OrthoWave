export * from './user';

export type AppointmentStatus = 'scheduled' | 'confirmed' | 'cancelled' | 'completed' | 'in_progress' | 'no_show' | 'pending' | 'blocked';

export interface Appointment {
  id: number;
  patientId: number;
  doctorId: number;
  date: string;
  time: string;
  status: AppointmentStatus;
  service: string;
  notes?: string;
  startTime: string;
  endTime: string;
  fechaHora: string;
  estado: string;
  patient: {
    id: number;
    name: string;
    email: string;
    phone?: string;
  };
  doctor: {
    id: number;
    name: string;
    email: string;
    specialization?: string;
    profileImage?: string;
  };
  specialist: {
    id: number;
    name: string;
    specialty: string;
  };
  type: string;
  createdAt: string;
  updatedAt: string;
}

export interface AvailableSlot {
  id: number;
  date: string;
  startTime: string;
  endTime: string;
  available: boolean;
  specialist: {
    id: number;
    name: string;
    specialty: string;
  };
}

export interface LoginResponse {
  access_token: string;
  user: any;
  redirectUrl?: string;
  redirect?: string;
}

export interface DoctorSummaryCardProps {
  onScheduleAppointment: () => void;
  onViewProfile: () => void;
}

export interface UserInfoOffcanvasProps {
  show: boolean;
  onClose: () => void;
  user: any;
}
