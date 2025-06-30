import React, { useState, useEffect } from 'react';
import { useDebounce } from '../../../hooks/useDebounce';
import { searchPatients } from '../../../services/patientService';

interface PatientSelectionProps {
    formData: any;
    updateFormData: (data: any) => void;
}

export const PatientSelection: React.FC<PatientSelectionProps> = ({
    formData,
    updateFormData
}) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [patients, setPatients] = useState([]);
    const [isSearching, setIsSearching] = useState(false);
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    useEffect(() => {
        if (debouncedSearchTerm) {
            setIsSearching(true);
            searchPatients(debouncedSearchTerm)
                .then(results => {
                    setPatients(results);
                    setIsSearching(false);
                });
        } else {
            setPatients([]);
        }
    }, [debouncedSearchTerm]);

    return (
        <div className="space-y-6">
            <div>
                <label className="block text-sm font-medium text-gray-700">
                    Buscar Paciente
                </label>
                <div className="relative mt-1">
                    <input
                        type="text"
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                        placeholder="Nombre o documento de identidad"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {isSearching && (
                        <div className="absolute right-3 top-2">
                            {/* Spinner de carga */}
                        </div>
                    )}
                </div>
            </div>

            {patients.length > 0 && (
                <div className="mt-4 border rounded-md divide-y">
                    {patients.map(patient => (
                        <div
                            key={patient.id}
                            className="p-4 hover:bg-gray-50 cursor-pointer"
                            onClick={() => {
                                updateFormData({ patientId: patient.id });
                                setSearchTerm(`${patient.name} - ${patient.document}`);
                                setPatients([]);
                            }}
                        >
                            <div className="font-medium">{patient.name}</div>
                            <div className="text-sm text-gray-500">
                                Documento: {patient.document}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}; 