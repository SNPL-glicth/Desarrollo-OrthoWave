import React, { useState } from 'react';
import { Cog6ToothIcon, BellIcon, UserCircleIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';

const SettingsModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('general');

  if (!isOpen) return null;

  const renderGeneralSettings = () => (
    <div className="space-y-4">
      <div>
        <label htmlFor="clinicName" className="block text-sm font-medium text-gray-700">
          Nombre de la Clínica
        </label>
        <input
          type="text"
          id="clinicName"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          defaultValue="Orto White"
        />
      </div>
      <div>
        <label htmlFor="timezone" className="block text-sm font-medium text-gray-700">
          Zona Horaria
        </label>
        <select
          id="timezone"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          defaultValue="America/Bogota"
        >
          <option value="America/Bogota">Bogotá (GMT-5)</option>
          <option value="America/Mexico_City">Ciudad de México (GMT-6)</option>
          <option value="America/Santiago">Santiago (GMT-4)</option>
        </select>
      </div>
      <div>
        <label htmlFor="language" className="block text-sm font-medium text-gray-700">
          Idioma
        </label>
        <select
          id="language"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
          defaultValue="es"
        >
          <option value="es">Español</option>
          <option value="en">English</option>
          <option value="pt">Português</option>
        </select>
      </div>
    </div>
  );

  const renderNotificationSettings = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-700">Notificaciones por Email</p>
          <p className="text-sm text-gray-500">Recibe actualizaciones importantes por correo</p>
        </div>
        <button
          type="button"
          className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 bg-primary"
          role="switch"
          aria-checked="true"
        >
          <span className="translate-x-5 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
        </button>
      </div>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-700">Notificaciones Push</p>
          <p className="text-sm text-gray-500">Recibe notificaciones en tiempo real</p>
        </div>
        <button
          type="button"
          className="relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 bg-primary"
          role="switch"
          aria-checked="true"
        >
          <span className="translate-x-5 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
        </button>
      </div>
    </div>
  );

  const renderSecuritySettings = () => (
    <div className="space-y-4">
      <div>
        <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700">
          Contraseña Actual
        </label>
        <input
          type="password"
          id="currentPassword"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
          Nueva Contraseña
        </label>
        <input
          type="password"
          id="newPassword"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
        />
      </div>
      <div>
        <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
          Confirmar Nueva Contraseña
        </label>
        <input
          type="password"
          id="confirmPassword"
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary focus:ring-primary sm:text-sm"
        />
      </div>
      <div className="pt-4">
        <button
          type="button"
          className="inline-flex justify-center rounded-md border border-transparent bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        >
          Actualizar Contraseña
        </button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full mx-4 p-6">
        <div className="flex justify-between items-start mb-4">
          <h3 className="text-xl font-semibold text-gray-900">
            Configuración
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('general')}
              className={`${
                activeTab === 'general'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <Cog6ToothIcon className="h-5 w-5 mr-2" />
              General
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`${
                activeTab === 'notifications'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <BellIcon className="h-5 w-5 mr-2" />
              Notificaciones
            </button>
            <button
              onClick={() => setActiveTab('security')}
              className={`${
                activeTab === 'security'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm flex items-center`}
            >
              <ShieldCheckIcon className="h-5 w-5 mr-2" />
              Seguridad
            </button>
          </nav>
        </div>

        <div className="mt-6">
          {activeTab === 'general' && renderGeneralSettings()}
          {activeTab === 'notifications' && renderNotificationSettings()}
          {activeTab === 'security' && renderSecuritySettings()}
        </div>

        <div className="mt-6 flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800"
          >
            Cancelar
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark"
          >
            Guardar Cambios
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsModal; 