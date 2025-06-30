import React from 'react';
import { Tab } from '@headlessui/react';
import MyAppointments from '../../components/patient/MyAppointments';
import AvailableAppointments from '../../components/patient/AvailableAppointments';
import UserInfo from '../../components/patient/UserInfo';

const UserProfile: React.FC = () => {
    return (
        <div className="container mx-auto py-8 px-4">
            <h1 className="text-3xl font-bold mb-8">Mi Perfil</h1>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Información del Usuario */}
                <div className="lg:col-span-1">
                    <UserInfo />
                </div>

                {/* Contenido Principal */}
                <div className="lg:col-span-2">
                    <Tab.Group>
                        <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1">
                            <Tab className={({ selected }) =>
                                `w-full rounded-lg py-2.5 text-sm font-medium leading-5
                                ${selected
                                    ? 'bg-white text-blue-700 shadow'
                                    : 'text-blue-500 hover:bg-white/[0.12] hover:text-blue-600'
                                }`
                            }>
                                Mis Citas
                            </Tab>
                            <Tab className={({ selected }) =>
                                `w-full rounded-lg py-2.5 text-sm font-medium leading-5
                                ${selected
                                    ? 'bg-white text-blue-700 shadow'
                                    : 'text-blue-500 hover:bg-white/[0.12] hover:text-blue-600'
                                }`
                            }>
                                Agendar Cita
                            </Tab>
                        </Tab.List>
                        <Tab.Panels className="mt-6">
                            <Tab.Panel>
                                <MyAppointments />
                            </Tab.Panel>
                            <Tab.Panel>
                                <AvailableAppointments />
                            </Tab.Panel>
                        </Tab.Panels>
                    </Tab.Group>
                </div>
            </div>
        </div>
    );
};

export default UserProfile; 