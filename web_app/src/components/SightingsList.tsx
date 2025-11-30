import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { getSightings } from '../services/api';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    Typography, CircularProgress, Box, Chip
} from '@mui/material';
import { format } from 'date-fns';

interface SightingsListProps {
    plateNumber?: string;
}

export const SightingsList: React.FC<SightingsListProps> = ({ plateNumber }) => {
    const { data: sightings, isLoading, error } = useQuery({
        queryKey: ['sightings', plateNumber],
        queryFn: () => getSightings({ plateNumber }),
        refetchInterval: 5000, // Poll every 5 seconds for local dev
    });

    if (isLoading) {
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
        <TableContainer component={Paper} sx={{ mt: 2 }}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Plate Number</TableCell>
                        <TableCell>Location</TableCell>
                        <TableCell>Timestamp</TableCell>
                        <TableCell>Seen At</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {sightings?.map((sighting) => (
                        <TableRow key={sighting.id}>
                            <TableCell>
                                <Chip label={sighting.plate_number} color="primary" variant="outlined" sx={{ fontWeight: 'bold' }} />
                            </TableCell>
                            <TableCell>{sighting.location_id}</TableCell>
                            <TableCell>
                                {sighting.timestamp ? format(new Date(sighting.timestamp), 'PPpp') : 'N/A'}
                            </TableCell>
                            <TableCell>
                                {sighting.created_at ? format(new Date(sighting.created_at), 'PPpp') : 'N/A'}
                            </TableCell>
                        </TableRow>
                    ))}
                    {sightings?.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={4} align="center">
                                No sightings recorded yet.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
};
