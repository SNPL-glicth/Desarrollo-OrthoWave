import React from 'react';
import { useLocation } from 'react-router-dom';
import Footer from './Footer';

const Layout = ({ children }) => {
  const location = useLocation();
  const isDashboard = location.pathname.includes('dashboard');

  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-grow">
        {children}
      </main>
      {!isDashboard && <Footer />}
    </div>
  );
};

export default Layout; 