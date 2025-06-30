import React from 'react';
import { Link, useLocation } from 'react-router-dom';

const Navbar: React.FC = () => {
    const location = useLocation();

    const isActive = (path: string) => {
        return location.pathname === path ? 'bg-blue-700' : '';
    };

    return (
        <nav className="bg-blue-600">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between h-16">
                    <div className="flex items-center">
                        <Link to="/" className="text-white font-bold text-xl">
                            Orto-White
                        </Link>
                        
                        <div className="hidden md:block">
                            <div className="ml-10 flex items-baseline space-x-4">
                                <Link
                                    to="/appointments/new"
                                    className={`text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 ${isActive('/appointments/new')}`}
                                >
                                    Agendar Cita
                                </Link>
                                <Link
                                    to="/my-appointments"
                                    className={`text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 ${isActive('/my-appointments')}`}
                                >
                                    Mis Citas
                                </Link>
                                <Link
                                    to="/profile"
                                    className={`text-white px-3 py-2 rounded-md text-sm font-medium hover:bg-blue-700 ${isActive('/profile')}`}
                                >
                                    Mi Perfil
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar; 