import axios from 'axios';
import type { Sighting } from '../types/sighting';

const API_URL = 'http://localhost:8000/api/v1';

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'x-api-key': 'dev-api-key-123'
    }
});

export const getSightings = async (params?: { plateNumber?: string }): Promise<Sighting[]> => {
    const response = await api.get<Sighting[]>('/sightings', {
        params,
        headers: { 'x-api-key': 'dev-api-key-123' }
    });
    return response.data;
};
