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
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Fab,
  TextField,
} from '@mui/material';
import {
  PictureAsPdf,
  Download,
  Visibility,
  Delete,
  Add,
  CloudUpload,
} from '@mui/icons-material';
// Import desde la app principal
const authService = {
  getToken: () => localStorage.getItem('token')
};

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

const MyDocuments: React.FC = () => {
  const [documents, setDocuments] = useState<PatientDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // Variables del modal PDF viewer eliminadas - ahora se abre en nueva pestaña
  const [openUpload, setOpenUpload] = useState(false);
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadDescription, setUploadDescription] = useState('');
  const [uploading, setUploading] = useState(false);

  const MAX_DOCUMENTS = 3;

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const token = authService.getToken();
      if (!token) {
        setError('No hay sesión activa. Por favor, inicia sesión nuevamente.');
        return;
      }
      
      console.log('Enviando petición con token:', token ? 'Token presente' : 'No hay token');
      
      const response = await fetch('http://localhost:4000/api/patient-documents', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Respuesta del servidor:', response.status, response.statusText);

      if (response.status === 401) {
        setError('Sesión expirada. Por favor, inicia sesión nuevamente.');
        return;
      }
      
      if (response.status === 403) {
        setError('No tienes permisos para ver documentos. Asegúrate de tener rol de paciente.');
        return;
      }
      
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

  const handleDownload = async (doc: PatientDocument) => {
    try {
      const response = await fetch(`http://localhost:4000/api/patient-documents/${doc.id}/download`, {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`,
        },
      });

      if (!response.ok) {
        throw new Error('Error al descargar el documento');
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = doc.originalName;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Limpiar el objeto URL
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al descargar documento');
    }
  };

  const handleView = async (doc: PatientDocument) => {
    try {
      // Como ya no necesitamos autenticación, podemos abrir directamente en nueva pestaña
      const pdfUrl = `http://localhost:4000/api/patient-documents/${doc.id}/view`;
      window.open(pdfUrl, '_blank');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al visualizar documento');
    }
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

  const handleUpload = async () => {
    if (!uploadFile) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('file', uploadFile);
      if (uploadDescription) {
        formData.append('description', uploadDescription);
      }

      const response = await fetch('http://localhost:4000/api/patient-documents/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al subir el documento');
      }

      // Cerrar modal y recargar documentos
      setOpenUpload(false);
      setUploadFile(null);
      setUploadDescription('');
      fetchDocuments();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setUploading(false);
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
      <Typography variant="h4" gutterBottom>
        Mis Documentos
      </Typography>

      <Typography variant="body1" color="text.secondary" paragraph>
        Aquí puede ver, descargar y gestionar sus documentos médicos. 
        Puede tener hasta {MAX_DOCUMENTS} documentos activos.
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {documents.length >= MAX_DOCUMENTS && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Ha alcanzado el límite máximo de {MAX_DOCUMENTS} documentos. 
          Para subir un nuevo documento, debe eliminar uno existente.
        </Alert>
      )}

      {documents.length === 0 ? (
        <Alert severity="info" sx={{ mb: 3 }}>
          No tiene documentos subidos. Puede subir hasta {MAX_DOCUMENTS} documentos PDF.
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

      {/* FAB para subir documentos */}
      {documents.length < MAX_DOCUMENTS && (
        <Fab
          color="primary"
          aria-label="subir documento"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={() => setOpenUpload(true)}
        >
          <Add />
        </Fab>
      )}

      {/* Modal para subir documentos */}
      <Dialog open={openUpload} onClose={() => setOpenUpload(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Subir Nuevo Documento</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 1 }}>
            <input
              accept="application/pdf"
              style={{ display: 'none' }}
              id="file-upload"
              type="file"
              onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
            />
            <label htmlFor="file-upload">
              <Button
                variant="outlined"
                component="span"
                startIcon={<CloudUpload />}
                fullWidth
                sx={{ mb: 2 }}
              >
                {uploadFile ? uploadFile.name : 'Seleccionar archivo PDF'}
              </Button>
            </label>
            
            <TextField
              label="Descripción (opcional)"
              multiline
              rows={3}
              fullWidth
              value={uploadDescription}
              onChange={(e) => setUploadDescription(e.target.value)}
              placeholder="Descripción del documento..."
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenUpload(false)}>Cancelar</Button>
          <Button
            onClick={handleUpload}
            variant="contained"
            disabled={!uploadFile || uploading}
            startIcon={uploading ? <CircularProgress size={20} /> : <CloudUpload />}
          >
            {uploading ? 'Subiendo...' : 'Subir'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* El modal PDF viewer fue eliminado - ahora se abre en nueva pestaña */}
    </Box>
  );
};

export default MyDocuments;
