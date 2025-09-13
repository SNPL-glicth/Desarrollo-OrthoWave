import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { documentService, PatientDocument } from '../../services/documentService';
import DocumentUpload from './DocumentUpload';

const MyDocuments: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [documents, setDocuments] = useState<PatientDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  // const [selectedDocument, setSelectedDocument] = useState<PatientDocument | null>(null); // Para futuro uso
  const [showUpload, setShowUpload] = useState(false);

  // Cargar documentos al montar el componente
  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Cargando documentos del paciente...');
      
      // Usar el endpoint correcto para pacientes
      const docs = await documentService.getPatientDocuments();
      console.log('Documentos cargados:', docs);
      setDocuments(docs);
    } catch (err: any) {
      console.error('Error loading documents:', err);
      const errorMessage = err.response?.data?.message || err.message || 'Error al cargar los documentos';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadSuccess = async (document: PatientDocument) => {
    console.log('Upload success - Documento recibido:', document);
    
    // Actualizar la lista localmente primero
    setDocuments(prev => [document, ...prev]);
    setSuccess('Documento subido correctamente');
    setShowUpload(false);
    
    // Recargar la lista completa del servidor para asegurar sincronización
    try {
      await loadDocuments();
      console.log('Lista de documentos actualizada desde el servidor');
    } catch (err) {
      console.warn('Error al actualizar la lista desde el servidor:', err);
      // No mostrar error al usuario, la actualización local ya funcionó
    }
    
    setTimeout(() => setSuccess(null), 5000);
  };

  const handleUploadError = (errorMessage: string) => {
    setError(errorMessage);
    setTimeout(() => setError(null), 5000);
  };

  const handleViewDocument = (document: PatientDocument) => {
    console.log('Abriendo documento:', document);
    const viewUrl = `http://localhost:4000/api/patient-documents/${document.id}/view`;
    window.open(viewUrl, '_blank', 'width=800,height=600');
  };

  const handleDownloadDocument = (document: PatientDocument) => {
    console.log('Descargando documento:', document);
    const downloadUrl = `http://localhost:4000/api/patient-documents/${document.id}/download`;
    const link = window.document.createElement('a');
    link.href = downloadUrl;
    link.download = document.originalName;
    link.click();
  };

  const handleDeleteDocument = async (documentId: number) => {
    if (!window.confirm('¿Estás seguro de que quieres eliminar este documento?')) {
      return;
    }

    try {
      await documentService.deleteDocument(documentId);
      setDocuments(prev => prev.filter(doc => doc.id !== documentId));
      setSuccess('Documento eliminado correctamente');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      console.error('Error deleting document:', err);
      setError(err.response?.data?.message || 'Error al eliminar el documento');
      setTimeout(() => setError(null), 5000);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-600">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/dashboard/patient')}
                className="flex items-center px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 bg-gray-50 hover:bg-gray-100 rounded-md transition-colors"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
                Volver al Dashboard
              </button>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Mis Documentos</h1>
                <p className="text-gray-600 mt-2">Gestiona tus documentos médicos</p>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <button
                onClick={loadDocuments}
                disabled={loading}
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors disabled:opacity-50"
              >
                <svg className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {loading ? 'Actualizando...' : 'Actualizar'}
              </button>
              <button
                onClick={() => setShowUpload(!showUpload)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                {showUpload ? 'Cancelar' : 'Subir Documento'}
              </button>
            </div>
          </div>
        </div>

        {/* Mensajes de estado */}
        {success && (
          <div className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex">
              <svg className="flex-shrink-0 w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">{success}</p>
              </div>
            </div>
          </div>
        )}

        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <svg className="flex-shrink-0 w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* Sección de subida */}
        {showUpload && (
          <div className="bg-white rounded-lg shadow-sm mb-8 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Subir Nuevo Documento</h2>
            {documents.length >= 3 ? (
              <div className="text-center py-8 bg-orange-50 rounded-lg border border-orange-200">
                <svg className="mx-auto h-12 w-12 text-orange-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
                <h3 className="text-lg font-medium text-orange-900 mb-2">Límite alcanzado</h3>
                <p className="text-orange-700">
                  Has alcanzado el límite de 3 documentos. Elimina un documento existente para subir uno nuevo.
                </p>
              </div>
            ) : (
              <DocumentUpload
                onUploadSuccess={handleUploadSuccess}
                onError={handleUploadError}
                maxFiles={1}
              />
            )}
          </div>
        )}

        {/* Grid de documentos */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Documentos Subidos</h2>
            <span className="text-sm text-gray-500">
              {documents.length}/3 documentos
            </span>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-600 mx-auto mb-4"></div>
                <p className="text-gray-600">Cargando documentos...</p>
              </div>
            </div>
          ) : documents.length === 0 ? (
            <div className="text-center py-12">
              <svg className="mx-auto h-16 w-16 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <h3 className="text-xl font-medium text-gray-900 mb-2">No hay documentos</h3>
              <p className="text-gray-600 mb-6">
                Puedes subir hasta 3 documentos PDF desde aquí
              </p>
              <button
                onClick={() => setShowUpload(true)}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
              >
                Subir Documento
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {documents.map((document) => (
                <div
                  key={document.id}
                  className="relative bg-gradient-to-br from-red-50 to-red-100 border border-red-200 rounded-lg p-4 hover:shadow-md transition-shadow group"
                >
                  {/* Icono PDF - Clickeable */}
                  <div 
                    className="flex items-center justify-center mb-4 cursor-pointer"
                    onClick={() => handleViewDocument(document)}
                  >
                    <svg className="h-16 w-16 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
                    </svg>
                  </div>

                  {/* Información del documento - Clickeable */}
                  <div 
                    className="text-center mb-4 cursor-pointer"
                    onClick={() => handleViewDocument(document)}
                  >
                    <h3 className="font-medium text-gray-900 mb-1 text-sm truncate" title={document.originalName}>
                      {document.originalName}
                    </h3>
                    <p className="text-xs text-gray-600 mb-1">
                      {formatFileSize(document.size)}
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatDate(document.uploadDate)}
                    </p>
                  </div>

                  {/* Botones de acción */}
                  <div className="flex items-center justify-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewDocument(document);
                      }}
                      className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
                      title="Ver documento"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDownloadDocument(document);
                      }}
                      className="p-2 text-green-600 hover:text-green-800 hover:bg-green-50 rounded-lg transition-colors"
                      title="Descargar documento"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteDocument(document.id);
                      }}
                      className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar documento"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyDocuments;
