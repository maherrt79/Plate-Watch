import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    Box, Typography, TextField, Button, Paper, Grid, Slider,
    Card, CardContent, CardHeader, Divider, Chip,
    Table, TableBody, TableCell, TableHead, TableRow,
    Tabs, Tab, CircularProgress
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import GroupIcon from '@mui/icons-material/Group';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import RouteIcon from '@mui/icons-material/Route';
import { getConvoyAnalysis, getODMatrix } from '../services/api';
import { format } from 'date-fns';

const ConvoyAnalysis: React.FC = () => {
    const [plateInput, setPlateInput] = useState('');
    const [searchPlate, setSearchPlate] = useState('');
    const [timeWindow, setTimeWindow] = useState<number>(5);

    const { data: convoyGroups, isLoading, isError } = useQuery({
        queryKey: ['convoy', searchPlate, timeWindow],
        queryFn: () => getConvoyAnalysis(searchPlate, timeWindow),
        enabled: !!searchPlate,
    });

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (plateInput) {
            setSearchPlate(plateInput);
        }
    };

    return (
        <Box>
            <Typography variant="body1" color="textSecondary" paragraph>
                Detect vehicles traveling together by finding sightings at the same location within a short time window.
            </Typography>

            <Paper sx={{ p: 3, mb: 4 }}>
                <form onSubmit={handleSearch}>
                    <Grid container spacing={3} alignItems="center">
                        <Grid size={{ xs: 12, md: 4 }}>
                            <TextField
                                label="Target Plate Number"
                                value={plateInput}
                                onChange={(e) => setPlateInput(e.target.value)}
                                fullWidth
                                required
                                placeholder="e.g. ABC-123"
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Typography gutterBottom>
                                Time Window: {timeWindow} seconds
                            </Typography>
                            <Slider
                                value={timeWindow}
                                onChange={(_, val) => setTimeWindow(val as number)}
                                min={1}
                                max={60}
                                valueLabelDisplay="auto"
                                marks={[
                                    { value: 1, label: '1s' },
                                    { value: 5, label: '5s' },
                                    { value: 30, label: '30s' },
                                    { value: 60, label: '60s' },
                                ]}
                            />
                        </Grid>
                        <Grid size={{ xs: 12, md: 4 }}>
                            <Button
                                type="submit"
                                variant="contained"
                                size="large"
                                startIcon={<SearchIcon />}
                                fullWidth
                                disabled={!plateInput}
                            >
                                Analyze
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Paper>

            {isLoading && <Typography>Analyzing sightings...</Typography>}
            {isError && <Typography color="error">Failed to analyze data.</Typography>}

            {convoyGroups && (
                <Box>
                    <Typography variant="h6" gutterBottom>
                        Found {convoyGroups.length} potential convoy events for {searchPlate}
                    </Typography>

                    {convoyGroups.length === 0 && (
                        <Typography color="textSecondary">No convoys detected within {timeWindow} seconds.</Typography>
                    )}

                    <Grid container spacing={3}>
                        {convoyGroups.map((group, index) => (
                            <Grid size={{ xs: 12 }} key={index}>
                                <Card variant="outlined">
                                    <CardHeader
                                        avatar={<DirectionsCarIcon color="primary" />}
                                        title={`Sighting at ${group.leader_sighting.location_id}`}
                                        subheader={format(new Date(group.leader_sighting.timestamp), 'PPpp')}
                                        action={
                                            <Chip label={`${group.followers.length} Followers`} color="warning" />
                                        }
                                    />
                                    <Divider />
                                    <CardContent>
                                        <Table size="small">
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Follower Plate</TableCell>
                                                    <TableCell>Vehicle</TableCell>
                                                    <TableCell>Time Difference</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {group.followers.map((follower) => {
                                                    const diff = (new Date(follower.timestamp).getTime() - new Date(group.leader_sighting.timestamp).getTime()) / 1000;
                                                    return (
                                                        <TableRow key={follower.id}>
                                                            <TableCell sx={{ fontWeight: 'bold' }}>{follower.plate_number}</TableCell>
                                                            <TableCell>
                                                                {follower.vehicle_color} {follower.vehicle_make} {follower.vehicle_model}
                                                            </TableCell>
                                                            <TableCell>
                                                                {diff > 0 ? `+${diff.toFixed(1)}s` : `${diff.toFixed(1)}s`}
                                                            </TableCell>
                                                        </TableRow>
                                                    );
                                                })}
                                            </TableBody>
                                        </Table>
                                    </CardContent>
                                </Card>
                            </Grid>
                        ))}
                    </Grid>
                </Box>
            )}
        </Box>
    );
};

const ODMatrix: React.FC = () => {
    const { data: matrix, isLoading } = useQuery({
        queryKey: ['od-matrix'],
        queryFn: () => getODMatrix(),
    });

    if (isLoading) return <CircularProgress />;
    if (!matrix || matrix.length === 0) return <Typography>No trip data available.</Typography>;

    // Extract unique locations
    const locations = Array.from(new Set([
        ...matrix.map(m => m.origin),
        ...matrix.map(m => m.destination)
    ])).sort();

    return (
        <Box>
            <Typography variant="body1" color="textSecondary" paragraph>
                Visualize traffic flow between locations. Rows represent Origins, Columns represent Destinations.
            </Typography>
            <Paper sx={{ overflowX: 'auto' }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ fontWeight: 'bold' }}>Origin \ Destination</TableCell>
                            {locations.map(loc => (
                                <TableCell key={loc} align="center" sx={{ fontWeight: 'bold' }}>{loc}</TableCell>
                            ))}
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {locations.map(origin => (
                            <TableRow key={origin}>
                                <TableCell sx={{ fontWeight: 'bold' }}>{origin}</TableCell>
                                {locations.map(dest => {
                                    const entry = matrix.find(m => m.origin === origin && m.destination === dest);
                                    const count = entry ? entry.count : 0;
                                    return (
                                        <TableCell key={dest} align="center" sx={{
                                            bgcolor: count > 0 ? `rgba(25, 118, 210, ${Math.min(count / 10, 0.5)})` : 'inherit',
                                            fontWeight: count > 0 ? 'bold' : 'normal'
                                        }}>
                                            {count > 0 ? count : '-'}
                                        </TableCell>
                                    );
                                })}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Paper>
        </Box>
    );
};

const AnalyticsDashboard: React.FC = () => {
    const [tab, setTab] = useState(0);

    return (
        <Box>
            <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <GroupIcon fontSize="large" color="primary" /> Analytics Dashboard
            </Typography>

            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
                <Tabs value={tab} onChange={(_, newValue) => setTab(newValue)}>
                    <Tab icon={<GroupIcon />} label="Convoy Analysis" />
                    <Tab icon={<RouteIcon />} label="Origin-Destination Matrix" />
                </Tabs>
            </Box>

            {tab === 0 && <ConvoyAnalysis />}
            {tab === 1 && <ODMatrix />}
        </Box>
    );
};

export default AnalyticsDashboard;
