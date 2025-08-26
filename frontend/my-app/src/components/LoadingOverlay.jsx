import React from 'react';
import { motion } from 'framer-motion';

const LoadingOverlay = ({ 
  isVisible, 
  title = "Cargando...", 
  message = "Por favor espere un momento",
  size = "md" // sm, md, lg
}) => {
  if (!isVisible) return null;

  const sizeClasses = {
    sm: {
      spinner: "h-6 w-6",
      container: "p-6",
      title: "text-base",
      message: "text-xs"
    },
    md: {
      spinner: "h-8 w-8",
      container: "p-8",
      title: "text-lg",
      message: "text-sm"
    },
    lg: {
      spinner: "h-12 w-12",
      container: "p-12",
      title: "text-xl",
      message: "text-base"
    }
  };

  const currentSize = sizeClasses[size] || sizeClasses.md;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className={`bg-white rounded-lg max-w-sm mx-4 text-center shadow-lg ${currentSize.container}`}
      >
        <div className="flex items-center justify-center mb-4">
          <svg 
            className={`animate-spin text-primary ${currentSize.spinner}`} 
            xmlns="http://www.w3.org/2000/svg" 
            fill="none" 
            viewBox="0 0 24 24"
          >
            <circle 
              className="opacity-25" 
              cx="12" 
              cy="12" 
              r="10" 
              stroke="currentColor" 
              strokeWidth="4"
            ></circle>
            <path 
              className="opacity-75" 
              fill="currentColor" 
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
        <h3 className={`font-medium text-gray-900 mb-2 ${currentSize.title}`}>
          {title}
        </h3>
        <p className={`text-gray-500 ${currentSize.message}`}>
          {message}
        </p>
      </motion.div>
    </motion.div>
  );
};

export default LoadingOverlay;
