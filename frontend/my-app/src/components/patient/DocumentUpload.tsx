import React, { useState, useRef, useCallback } from 'react';
import { documentService, PatientDocument } from '../../services/documentService';

interface DocumentUploadProps {
  onUploadSuccess: (document: PatientDocument) => void;
  onError: (error: string) => void;
  maxFiles?: number;
}

const DocumentUpload: React.FC<DocumentUploadProps> = ({ 
  onUploadSuccess, 
  onError,
  maxFiles = 5 
}) => {
  const [isDragActive, setIsDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingFiles, setUploadingFiles] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragActive(true);
    }
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  }, []);

  const handleFiles = useCallback(async (files: File[]) => {
    console.log('=== INICIANDO UPLOAD DE ARCHIVOS ===');
    console.log('Archivos recibidos:', files.length);
    console.log('Archivos:', files.map(f => ({ name: f.name, size: f.size, type: f.type })));
    
    // Validar número máximo de archivos
    if (files.length > maxFiles) {
      const errorMsg = `Solo puedes subir un máximo de ${maxFiles} archivos a la vez`;
      console.error('Error - demasiados archivos:', errorMsg);
      onError(errorMsg);
      return;
    }

    // Validar cada archivo
    const validFiles: File[] = [];
    for (const file of files) {
      console.log(`Validando archivo: ${file.name}`);
      const validation = documentService.validatePDFFile(file);
      if (!validation.isValid) {
        const errorMsg = `Error en ${file.name}: ${validation.error}`;
        console.error('Validación fallida:', errorMsg);
        onError(errorMsg);
        continue;
      }
      console.log(`Archivo válido: ${file.name}`);
      validFiles.push(file);
    }

    if (validFiles.length === 0) {
      console.warn('No hay archivos válidos para subir');
      return;
    }

    console.log(`Subiendo ${validFiles.length} archivos válidos`);
    
    // Subir archivos válidos
    setUploading(true);
    setUploadingFiles(validFiles.map(f => f.name));

    try {
      for (const file of validFiles) {
        try {
          console.log(`Iniciando upload de: ${file.name}`);
          const uploadedDocument = await documentService.uploadDocument({ file });
          console.log('Upload exitoso, documento recibido:', uploadedDocument);
          onUploadSuccess(uploadedDocument);
          
          // Remover archivo de la lista de uploading
          setUploadingFiles(prev => prev.filter(name => name !== file.name));
        } catch (error: any) {
          console.error('Error uploading file:', error);
          console.error('Response status:', error.response?.status);
          console.error('Response data:', error.response?.data);
          const errorMsg = `Error al subir ${file.name}: ${error.response?.data?.message || error.message || 'Error desconocido'}`;
          onError(errorMsg);
          setUploadingFiles(prev => prev.filter(name => name !== file.name));
        }
      }
    } finally {
      setUploading(false);
      setUploadingFiles([]);
      
      // Limpiar input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      
      console.log('=== UPLOAD PROCESS COMPLETED ===');
    }
  }, [maxFiles, onError, onUploadSuccess]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(Array.from(e.dataTransfer.files));
    }
  }, [handleFiles]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(Array.from(e.target.files));
    }
  }, [handleFiles]);


  const handleClick = () => {
    if (!uploading) {
      fileInputRef.current?.click();
    }
  };

  // Función de utilidad para formato de archivos (disponible para futuro uso)
  // const formatFileSize = (bytes: number): string => {
  //   if (bytes === 0) return '0 Bytes';
  //   const k = 1024;
  //   const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  //   const i = Math.floor(Math.log(bytes) / Math.log(k));
  //   return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  // };

  return (
    <div className="w-full">
      {/* Drop Zone */}
      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 transition-colors duration-200 cursor-pointer
          ${isDragActive 
            ? 'border-gray-400 bg-gray-50' 
            : uploading 
            ? 'border-gray-300 bg-gray-50 cursor-not-allowed' 
            : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50'
          }
        `}
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileInput}
          className="hidden"
          disabled={uploading}
        />

        <div className="text-center">
          {uploading ? (
            <>
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600 mx-auto mb-4"></div>
              <p className="text-lg font-medium text-gray-900 mb-2">
                Subiendo documentos...
              </p>
              {uploadingFiles.length > 0 && (
                <div className="text-sm text-gray-600 space-y-1">
                  {uploadingFiles.map((fileName, index) => (
                    <div key={index} className="flex items-center justify-center space-x-2">
                      <div className="animate-spin rounded-full h-3 w-3 border-b border-gray-600"></div>
                      <span>{fileName}</span>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <>
              <svg
                className="mx-auto h-12 w-12 text-gray-400 mb-4"
                stroke="currentColor"
                fill="none"
                viewBox="0 0 48 48"
                aria-hidden="true"
              >
                <path
                  d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <p className="text-lg font-medium text-gray-900 mb-2">
                {isDragActive ? 'Suelta los archivos aquí' : 'Subir documentos PDF'}
              </p>
              <p className="text-sm text-gray-600 mb-4">
                Arrastra y suelta tus archivos PDF aquí, o haz clic para seleccionar
              </p>
              <div className="text-xs text-gray-500">
                <p>• Solo archivos PDF permitidos</p>
                <p>• Tamaño máximo: 10MB por archivo</p>
                <p>• Máximo {maxFiles} archivos a la vez</p>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Upload Progress */}
      {uploadingFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          {uploadingFiles.map((fileName, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <svg className="h-6 w-6 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                  <span className="text-sm font-medium text-gray-900 truncate">
                    {fileName}
                  </span>
                </div>
                <div className="animate-spin rounded-full h-4 w-4 border-b border-gray-600"></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default DocumentUpload;
