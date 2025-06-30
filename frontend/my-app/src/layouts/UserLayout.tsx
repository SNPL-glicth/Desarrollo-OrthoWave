import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../components/navigation/Navbar';

const UserLayout: React.FC = () => {
    return (
        <div className="min-h-screen bg-gray-100">
            <Navbar />
            <main className="container mx-auto py-8 px-4">
                <Outlet />
            </main>
        </div>
    );
};

export default UserLayout; 