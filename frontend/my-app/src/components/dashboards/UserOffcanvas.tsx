import React from 'react';
import { User } from '../../types/User';

interface UserOffcanvasProps {
  show: boolean;
  onClose: () => void;
  user: User | null;
}

const UserOffcanvas: React.FC<UserOffcanvasProps> = ({ show, onClose, user }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 overflow-hidden z-50">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={onClose}></div>
        <div className="fixed inset-y-0 right-0 pl-10 max-w-full flex">
          <div className="relative w-96">
            <div className="h-full flex flex-col py-6 bg-white shadow-xl">
              <div className="px-4 sm:px-6">
                <div className="flex items-start justify-between">
                  <h2 className="text-lg font-medium text-gray-900">Perfil de Usuario</h2>
                  <button
        onClick={onClose}
                    className="rounded-md text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    <span className="sr-only">Cerrar panel</span>
                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              <div className="mt-6 relative flex-1 px-4 sm:px-6">
                {user ? (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Nombre</h3>
                      <p className="mt-1 text-sm text-gray-900">{user.nombre} {user.apellido}</p>
        </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Email</h3>
                      <p className="mt-1 text-sm text-gray-900">{user.email}</p>
            </div>
            <div>
                      <h3 className="text-sm font-medium text-gray-500">Rol</h3>
                      <p className="mt-1 text-sm text-gray-900">{user.rol}</p>
                    </div>
                    {user.telefono && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Teléfono</h3>
                        <p className="mt-1 text-sm text-gray-900">{user.telefono}</p>
                      </div>
                    )}
                    {user.direccion && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Dirección</h3>
                        <p className="mt-1 text-sm text-gray-900">{user.direccion}</p>
                      </div>
                    )}
                    {user.especialidad && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500">Especialidad</h3>
                        <p className="mt-1 text-sm text-gray-900">{user.especialidad}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-gray-500">No hay información disponible</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserOffcanvas;
