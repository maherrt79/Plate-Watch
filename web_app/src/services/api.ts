import axios from 'axios';
import type { Sighting } from '../types/sighting';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1';
const API_KEY = import.meta.env.VITE_API_KEY || 'dev-api-key-123';

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        'x-api-key': API_KEY
    }
});

export const setupInterceptors = (showToast: (msg: string, type: 'error' | 'success' | 'info' | 'warning') => void) => {
    api.interceptors.response.use(
        (response) => response,
        (error) => {
            const message = error.response?.data?.detail || error.message || 'An unexpected error occurred';
            showToast(message, 'error');
            return Promise.reject(error);
        }
    );
};

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
    const response = await api.get<Hotlist[]>('/hotlists');
    return response.data;
};

export const createHotlist = async (data: { plate_number: string; description: string; category: string }): Promise<Hotlist> => {
    const response = await api.post<Hotlist>('/hotlists', data);
    return response.data;
};

export const deleteHotlist = async (id: string): Promise<void> => {
    await api.delete(`/hotlists/${id}`);
};

export interface ConvoyGroup {
    leader_sighting: Sighting;
    followers: Sighting[];
}

export const getConvoyAnalysis = async (plateNumber: string, timeWindowSeconds: number = 5): Promise<ConvoyGroup[]> => {
    const response = await api.get<ConvoyGroup[]>('/analytics/convoy', {
        params: { plate_number: plateNumber, time_window_seconds: timeWindowSeconds }
    });
    return response.data;
};
