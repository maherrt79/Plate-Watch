import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getSightings } from '../services/api';
import { Typography, CircularProgress, Box } from '@mui/material';
import DashboardStats from './Map/DashboardStats';
import { SightingsFilter } from './Sightings/SightingsFilter';
import { SightingsTable } from './Sightings/SightingsTable';

export const SightingsList: React.FC = () => {
    const [plateSearch, setPlateSearch] = useState('');
    const [locationId, setLocationId] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [alertType, setAlertType] = useState('All');

    const { data: sightings, isLoading, error } = useQuery({
        queryKey: ['sightings', plateSearch, locationId, startDate, endDate, alertType],
        queryFn: () => getSightings({
            plateNumber: plateSearch || undefined,
            locationId: locationId || undefined,
            startDate: startDate || undefined,
            endDate: endDate || undefined,
            hotlistCategory: alertType !== 'All' ? alertType : undefined
        }),
        refetchInterval: 5000,
    });

    if (isLoading && !sightings) {
        return (
            <Box display="flex" justifyContent="center" p={4}>
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Typography color="error" align="center">
                Error loading sightings. Is the backend running?
            </Typography>
        );
    }

    return (
        <Box sx={{ width: '100%' }}>
            <DashboardStats />

            <SightingsFilter
                plateSearch={plateSearch}
                setPlateSearch={setPlateSearch}
                locationId={locationId}
                setLocationId={setLocationId}
                startDate={startDate}
                setStartDate={setStartDate}
                endDate={endDate}
                setEndDate={setEndDate}
                alertType={alertType}
                setAlertType={setAlertType}
            />

            <SightingsTable sightings={sightings || []} />
        </Box>
    );
};
