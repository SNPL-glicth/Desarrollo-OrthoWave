import React from 'react';
import Hero from '../components/Hero';
import Services from '../components/Services';
import Products from '../components/Products';
import AboutUs from '../components/AboutUs';
import Contact from '../components/Contact';
import Navbar from '../components/Navbar';

const HomePage = () => {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main>
        <Hero />
        <Services />
        <Products />
        <AboutUs />
        <Contact />
      </main>
    </div>
  );
};

export default HomePage; 