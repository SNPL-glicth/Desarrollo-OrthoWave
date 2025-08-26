import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bars3Icon, 
  XMarkIcon, 
  UserIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const navigation = [
  { name: 'Inicio', href: '/' },
  { name: 'Servicios', href: '/#servicios' },
  { name: 'Productos', href: '/#productos' },
  { name: 'Nosotros', href: '/#nosotros' },
  { name: 'Contacto', href: '/#contacto' },
];

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, logout, user } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 10;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [scrolled]);


  const scrollToSection = (e, href) => {
    e.preventDefault();
    
    const handleScroll = () => {
      const sectionId = href.replace('/#', '');
      const element = document.getElementById(sectionId);
      if (element) {
        const navbarHeight = 64; // altura del navbar en píxeles
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - navbarHeight;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
    };

    if (location.pathname !== '/') {
      navigate('/');
      // Esperar a que la navegación se complete y el nuevo contenido se monte
      setTimeout(handleScroll, 100);
    } else {
      handleScroll();
    }

    setIsOpen(false);
  };


  const renderAuthButtons = () => {
    if (isAuthenticated) {
      return (
        <div className="flex items-center">
          <Link
            to={user?.role === 'administrador' ? '/dashboard/admin' : (user?.role === 'doctor' ? '/dashboard/doctor' : '/dashboard/patient')}
            className="flex items-center text-gray-700 hover:text-primary transition-colors"
          >
            <UserIcon className="h-6 w-6 mr-1" />
            <span className="hidden md:block">{user?.firstName || 'Mi cuenta'}</span>
          </Link>
          <button
            onClick={() => logout(navigate)}
            className="ml-4 flex items-center text-gray-700 hover:text-primary transition-colors"
            title="Cerrar sesión"
          >
            <ArrowRightOnRectangleIcon className="h-6 w-6" />
            <span className="hidden md:block ml-1">Salir</span>
          </button>
        </div>
      );
    } else {
      return (
        <div className="flex items-center space-x-3">
          <Link
            to="/login"
            className="px-5 py-1.5 text-sm uppercase tracking-wider font-medium transition-all duration-300 text-primary border-b-2 border-primary hover:bg-primary/10"
            onClick={() => {
              setIsOpen(false);
              setTimeout(() => {
                window.scrollTo({
                  top: 0,
                  behavior: 'instant'
                });
              }, 100);
            }}
          >
            Iniciar sesión
          </Link>
          <Link
            to="/register"
            className="px-5 py-1.5 text-sm uppercase tracking-wider font-medium transition-all duration-300 text-white bg-primary hover:bg-primary-dark"
            onClick={() => {
              setIsOpen(false);
              setTimeout(() => {
                window.scrollTo({
                  top: 0,
                  behavior: 'instant'
                });
              }, 100);
            }}
          >
            Crear cuenta
          </Link>
        </div>
      );
    }
  };

  return (
    <>
    <motion.nav 
      className={`fixed w-full z-50 transition-all duration-300 bg-white shadow-sm`}
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-14 sm:h-16">
          {/* Logo */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center">
              <img
                src="/images/White logo - no background_page-0001.webp"
                alt="OWC Orthowave Colombia"
                className="h-10 w-auto sm:h-12"
              />
            </Link>
          </div>

          {/* Mobile menu button - optimizado para touch */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-3 rounded-md text-gray-700 hover:text-primary focus:outline-none touch-manipulation min-h-[44px] min-w-[44px]"
              aria-expanded={isOpen}
              aria-label={isOpen ? 'Cerrar menú' : 'Abrir menú principal'}
            >
              <span className="sr-only">{isOpen ? 'Cerrar menú' : 'Abrir menú principal'}</span>
              {isOpen ? (
                <XMarkIcon className="block h-6 w-6" aria-hidden="true" />
              ) : (
                <Bars3Icon className="block h-6 w-6" aria-hidden="true" />
              )}
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:items-center">
            {navigation.map((item) => (
              item.href.includes('#') ? (
                <a
                  key={item.name}
                  href={item.href}
                  onClick={(e) => scrollToSection(e, item.href)}
                  className="uppercase tracking-wider px-4 py-2 text-xs font-medium transition-colors mx-1 text-gray-700 hover:text-primary"
                >
                  {item.name}
                </a>
              ) : (
                <Link
                  key={item.name}
                  to={item.href}
                  className="uppercase tracking-wider px-4 py-2 text-xs font-medium transition-colors mx-1 text-gray-700 hover:text-primary"
                >
                  {item.name}
                </Link>
              )
            ))}
          </div>

          {/* User Icons */}
          <div className="hidden md:flex items-center ml-auto">
            <div className="flex items-center space-x-4 mr-6">
              {renderAuthButtons()}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="md:hidden"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div className="px-2 pt-2 pb-3 space-y-1 bg-white shadow-lg">
              {navigation.map((item) => (
                item.href.includes('#') ? (
                  <a
                    key={item.name}
                    href={item.href}
                    onClick={(e) => scrollToSection(e, item.href)}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50"
                  >
                    {item.name}
                  </a>
                ) : (
                  <Link
                    key={item.name}
                    to={item.href}
                    className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50"
                  >
                    {item.name}
                  </Link>
                )
              ))}
              
              {/* Mobile auth buttons */}
              <div className="pt-4 pb-3 border-t border-gray-200">
                {isAuthenticated ? (
                  <div className="space-y-2">
                    <Link
                      to={user?.role === 'administrador' ? '/dashboard/admin' : (user?.role === 'doctor' ? '/dashboard/doctor' : '/dashboard/patient')}
                      className="flex items-center px-3 py-2 text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50"
                      onClick={() => setIsOpen(false)}
                    >
                      <UserIcon className="h-6 w-6 mr-2" />
                      {user?.firstName || 'Mi cuenta'}
                    </Link>
                    <button
                      onClick={() => {
                        logout(navigate);
                        setIsOpen(false);
                      }}
                      className="flex items-center w-full px-3 py-2 text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50"
                    >
                      <ArrowRightOnRectangleIcon className="h-6 w-6 mr-2" />
                      Salir
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <Link
                      to="/login"
                      className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50"
                      onClick={() => setIsOpen(false)}
                    >
                      Iniciar sesión
                    </Link>
                    <Link
                      to="/register"
                      className="block px-3 py-2 text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50"
                      onClick={() => setIsOpen(false)}
                    >
                      Crear cuenta
                    </Link>
                  </div>
                )}
              </div>

            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
    </>
  );
};

export default Navbar;
