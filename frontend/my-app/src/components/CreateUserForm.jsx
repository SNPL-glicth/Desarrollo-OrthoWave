import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

const CreateUserForm = ({ onClose, onUserCreated }) => {
  const [activeTab, setActiveTab] = useState('admin'); // Pestaña activa por defecto
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    telefono: '',
    rolId: 1, // Por defecto admin
    // Campos específicos para doctor
    especialidad: '',
    numeroRegistroMedico: '',
    universidadEgreso: '',
    añoGraduacion: '',
    biografia: '',
    tarifaConsulta: '',
    // Campos específicos para paciente (simplificados como registro normal)
    // No se requieren campos adicionales para mantener consistencia con el registro normal
  });

  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Cargar roles disponibles
    const fetchRoles = async () => {
      try {
        const response = await fetch('http://localhost:4000/users/public/roles');
        if (response.ok) {
          const rolesData = await response.json();
          setRoles(rolesData);
        }
      } catch (error) {
        console.error('Error al cargar roles:', error);
      }
    };
    fetchRoles();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: name === 'rolId' ? parseInt(value) : value
    }));
  };

  // Función para cambiar de pestaña
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    // Cambiar el rolId según la pestaña seleccionada
    const roleMapping = {
      'admin': 1,
      'doctor': 2,
      'paciente': 3
    };
    setFormData(prevState => ({
      ...prevState,
      rolId: roleMapping[tab] || 1
    }));
  };

  // Función para limpiar formulario
  const resetForm = () => {
    setFormData({
      nombre: '',
      apellido: '',
      email: '',
      password: '',
      telefono: '',
      rolId: activeTab === 'admin' ? 1 : activeTab === 'doctor' ? 2 : 3,
      especialidad: '',
      numeroRegistroMedico: '',
      universidadEgreso: '',
      añoGraduacion: '',
      biografia: '',
      tarifaConsulta: ''
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Obtener token del localStorage
      const token = localStorage.getItem('token');

      if (!token) {
        toast.error('No tienes autorización para crear usuarios');
        return;
      }

      // Verificar si es paciente para usar endpoint simplificado
      if (isPaciente) {
        // Para pacientes, usar endpoint simplificado con solo datos básicos
        // igual que en el formulario de registro normal
        const pacienteData = {
          nombre: formData.nombre,
          apellido: formData.apellido,
          email: formData.email,
          password: formData.password,
          telefono: formData.telefono
        };

        const response = await fetch('http://localhost:4000/users/admin/crear-paciente', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify(pacienteData)
        });

        if (response.ok) {
          const data = await response.json();
          toast.success('Paciente creado exitosamente (sin verificación requerida)');
          onUserCreated && onUserCreated(data);

          // Limpiar formulario
          resetForm();

          onClose && onClose();
        } else {
          const error = await response.json();
          toast.error(error.message || 'Error al crear el paciente');
        }
        return;
      }

      // Para admin y doctor, usar el endpoint completo
      const userData = {
        nombre: formData.nombre,
        apellido: formData.apellido,
        email: formData.email,
        password: formData.password,
        telefono: formData.telefono,
        rolId: formData.rolId
      };

      // Agregar campos específicos según el rol
      const selectedRole = roles.find(r => r.id === formData.rolId);
      if (selectedRole?.nombre === 'doctor') {
        userData.perfilMedico = {
          especialidad: formData.especialidad,
          numeroRegistroMedico: formData.numeroRegistroMedico,
          universidadEgreso: formData.universidadEgreso,
          añoGraduacion: parseInt(formData.añoGraduacion),
          biografia: formData.biografia,
          tarifaConsulta: parseFloat(formData.tarifaConsulta) || 0,
          aceptaNuevosPacientes: true,
          duracionConsultaDefault: 60,
          activo: true
        };
      }

      // Usar el endpoint de admin para crear usuarios sin verificación
      const response = await fetch('http://localhost:4000/users/admin/crear-usuario', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(userData)
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Usuario creado exitosamente (sin verificación requerida)');
        onUserCreated && onUserCreated(data);

        // Limpiar formulario
        resetForm();

        onClose && onClose();
      } else {
        const error = await response.json();
        toast.error(error.message || 'Error al crear el usuario');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al crear el usuario');
    } finally {
      setLoading(false);
    }
  };

  // Obtener rol seleccionado basado en la pestaña activa
  const isAdmin = activeTab === 'admin';
  const isDoctor = activeTab === 'doctor';
  const isPaciente = activeTab === 'paciente';
  
  // Configuración de las pestañas
  const tabs = [
    { id: 'admin', label: 'Administrador', icon: '👑', color: 'bg-red-500' },
    { id: 'doctor', label: 'Doctor', icon: '👩‍⚕️', color: 'bg-green-500' },
    { id: 'paciente', label: 'Paciente', icon: '👤', color: 'bg-blue-500' }
  ];

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-10 mx-auto p-5 border w-full max-w-4xl shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Crear Nuevo Usuario {isAdmin ? '(Administrador)' : isDoctor ? '(Doctor)' : isPaciente ? '(Paciente)' : ''}
            </h3>
            <button
              type="button"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Pestañas */}
          <div className="border-b border-gray-200 mb-6">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => handleTabChange(tab.id)}
                  className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 flex items-center space-x-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <p className="text-sm text-gray-600 mb-6">
            Los usuarios creados por admin no requieren verificación de email
            {isAdmin && ' y tendrán permisos de administrador completos'}
            {isDoctor && ' y tendrán un perfil médico automáticamente'}
            {isPaciente && ' y tendrán un perfil de paciente automáticamente. Para pacientes se requieren solo los mismos datos básicos que en el registro normal'}
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Información básica */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Nombre *</label>
                <input
                  type="text"
                  name="nombre"
                  value={formData.nombre}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Apellido *</label>
                <input
                  type="text"
                  name="apellido"
                  value={formData.apellido}
                  onChange={handleInputChange}
                  required
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Contraseña *</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Teléfono</label>
                <input
                  type="tel"
                  name="telefono"
                  value={formData.telefono}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Rol *</label>
                <input
                  type="text"
                  value={isAdmin ? 'Administrador' : isDoctor ? 'Doctor' : 'Paciente'}
                  disabled
                  className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm sm:text-sm text-gray-500"
                />
                <p className="mt-1 text-xs text-gray-500">El rol se selecciona mediante las pestañas superiores</p>
              </div>
            </div>


            {/* Campos específicos para doctores */}
            {isDoctor && (
              <div className="border-t pt-4">
                <h4 className="text-md font-medium text-gray-900 mb-3">Información Médica</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Especialidad *</label>
                    <input
                      type="text"
                      name="especialidad"
                      value={formData.especialidad}
                      onChange={handleInputChange}
                      required={isDoctor}
                      placeholder="Ej: Ortopedia y Traumatología"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Registro Médico *</label>
                    <input
                      type="text"
                      name="numeroRegistroMedico"
                      value={formData.numeroRegistroMedico}
                      onChange={handleInputChange}
                      required={isDoctor}
                      placeholder="Ej: RM-12345"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Universidad de Egreso *</label>
                    <input
                      type="text"
                      name="universidadEgreso"
                      value={formData.universidadEgreso}
                      onChange={handleInputChange}
                      required={isDoctor}
                      placeholder="Ej: Universidad Nacional"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Año de Graduación *</label>
                    <input
                      type="number"
                      name="añoGraduacion"
                      value={formData.añoGraduacion}
                      onChange={handleInputChange}
                      required={isDoctor}
                      min="1980"
                      max="2024"
                      placeholder="Ej: 2015"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Tarifa Consulta (COP)</label>
                    <input
                      type="number"
                      name="tarifaConsulta"
                      value={formData.tarifaConsulta}
                      onChange={handleInputChange}
                      min="0"
                      placeholder="Ej: 150000"
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                    />
                  </div>
                </div>

                <div className="mt-4">
                  <label className="block text-sm font-medium text-gray-700">Biografía</label>
                  <textarea
                    name="biografia"
                    value={formData.biografia}
                    onChange={handleInputChange}
                    rows="3"
                    placeholder="Breve descripción de la experiencia y especialidades..."
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
                  />
                </div>
              </div>
            )}

            {/* Para pacientes, no se requieren campos adicionales 
                 manteniendo consistencia con el formulario de registro normal */}

            <div className={`p-4 rounded-md border ${
              isAdmin ? 'bg-red-50 border-red-200' : 
              isDoctor ? 'bg-green-50 border-green-200' : 
              'bg-blue-50 border-blue-200'
            }`}>
              <div className="flex items-center">
                <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center ${
                  isAdmin ? 'bg-red-500' : 
                  isDoctor ? 'bg-green-500' : 
                  'bg-blue-500'
                }`}>
                  <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className={`text-sm font-medium ${
                    isAdmin ? 'text-red-800' : 
                    isDoctor ? 'text-green-800' : 
                    'text-blue-800'
                  }`}>
                    {isAdmin && '🛡️ Administrador con permisos completos'}
                    {isDoctor && '👩‍⚕️ Doctor con perfil médico automático'}
                    {isPaciente && '👤 Paciente con perfil básico'}
                  </p>
                  <p className={`text-sm ${
                    isAdmin ? 'text-red-700' : 
                    isDoctor ? 'text-green-700' : 
                    'text-blue-700'
                  }`}>
                    Usuario verificado automáticamente, puede iniciar sesión inmediatamente
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
              >
                Limpiar
              </button>
              <button
                type="submit"
                disabled={loading}
                className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 transition-colors ${
                  isAdmin ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500' : 
                  isDoctor ? 'bg-green-600 hover:bg-green-700 focus:ring-green-500' : 
                  'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                }`}
              >
                {loading ? (
                  <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Creando...
                  </div>
                ) : (
                  `Crear ${isAdmin ? 'Administrador' : isDoctor ? 'Doctor' : 'Paciente'}`
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateUserForm;
