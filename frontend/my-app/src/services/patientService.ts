import api from './api';

export const searchPatients = async (searchTerm: string) => {
    const response = await api.get('/pacientes/buscar', {
        params: { identificacion: searchTerm }
    });
    return response.data;
};

export const getPatientProfile = async () => {
    const response = await api.get('/pacientes/mi-perfil');
    return response.data;
};

export const updatePatientProfile = async (profileData: any) => {
    const response = await api.patch('/pacientes/mi-perfil', profileData);
    return response.data;
};

export const getAllPatients = async () => {
    const response = await api.get('/pacientes');
    return response.data;
};

export const getPatientsByDoctor = async () => {
    const response = await api.get('/pacientes/mis-pacientes');
    return response.data;
};

export const getPatientById = async (id: number) => {
    const response = await api.get(`/pacientes/usuario/${id}`);
    return response.data;
};

export const updatePatientById = async (id: number, profileData: any) => {
    const response = await api.patch(`/pacientes/usuario/${id}`, profileData);
    return response.data;
};

export const getPatientStatistics = async () => {
    const response = await api.get('/pacientes/estadisticas');
    return response.data;
};
