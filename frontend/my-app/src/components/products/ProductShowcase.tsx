import React, { useState, useEffect } from 'react';
import { Product, productsService } from '../../services/productsService';
import { ShoppingCart, Plus, Minus, Star, Package, Heart } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface ProductShowcaseProps {
  onCartUpdate?: () => void;
}

const ProductShowcase: React.FC<ProductShowcaseProps> = ({ onCartUpdate }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [cartItems, setCartItems] = useState<{[key: number]: number}>({});

  const categories = [
    { id: 'all', name: 'Todos los productos', icon: Package },
    { id: 'Ortodoncia', name: 'Ortodoncia', icon: Star },
    { id: 'Higiene', name: 'Higiene Dental', icon: Heart }
  ];

  useEffect(() => {
    loadProducts();
    loadCartState();
  }, [selectedCategory]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      let productsData: Product[];
      
      if (selectedCategory === 'all') {
        productsData = await productsService.getAllProducts();
      } else {
        productsData = await productsService.getProductsByCategory(selectedCategory);
      }
      
      setProducts(productsData);
    } catch (error) {
      console.error('Error loading products:', error);
      toast.error('Error al cargar productos');
    } finally {
      setLoading(false);
    }
  };

  const loadCartState = () => {
    const cart = productsService.getCart();
    const cartState: {[key: number]: number} = {};
    cart.forEach(item => {
      cartState[item.product.id] = item.quantity;
    });
    setCartItems(cartState);
  };

  const addToCart = (product: Product) => {
    try {
      productsService.addToCart(product, 1);
      setCartItems(prev => ({
        ...prev,
        [product.id]: (prev[product.id] || 0) + 1
      }));
      toast.success(`${product.name} agregado al carrito`);
      onCartUpdate?.();
    } catch (error) {
      toast.error('Error al agregar producto al carrito');
    }
  };

  const updateQuantity = (product: Product, newQuantity: number) => {
    try {
      if (newQuantity === 0) {
        productsService.removeFromCart(product.id);
        setCartItems(prev => {
          const updated = { ...prev };
          delete updated[product.id];
          return updated;
        });
        toast.success(`${product.name} eliminado del carrito`);
      } else {
        productsService.updateCartQuantity(product.id, newQuantity);
        setCartItems(prev => ({
          ...prev,
          [product.id]: newQuantity
        }));
      }
      onCartUpdate?.();
    } catch (error) {
      toast.error('Error al actualizar cantidad');
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0
    }).format(price);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl font-bold mb-4">Productos Ortodóncicos</h1>
          <p className="text-xl opacity-90">
            Encuentra los mejores productos para tu tratamiento ortodóncico
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Filtros por categoría */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">Categorías</h2>
          <div className="flex flex-wrap gap-4">
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <motion.button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex items-center gap-2 px-6 py-3 rounded-full font-medium transition-all ${
                    selectedCategory === category.id
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <IconComponent size={20} />
                  {category.name}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Grid de productos */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <AnimatePresence>
            {products.map((product) => (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                whileHover={{ y: -5 }}
                className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
              >
                {/* Imagen del producto */}
                <div className="h-48 bg-gray-100 relative overflow-hidden">
                  <img
                    src={product.image_url}
                    alt={product.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://via.placeholder.com/300x300/E5E7EB/9CA3AF?text=Sin+Imagen';
                    }}
                  />
                  {product.requires_prescription && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                      Receta
                    </div>
                  )}
                  {product.stock <= 5 && product.stock > 0 && (
                    <div className="absolute top-2 left-2 bg-orange-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                      Últimas {product.stock}
                    </div>
                  )}
                  {product.stock === 0 && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <span className="text-white font-bold">Agotado</span>
                    </div>
                  )}
                </div>

                {/* Información del producto */}
                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-bold text-lg text-gray-800 line-clamp-2">
                      {product.name}
                    </h3>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {product.description}
                  </p>

                  <div className="flex items-center justify-between mb-3">
                    <div className="text-xs text-gray-500">
                      {product.category} • {product.brand}
                    </div>
                    <div className="text-xs text-gray-500">
                      Stock: {product.stock}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-2xl font-bold text-blue-600">
                      {formatPrice(product.price)}
                    </div>

                    {/* Controles del carrito */}
                    {cartItems[product.id] ? (
                      <div className="flex items-center gap-2 bg-gray-100 rounded-full px-3 py-2">
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => updateQuantity(product, cartItems[product.id] - 1)}
                          className="p-1 hover:bg-gray-200 rounded-full"
                          disabled={product.stock === 0}
                        >
                          <Minus size={16} />
                        </motion.button>
                        <span className="font-medium min-w-[20px] text-center">
                          {cartItems[product.id]}
                        </span>
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => updateQuantity(product, cartItems[product.id] + 1)}
                          className="p-1 hover:bg-gray-200 rounded-full"
                          disabled={cartItems[product.id] >= product.stock}
                        >
                          <Plus size={16} />
                        </motion.button>
                      </div>
                    ) : (
                      <motion.button
                        whileTap={{ scale: 0.95 }}
                        onClick={() => addToCart(product)}
                        disabled={product.stock === 0}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full font-medium transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
                      >
                        <ShoppingCart size={18} />
                        Agregar
                      </motion.button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Mensaje si no hay productos */}
        {products.length === 0 && !loading && (
          <div className="text-center py-12">
            <Package size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-medium text-gray-600 mb-2">
              No hay productos disponibles
            </h3>
            <p className="text-gray-500">
              {selectedCategory === 'all' 
                ? 'No hay productos en el catálogo'
                : `No hay productos en la categoría ${selectedCategory}`
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductShowcase;
