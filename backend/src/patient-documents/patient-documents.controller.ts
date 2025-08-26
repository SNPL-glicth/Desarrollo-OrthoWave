import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  Body,
  UseInterceptors,
  UploadedFile,
  UseGuards,
  Request,
  Res,
  ParseIntPipe,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Response } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { PatientDocumentsService } from './patient-documents.service';
import { PacientesService } from '../pacientes/pacientes.service';
import { UploadDocumentDto } from './dto/upload-document.dto';
import { PatientDocumentResponseDto } from './dto/patient-document-response.dto';

@Controller('api/patient-documents')
export class PatientDocumentsController {

  // ENDPOINT TEMPORAL PARA PROBAR SIN REINICIAR SERVIDOR
  @Get('test-no-auth')
  async testNoAuth(): Promise<any> {
    console.log('=== TEST NO AUTH FUNCIONANDO ===');
    return { 
      message: 'Endpoint funcionando sin autenticación',
      timestamp: new Date().toISOString()
    };
  }

  // ===== ENDPOINTS TEMPORALES SIN AUTH PARA DEBUGGING =====
  @Get('debug/test')
  async debugTest(): Promise<{ message: string }> {
    console.log('=== DEBUG TEST ENDPOINT ===');
    return { message: 'Endpoint funcionando sin autenticación' };
  }

  @Get('debug/list')
  async debugList(): Promise<PatientDocumentResponseDto[]> {
    console.log('=== DEBUG LIST TODOS LOS DOCUMENTOS ===');
    // Obtener todos los documentos sin verificar autenticación
    const documents = await this.patientDocumentsService.getAllDocumentsDebug();
    console.log('Documentos encontrados:', documents.length);
    return documents;
  }

  @Get('debug/:id/view')
  async debugViewDocument(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response
  ): Promise<void> {
    console.log('=== DEBUG VIEW DOCUMENT ===');
    console.log('Document ID:', id);
    
    try {
      const { filePath, mimeType } = await this.patientDocumentsService.getDocumentFile(id);
      
      console.log('Archivo encontrado:', filePath);
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', 'inline');
      res.sendFile(filePath, { root: '.' });
    } catch (error) {
      console.error('Error en debug view:', error.message);
      res.status(404).json({ error: error.message });
    }
  }
  constructor(
    private readonly patientDocumentsService: PatientDocumentsService,
    private readonly pacientesService: PacientesService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadDocumentDto: UploadDocumentDto,
    @Request() req,
  ): Promise<PatientDocumentResponseDto> {
    const usuario = req.user;

    // Solo pacientes pueden subir sus propios documentos
    if (usuario.rol.nombre !== 'paciente') {
      throw new HttpException('Solo los pacientes pueden subir documentos', HttpStatus.FORBIDDEN);
    }

    if (!file) {
      throw new HttpException('No se ha proporcionado ningún archivo', HttpStatus.BAD_REQUEST);
    }

    // Obtener el ID del paciente desde el usuario autenticado
    let patientId = req.user.paciente?.id;
    if (!patientId) {
      // Si no existe el perfil de paciente, crearlo automáticamente
      const newPaciente = await this.pacientesService.crearPaciente({
        usuarioId: req.user.id,
        activo: true,
        primeraConsulta: true
      });
      
      patientId = newPaciente.id;
    }

    return this.patientDocumentsService.uploadDocument(file, patientId, uploadDocumentDto);
  }

  // TEMPORAL: Sin autenticación para debugging - retorna TODOS los documentos
  @Get()
  async getPatientDocuments(): Promise<PatientDocumentResponseDto[]> {
    // Temporal: retornar todos los documentos sin verificar autenticación
    return this.patientDocumentsService.getAllDocumentsDebug();
  }

  @UseGuards(JwtAuthGuard)
  @Get('patient/:patientId')
  async getDocumentsByPatientId(
    @Param('patientId', ParseIntPipe) patientId: number,
    @Request() req,
  ): Promise<PatientDocumentResponseDto[]> {
    const usuario = req.user;

    console.log('=== GET DOCUMENTS BY PATIENT ID ===');
    console.log('Usuario:', usuario.id, usuario.rol?.nombre);
    console.log('Patient ID solicitado:', patientId);

    // Solo doctores y admins pueden ver documentos de otros pacientes
    if (usuario.rol.nombre !== 'doctor' && usuario.rol.nombre !== 'admin') {
      console.log('Error: Usuario no es doctor ni admin');
      throw new HttpException('No tienes permisos para ver documentos de otros pacientes', HttpStatus.FORBIDDEN);
    }

    try {
      const documents = await this.patientDocumentsService.getDocumentsByPatientId(patientId);
      console.log('Documentos encontrados:', documents.length);
      return documents;
    } catch (error) {
      console.log('Error al obtener documentos:', error.message);
      // Si no hay documentos, retornar array vacío en lugar de error
      return [];
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async deleteDocument(
    @Param('id', ParseIntPipe) id: number,
    @Request() req,
  ): Promise<{ message: string }> {
    const usuario = req.user;

    // Solo pacientes (sus propios documentos) y admins pueden eliminar documentos
    if (usuario.rol.nombre !== 'paciente' && usuario.rol.nombre !== 'admin') {
      throw new HttpException('No tienes permisos para eliminar documentos', HttpStatus.FORBIDDEN);
    }

    await this.patientDocumentsService.deleteDocument(id, req.user.id, req.user.rol);
    return { message: 'Documento eliminado correctamente' };
  }

  // IMPORTANTE: Los endpoints específicos deben ir después de los endpoints con parámetros
  @UseGuards(JwtAuthGuard)
  @Get(':id/download')
  async downloadDocument(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
    @Request() req,
  ): Promise<void> {
    const usuario = req.user;

    // Todos los usuarios autenticados pueden descargar documentos (con permisos verificados en el servicio)
    const { filePath, originalName, mimeType } = await this.patientDocumentsService.getDocumentFile(id);
    
    res.setHeader('Content-Type', mimeType);
    res.setHeader('Content-Disposition', `attachment; filename="${originalName}"`);
    res.sendFile(filePath, { root: '.' });
  }

  // TEMPORAL: Sin autenticación para debugging
  @Get(':id/view')
  async viewDocument(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ): Promise<void> {
    try {
      const { filePath, mimeType } = await this.patientDocumentsService.getDocumentFile(id);
      
      res.setHeader('Content-Type', mimeType);
      res.setHeader('Content-Disposition', 'inline');
      res.sendFile(filePath, { root: '.' });
    } catch (error) {
      res.status(404).json({ error: error.message });
    }
  }
}
