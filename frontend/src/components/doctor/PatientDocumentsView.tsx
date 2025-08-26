import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Alert,
  CircularProgress,
  IconButton,
  Chip,
} from '@mui/material';
import {
  PictureAsPdf,
  Download,
  Visibility,
  Delete,
} from '@mui/icons-material';
import { authService } from '../../services/authService';

interface PatientDocument {
  id: number;
  originalName: string;
  filePath: string;
  mimeType: string;
  fileSize: number;
  description?: string;
  uploadedAt: string;
  patientId: number;
}

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

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`http://localhost:4000/api/patient-documents/patient/${patientId}`, {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener documentos del paciente');
      }

      const data = await response.json();
      setDocuments(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('Error fetching patient documents:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (doc: PatientDocument) => {
    const link = document.createElement('a');
    link.href = `http://localhost:4000/api/patient-documents/${doc.id}/download`;
    link.download = doc.originalName;
    link.style.display = 'none';
    
    document.body?.appendChild(link);
    link.click();
    document.body?.removeChild(link);
  };

  const handleView = (doc: PatientDocument) => {
    const url = `http://localhost:4000/api/patient-documents/${doc.id}/view`;
    window.open(url, '_blank');
  };

  const handleDelete = async (doc: PatientDocument) => {
    if (!window.confirm(`¿Está seguro de que desea eliminar el documento "${doc.originalName}"?`)) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:4000/api/patient-documents/${doc.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Error al eliminar el documento');
      }

      // Recargar documentos
      fetchDocuments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
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
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  useEffect(() => {
    if (patientId) {
      fetchDocuments();
    }
  }, [patientId]);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h5" gutterBottom>
        Documentos de {patientName}
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {documents.length === 0 ? (
        <Alert severity="info">
          Este paciente no tiene documentos subidos.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {documents.map((doc) => (
            <Grid item xs={12} sm={6} md={4} key={doc.id}>
              <Card 
                sx={{ 
                  height: '100%', 
                  display: 'flex', 
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1, p: 2 }}>
                  <Box display="flex" justifyContent="center" mb={2}>
                    <PictureAsPdf 
                      sx={{ 
                        fontSize: 64, 
                        color: '#d32f2f',
                        opacity: 0.8 
                      }} 
                    />
                  </Box>
                  
                  <Typography 
                    variant="h6" 
                    noWrap 
                    sx={{ 
                      fontSize: '0.9rem',
                      fontWeight: 'bold',
                      textAlign: 'center',
                      mb: 1
                    }}
                    title={doc.originalName}
                  >
                    {doc.originalName}
                  </Typography>
                  
                  {doc.description && (
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ mb: 1, textAlign: 'center' }}
                    >
                      {doc.description}
                    </Typography>
                  )}
                  
                  <Box display="flex" flexDirection="column" gap={1} mt={2}>
                    <Chip 
                      label={formatFileSize(doc.fileSize)} 
                      size="small" 
                      color="primary" 
                      variant="outlined"
                    />
                    <Chip 
                      label={formatDate(doc.uploadedAt)} 
                      size="small" 
                      color="default" 
                      variant="outlined"
                    />
                  </Box>
                </CardContent>
                
                <Box 
                  sx={{ 
                    p: 1, 
                    pt: 0, 
                    display: 'flex', 
                    justifyContent: 'space-around',
                    borderTop: '1px solid',
                    borderColor: 'divider'
                  }}
                >
                  <IconButton 
                    color="primary" 
                    onClick={() => handleView(doc)}
                    title="Ver documento"
                    size="small"
                  >
                    <Visibility />
                  </IconButton>
                  <IconButton 
                    color="secondary" 
                    onClick={() => handleDownload(doc)}
                    title="Descargar documento"
                    size="small"
                  >
                    <Download />
                  </IconButton>
                  <IconButton 
                    color="error" 
                    onClick={() => handleDelete(doc)}
                    title="Eliminar documento"
                    size="small"
                  >
                    <Delete />
                  </IconButton>
                </Box>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

    </Box>
  );
};

export default PatientDocumentsView;
