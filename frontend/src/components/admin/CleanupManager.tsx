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
  Chip,
  Divider,
} from '@mui/material';
import {
  DeleteSweep,
  Assessment,
  Schedule,
  Warning,
} from '@mui/icons-material';
import { authService } from '../../services/authService';

interface CleanupStats {
  totalPatients: number;
  oldPatients: number;
  demoPatients: number;
  eligibleForDeletion: number;
}

interface CleanupResult {
  success: boolean;
  message: string;
  deletedPatients?: number;
  deletedDocuments?: number;
}

const CleanupManager: React.FC = () => {
  const [stats, setStats] = useState<CleanupStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [runningCleanup, setRunningCleanup] = useState(false);
  const [result, setResult] = useState<CleanupResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:4000/api/cleanup/stats', {
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Error al obtener estadísticas de limpieza');
      }

      const data = await response.json();
      setStats(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('Error fetching cleanup stats:', err);
    } finally {
      setLoading(false);
    }
  };

  const runCleanup = async () => {
    if (!window.confirm('¿Está seguro de que desea ejecutar la limpieza automática ahora? Esta acción eliminará permanentemente los datos de pacientes antiguos.')) {
      return;
    }

    try {
      setRunningCleanup(true);
      setError(null);
      setResult(null);
      
      const response = await fetch('http://localhost:4000/api/cleanup/run', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authService.getToken()}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Error al ejecutar la limpieza');
      }

      const data = await response.json();
      setResult(data);
      
      // Refrescar estadísticas después de la limpieza
      await fetchStats();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      console.error('Error running cleanup:', err);
    } finally {
      setRunningCleanup(false);
    }
  };

  useEffect(() => {
    fetchStats();
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
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <DeleteSweep />
        Gestión de Limpieza Automática
      </Typography>

      <Typography variant="body1" color="text.secondary" paragraph>
        Sistema de limpieza automática que elimina pacientes y sus documentos después de 6 meses.
        La limpieza se ejecuta automáticamente cada domingo a las 2:00 AM.
      </Typography>

      <Grid container spacing={3}>
        {/* Estadísticas */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Assessment />
                Estadísticas de Pacientes
              </Typography>
              
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              {stats && (
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <Box textAlign="center">
                      <Typography variant="h4" color="primary">
                        {stats.totalPatients}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Total Pacientes
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={6} sm={3}>
                    <Box textAlign="center">
                      <Typography variant="h4" color="warning.main">
                        {stats.oldPatients}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Pacientes Antiguos (>6m)
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={6} sm={3}>
                    <Box textAlign="center">
                      <Typography variant="h4" color="info.main">
                        {stats.demoPatients}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Pacientes Demo
                      </Typography>
                    </Box>
                  </Grid>
                  
                  <Grid item xs={6} sm={3}>
                    <Box textAlign="center">
                      <Typography variant="h4" color="error.main">
                        {stats.eligibleForDeletion}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Elegibles para Eliminar
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              )}

              <Divider sx={{ my: 2 }} />

              <Box display="flex" gap={1} justifyContent="center">
                <Chip 
                  icon={<Schedule />} 
                  label="Limpieza Automática: Domingos 2:00 AM" 
                  color="info"
                  variant="outlined"
                />
                {stats && stats.eligibleForDeletion > 0 && (
                  <Chip 
                    icon={<Warning />} 
                    label={`${stats.eligibleForDeletion} pacientes pendientes de limpieza`}
                    color="warning"
                    variant="outlined"
                  />
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Panel de Control */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Control Manual
              </Typography>
              
              <Typography variant="body2" color="text.secondary" paragraph>
                Ejecute la limpieza manualmente si es necesario. Esta acción no se puede deshacer.
              </Typography>

              <Button
                variant="contained"
                color="warning"
                fullWidth
                onClick={runCleanup}
                disabled={runningCleanup || (stats?.eligibleForDeletion === 0)}
                startIcon={runningCleanup ? <CircularProgress size={20} /> : <DeleteSweep />}
                sx={{ mb: 2 }}
              >
                {runningCleanup ? 'Ejecutando...' : 'Ejecutar Limpieza Ahora'}
              </Button>

              <Button
                variant="outlined"
                fullWidth
                onClick={fetchStats}
                disabled={loading}
              >
                Actualizar Estadísticas
              </Button>

              {result && (
                <Alert 
                  severity={result.success ? 'success' : 'error'} 
                  sx={{ mt: 2 }}
                >
                  {result.message}
                  {result.success && result.deletedPatients !== undefined && (
                    <Typography variant="body2" sx={{ mt: 1 }}>
                      Pacientes eliminados: {result.deletedPatients}<br />
                      Documentos eliminados: {result.deletedDocuments}
                    </Typography>
                  )}
                </Alert>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Alert severity="info" sx={{ mt: 3 }}>
        <strong>Nota importante:</strong> Los pacientes demo (aquellos con "demo" o "test" en su email o nombre) 
        nunca serán eliminados automáticamente, independientemente de su antigüedad.
      </Alert>
    </Box>
  );
};

export default CleanupManager;
