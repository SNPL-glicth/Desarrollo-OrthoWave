export class PatientDocumentResponseDto {
  id: number;
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadDate: string;
  url: string;
  patientId: number;
  description?: string;
}
