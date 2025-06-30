import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { XMarkIcon, CreditCardIcon, TruckIcon, UserIcon } from '@heroicons/react/24/outline';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const Checkout = ({ onClose }) => {
  const { cartItems, getCartTotal, clearCart } = useCart();
  const { isAuthenticated, openAuthModal } = useAuth();
  const [step, setStep] = useState(isAuthenticated ? 1 : 0);
  const [formData, setFormData] = useState({
    // Información personal
    fullName: '',
    email: '',
    phone: '',
    // Dirección de envío
    address: '',
    city: '',
    state: '',
    zipCode: '',
    // Información de pago
    cardNumber: '',
    cardHolder: '',
    expiryDate: '',
    cvv: '',
  });
  const [loading, setLoading] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  // Actualizar el paso si el usuario inicia sesión mientras está en el checkout
  useEffect(() => {
    if (isAuthenticated && step === 0) {
      setStep(1);
    }
  }, [isAuthenticated, step]);

  const formatPrice = (price) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (step === 0) {
      // Si no está autenticado, mostrar modal de login
      openAuthModal();
      return;
    }
    
    if (step < 3) {
      setStep(step + 1);
      return;
    }
    
    // Procesar el pago
    setLoading(true);
    
    // Simulación de procesamiento de pago
    setTimeout(() => {
      setLoading(false);
      setOrderComplete(true);
      clearCart();
    }, 2000);
  };

  const steps = [
    { id: 0, name: 'Iniciar sesión', icon: UserIcon },
    { id: 1, name: 'Información personal', icon: UserIcon },
    { id: 2, name: 'Dirección de envío', icon: TruckIcon },
    { id: 3, name: 'Método de pago', icon: CreditCardIcon },
  ];

  if (orderComplete) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div 
          className="bg-white rounded-lg shadow-xl max-w-md w-full overflow-hidden"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
        >
          <div className="p-6">
            <div className="flex justify-center mb-6">
              <div className="bg-green-100 rounded-full p-3">
                <svg className="h-12 w-12 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h2 className="text-2xl font-bold text-center text-gray-900 mb-2">¡Pedido completado!</h2>
            <p className="text-center text-gray-600 mb-6">
              Tu pedido ha sido procesado correctamente. Recibirás un correo electrónico con los detalles de tu compra.
            </p>
            <button
              onClick={onClose}
              className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary-dark transition-colors font-medium"
            >
              Volver a la tienda
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <motion.div 
        className="bg-white rounded-lg shadow-xl max-w-4xl w-full overflow-hidden"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Finalizar compra</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-500"
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Pasos del checkout */}
          <div className="p-6 border-r border-gray-200 hidden md:block">
            <div className="space-y-6">
              {steps.map((s) => (
                <div 
                  key={s.id} 
                  className={`flex items-center space-x-3 ${step >= s.id ? 'text-primary' : 'text-gray-400'}`}
                >
                  <div className={`rounded-full p-1 ${step >= s.id ? 'bg-primary text-white' : 'bg-gray-200 text-gray-500'}`}>
                    <s.icon className="h-5 w-5" />
                  </div>
                  <span className={`font-medium ${step >= s.id ? 'text-gray-900' : 'text-gray-500'}`}>{s.name}</span>
                </div>
              ))}
            </div>

            {/* Resumen del carrito */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Resumen del pedido</h3>
              <div className="space-y-3">
                {cartItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-gray-600">{item.name} x {item.quantity}</span>
                    <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                  </div>
                ))}
                <div className="border-t border-gray-200 pt-3 mt-3">
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span className="text-primary">{formatPrice(getCartTotal())}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Formulario de checkout */}
          <div className="p-6 col-span-2">
            <form onSubmit={handleSubmit}>
              {step === 0 && (
                <div>
                  <p className="text-gray-600 mb-6">
                    Para continuar con la compra, por favor inicia sesión o crea una cuenta.
                  </p>
                  <button
                    type="button"
                    onClick={openAuthModal}
                    className="w-full bg-primary text-white py-3 rounded-lg hover:bg-primary-dark transition-colors font-medium"
                  >
                    Iniciar sesión / Registrarse
                  </button>
                </div>
              )}

              {step === 1 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Información personal</h3>
                  
                  <div>
                    <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                      Nombre completo
                    </label>
                    <input
                      type="text"
                      id="fullName"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                      Correo electrónico
                    </label>
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                      Teléfono
                    </label>
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                      required
                    />
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Dirección de envío</h3>
                  
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                      Dirección
                    </label>
                    <input
                      type="text"
                      id="address"
                      name="address"
                      value={formData.address}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                        Ciudad
                      </label>
                      <input
                        type="text"
                        id="city"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                        Departamento
                      </label>
                      <input
                        type="text"
                        id="state"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                        required
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="zipCode" className="block text-sm font-medium text-gray-700 mb-1">
                      Código postal
                    </label>
                    <input
                      type="text"
                      id="zipCode"
                      name="zipCode"
                      value={formData.zipCode}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                      required
                    />
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-4">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Información de pago</h3>
                  
                  <div>
                    <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">
                      Número de tarjeta
                    </label>
                    <input
                      type="text"
                      id="cardNumber"
                      name="cardNumber"
                      value={formData.cardNumber}
                      onChange={handleChange}
                      placeholder="1234 5678 9012 3456"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                      required
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="cardHolder" className="block text-sm font-medium text-gray-700 mb-1">
                      Titular de la tarjeta
                    </label>
                    <input
                      type="text"
                      id="cardHolder"
                      name="cardHolder"
                      value={formData.cardHolder}
                      onChange={handleChange}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">
                        Fecha de expiración
                      </label>
                      <input
                        type="text"
                        id="expiryDate"
                        name="expiryDate"
                        value={formData.expiryDate}
                        onChange={handleChange}
                        placeholder="MM/AA"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">
                        CVV
                      </label>
                      <input
                        type="text"
                        id="cvv"
                        name="cvv"
                        value={formData.cvv}
                        onChange={handleChange}
                        placeholder="123"
                        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                        required
                      />
                    </div>
                  </div>

                  {/* Resumen del carrito para móviles */}
                  <div className="mt-6 pt-6 border-t border-gray-200 md:hidden">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Resumen del pedido</h3>
                    <div className="space-y-3">
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-gray-600">{item.name} x {item.quantity}</span>
                          <span className="font-medium">{formatPrice(item.price * item.quantity)}</span>
                        </div>
                      ))}
                      <div className="border-t border-gray-200 pt-3 mt-3">
                        <div className="flex justify-between font-medium">
                          <span>Total</span>
                          <span className="text-primary">{formatPrice(getCartTotal())}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-8 flex justify-between">
                {step > 0 && (
                  <button
                    type="button"
                    onClick={() => setStep(step - 1)}
                    className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Atrás
                  </button>
                )}
                
                <button
                  type="submit"
                  className={`px-6 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
                  disabled={loading}
                >
                  {loading ? (
                    <span className="flex items-center">
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Procesando...
                    </span>
                  ) : step === 3 ? (
                    'Confirmar pedido'
                  ) : (
                    'Continuar'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Checkout; 