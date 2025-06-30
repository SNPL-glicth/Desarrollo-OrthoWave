import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import { useCart } from '../context/CartContext';
import { toast } from 'react-hot-toast';

// Datos de los productos
const productsData = [
  {
    id: 1,
    name: 'CBD Terapéutico',
    price: 120000,
    image: '/images/products/cbd.webp',
    status: 'Disponible',
    category: 'cremas',
    description: 'Aceite CBD terapéutico para alivio del dolor y recuperación muscular'
  },
  {
    id: 2,
    name: 'Crema Magistral',
    price: 85000,
    image: '/images/products/Crema Magistral.webp',
    status: 'Disponible',
    category: 'cremas',
    description: 'Crema magistral especializada para tratamientos personalizados'
  },
  {
    id: 3,
    name: 'Crema Relajante',
    price: 75000,
    image: '/images/products/Creama Relajante.webp',
    status: 'Disponible',
    category: 'cremas',
    description: 'Crema relajante muscular con efecto térmico y antiinflamatorio'
  }
];

// Categorías para filtrar
const categories = [
  { id: 'todos', name: 'Todos' },
  { id: 'cremas', name: 'Cremas Terapéuticas' }
];

const formatPrice = (price) => {
  return `$ ${new Intl.NumberFormat('es-CO').format(price)} COP`;
};

const Products = () => {
  const [selectedCategory, setSelectedCategory] = useState('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [imageErrors, setImageErrors] = useState({});
  const { addToCart } = useCart();

  const handleImageError = useCallback((productId) => {
    setImageErrors(prev => ({ ...prev, [productId]: true }));
  }, []);

  const handleAddToCart = useCallback((product) => {
    if (product.status === 'Agotado') return;
    
    addToCart(product);
    toast.success(`${product.name} agregado al carrito`);
  }, [addToCart]);

  // Filtra productos por categoría y término de búsqueda
  const filteredProducts = productsData.filter(product => {
    const matchesCategory = selectedCategory === 'todos' || product.category === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section id="productos" className="py-8 sm:py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-2 sm:mb-4">
            Productos Terapéuticos
          </h2>
          <p className="text-base sm:text-lg text-gray-600 max-w-3xl mx-auto px-4">
            Descubre nuestra línea exclusiva de productos terapéuticos diseñados para optimizar tu recuperación y bienestar
          </p>
        </div>

        {/* Filtros y búsqueda */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 sm:mb-8 space-y-4 md:space-y-0">
          <div className="flex flex-wrap gap-2 justify-center md:justify-start w-full md:w-auto">
            {categories.map(category => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                  selectedCategory === category.id
                    ? 'bg-primary text-white'
                    : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>
          
          <div className="w-full md:w-auto">
            <div className="relative">
              <input
                type="text"
                placeholder="Buscar productos"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full md:w-64 px-3 sm:px-4 py-1.5 sm:py-2 text-sm sm:text-base border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Cuadrícula de productos */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 md:gap-8">
            {filteredProducts.map(product => (
              <motion.div 
                key={product.id} 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300 border border-gray-100"
              >
                <div className="aspect-w-16 aspect-h-12 bg-gray-100">
                  <img
                    src={imageErrors[product.id] ? '/images/placeholder.jpg' : product.image}
                    alt={product.name}
                    onError={() => handleImageError(product.id)}
                    className="w-full h-full object-cover object-center"
                  />
                </div>
                <div className="p-4 sm:p-6">
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-1 sm:mb-2">{product.name}</h3>
                  <p className="text-sm sm:text-base text-gray-600 mb-3 sm:mb-4 line-clamp-2">{product.description}</p>
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                    <span className="text-xl sm:text-2xl font-bold text-primary">
                      {formatPrice(product.price)}
                    </span>
                    <button
                      onClick={() => handleAddToCart(product)}
                      disabled={product.status === 'Agotado'}
                      className={`inline-flex items-center justify-center px-3 sm:px-4 py-1.5 sm:py-2 rounded-full text-xs sm:text-sm font-medium transition-colors w-full sm:w-auto
                        ${product.status === 'Agotado' 
                          ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                          : 'bg-primary text-white hover:bg-primary-dark'}`}
                    >
                      <ShoppingCartIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
                      {product.status === 'Agotado' ? 'Agotado' : 'Agregar al carrito'}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 sm:py-12">
            <p className="text-base sm:text-lg text-gray-500">No se encontraron productos que coincidan con tu búsqueda.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Products; 