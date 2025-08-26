import React, { useState, useEffect } from 'react';
import { CartItem, productsService } from '../../services/productsService';
import { ShoppingCart, X, Plus, Minus, Trash2, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';

interface ShoppingCartProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdate: () => void;
}

const ShoppingCartComponent: React.FC<ShoppingCartProps> = ({ isOpen, onClose, onUpdate }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      loadCart();
    }
  }, [isOpen]);

  const loadCart = () => {
    const cart = productsService.getCart();
    setCartItems(cart);
  };

  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity === 0) {
      removeItem(productId);
      return;
    }

    // Verificar límite de 10 productos total
    const currentCart = productsService.getCart();
    currentCart.find(item => item.product.id === productId);
    const otherItemsTotal = currentCart
      .filter(item => item.product.id !== productId)
      .reduce((sum, item) => sum + item.quantity, 0);
    
    if (otherItemsTotal + newQuantity > 10) {
      toast.error('No puedes tener más de 10 productos en el carrito');
      return;
    }

    productsService.updateCartQuantity(productId, newQuantity);
    loadCart();
    onUpdate();
  };

  const removeItem = (productId: number) => {
    productsService.removeFromCart(productId);
    loadCart();
    onUpdate();
    toast.success('Producto eliminado del carrito');
  };

  const clearCart = () => {
    productsService.clearCart();
    loadCart();
    onUpdate();
    toast.success('Carrito vaciado');
  };

  const reserveProducts = async () => {
    if (!user) {
      toast.error('Debes iniciar sesión para reservar productos');
      navigate('/login');
      return;
    }

    if (cartItems.length === 0) {
      toast.error('El carrito está vacío');
      return;
    }

    setLoading(true);
    try {
      await productsService.reserveProducts(notes);
      setCartItems([]);
      setNotes('');
      onUpdate();
      onClose();
      toast.success('¡Productos reservados exitosamente!');
    } catch (error: any) {
      console.error('Error reserving products:', error);
      toast.error(error.response?.data?.message || 'Error al reservar productos');
    } finally {
      setLoading(false);
    }
  };

  const getTotal = () => {
    return cartItems.reduce((total, item) => total + (item.product.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0);
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black bg-opacity-50"
          onClick={onClose}
        />

        {/* Cart panel */}
        <motion.div
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="absolute right-0 top-0 h-full w-full max-w-md bg-white shadow-xl flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b">
            <div className="flex items-center gap-2">
              <ShoppingCart size={24} />
              <h2 className="text-xl font-bold">Carrito ({getTotalItems()})</h2>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X size={20} />
            </button>
          </div>

          {/* Cart items */}
          <div className="flex-1 overflow-y-auto p-6">
            {cartItems.length === 0 ? (
              <div className="text-center py-12">
                <ShoppingCart size={64} className="mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-600 mb-2">
                  Tu carrito está vacío
                </h3>
                <p className="text-gray-500">
                  Agrega productos para empezar tu reserva
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <motion.div
                    key={item.product.id}
                    layout
                    className="flex gap-4 p-4 bg-gray-50 rounded-lg"
                  >
                    {/* Product image */}
                    <img
                      src={item.product.image_url}
                      alt={item.product.name}
                      className="w-16 h-16 object-cover rounded-lg"
                      onError={(e) => {
                        e.currentTarget.src = 'https://via.placeholder.com/64x64/E5E7EB/9CA3AF?text=Sin+Imagen';
                      }}
                    />

                    {/* Product info */}
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800 mb-1 line-clamp-2">
                        {item.product.name}
                      </h4>
                      <div className="text-sm text-gray-500 mb-2">
                        {formatPrice(item.product.price)} c/u
                      </div>
                      
                      {/* Quantity controls */}
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 bg-white rounded-full px-3 py-1">
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                            className="p-1 hover:bg-gray-100 rounded-full"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="font-medium min-w-[20px] text-center">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                            className="p-1 hover:bg-gray-100 rounded-full"
                            disabled={item.quantity >= item.product.stock}
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        <button
                          onClick={() => removeItem(item.product.id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                ))}

                {/* Notes */}
                <div className="mt-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notas adicionales (opcional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Comentarios sobre tu reserva..."
                    className="w-full p-3 border border-gray-300 rounded-lg resize-none h-20 focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          {cartItems.length > 0 && (
            <div className="border-t p-6">
              {/* Total */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-lg font-medium text-gray-700">Total:</span>
                <span className="text-2xl font-bold text-primary">
                  {formatPrice(getTotal())}
                </span>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={reserveProducts}
                  disabled={loading}
                  className="w-full bg-primary hover:bg-primary-dark text-white py-3 px-4 rounded-lg font-medium transition-colors disabled:bg-primary-400 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
                  ) : (
                    <>
                      <CheckCircle size={20} />
                      Reservar Productos
                    </>
                  )}
                </motion.button>

                <button
                  onClick={clearCart}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium transition-colors"
                >
                  Vaciar Carrito
                </button>
              </div>

              {/* Info message */}
              <div className="mt-4 p-3 bg-primary-50 rounded-lg">
                <p className="text-sm text-primary-700">
                  <strong>Nota:</strong> Los productos serán reservados y deberás confirmar 
                  su compra de manera presencial en la clínica.
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default ShoppingCartComponent;
