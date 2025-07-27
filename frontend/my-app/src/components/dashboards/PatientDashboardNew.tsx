import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay, isToday } from 'date-fns';
import { es } from 'date-fns/locale';

// Interfaz para citas
interface Cita {
  id: number;
  fecha: string;
  hora: string;
  doctor: string;
  estado: 'Confirmada' | 'Completada' | 'Cancelada' | 'Pendiente';
  consultorio?: string;
}

// Component para el User Account Modal (sin botón "mis pacientes")
interface UserAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: {
    name: string;
    email: string;
    avatar?: string;
  };
  onSignOut: () => void;
}

const UserAccountModal: React.FC<UserAccountModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onSignOut
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
      <div className="absolute top-16 right-6 z-50 w-80 bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
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
              <div className="w-full h-full bg-blue-500 flex items-center justify-center text-white text-2xl font-medium">
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

const PatientDashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(15); // Día seleccionado en el calendario
  
  // Datos de ejemplo para citas
  const [proximaCita] = useState<Cita>({
    id: 1,
    fecha: '28 de junio de 2025',
    hora: '10:00 AM',
    doctor: 'Dr. García',
    estado: 'Confirmada',
    consultorio: 'Consultorio'
  });
  
  const [historialCitas] = useState<Cita[]>([
    {
      id: 2,
      fecha: '14 de junio de 2025',
      hora: '',
      doctor: 'Dr. García',
      estado: 'Completada'
    },
    {
      id: 3,
      fecha: '30 de mayo de 2025',
      hora: '',
      doctor: 'Dr. García',
      estado: 'Cancelada'
    }
  ]);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleUserMenuToggle = () => {
    setIsUserMenuOpen(!isUserMenuOpen);
  };

  const handleNavigateToAgendar = () => {
    navigate('/dashboard/patient/agendar');
  };

  const renderCalendar = () => {
    const startOfCurrentMonth = startOfMonth(currentDate);
    const endOfCurrentMonth = endOfMonth(currentDate);
    const days = eachDayOfInterval({ start: startOfCurrentMonth, end: endOfCurrentMonth });

    // Días de la semana
    const weekDays = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

    return (
      <div className="space-y-2">
        {/* Header de días de la semana */}
        <div className="grid grid-cols-7 gap-1 mb-2">
          {weekDays.map((day, index) => (
            <div key={index} className="text-center text-sm font-medium text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>
        
        {/* Días del mes */}
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => (
            <button
              key={index}
              onClick={() => setSelectedDate(day.getDate())}
              className={`w-8 h-8 flex items-center justify-center rounded text-sm
                ${isSameMonth(day, currentDate) ? 'text-black' : 'text-gray-400'}
                ${day.getDate() === selectedDate ? 'bg-blue-600 text-white rounded-full' : ''}
                ${isToday(day) ? 'border border-blue-600' : ''}
                hover:bg-gray-100`}
            >
              {format(day, 'd')}
            </button>
          ))}
        </div>
      </div>
    );
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Cargando...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto flex justify-between items-center py-4 px-6">
          <div className="flex items-center space-x-4">
            <img className="h-8" src="/images/White logo - no background_page-0001.webp" alt="OrtoWhave" />
            <h1 className="text-2xl font-semibold text-gray-800">Hola, {user.nombre}</h1>
          </div>
          
          <div className="relative">
            <button
              onClick={handleUserMenuToggle}
              className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium hover:bg-blue-700 transition-colors"
            >
              {user.nombre?.charAt(0)?.toUpperCase() || 'U'}
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-8 px-6">
        <div className="flex gap-8">
          {/* Sidebar */}
          <aside className="w-64 space-y-6">
            <nav className="space-y-2">
              <button className="w-full flex items-center space-x-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>Inicio</span>
              </button>
              
              <button className="w-full flex items-center space-x-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <span>Mi perfil</span>
              </button>
            </nav>

            {/* Contactar */}
            <div className="pt-6 border-t border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-3">Contactar</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                  </svg>
                  <span>(+34) 123 456 789</span>
                </div>
                <div className="flex items-center space-x-2">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span>info@ortowhave.com</span>
                </div>
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 space-y-6">
            {/* Próxima cita */}
            <section className="bg-white rounded-lg shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Próxima cita</h2>
              <div className="space-y-2">
                <p className="text-2xl font-semibold text-gray-900">{proximaCita.fecha}</p>
                <p className="text-lg text-gray-600">{proximaCita.hora}</p>
                <p className="text-gray-600">{proximaCita.doctor}</p>
                <p className="text-gray-600">{proximaCita.consultorio}</p>
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                  {proximaCita.estado}
                </span>
              </div>
            </section>

            {/* Botón Agendar nueva cita */}
            <button
              onClick={handleNavigateToAgendar}
              className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-sm"
            >
              Agendar nueva cita
            </button>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Calendario */}
              <section className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-4">
                  <button 
                    onClick={() => setCurrentDate(subMonths(currentDate, 1))} 
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {format(currentDate, 'MMMM \'de\' yyyy', { locale: es })}
                  </h2>
                  <button 
                    onClick={() => setCurrentDate(addMonths(currentDate, 1))} 
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
                {renderCalendar()}
              </section>

              {/* Historial de citas */}
              <section className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Historial de citas</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-4 text-sm font-medium text-gray-500 border-b border-gray-200 pb-2">
                    <div>Fecha</div>
                    <div>Doctor</div>
                    <div>Estado</div>
                  </div>
                  {historialCitas.map((cita) => (
                    <div key={cita.id} className="grid grid-cols-3 gap-4 text-sm">
                      <div className="text-gray-900">{cita.fecha}</div>
                      <div className="text-gray-600">{cita.doctor}</div>
                      <div>
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium
                          ${cita.estado === 'Completada' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'}`}>
                          {cita.estado}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            </div>
          </main>
        </div>
      </div>

      {/* User Account Modal */}
      <UserAccountModal
        isOpen={isUserMenuOpen}
        onClose={() => setIsUserMenuOpen(false)}
        currentUser={{
          name: user.nombre || user.email,
          email: user.email,
          avatar: undefined,
        }}
        onSignOut={handleLogout}
      />
    </div>
  );
};

export default PatientDashboard;
