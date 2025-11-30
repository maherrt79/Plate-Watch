import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getSightings } from '../services/api';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    Typography, CircularProgress, Box, Chip, TextField, Grid
} from '@mui/material';
import { format } from 'date-fns';

interface SightingsListProps {
    plateNumber?: string;
}

export const SightingsList: React.FC<SightingsListProps> = ({ plateNumber }) => {
    const [locationId, setLocationId] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    const { data: sightings, isLoading, error } = useQuery({
        queryKey: ['sightings', plateNumber, locationId, startDate, endDate],
        queryFn: () => getSightings({
            plateNumber,
            locationId: locationId || undefined,
            startDate: startDate || undefined,
            endDate: endDate || undefined
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
        <Box>
            <Paper sx={{ p: 2, mb: 2 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <TextField
                            label="Location ID"
                            variant="outlined"
                            fullWidth
                            value={locationId}
                            onChange={(e) => setLocationId(e.target.value)}
                            size="small"
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <TextField
                            label="Start Date"
                            type="datetime-local"
                            variant="outlined"
                            fullWidth
                            value={startDate}
                            onChange={(e) => setStartDate(e.target.value)}
                            size="small"
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <TextField
                            label="End Date"
                            type="datetime-local"
                            variant="outlined"
                            fullWidth
                            value={endDate}
                            onChange={(e) => setEndDate(e.target.value)}
                            size="small"
                            InputLabelProps={{ shrink: true }}
                        />
                    </Grid>
                </Grid>
            </Paper>

            <TableContainer component={Paper}>
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
        </Box>
    );
};
