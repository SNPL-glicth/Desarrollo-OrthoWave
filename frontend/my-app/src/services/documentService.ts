import api from './api';

export interface PatientDocument {
  id: number;
  fileName: string;
  originalName: string;
  mimeType: string;
  size: number;
  uploadDate: string;
  url: string;
  patientId: number;
}

export interface UploadDocumentData {
  file: File;
  description?: string;
}

class DocumentService {
  private baseURL = '/api/patient-documents';

  /**
   * Subir un documento PDF
   */
  async uploadDocument(data: UploadDocumentData): Promise<PatientDocument> {
    const formData = new FormData();
    formData.append('file', data.file);
    if (data.description) {
      formData.append('description', data.description);
    }

    const response = await api.post<PatientDocument>(`${this.baseURL}/upload`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  }

  /**
   * Obtener todos los documentos del paciente actual
   */
  async getPatientDocuments(): Promise<PatientDocument[]> {
    const response = await api.get<PatientDocument[]>(`${this.baseURL}`);
    return response.data;
  }

  /**
   * Obtener documentos de un paciente específico (para doctores)
   */
  async getDocumentsByPatientId(patientId: number): Promise<PatientDocument[]> {
    const response = await api.get<PatientDocument[]>(`${this.baseURL}/patient/${patientId}`);
    return response.data;
  }

  /**
   * Eliminar un documento
   */
  async deleteDocument(documentId: number): Promise<void> {
    await api.delete(`${this.baseURL}/${documentId}`);
  }

  /**
   * Descargar un documento
   */
  async downloadDocument(documentId: number): Promise<Blob> {
    const response = await api.get(`${this.baseURL}/${documentId}/download`, {
      responseType: 'blob',
    });
    return response.data;
  }

  /**
   * Obtener URL para visualizar el PDF
   */
  getViewUrl(documentId: number): string {
    return `${api.defaults.baseURL}${this.baseURL}/${documentId}/view`;
  }

  /**
   * Validar si el archivo es un PDF válido
   */
  validatePDFFile(file: File): { isValid: boolean; error?: string } {
    // Verificar tipo MIME
    if (file.type !== 'application/pdf') {
      return {
        isValid: false,
        error: 'Solo se permiten archivos PDF'
      };
    }

    // Verificar tamaño (máximo 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return {
        isValid: false,
        error: 'El archivo no puede ser mayor a 10MB'
      };
    }

    // Verificar extensión
    const fileName = file.name.toLowerCase();
    if (!fileName.endsWith('.pdf')) {
      return {
        isValid: false,
        error: 'El archivo debe tener extensión .pdf'
      };
    }

    return { isValid: true };
  }
}

export const documentService = new DocumentService();
