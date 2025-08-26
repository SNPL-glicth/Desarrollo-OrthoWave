import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { PatientDocument } from './entities/patient-document.entity';
import { Paciente } from '../pacientes/entities/paciente.entity';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { PatientDocumentResponseDto } from './dto/patient-document-response.dto';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class PatientDocumentsService {
  private readonly uploadPath = 'uploads/patient-documents';

  constructor(
    @InjectRepository(PatientDocument)
    private patientDocumentRepository: Repository<PatientDocument>,
    @InjectRepository(Paciente)
    private pacienteRepository: Repository<Paciente>,
  ) {
    // Crear directorio de uploads si no existe
    if (!fs.existsSync(this.uploadPath)) {
      fs.mkdirSync(this.uploadPath, { recursive: true });
    }
  }

  async uploadDocument(
    file: Express.Multer.File,
    patientId: number,
    uploadDocumentDto: UploadDocumentDto,
  ): Promise<PatientDocumentResponseDto> {
    // Validar que el paciente existe
    const patient = await this.pacienteRepository.findOne({
      where: { id: patientId },
    });

    if (!patient) {
      throw new NotFoundException('Paciente no encontrado');
    }

    // Verificar límite de 3 documentos por paciente
    const existingDocuments = await this.patientDocumentRepository.count({
      where: { patientId },
    });

    if (existingDocuments >= 3) {
      throw new BadRequestException('Límite alcanzado: solo se permiten 3 documentos por paciente');
    }

    // Validar que el archivo es PDF
    if (file.mimetype !== 'application/pdf') {
      throw new BadRequestException('Solo se permiten archivos PDF');
    }

    // Validar tamaño (10MB máximo)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      throw new BadRequestException('El archivo no puede ser mayor a 10MB');
    }

    // Generar nombre único para el archivo
    const fileExtension = path.extname(file.originalname);
    const fileName = `${uuidv4()}${fileExtension}`;
    const filePath = path.join(this.uploadPath, fileName);

    try {
      // Guardar archivo en disco
      fs.writeFileSync(filePath, file.buffer);

      // Guardar información en base de datos
      const document = this.patientDocumentRepository.create({
        patientId,
        originalName: file.originalname,
        fileName,
        filePath,
        mimeType: file.mimetype,
        size: file.size,
        description: uploadDocumentDto.description,
      });

      const savedDocument = await this.patientDocumentRepository.save(document);

      return this.mapToResponseDto(savedDocument);
    } catch (error) {
      // Si hubo error, eliminar archivo del disco si se creó
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
      throw error;
    }
  }

  async getPatientDocuments(patientId: number): Promise<PatientDocumentResponseDto[]> {
    const documents = await this.patientDocumentRepository.find({
      where: { patientId },
      order: { uploadDate: 'DESC' },
    });

    return documents.map(doc => this.mapToResponseDto(doc));
  }

  async getDocumentsByPatientId(patientId: number): Promise<PatientDocumentResponseDto[]> {
    console.log('=== GET DOCUMENTS BY PATIENT ID SERVICE ===');
    console.log('Patient ID recibido:', patientId);
    
    // Buscar paciente por usuario ID, no por ID de paciente
    const patient = await this.pacienteRepository.findOne({
      where: { usuarioId: patientId }, // Cambio importante: usar usuarioId
      relations: ['usuario']
    });

    console.log('Paciente encontrado:', patient ? 'Sí' : 'No');
    
    if (!patient) {
      console.log('No se encontró paciente, retornando array vacío');
      // En lugar de error, retornar array vacío
      return [];
    }

    console.log('Buscando documentos para paciente ID:', patient.id);
    const documents = await this.patientDocumentRepository.find({
      where: { patientId: patient.id },
      order: { uploadDate: 'DESC' },
    });

    console.log('Documentos encontrados:', documents.length);
    return documents.map(doc => this.mapToResponseDto(doc));
  }

  async deleteDocument(documentId: number, userId: number, userRole: string): Promise<void> {
    const document = await this.patientDocumentRepository.findOne({
      where: { id: documentId },
      relations: ['patient', 'patient.usuario'],
    });

    if (!document) {
      throw new NotFoundException('Documento no encontrado');
    }

    // Verificar permisos: solo el dueño del documento puede eliminarlo
    if (userRole !== 'admin' && document.patient.usuario.id !== userId) {
      throw new ForbiddenException('No tienes permisos para eliminar este documento');
    }

    try {
      // Eliminar archivo del disco
      if (fs.existsSync(document.filePath)) {
        fs.unlinkSync(document.filePath);
      }

      // Eliminar registro de la base de datos
      await this.patientDocumentRepository.remove(document);
    } catch (error) {
      throw new BadRequestException('Error al eliminar el documento');
    }
  }

  async getDocumentFile(documentId: number): Promise<{ filePath: string; originalName: string; mimeType: string }> {
    const document = await this.patientDocumentRepository.findOne({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundException('Documento no encontrado');
    }

    if (!fs.existsSync(document.filePath)) {
      throw new NotFoundException('Archivo no encontrado en el servidor');
    }

    return {
      filePath: document.filePath,
      originalName: document.originalName,
      mimeType: document.mimeType,
    };
  }

  // Método temporal para debugging sin autenticación
  async getAllDocumentsDebug(): Promise<PatientDocumentResponseDto[]> {
    const documents = await this.patientDocumentRepository.find({
      order: { uploadDate: 'DESC' },
    });

    return documents.map(doc => this.mapToResponseDto(doc));
  }

  private mapToResponseDto(document: PatientDocument): PatientDocumentResponseDto {
    return {
      id: document.id,
      fileName: document.fileName,
      originalName: document.originalName,
      mimeType: document.mimeType,
      size: document.size,
      uploadDate: document.uploadDate.toISOString(),
      url: `/api/patient-documents/${document.id}/view`, // URL sin auth para debugging
      patientId: document.patientId,
      description: document.description,
    };
  }
}
