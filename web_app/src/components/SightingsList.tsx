import { useState } from 'react';
import { getCategoryStyle } from '../utils/hotlistColors';
import { useQuery } from '@tanstack/react-query';
import { getSightings } from '../services/api';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    Typography, CircularProgress, Box, Chip, TextField, Grid
} from '@mui/material';
import { format } from 'date-fns';
import DashboardStats from './Map/DashboardStats';

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
            <Paper sx={{ p: 2, mb: 2 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid size={{ xs: 12, sm: 3 }}>
                        <TextField
                            label="Search Plate"
                            variant="outlined"
                            fullWidth
                            value={plateSearch}
                            onChange={(e) => setPlateSearch(e.target.value)}
                            size="small"
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 2 }}>
                        <TextField
                            label="Location ID"
                            variant="outlined"
                            fullWidth
                            value={locationId}
                            onChange={(e) => setLocationId(e.target.value)}
                            size="small"
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 2 }}>
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
                    <Grid size={{ xs: 12, sm: 2 }}>
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
                    <Grid size={{ xs: 12, sm: 3 }}>
                        <TextField
                            select
                            label="Alert Type"
                            variant="outlined"
                            fullWidth
                            value={alertType}
                            onChange={(e) => setAlertType(e.target.value)}
                            size="small"
                            SelectProps={{ native: true }}
                        >
                            <option value="All">All Sightings</option>
                            <option value="All Alerts">All Alerts</option>
                            <option value="danger">Danger</option>
                            <option value="banned">Banned</option>
                            <option value="info">Info</option>
                        </TextField>
                    </Grid>
                </Grid>
            </Paper>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Plate Number</TableCell>
                            <TableCell>Vehicle</TableCell>
                            <TableCell>Color</TableCell>
                            <TableCell>Direction</TableCell>
                            <TableCell>Location</TableCell>
                            <TableCell>Timestamp</TableCell>
                            <TableCell>Seen At</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {sightings?.map((sighting) => {
                            const categoryStyle = sighting.is_hot ? getCategoryStyle(sighting.hotlist_category) : null;

                            return (
                                <TableRow
                                    key={sighting.id}
                                    hover
                                >
                                    <TableCell>
                                        <Chip
                                            label={sighting.plate_number}
                                            color={categoryStyle ? categoryStyle.color : "primary"}
                                            variant={sighting.is_hot ? "filled" : "outlined"}
                                            sx={{ fontWeight: 'bold' }}
                                        />
                                        {sighting.is_hot && categoryStyle && (
                                            <Typography
                                                variant="caption"
                                                sx={{
                                                    ml: 1,
                                                    fontWeight: 'bold',
                                                    color: categoryStyle.hex,
                                                    textTransform: 'uppercase'
                                                }}
                                            >
                                                {categoryStyle.label} ALERT
                                            </Typography>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {sighting.vehicle_make && sighting.vehicle_model
                                            ? `${sighting.vehicle_make} ${sighting.vehicle_model}`
                                            : 'Unknown'}
                                    </TableCell>
                                    <TableCell>
                                        {sighting.vehicle_color || 'Unknown'}
                                    </TableCell>
                                    <TableCell>
                                        {sighting.direction || 'Unknown'}
                                    </TableCell>
                                    <TableCell>{sighting.location_id}</TableCell>
                                    <TableCell>
                                        {sighting.timestamp ? format(new Date(sighting.timestamp), 'PPpp') : 'N/A'}
                                    </TableCell>
                                    <TableCell>
                                        {sighting.created_at ? format(new Date(sighting.created_at), 'PPpp') : 'N/A'}
                                    </TableCell>
                                </TableRow>
                            );
                        })}

                        {sightings?.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} align="center">
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
