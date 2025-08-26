import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Alert,
  CircularProgress,
  IconButton,
} from '@mui/material';
import {
  PictureAsPdf,
  Visibility,
} from '@mui/icons-material';

interface DebugDocument {
  id: number;
  originalName: string;
  mimeType: string;
  size: number;
  uploadDate: string;
  patientId: number;
  url: string;
}

const DebugDocuments: React.FC = () => {
  const [documents, setDocuments] = useState<DebugDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Probando endpoint de debug...');
      
      const response = await fetch('http://localhost:4000/api/patient-documents/debug/list');
      
      console.log('Respuesta del servidor:', response.status, response.statusText);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: 'Error desconocido' }));
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Documentos obtenidos:', data);
      setDocuments(data);
    } catch (err) {
      console.error('Error fetching documents:', err);
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  const handleView = (doc: DebugDocument) => {
    const url = `http://localhost:4000/api/patient-documents/debug/${doc.id}/view`;
    window.open(url, '_blank');
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
    fetchDocuments();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom color="error">
        🐛 DEBUG - Documentos PDF (SIN AUTENTICACIÓN)
      </Typography>

      <Alert severity="warning" sx={{ mb: 2 }}>
        Esta es una página temporal de debugging. Los endpoints están SIN autenticación para probar que funcionan.
      </Alert>

      <Button 
        variant="contained" 
        onClick={fetchDocuments}
        sx={{ mb: 2 }}
      >
        Recargar Documentos
      </Button>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {documents.length === 0 ? (
        <Alert severity="info">
          No hay documentos en la base de datos.
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {documents.map((doc) => (
            <Grid item xs={12} sm={6} md={4} key={doc.id}>
              <Card>
                <CardContent>
                  <Box display="flex" justifyContent="center" mb={2}>
                    <PictureAsPdf 
                      sx={{ 
                        fontSize: 48, 
                        color: '#d32f2f' 
                      }} 
                    />
                  </Box>
                  
                  <Typography 
                    variant="h6" 
                    sx={{ 
                      fontSize: '0.9rem',
                      textAlign: 'center',
                      mb: 1
                    }}
                  >
                    {doc.originalName}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 1 }}>
                    Tamaño: {formatFileSize(doc.size)}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 1 }}>
                    Paciente ID: {doc.patientId}
                  </Typography>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mb: 2 }}>
                    {formatDate(doc.uploadDate)}
                  </Typography>
                  
                  <Box display="flex" justifyContent="center">
                    <IconButton 
                      color="primary" 
                      onClick={() => handleView(doc)}
                      title="Ver documento"
                    >
                      <Visibility />
                    </IconButton>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

export default DebugDocuments;
