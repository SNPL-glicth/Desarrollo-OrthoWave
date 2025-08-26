import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';

interface PatientProfile {
  usuarioId: number;
  usuario: {
    id: number;
    nombre: string;
    apellido: string;
    email: string;
    telefono: string;
  };
  // Campos básicos del paciente (sin información médica ni adicional)
  numeroIdentificacion?: string;
  tipoIdentificacion?: string;
  fechaNacimiento?: string;
  edad?: number; // Calculado por el backend
  genero?: string;
  eps?: string;
  numeroAfiliacion?: string;
  tipoAfiliacion?: string;
  contactoEmergenciaNombre?: string;
  contactoEmergenciaTelefono?: string;
  contactoEmergenciaParentesco?: string;
  aceptaComunicaciones?: boolean;
  prefiereWhatsapp?: boolean;
  prefiereEmail?: boolean;
  prefiereSms?: boolean;
}

const PatientProfileComponent: React.FC = () => {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<PatientProfile>>({});
  const [originalData, setOriginalData] = useState<Partial<PatientProfile>>({});

  // Cargar perfil del paciente
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          toast.error('No tienes autorización');
          return;
        }

        const response = await fetch('http://localhost:4000/pacientes/mi-perfil', {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Datos recibidos del backend:', data);
          setProfile(data);
          // Asegurar que formData tenga la estructura correcta
          const normalizedData = {
            ...data,
            usuario: {
              id: data.usuario?.id || 0,
              nombre: data.usuario?.nombre || '',
              apellido: data.usuario?.apellido || '',
              email: data.usuario?.email || '',
              telefono: data.usuario?.telefono || ''
            }
          };
          console.log('Datos normalizados:', normalizedData);
          setFormData(normalizedData);
          setOriginalData(normalizedData);
        } else {
          console.log('Error response:', response.status);
          const error = await response.json();
          console.log('Error data:', error);
          toast.error(error.message || 'Error al cargar el perfil');
        }
      } catch (error) {
        console.error('Error:', error);
        toast.error('Error al cargar el perfil');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        toast.error('No tienes autorización');
        return;
      }

      // Estructurar los datos correctamente
      const { usuario, ...datosPaciente } = formData;
      const dataToSend = {
        ...datosPaciente,
        ...(usuario && { usuario })
      };

      console.log('Datos a enviar:', JSON.stringify(dataToSend, null, 2));
      console.log('Usuario en dataToSend:', dataToSend.usuario);

      const response = await fetch('http://localhost:4000/pacientes/mi-perfil', {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        setProfile(updatedProfile);
        const normalizedUpdatedData = {
          ...updatedProfile,
          usuario: {
            id: updatedProfile.usuario?.id || 0,
            nombre: updatedProfile.usuario?.nombre || '',
            apellido: updatedProfile.usuario?.apellido || '',
            email: updatedProfile.usuario?.email || '',
            telefono: updatedProfile.usuario?.telefono || ''
          }
        };
        setFormData(normalizedUpdatedData);
        setOriginalData(normalizedUpdatedData); // Actualizar originalData para que coincida
        setEditing(false);
        toast.success('Perfil actualizado correctamente');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Error al actualizar el perfil');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al actualizar el perfil');
    } finally {
      setSaving(false);
    }
  };

  // Función para detectar si hay cambios (sin información médica)
  const hasChanges = () => {
    if (!originalData || !formData) return false;
    
    // Campos básicos del paciente que se pueden editar (sin información médica ni adicional)
    const pacienteFields = ['genero', 'tipoAfiliacion', 'eps', 'numeroIdentificacion', 'tipoIdentificacion', 'fechaNacimiento', 'numeroAfiliacion', 'contactoEmergenciaNombre', 'contactoEmergenciaTelefono', 'contactoEmergenciaParentesco'];
    
    // Verificar cambios en campos del paciente
    for (const field of pacienteFields) {
      if (formData[field as keyof PatientProfile] !== originalData[field as keyof PatientProfile]) {
        console.log(`Campo ${field} cambió:`, formData[field as keyof PatientProfile], '!==', originalData[field as keyof PatientProfile]);
        return true;
      }
    }
    
    // Verificar cambios en datos del usuario
    const usuarioFields = ['telefono'];
    for (const field of usuarioFields) {
      if (formData.usuario?.[field as keyof typeof formData.usuario] !== originalData.usuario?.[field as keyof typeof originalData.usuario]) {
        console.log(`Campo usuario.${field} cambió:`, formData.usuario?.[field as keyof typeof formData.usuario], '!==', originalData.usuario?.[field as keyof typeof originalData.usuario]);
        return true;
      }
    }
    
    return false;
  };

  const handleCancel = () => {
    setFormData({
      ...originalData
    });
    setEditing(false);
  };

  const handleStartEditing = () => {
    // Al iniciar edición, guardar estado actual como original
    setOriginalData({ ...formData });
    setEditing(true);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    return new Date(dateString).toISOString().split('T')[0];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex justify-between items-center py-4 px-4 sm:px-6">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/dashboard/patient')}
              className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              Volver al Dashboard
            </button>
            <h1 className="text-2xl font-semibold text-gray-800">Mi Perfil</h1>
          </div>
          
          <div className="flex items-center space-x-4">
            {!editing ? (
              <button
                onClick={handleStartEditing}
                className="flex items-center space-x-2 bg-emerald-600 text-white px-6 py-2 rounded-lg hover:bg-emerald-700 transition-colors shadow-md"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                <span>Actualizar Información</span>
              </button>
            ) : (
              <div className="flex space-x-2">
                <button
                  onClick={handleCancel}
                  className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving || !hasChanges()}
                  className={`px-4 py-2 rounded-lg transition-colors ${
                    hasChanges() && !saving 
                      ? 'bg-green-600 text-white hover:bg-green-700' 
                      : 'bg-gray-400 text-gray-200 cursor-not-allowed'
                  }`}
                >
                  {saving ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6">
        <div className="bg-white rounded-lg shadow-sm">
          {/* Información del Usuario */}
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                {profile?.usuario.nombre?.charAt(0)?.toUpperCase() || 'U'}
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">
                  {profile?.usuario.nombre} {profile?.usuario.apellido}
                </h2>
                <p className="text-gray-600">{profile?.usuario.email}</p>
                {profile?.edad && (
                  <p className="text-blue-600 font-medium">{profile.edad} años</p>
                )}
              </div>
            </div>
          </div>

          <div className="p-6 space-y-6">
            {/* Información Personal - Solo campos básicos del registro */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Información Personal</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    value={`${profile?.usuario.nombre || ''} ${profile?.usuario.apellido || ''}`}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Correo Electrónico
                  </label>
                  <input
                    type="email"
                    value={profile?.usuario.email || ''}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono
                  </label>
                  {editing ? (
                    <input
                      type="tel"
                      name="telefono"
                      value={formData.usuario?.telefono || ''}
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        usuario: { 
                          id: prev.usuario?.id || 0,
                          nombre: prev.usuario?.nombre || '',
                          apellido: prev.usuario?.apellido || '',
                          email: prev.usuario?.email || '',
                          telefono: e.target.value 
                        }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Ej: +57 300 123 4567"
                    />
                  ) : (
                    <input
                      type="text"
                      value={profile?.usuario.telefono || 'No especificado'}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Edad
                  </label>
                  <input
                    type="text"
                    value={profile?.edad ? `${profile.edad} años` : 'No especificada'}
                    disabled
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Género
                  </label>
                  {editing ? (
                    <select
                      name="genero"
                      value={formData.genero || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Seleccionar</option>
                      <option value="Masculino">Masculino</option>
                      <option value="Femenino">Femenino</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={profile?.genero || 'No especificado'}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Afiliación
                  </label>
                  {editing ? (
                    <select
                      name="tipoAfiliacion"
                      value={formData.tipoAfiliacion || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Seleccionar</option>
                      <option value="EPS">EPS</option>
                      <option value="Particular">Particular</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={profile?.tipoAfiliacion || 'No especificado'}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                    />
                  )}
                </div>

                {/* Campo EPS solo si es tipo EPS */}
                {((editing && formData.tipoAfiliacion === 'EPS') || (!editing && profile?.tipoAfiliacion === 'EPS')) && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      EPS
                    </label>
                    {editing ? (
                      <input
                        type="text"
                        name="eps"
                        value={formData.eps || ''}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ej: Sura, Sanitas, etc."
                      />
                    ) : (
                      <input
                        type="text"
                        value={profile?.eps || 'No especificada'}
                        disabled
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                      />
                    )}
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Nacimiento
                  </label>
                  {editing ? (
                    <input
                      type="date"
                      name="fechaNacimiento"
                      value={formatDate(formData.fechaNacimiento)}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  ) : (
                    <input
                      type="text"
                      value={profile?.fechaNacimiento ? formatDate(profile.fechaNacimiento) : 'No especificada'}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Documento de Identidad
                  </label>
                  {editing ? (
                    <div className="flex space-x-2">
                      <select
                        name="tipoIdentificacion"
                        value={formData.tipoIdentificacion || 'CC'}
                        onChange={handleInputChange}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="CC">CC</option>
                        <option value="CE">CE</option>
                        <option value="TI">TI</option>
                        <option value="PP">PP</option>
                      </select>
                      <input
                        type="text"
                        name="numeroIdentificacion"
                        value={formData.numeroIdentificacion || ''}
                        onChange={handleInputChange}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Número de documento"
                      />
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={profile?.tipoIdentificacion && profile?.numeroIdentificacion ? 
                        `${profile.tipoIdentificacion} ${profile.numeroIdentificacion}` : 'No especificado'}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                    />
                  )}
                </div>
              </div>
            </div>


            {/* Contacto de Emergencia */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Contacto de Emergencia</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre Completo
                  </label>
                  {editing ? (
                    <input
                      type="text"
                      name="contactoEmergenciaNombre"
                      value={formData.contactoEmergenciaNombre || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Nombre del contacto"
                    />
                  ) : (
                    <input
                      type="text"
                      value={profile?.contactoEmergenciaNombre || 'No especificado'}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Teléfono
                  </label>
                  {editing ? (
                    <input
                      type="tel"
                      name="contactoEmergenciaTelefono"
                      value={formData.contactoEmergenciaTelefono || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Teléfono de emergencia"
                    />
                  ) : (
                    <input
                      type="text"
                      value={profile?.contactoEmergenciaTelefono || 'No especificado'}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Parentesco
                  </label>
                  {editing ? (
                    <select
                      name="contactoEmergenciaParentesco"
                      value={formData.contactoEmergenciaParentesco || ''}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Seleccionar</option>
                      <option value="Padre">Padre</option>
                      <option value="Madre">Madre</option>
                      <option value="Hermano/a">Hermano/a</option>
                      <option value="Cónyuge">Cónyuge</option>
                      <option value="Hijo/a">Hijo/a</option>
                      <option value="Amigo/a">Amigo/a</option>
                      <option value="Otro">Otro</option>
                    </select>
                  ) : (
                    <input
                      type="text"
                      value={profile?.contactoEmergenciaParentesco || 'No especificado'}
                      disabled
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
                    />
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientProfileComponent;
