import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getSightings } from '../services/api';
import { Typography, Box } from '@mui/material';
import DashboardStats from './Map/DashboardStats';
import { SightingsFilter } from './Sightings/SightingsFilter';
import { SightingsTable } from './Sightings/SightingsTable';
import { SightingsTableSkeleton } from './Sightings/SightingsTableSkeleton';
import { useDebounce } from '../hooks/useDebounce';

export const SightingsList: React.FC = () => {
    const [plateSearch, setPlateSearch] = useState('');
    const [locationId, setLocationId] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [alertType, setAlertType] = useState('All');

    const debouncedPlateSearch = useDebounce(plateSearch, 500);

    const { data: sightings, isLoading, error } = useQuery({
        queryKey: ['sightings', debouncedPlateSearch, locationId, startDate, endDate, alertType],
        queryFn: () => getSightings({
            plateNumber: debouncedPlateSearch || undefined,
            locationId: locationId || undefined,
            startDate: startDate || undefined,
            endDate: endDate || undefined,
            hotlistCategory: alertType !== 'All' ? alertType : undefined
        }),
        refetchInterval: 5000,
    });

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

            {isLoading && !sightings ? (
                <SightingsTableSkeleton />
            ) : (
                <SightingsTable sightings={sightings || []} />
            )}
        </Box>
    );
};
