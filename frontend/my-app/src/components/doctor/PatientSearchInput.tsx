import React, { useState, useEffect, useRef } from 'react';

interface Patient {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  telefono?: string;
}

interface PatientSearchInputProps {
  patients: Patient[];
  selectedPatient: Patient | null;
  onPatientSelect: (patient: Patient | null) => void;
  loading?: boolean;
}

const PatientSearchInput: React.FC<PatientSearchInputProps> = ({
  patients,
  selectedPatient,
  onPatientSelect,
  loading = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filtrar pacientes basado en el término de búsqueda
  useEffect(() => {
    if (!searchTerm.trim()) {
      // Si no hay búsqueda, mostrar los primeros 10 pacientes ordenados por nombre
      const sortedPatients = [...patients]
        .sort((a, b) => `${a.nombre} ${a.apellido}`.localeCompare(`${b.nombre} ${b.apellido}`))
        .slice(0, 10);
      setFilteredPatients(sortedPatients);
    } else {
      // Filtrar por nombre, apellido o email
      const filtered = patients
        .filter(patient => {
          const fullName = `${patient.nombre} ${patient.apellido}`.toLowerCase();
          const email = patient.email.toLowerCase();
          const search = searchTerm.toLowerCase();
          
          return fullName.includes(search) || email.includes(search);
        })
        .sort((a, b) => {
          // Ordenar por relevancia: primero los que coinciden al inicio
          const aFullName = `${a.nombre} ${a.apellido}`.toLowerCase();
          const bFullName = `${b.nombre} ${b.apellido}`.toLowerCase();
          const search = searchTerm.toLowerCase();
          
          const aStartsWith = aFullName.startsWith(search);
          const bStartsWith = bFullName.startsWith(search);
          
          if (aStartsWith && !bStartsWith) return -1;
          if (!aStartsWith && bStartsWith) return 1;
          
          return aFullName.localeCompare(bFullName);
        })
        .slice(0, 15); // Limitar a 15 resultados máximo
      
      setFilteredPatients(filtered);
    }
    setHighlightedIndex(-1);
  }, [searchTerm, patients]);

  // Manejar clicks fuera del componente
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current && 
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Actualizar input cuando se selecciona un paciente externamente
  useEffect(() => {
    if (selectedPatient) {
      setSearchTerm(`${selectedPatient.nombre} ${selectedPatient.apellido}`);
      setIsOpen(false);
    } else {
      setSearchTerm('');
    }
  }, [selectedPatient]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setIsOpen(true);
    
    // Si se borra el input, deseleccionar paciente
    if (!value.trim() && selectedPatient) {
      onPatientSelect(null);
    }
  };

  const handlePatientSelect = (patient: Patient) => {
    onPatientSelect(patient);
    setSearchTerm(`${patient.nombre} ${patient.apellido}`);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown' || e.key === 'Enter') {
        setIsOpen(true);
        return;
      }
    }

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev < filteredPatients.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => 
          prev > 0 ? prev - 1 : filteredPatients.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < filteredPatients.length) {
          handlePatientSelect(filteredPatients[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  const clearSelection = () => {
    onPatientSelect(null);
    setSearchTerm('');
    setIsOpen(true);
    inputRef.current?.focus();
  };

  const highlightText = (text: string, search: string) => {
    if (!search.trim()) return text;
    
    const regex = new RegExp(`(${search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-blue-100 text-blue-900 px-0.5 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  return (
    <div className="relative">
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={searchTerm}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          placeholder={loading ? "Cargando pacientes..." : "Escribir nombre, apellido o email..."}
          disabled={loading}
          className="w-full p-4 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-base shadow-sm hover:shadow-md transition-all duration-200 bg-white disabled:bg-gray-50 disabled:text-gray-500"
        />
        
        {/* Icono de búsqueda o loading */}
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
          {loading ? (
            <svg className="animate-spin h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : selectedPatient ? (
            <button
              onClick={clearSelection}
              className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
              type="button"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          ) : (
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          )}
        </div>
      </div>

      {/* Dropdown de resultados */}
      {isOpen && !loading && (
        <div
          ref={dropdownRef}
          className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-80 overflow-y-auto"
        >
          {filteredPatients.length === 0 ? (
            <div className="px-4 py-8 text-center text-gray-500">
              <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              {searchTerm.trim() ? 'No se encontraron pacientes' : 'No hay pacientes disponibles'}
            </div>
          ) : (
            <>
              {/* Encabezado si hay búsqueda */}
              {searchTerm.trim() && (
                <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                  <div className="text-xs text-gray-600">
                    {filteredPatients.length} resultado{filteredPatients.length !== 1 ? 's' : ''} para "{searchTerm}"
                  </div>
                </div>
              )}
              
              {/* Lista de pacientes */}
              {filteredPatients.map((patient, index) => (
                <button
                  key={patient.id}
                  type="button"
                  onClick={() => handlePatientSelect(patient)}
                  className={`w-full px-4 py-3 text-left hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-b-0 focus:outline-none focus:bg-blue-50 ${
                    highlightedIndex === index ? 'bg-blue-50' : ''
                  } ${selectedPatient?.id === patient.id ? 'bg-green-50 border-l-4 border-l-green-500' : ''}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-100 to-indigo-200 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-blue-700 font-semibold text-sm">
                            {patient.nombre.charAt(0)}{patient.apellido.charAt(0)}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900">
                            {highlightText(`${patient.nombre} ${patient.apellido}`, searchTerm)}
                          </div>
                          <div className="text-xs text-gray-600 truncate">
                            {highlightText(patient.email, searchTerm)}
                          </div>
                          {patient.telefono && (
                            <div className="text-xs text-gray-500">
                              📞 {patient.telefono}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    {/* Indicador de selección */}
                    {selectedPatient?.id === patient.id && (
                      <div className="flex-shrink-0 ml-3">
                        <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>
                </button>
              ))}
              
              {/* Información adicional en el pie */}
              {filteredPatients.length >= 15 && (
                <div className="px-4 py-2 bg-gray-50 border-t border-gray-200">
                  <div className="text-xs text-gray-500 text-center">
                    Mostrando los primeros 15 resultados. Usa más palabras clave para refinar la búsqueda.
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default PatientSearchInput;
