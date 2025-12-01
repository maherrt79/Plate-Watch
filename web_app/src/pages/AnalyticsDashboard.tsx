import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    Box, Typography, TextField, Button, Paper, Grid, Slider,
    Card, CardContent, CardHeader, Divider, Chip,
    Table, TableBody, TableCell, TableHead, TableRow
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import GroupIcon from '@mui/icons-material/Group';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import { getConvoyAnalysis } from '../services/api';
import { format } from 'date-fns';

const AnalyticsDashboard: React.FC = () => {
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
            <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <GroupIcon fontSize="large" color="primary" /> Convoy Analysis
            </Typography>
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

export default AnalyticsDashboard;
