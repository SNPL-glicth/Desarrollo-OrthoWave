import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Bars3Icon, 
  XMarkIcon, 
  ShoppingCartIcon, 
  UserIcon,
  TrashIcon,
  PlusIcon,
  MinusIcon,
  ArrowRightOnRectangleIcon
} from '@heroicons/react/24/outline';
import { useCart } from '../context/CartContext';
import { useAuth, withAuthNavigation } from '../context/AuthContext';
import Checkout from './Checkout';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const navigation = [
  { name: 'Inicio', href: '/' },
  { name: 'Servicios', href: '/#servicios' },
  { name: 'Productos', href: '/#productos' },
  { name: 'Nosotros', href: '/#nosotros' },
  { name: 'Contacto', href: '/#contacto' },
];

const NavbarBase = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const cartRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, logout, user } = useAuth();
  const {
    cartItems,
    isCartOpen,
    setIsCartOpen,
    removeFromCart,
    updateQuantity,
    getCartTotal,
    getCartCount,
    isCheckoutOpen,
    proceedToCheckout,
    closeCheckout
  } = useCart();

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

  // Cerrar el carrito al hacer clic fuera de él
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (cartRef.current && !cartRef.current.contains(event.target)) {
        setIsCartOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [setIsCartOpen]);

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

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
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

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-primary focus:outline-none"
              aria-expanded="false"
            >
              <span className="sr-only">Abrir menú principal</span>
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

          {/* User and Cart Icons */}
          <div className="hidden md:flex items-center ml-auto">
            <div className="flex items-center space-x-4 mr-6">
              {renderAuthButtons()}
              
              <div className="relative">
                <button 
                  className="p-2 rounded-none text-gray-700 hover:text-primary transition-colors relative"
                  aria-label="Carrito de compras"
                  onClick={() => setIsCartOpen(!isCartOpen)}
                >
                  <ShoppingCartIcon className="h-6 w-6" />
                  {getCartCount() > 0 && (
                    <span className="absolute -top-1 -right-1 bg-secondary text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {getCartCount()}
                    </span>
                  )}
                </button>

                {/* Cart Dropdown */}
                <AnimatePresence>
                  {isCartOpen && (
                    <motion.div
                      ref={cartRef}
                      className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-none shadow-xl"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                    >
                      <div className="p-4 border-b border-gray-200">
                        <div className="flex justify-between items-center">
                          <h3 className="text-lg font-semibold text-gray-900">Tu carrito</h3>
                          <button
                            onClick={() => setIsCartOpen(false)}
                            className="text-gray-400 hover:text-gray-500"
                          >
                            <XMarkIcon className="h-5 w-5" />
                          </button>
                        </div>
                      </div>

                      <div className="max-h-96 overflow-y-auto">
                        {cartItems.length === 0 ? (
                          <div className="p-4 text-center text-gray-500">
                            Tu carrito está vacío
                          </div>
                        ) : (
                          <div className="p-4 space-y-4">
                            {cartItems.map((item) => (
                              <div key={item.id} className="flex items-center space-x-4">
                                <div className="flex-shrink-0 w-16 h-16 bg-gray-100 rounded-none overflow-hidden">
                                  <img
                                    src={item.image}
                                    alt={item.name}
                                    className="w-full h-full object-cover object-center"
                                  />
                                </div>
                                <div className="flex-1">
                                  <h4 className="text-sm font-medium text-gray-900">{item.name}</h4>
                                  <p className="text-sm text-gray-500">{formatPrice(item.price)}</p>
                                  <div className="flex items-center space-x-2 mt-1">
                                    <button
                                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                      className="text-gray-500 hover:text-gray-700"
                                    >
                                      <MinusIcon className="h-4 w-4" />
                                    </button>
                                    <span className="text-sm text-gray-900">{item.quantity}</span>
                                    <button
                                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                      className="text-gray-500 hover:text-gray-700"
                                    >
                                      <PlusIcon className="h-4 w-4" />
                                    </button>
                                  </div>
                                </div>
                                <button
                                  onClick={() => removeFromCart(item.id)}
                                  className="text-gray-400 hover:text-red-500"
                                >
                                  <TrashIcon className="h-5 w-5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {cartItems.length > 0 && (
                        <div className="p-4 border-t border-gray-200">
                          <div className="flex justify-between items-center mb-4">
                            <span className="text-base font-medium text-gray-900">Total</span>
                            <span className="text-lg font-bold text-secondary">
                              {formatPrice(getCartTotal())}
                            </span>
                          </div>
                          <button
                              onClick={proceedToCheckout}
                            className="w-full bg-primary text-white py-2 uppercase tracking-wider text-sm font-medium hover:bg-primary-dark transition-colors"
                          >
                            Proceder al pago
                          </button>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
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

              {/* Mobile cart button */}
              <div className="pt-2 pb-3 border-t border-gray-200">
                <button
                  onClick={() => {
                    setIsCartOpen(!isCartOpen);
                    setIsOpen(false);
                  }}
                  className="flex items-center w-full px-3 py-2 text-base font-medium text-gray-700 hover:text-primary hover:bg-gray-50"
                >
                  <ShoppingCartIcon className="h-6 w-6 mr-2" />
                  Carrito ({getCartCount()})
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
      
      {/* Checkout Modal */}
      <AnimatePresence>
        {isCheckoutOpen && <Checkout onClose={closeCheckout} />}
      </AnimatePresence>
    </>
  );
};

// Exportamos el componente con el HOC aplicado
const Navbar = withAuthNavigation(NavbarBase);
export default Navbar; 