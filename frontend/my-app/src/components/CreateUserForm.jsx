import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';

const CreateUserForm = ({ onClose, onUserCreated }) => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    nombre: '',
    apellido: '',
    email: '',
    password: '',
    telefono: '',
    direccion: '',
    rolId: 2 // Por defecto doctor
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

      // Usar el endpoint de admin para crear usuarios sin verificación
      const response = await fetch('http://localhost:4000/users/admin/crear-usuario', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const data = await response.json();
        toast.success('Usuario creado exitosamente (sin verificación requerida)');
        onUserCreated && onUserCreated(data);

        // Limpiar formulario
        setFormData({
          nombre: '',
          apellido: '',
          email: '',
          password: '',
          telefono: '',
          direccion: '',
          rolId: 2
        });

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

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
        <div className="mt-3">
          <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
            Crear Nuevo Usuario (Sin Verificación)
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Los usuarios creados por admin no requieren verificación de email
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Nombre</label>
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
              <label className="block text-sm font-medium text-gray-700">Apellido</label>
              <input
                type="text"
                name="apellido"
                value={formData.apellido}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
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
              <label className="block text-sm font-medium text-gray-700">Contraseña</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              />
            </div>

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
              <label className="block text-sm font-medium text-gray-700">Dirección</label>
              <input
                type="text"
                name="direccion"
                value={formData.direccion}
                onChange={handleInputChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">Rol</label>
              <select
                name="rolId"
                value={formData.rolId}
                onChange={handleInputChange}
                required
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
              >
                {roles.map(rol => (
                  <option key={rol.id} value={rol.id}>
                    {rol.nombre.charAt(0).toUpperCase() + rol.nombre.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-green-50 border border-green-200 rounded-md p-3">
              <p className="text-sm text-green-700">
                ✅ Los usuarios creados estarán verificados automáticamente
              </p>
            </div>

            <div className="flex justify-end space-x-3 mt-5">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-white bg-primary hover:bg-primary-dark rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50"
              >
                {loading ? 'Creando...' : 'Crear Usuario'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateUserForm;
