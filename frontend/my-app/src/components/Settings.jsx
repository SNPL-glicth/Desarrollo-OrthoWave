import React, { useState } from 'react';
import { UserCircleIcon, Cog6ToothIcon } from '@heroicons/react/24/outline';
import { BellIcon, ShieldCheckIcon, PaintBrushIcon } from '@heroicons/react/24/outline';

const Settings = () => {
  const [settings, setSettings] = useState({
    notifications: {
      email: true,
      push: false,
      sms: false,
    },
    appearance: {
      theme: 'light',
      language: 'es',
      fontSize: 'normal',
    },
    privacy: {
      showProfile: true,
      showEmail: false,
      twoFactorAuth: false,
    },
  });

  const handleNotificationChange = (type) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [type]: !prev.notifications[type],
      },
    }));
  };

  const handleAppearanceChange = (field, value) => {
    setSettings(prev => ({
      ...prev,
      appearance: {
        ...prev.appearance,
        [field]: value,
      },
    }));
  };

  const handlePrivacyChange = (field) => {
    setSettings(prev => ({
      ...prev,
      privacy: {
        ...prev.privacy,
        [field]: !prev.privacy[field],
      },
    }));
  };

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-gray-900 mb-6">Configuración</h2>

      {/* Notificaciones */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex items-center mb-4">
          <BellIcon className="h-6 w-6 text-primary mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Notificaciones</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Notificaciones por email</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={settings.notifications.email}
                onChange={() => handleNotificationChange('email')}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-light rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Notificaciones push</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={settings.notifications.push}
                onChange={() => handleNotificationChange('push')}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-light rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Notificaciones SMS</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={settings.notifications.sms}
                onChange={() => handleNotificationChange('sms')}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-light rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Apariencia */}
      <div className="bg-white shadow rounded-lg p-6 mb-6">
        <div className="flex items-center mb-4">
          <PaintBrushIcon className="h-6 w-6 text-primary mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Apariencia</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tema</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              value={settings.appearance.theme}
              onChange={(e) => handleAppearanceChange('theme', e.target.value)}
            >
              <option value="light">Claro</option>
              <option value="dark">Oscuro</option>
              <option value="system">Sistema</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Idioma</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              value={settings.appearance.language}
              onChange={(e) => handleAppearanceChange('language', e.target.value)}
            >
              <option value="es">Español</option>
              <option value="en">English</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tamaño de fuente</label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
              value={settings.appearance.fontSize}
              onChange={(e) => handleAppearanceChange('fontSize', e.target.value)}
            >
              <option value="small">Pequeño</option>
              <option value="normal">Normal</option>
              <option value="large">Grande</option>
            </select>
          </div>
        </div>
      </div>

      {/* Privacidad y Seguridad */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex items-center mb-4">
          <ShieldCheckIcon className="h-6 w-6 text-primary mr-2" />
          <h3 className="text-lg font-medium text-gray-900">Privacidad y Seguridad</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Mostrar perfil público</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={settings.privacy.showProfile}
                onChange={() => handlePrivacyChange('showProfile')}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-light rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Mostrar email público</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={settings.privacy.showEmail}
                onChange={() => handlePrivacyChange('showEmail')}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-light rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-gray-700">Autenticación de dos factores</span>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                className="sr-only peer"
                checked={settings.privacy.twoFactorAuth}
                onChange={() => handlePrivacyChange('twoFactorAuth')}
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-light rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings; 