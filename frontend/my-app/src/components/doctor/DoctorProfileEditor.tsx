import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import axios from 'axios';

interface DoctorProfile {
  id?: number;
  usuarioId: number;
  numeroRegistroMedico?: string;
  especialidad?: string;
  subespecialidades?: string[];
  universidadEgreso?: string;
  añoGraduacion?: number;
  biografia?: string;
  aceptaNuevosPacientes?: boolean;
  tarifaConsulta?: number;
  duracionConsultaDefault?: number;
  telefonoConsultorio?: string;
  direccionConsultorio?: string;
  ciudad?: string;
  diasAtencion?: string[];
  horaInicio?: string;
  horaFin?: string;
  horaAlmuerzoInicio?: string;
  horaAlmuerzoFin?: string;
  activo?: boolean;
}

interface UserProfile {
  nombre: string;
  apellido: string;
  telefono?: string;
  email: string;
}

const DoctorProfileEditor: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [doctorProfile, setDoctorProfile] = useState<DoctorProfile>({
    usuarioId: Number(user?.id) || 0,
    aceptaNuevosPacientes: true,
    duracionConsultaDefault: 30,
    activo: true
  });
  const [userProfile, setUserProfile] = useState<UserProfile>({
    nombre: user?.nombre || '',
    apellido: user?.apellido || '',
    telefono: user?.telefono || '',
    email: user?.email || ''
  });

  const diasSemana = [
    { key: 'lunes', label: 'Lunes' },
    { key: 'martes', label: 'Martes' },
    { key: 'miercoles', label: 'Miércoles' },
    { key: 'jueves', label: 'Jueves' },
    { key: 'viernes', label: 'Viernes' },
    { key: 'sabado', label: 'Sábado' },
    { key: 'domingo', label: 'Domingo' }
  ];

  // Duración fija - no modificable por el doctor

  useEffect(() => {
    if (user?.id) {
      loadDoctorProfile();
    }
  }, [user]);

  const loadDoctorProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const response = await axios.get(`http://localhost:4000/perfil-medico/mi-perfil`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (response.data) {
        setDoctorProfile({
          ...response.data,
          subespecialidades: response.data.subespecialidades || [],
          diasAtencion: response.data.diasAtencion || []
        });
      }
    } catch (error: any) {
      console.error('Error loading doctor profile:', error);
      // Si no existe perfil, mantener valores por defecto
      if (error.response?.status !== 404) {
        toast.error('Error al cargar el perfil médico');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      
      // Preparar datos para envío
      const profileData = {
        ...doctorProfile,
        subespecialidades: doctorProfile.subespecialidades?.filter(s => s.trim() !== ''),
        diasAtencion: doctorProfile.diasAtencion || []
      };

      // Crear o actualizar perfil médico
      if (doctorProfile.id) {
        await axios.patch('http://localhost:4000/perfil-medico/mi-perfil', profileData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } else {
        await axios.post('http://localhost:4000/perfil-medico', profileData, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }

      toast.success('Perfil actualizado correctamente');
      await loadDoctorProfile(); // Recargar datos
    } catch (error: any) {
      console.error('Error saving profile:', error);
      toast.error(error.response?.data?.message || 'Error al guardar el perfil');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field: keyof DoctorProfile, value: any) => {
    setDoctorProfile(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleDiasAtencionChange = (dia: string) => {
    const diasActuales = doctorProfile.diasAtencion || [];
    const yaSeleccionado = diasActuales.includes(dia);
    
    if (yaSeleccionado) {
      handleInputChange('diasAtencion', diasActuales.filter(d => d !== dia));
    } else {
      handleInputChange('diasAtencion', [...diasActuales, dia]);
    }
  };

  const formatCurrency = (value: number | undefined) => {
    if (!value) return '';
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(value);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-gray-600">Cargando perfil...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Editar Perfil Profesional</h2>
            <p className="text-sm text-gray-600 mt-1">
              Actualiza tu información profesional y tarifas de consulta
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${
              doctorProfile.activo 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {doctorProfile.activo ? 'Activo' : 'Inactivo'}
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-6 space-y-6">
        {/* Información Básica */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Especialidad Principal *
            </label>
            <input
              type="text"
              value={doctorProfile.especialidad || ''}
              onChange={(e) => handleInputChange('especialidad', e.target.value)}
              placeholder="Ej: Ortodoncia"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Número de Registro Médico
            </label>
            <input
              type="text"
              value={doctorProfile.numeroRegistroMedico || ''}
              onChange={(e) => handleInputChange('numeroRegistroMedico', e.target.value)}
              placeholder="Ej: 12345"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Universidad de Egreso
            </label>
            <input
              type="text"
              value={doctorProfile.universidadEgreso || ''}
              onChange={(e) => handleInputChange('universidadEgreso', e.target.value)}
              placeholder="Ej: Universidad Nacional"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Año de Graduación
            </label>
            <input
              type="number"
              value={doctorProfile.añoGraduacion || ''}
              onChange={(e) => handleInputChange('añoGraduacion', parseInt(e.target.value) || undefined)}
              placeholder="Ej: 2015"
              min="1950"
              max={new Date().getFullYear()}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        </div>

        {/* Tarifa de Consulta */}
        <div className="bg-blue-50 rounded-lg p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
            </svg>
            Tarifa de Consulta
          </h3>
          
          <div className="max-w-md">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tarifa por Consulta
            </label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
              <input
                type="number"
                value={doctorProfile.tarifaConsulta || ''}
                onChange={(e) => handleInputChange('tarifaConsulta', parseFloat(e.target.value) || undefined)}
                placeholder="150000"
                className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            {doctorProfile.tarifaConsulta && (
              <p className="text-xs text-gray-600 mt-1">
                {formatCurrency(doctorProfile.tarifaConsulta)}
              </p>
            )}
            <p className="text-xs text-gray-500 mt-2">
              Esta tarifa se mostrará a los pacientes cuando agenden citas contigo.
            </p>
          </div>
        </div>

        {/* Información de Contacto */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Información de Consultorio</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Teléfono del Consultorio
              </label>
              <input
                type="tel"
                value={doctorProfile.telefonoConsultorio || ''}
                onChange={(e) => handleInputChange('telefonoConsultorio', e.target.value)}
                placeholder="(+57) 300 123 4567"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ciudad
              </label>
              <input
                type="text"
                value={doctorProfile.ciudad || ''}
                onChange={(e) => handleInputChange('ciudad', e.target.value)}
                placeholder="Ej: Bogotá"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dirección del Consultorio
              </label>
              <input
                type="text"
                value={doctorProfile.direccionConsultorio || ''}
                onChange={(e) => handleInputChange('direccionConsultorio', e.target.value)}
                placeholder="Ej: Calle 123 # 45-67, Consultorio 101"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Biografía */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Biografía Profesional
          </label>
          <textarea
            value={doctorProfile.biografia || ''}
            onChange={(e) => handleInputChange('biografia', e.target.value)}
            placeholder="Describe tu experiencia, especialidades y enfoque profesional..."
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {/* Configuraciones */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="aceptaNuevosPacientes"
            checked={doctorProfile.aceptaNuevosPacientes || false}
            onChange={(e) => handleInputChange('aceptaNuevosPacientes', e.target.checked)}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="aceptaNuevosPacientes" className="ml-2 text-sm text-gray-700">
            Acepto nuevos pacientes
          </label>
        </div>
      </div>

      {/* Footer */}
      <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-xl">
        <div className="flex justify-end space-x-3">
          <button
            onClick={loadDoctorProfile}
            disabled={saving}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            onClick={handleSaveProfile}
            disabled={saving || !doctorProfile.especialidad}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Guardando...
              </>
            ) : (
              <>
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Guardar Perfil
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default DoctorProfileEditor;