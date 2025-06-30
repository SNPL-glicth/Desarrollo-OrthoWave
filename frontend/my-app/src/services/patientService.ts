import axios from 'axios';

export const searchPatients = async (searchTerm: string) => {
    const response = await axios.get(`/api/patients/search`, {
        params: { q: searchTerm }
    });
    return response.data;
}; 