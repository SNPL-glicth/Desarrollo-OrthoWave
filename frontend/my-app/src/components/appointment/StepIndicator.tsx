import React from 'react';

interface Step {
    number: number;
    title: string;
}

interface StepIndicatorProps {
    steps: Step[];
    currentStep: number;
}

export const StepIndicator: React.FC<StepIndicatorProps> = ({ 
    steps, 
    currentStep 
}) => {
    return (
        <div className="flex justify-between">
            {steps.map((step, index) => (
                <div 
                    key={step.number}
                    className="flex items-center"
                >
                    <div className={`
                        flex items-center justify-center w-8 h-8 rounded-full
                        ${currentStep >= step.number
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-600'
                        }
                    `}>
                        {step.number}
                    </div>
                    <div className="ml-2">
                        <div className="text-sm font-medium">
                            {step.title}
                        </div>
                    </div>
                    {index < steps.length - 1 && (
                        <div className={`
                            w-full h-0.5 mx-4
                            ${currentStep > step.number
                                ? 'bg-blue-600'
                                : 'bg-gray-200'
                            }
                        `} />
                    )}
                </div>
            ))}
        </div>
    );
}; 