import React from 'react';
import { useServices } from '../../../hooks/useServices';

interface Service {
    id: string;
    name: string;
    description: string;
    duration: number;
    price: number;
    specialistTypes: string[];
}

export const ServiceSelection: React.FC<{
    formData: any;
    updateFormData: (data: any) => void;
}> = ({ formData, updateFormData }) => {
    const { services, loading } = useServices();

    if (loading) return <div>Cargando servicios...</div>;

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                {services.map((service: Service) => (
                    <div
                        key={service.id}
                        className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                            formData.serviceId === service.id
                                ? 'border-blue-500 bg-blue-50'
                                : 'hover:border-gray-400'
                        }`}
                        onClick={() => updateFormData({ 
                            serviceId: service.id,
                            duration: service.duration
                        })}
                    >
                        <h3 className="font-medium text-lg">{service.name}</h3>
                        <p className="text-gray-600 text-sm mt-1">
                            {service.description}
                        </p>
                        <div className="mt-4 flex justify-between items-center">
                            <span className="text-green-600 font-medium">
                                ${service.price.toLocaleString()}
                            </span>
                            <span className="text-gray-500 text-sm">
                                {service.duration} minutos
                            </span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}; 