import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { PencilIcon, TrashIcon, UserPlusIcon, MagnifyingGlassIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import CreateUserForm from './CreateUserForm';
import { useAuth } from '../context/AuthContext';
import { userService } from '../services/api';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUser, setSelectedUser] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    documentId: '',
    documentType: 'CC',
    address: '',
    birthDate: ''
  });

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await userService.getUsers();
      setUsers(response.data || []);
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      setError('Error al cargar los usuarios. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // Limpiar mensajes después de un tiempo
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(''), 5000);
      return () => clearTimeout(timer);
    }
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, error]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleRoleFilter = (e) => {
    setSelectedRole(e.target.value);
    setCurrentPage(1);
  };

  const handleStatusFilter = (e) => {
    setSelectedStatus(e.target.value);
    setCurrentPage(1);
  };

  // Filtrado avanzado de usuarios
  const filteredUsers = users.filter(user => {
    const matchesSearch =
      user.nombre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.apellido?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.documento?.includes(searchTerm);

    const matchesRole = selectedRole === 'all' || user.rol?.nombre === selectedRole;

    const matchesStatus = selectedStatus === 'all' ||
      (selectedStatus === 'verified' && user.isVerified) ||
      (selectedStatus === 'unverified' && !user.isVerified);

    return matchesSearch && matchesRole && matchesStatus;
  });

  // Paginación
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  const handleEdit = (patient) => {
    setSelectedUser(patient);
    setFormData({
      firstName: patient.firstName || '',
      lastName: patient.lastName || '',
      email: patient.email || '',
      phone: patient.phone || '',
      documentId: patient.documentId || '',
      documentType: patient.documentType || 'CC',
      address: patient.address || '',
      birthDate: patient.birthDate ? patient.birthDate.split('T')[0] : ''
    });
    setIsModalOpen(true);
  };

  const deleteUser = async (id) => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar este usuario?')) {
      return;
    }

    try {
      await userService.deleteUser(id);
      setSuccessMessage('Usuario eliminado exitosamente');
      fetchUsers(); // Recargar la lista después de eliminar
    } catch (error) {
      console.error('Error al eliminar usuario:', error);
      setError('Error al eliminar el usuario. Intenta nuevamente.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const updateUser = async (userData) => {
    try {
      await userService.updateUser(selectedUser.id, userData);
      setSuccessMessage('Usuario actualizado exitosamente');
      fetchUsers(); // Recargar la lista después de actualizar
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      setError('Error al actualizar el usuario. Intenta nuevamente.');
      throw error; // Re-throw to handle in handleSubmit
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await updateUser(formData);
      setIsModalOpen(false);
      setSelectedUser(null);
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      // Error is already handled in updateUser
    }
  };

  const handleUserCreated = (newUser) => {
    setSuccessMessage('Usuario creado exitosamente');
    setIsCreateModalOpen(false);
    fetchUsers(); // Recargar la lista de usuarios
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gestión de Usuarios</h1>
        <div className="flex space-x-2">
        <button
          onClick={fetchUsers}
          className="flex items-center text-primary hover:text-primary-dark"
        >
          <ArrowPathIcon className="h-5 w-5 mr-1" />
          Actualizar
        </button>
          {user?.rol === 'ADMIN' && (
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="flex items-center px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
            >
              <UserPlusIcon className="h-5 w-5 mr-2" />
              Crear Usuario
            </button>
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <div className="flex items-center mb-6 relative">
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3" />
          <input
            type="text"
            placeholder="Buscar por nombre, documento o correo..."
            className="pl-10 pr-4 py-2 border rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-primary"
            value={searchTerm}
            onChange={handleSearch}
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Nombre
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Documento
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contacto
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rol
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Citas
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-medium">
                          {patient.firstName.charAt(0)}{patient.lastName.charAt(0)}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{patient.firstName} {patient.lastName}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{patient.documentType} {patient.documentId}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{patient.email}</div>
                      <div className="text-sm text-gray-500">{patient.phone}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        patient.role === 'ROLE_ADMIN' ? 'bg-purple-100 text-purple-800' :
                        patient.role === 'ROLE_DOCTOR' ? 'bg-green-100 text-green-800' :
                        patient.role === 'ROLE_ASSISTANT' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {patient.role === 'ROLE_ADMIN' ? 'Administrador' :
                         patient.role === 'ROLE_DOCTOR' ? 'Doctor' :
                         patient.role === 'ROLE_ASSISTANT' ? 'Asistente' :
                         'Paciente'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                        {patient.appointments?.length || 0} citas
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handleEdit(patient)}
                        className="text-indigo-600 hover:text-indigo-900 mr-3"
                      >
                        <PencilIcon className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => deleteUser(patient.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <TrashIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}

                {filteredPatients.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                      No se encontraron pacientes
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal de edición */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg shadow-xl p-6 w-full max-w-2xl"
          >
            <h2 className="text-xl font-bold mb-4">Editar Usuario</h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nombre</label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Apellido</label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Documento</label>
                  <select
                    name="documentType"
                    value={formData.documentType}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                  >
                    <option value="CC">Cédula de Ciudadanía</option>
                    <option value="CE">Cédula de Extranjería</option>
                    <option value="TI">Tarjeta de Identidad</option>
                    <option value="PP">Pasaporte</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Número de Documento</label>
                  <input
                    type="text"
                    name="documentId"
                    value={formData.documentId}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Teléfono</label>
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Dirección</label>
                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de Nacimiento</label>
                  <input
                    type="date"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleInputChange}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark"
                >
                  Guardar Cambios
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Modal de creación de usuario */}
      {isCreateModalOpen && (
        <CreateUserForm
          onClose={() => setIsCreateModalOpen(false)}
          onUserCreated={handleUserCreated}
        />
      )}
    </div>
  );
};

export default UserManagement;
