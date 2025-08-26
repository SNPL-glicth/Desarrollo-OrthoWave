import React, { useState, useEffect } from 'react';
import { ShoppingCart } from 'lucide-react';
import { motion } from 'framer-motion';
import { productsService } from '../../services/productsService';

interface FloatingCartButtonProps {
  onClick: () => void;
  updateTrigger?: number; // Trigger para forzar actualización
}

const FloatingCartButton: React.FC<FloatingCartButtonProps> = ({ onClick, updateTrigger }) => {
  const [itemCount, setItemCount] = useState(0);
  const [total, setTotal] = useState(0);

  const updateCartInfo = () => {
    const count = productsService.getCartItemCount();
    const totalAmount = productsService.getCartTotal();
    setItemCount(count);
    setTotal(totalAmount);
  };

  useEffect(() => {
    updateCartInfo();
  }, [updateTrigger]); // Se actualiza cuando cambia el trigger

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  if (itemCount === 0) return null;

  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ scale: 0, opacity: 0 }}
      className="fixed bottom-6 right-6 z-40"
    >
      <motion.button
        onClick={onClick}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        className="bg-primary hover:bg-primary-dark text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-200 p-4 flex items-center gap-3 pr-6"
      >
        <div className="relative">
          <ShoppingCart size={24} />
          {itemCount > 0 && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold"
            >
              {itemCount > 99 ? '99+' : itemCount}
            </motion.div>
          )}
        </div>
        
        <div className="text-left">
          <div className="text-sm font-medium">
            {itemCount} {itemCount === 1 ? 'producto' : 'productos'}
          </div>
          <div className="text-xs opacity-90">
            {formatPrice(total)}
          </div>
        </div>
      </motion.button>
    </motion.div>
  );
};

// Hook personalizado para manejar el carrito flotante
export const useFloatingCart = () => {
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartUpdateTrigger, setCartUpdateTrigger] = useState(0);

  const openCart = () => setIsCartOpen(true);
  const closeCart = () => setIsCartOpen(false);
  const triggerCartUpdate = () => setCartUpdateTrigger(prev => prev + 1);

  return {
    isCartOpen,
    openCart,
    closeCart,
    triggerCartUpdate,
    cartUpdateTrigger
  };
};

export default FloatingCartButton;
