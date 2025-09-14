import React from 'react';

interface UserAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: {
    name: string;
    email: string;
    avatar?: string;
  };
  onSignOut: () => void;
  onNavigateToPatients?: () => void;
  onNavigateToHome?: () => void;
}

const UserAccountModal: React.FC<UserAccountModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSignOut,
  onNavigateToPatients,
  onNavigateToHome
}) => {
  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 z-40 bg-black bg-opacity-0"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="absolute top-16 right-6 z-50 w-80 bg-gray-50 rounded-lg shadow-lg border border-gray-200 overflow-hidden">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 p-1 rounded-full hover:bg-gray-100 transition-colors"
        >
          <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Current user section */}
        <div className="p-6 text-center">
          {/* User avatar */}
          <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden">
            {currentUser.avatar ? (
              <img 
                src={currentUser.avatar} 
                alt={currentUser.name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-500 flex items-center justify-center text-white text-2xl font-medium">
                {currentUser.name?.charAt(0)?.toUpperCase() || 'U'}
              </div>
            )}
          </div>

          {/* User info */}
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            ¡Hola, {currentUser.name}!
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            {currentUser.email}
          </p>

          {/* Action buttons */}
          <div className="space-y-2">
            {onNavigateToPatients && (
              <button
                onClick={onNavigateToPatients}
                className="w-full px-4 py-2 text-sm font-medium text-gray-600 border border-gray-600 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Ir a Mis Pacientes
              </button>
            )}
            {onNavigateToHome && (
              <button
                onClick={onNavigateToHome}
                className="w-full px-4 py-2 text-sm font-medium text-gray-600 bg-gray-50 border border-gray-200 rounded-lg hover:bg-gray-100 transition-colors flex items-center justify-center"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Volver al Inicio
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 px-4 py-3">
          <div className="flex justify-between items-center text-xs text-gray-500">
            <div className="flex space-x-4">
              <button className="hover:text-gray-700 transition-colors">
                Política de Privacidad
              </button>
              <span>•</span>
              <button className="hover:text-gray-700 transition-colors">
                Términos del Servicio
              </button>
            </div>
          </div>
          
          {/* Sign out button */}
          <button
            onClick={onSignOut}
            className="w-full mt-3 px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
          >
            Cerrar sesión
          </button>
        </div>
      </div>
    </>
  );
};

export default UserAccountModal;
