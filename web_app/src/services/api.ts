import axios from 'axios';
import type { Sighting } from '../types/sighting';

const API_URL = 'http://localhost:8000/api/v1';

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'x-api-key': 'dev-api-key-123'
    }
});

export const getSightings = async (params?: {
    plateNumber?: string;
    locationId?: string;
    startDate?: string;
    endDate?: string;
    hotlistCategory?: string;
}): Promise<Sighting[]> => {
    const response = await api.get<Sighting[]>('/sightings', {
        params,
    });
    return response.data;
};

export interface SightingStats {
    total_sightings: number;
    total_alerts: number;
    alerts_by_category: Record<string, number>;
}

export const getSightingStats = async (): Promise<SightingStats> => {
    const response = await api.get<SightingStats>('/sightings/stats');
    return response.data;
};

export interface Hotlist {
    id: string;
    plate_number: string;
    description: string;
    category: string;
    created_at: string;
}

export const getHotlists = async (): Promise<Hotlist[]> => {
    const response = await api.get<Hotlist[]>('/hotlists', {
        headers: { 'x-api-key': 'dev-api-key-123' }
    });
    return response.data;
};

export const createHotlist = async (data: { plate_number: string; description: string; category: string }): Promise<Hotlist> => {
    const response = await api.post<Hotlist>('/hotlists', data, {
        headers: { 'x-api-key': 'dev-api-key-123' }
    });
    return response.data;
};

export const deleteHotlist = async (id: string): Promise<void> => {
    await api.delete(`/hotlists/${id}`, {
        headers: { 'x-api-key': 'dev-api-key-123' }
    });
};
