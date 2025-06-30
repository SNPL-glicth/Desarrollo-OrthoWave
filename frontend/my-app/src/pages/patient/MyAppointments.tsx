import React, { useState } from 'react';
import { Tab } from '@headlessui/react';
import UpcomingAppointments from '../../components/patient/UpcomingAppointments';
import AppointmentHistory from '../../components/patient/AppointmentHistory';
import { usePatientAppointments } from '../../hooks/usePatientAppointments';

const MyAppointments: React.FC = () => {
    const { loading, error } = usePatientAppointments();

    return (
        <div className="container mx-auto py-8 px-4">
            <h1 className="text-2xl font-bold mb-6">Mis Citas</h1>

            <Tab.Group>
                <Tab.List className="flex space-x-1 rounded-xl bg-blue-900/20 p-1">
                    <Tab
                        className={({ selected }) =>
                            `w-full rounded-lg py-2.5 text-sm font-medium leading-5
                            ${selected
                                ? 'bg-white text-blue-700 shadow'
                                : 'text-blue-500 hover:bg-white/[0.12] hover:text-blue-600'
                            }`
                        }
                    >
                        Próximas Citas
                    </Tab>
                    <Tab
                        className={({ selected }) =>
                            `w-full rounded-lg py-2.5 text-sm font-medium leading-5
                            ${selected
                                ? 'bg-white text-blue-700 shadow'
                                : 'text-blue-500 hover:bg-white/[0.12] hover:text-blue-600'
                            }`
                        }
                    >
                        Historial
                    </Tab>
                </Tab.List>
                <Tab.Panels className="mt-6">
                    <Tab.Panel>
                        <UpcomingAppointments />
                    </Tab.Panel>
                    <Tab.Panel>
                        <AppointmentHistory />
                    </Tab.Panel>
                </Tab.Panels>
            </Tab.Group>
        </div>
    );
};

export default MyAppointments; 