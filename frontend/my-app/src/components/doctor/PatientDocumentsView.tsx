import React, { useState, useEffect } from 'react';
import { documentService, PatientDocument } from '../../services/documentService';

interface PatientDocumentsViewProps {
  patientId: number;
  patientName?: string;
}

const PatientDocumentsView: React.FC<PatientDocumentsViewProps> = ({ 
  patientId, 
  patientName = 'Paciente' 
}) => {
  const [documents, setDocuments] = useState<PatientDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDocuments();
  }, [patientId]);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Cargando documentos del paciente:', patientId);
      
      const docs = await documentService.getDocumentsByPatientId(patientId);
      console.log('Documentos cargados:', docs);
      setDocuments(docs);
    } catch (err: any) {
      console.error('Error loading patient documents:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Error al cargar los documentos';
      setError(errorMessage);
      // Si hay error, mostrar array vacío para mejor UX
      setDocuments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleViewDocument = (document: PatientDocument) => {
    console.log('Abriendo documento:', document);
    const viewUrl = `http://localhost:4000/api/patient-documents/${document.id}/view`;
    
    // Abrir en nueva pestaña con configuraciones específicas
    const newWindow = window.open(
      viewUrl, 
      '_blank', 
      'width=900,height=700,scrollbars=yes,resizable=yes,toolbar=no,menubar=no'
    );
    
    // Verificar si se abrió correctamente
    if (!newWindow) {
      alert('Por favor permite ventanas emergentes para ver el documento');
    }
  };

  const handleDownloadDocument = (doc: PatientDocument) => {
    console.log('Descargando documento:', doc);
    const downloadUrl = `http://localhost:4000/api/patient-documents/${doc.id}/download`;
    
    const link = window.document.createElement('a');
    link.href = downloadUrl;
    link.download = doc.originalName;
    link.style.display = 'none';
    
    document.body?.appendChild(link);
    link.click();
    document.body?.removeChild(link);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Documentos de {patientName}
        </h3>
        <div className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando documentos...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">
          Documentos de {patientName}
        </h3>
        <span className="text-sm text-gray-500">
          {documents.length}/3 documentos
        </span>
      </div>

      {error && (
        <div className="mb-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="flex">
            <svg className="flex-shrink-0 w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="ml-3">
              <p className="text-sm text-yellow-800">
                No se pudieron cargar los documentos. {documents.length === 0 && 'Este paciente no ha subido documentos aún.'}
              </p>
            </div>
          </div>
        </div>
      )}

      {documents.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-lg">
          <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <h4 className="text-lg font-medium text-gray-900 mb-2">Sin documentos</h4>
          <p className="text-gray-600 mb-4">
            Este paciente no ha subido documentos médicos aún.
          </p>
          <p className="text-sm text-gray-500">
            Los pacientes pueden subir hasta 3 documentos PDF desde su perfil.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {documents.map((document) => (
            <div
              key={document.id}
              className="bg-gradient-to-br from-blue-50 to-blue-100 border border-blue-200 rounded-lg p-4 hover:shadow-lg transition-all duration-200 cursor-pointer group relative"
              onClick={() => handleViewDocument(document)}
            >
              {/* Icono PDF */}
              <div className="flex items-center justify-center mb-3">
                <div className="relative">
                  <svg className="h-12 w-12 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                  </svg>
                  {/* Badge PDF */}
                  <div className="absolute -top-1 -right-1 bg-red-600 text-white text-xs px-1 py-0.5 rounded font-bold">
                    PDF
                  </div>
                </div>
              </div>

              {/* Información del documento */}
              <div className="text-center mb-3">
                <h4 className="font-medium text-gray-900 mb-1 text-sm truncate" title={document.originalName}>
                  {document.originalName}
                </h4>
                <p className="text-xs text-gray-600 mb-1">
                  {formatFileSize(document.size)}
                </p>
                <p className="text-xs text-gray-500">
                  {formatDate(document.uploadDate)}
                </p>
              </div>

              {/* Botones de acción - aparecen al hacer hover */}
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-1">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewDocument(document);
                  }}
                  className="p-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  title="Ver documento"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
                
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownloadDocument(document);
                  }}
                  className="p-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  title="Descargar documento"
                >
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </button>
              </div>

              {/* Indicador de click */}
              <div className="absolute bottom-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <span className="text-xs text-blue-700 font-medium">Click para ver</span>
              </div>
            </div>
          ))}
          
          {/* Mostrar espacios vacíos para indicar límite */}
          {documents.length < 3 && Array.from({ length: 3 - documents.length }).map((_, index) => (
            <div
              key={`empty-${index}`}
              className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-4 flex items-center justify-center"
            >
              <div className="text-center">
                <svg className="h-8 w-8 text-gray-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-xs text-gray-500">Espacio disponible</p>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {documents.length > 0 && (
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            Haz clic en cualquier documento para verlo en una nueva pestaña
          </p>
        </div>
      )}
    </div>
  );
};

export default PatientDocumentsView;
