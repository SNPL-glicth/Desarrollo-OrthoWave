import React, { useState } from 'react';
import { PatientSelection } from './steps/PatientSelection';
import { ServiceSelection } from './steps/ServiceSelection';
import { DateTimeSelection } from './steps/DateTimeSelection';
import { Confirmation } from './steps/Confirmation';
import { StepIndicator } from './StepIndicator';

interface AppointmentFormData {
    patientId: string;
    serviceId: string;
    specialistId: string;
    dateTime: Date | null;
    notes: string;
}

const AppointmentWizard: React.FC = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<AppointmentFormData>({
        patientId: '',
        serviceId: '',
        specialistId: '',
        dateTime: null,
        notes: ''
    });

    const steps = [
        { number: 1, title: 'Paciente', component: PatientSelection },
        { number: 2, title: 'Servicio', component: ServiceSelection },
        { number: 3, title: 'Fecha y Hora', component: DateTimeSelection },
        { number: 4, title: 'Confirmación', component: Confirmation }
    ];

    const handleNext = () => {
        setCurrentStep(prev => Math.min(prev + 1, steps.length));
    };

    const handleBack = () => {
        setCurrentStep(prev => Math.max(prev - 1, 1));
    };

    const updateFormData = (data: Partial<AppointmentFormData>) => {
        setFormData(prev => ({ ...prev, ...data }));
    };

    const CurrentStepComponent = steps[currentStep - 1].component;

    return (
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
            <StepIndicator 
                steps={steps} 
                currentStep={currentStep} 
            />

            <div className="mt-8">
                <CurrentStepComponent
                    formData={formData}
                    updateFormData={updateFormData}
                />
            </div>

            <div className="mt-8 flex justify-between">
                {currentStep > 1 && (
                    <button
                        onClick={handleBack}
                        className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md"
                    >
                        Anterior
                    </button>
                )}
                {currentStep < steps.length ? (
                    <button
                        onClick={handleNext}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md ml-auto"
                    >
                        Siguiente
                    </button>
                ) : (
                    <button
                        onClick={() => {/* Lógica de envío */}}
                        className="px-4 py-2 bg-green-600 text-white rounded-md ml-auto"
                    >
                        Confirmar Cita
                    </button>
                )}
            </div>
        </div>
    );
};

export default AppointmentWizard; 