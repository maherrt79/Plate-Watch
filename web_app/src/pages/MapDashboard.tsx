import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Typography, Box, Paper, Grid, TextField, FormControlLabel, Switch, FormGroup } from '@mui/material';
import CityMap, { ENTRANCES } from '../components/Map/CityMap';
import RecentAlerts from '../components/Map/RecentAlerts';
import DashboardStats from '../components/Map/DashboardStats';
import type { Sighting } from '../types/sighting';
import { getSightings } from '../services/api';
const MapDashboard: React.FC = () => {
    const [selectedSighting, setSelectedSighting] = useState<Sighting | null>(null);
    const [plateFilter, setPlateFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');
    const [showHeatmap, setShowHeatmap] = useState(false);
    const [showTrajectory, setShowTrajectory] = useState(true);

    const { data: sightings = [] } = useQuery({
        queryKey: ['mapSightings', plateFilter, categoryFilter],
        queryFn: async () => {
            const data = await getSightings({
                plateNumber: plateFilter || undefined,
                hotlistCategory: categoryFilter !== 'All' ? categoryFilter : undefined
            });
            // Filter for sightings that have a known location ID (for the map at least)
            return data.filter(s => ENTRANCES[s.location_id]);
        },
        refetchInterval: 5000,
    });

    const handleSelectSighting = (sighting: Sighting) => {
        setSelectedSighting(sighting);
    };

    // No need for client-side filtering anymore
    const filteredSightings = sightings;

    return (
        <Box sx={{ width: '100%' }}>
            <Typography component="h2" variant="h5" color="primary" gutterBottom sx={{ mb: 3 }}>
                Live Map Dashboard - Jableh
            </Typography>

            <DashboardStats />

            <Paper sx={{ p: 2, mb: 3 }}>
                <Grid container spacing={2} alignItems="center">
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <TextField
                            label="Search Plate"
                            variant="outlined"
                            fullWidth
                            value={plateFilter}
                            onChange={(e) => setPlateFilter(e.target.value)}
                            size="small"
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <TextField
                            select
                            label="Alert Type"
                            variant="outlined"
                            fullWidth
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
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
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <FormGroup row sx={{ justifyContent: 'center' }}>
                            <FormControlLabel
                                control={<Switch checked={showHeatmap} onChange={(e) => setShowHeatmap(e.target.checked)} />}
                                label="Heatmap"
                            />
                            <FormControlLabel
                                control={<Switch checked={showTrajectory} onChange={(e) => setShowTrajectory(e.target.checked)} />}
                                label="Trajectory"
                            />
                        </FormGroup>
                    </Grid>
                </Grid>
            </Paper>

            <Grid container spacing={2}>
                {/* Map Section */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <CityMap
                        sightings={filteredSightings}
                        selectedSighting={selectedSighting}
                        showHeatmap={showHeatmap}
                        showTrajectory={showTrajectory}
                    />
                    <Box sx={{ mt: 2 }}>
                        <Typography variant="body2" color="textSecondary">
                            Monitoring 7 key points: North, South, East, West, Center, Port, and Stadium.
                            Red markers indicate Hotlist alerts. Click an alert to locate it.
                        </Typography>
                    </Box>
                </Grid>

                {/* Alerts Side Table */}
                <Grid size={{ xs: 12, md: 6 }}>
                    <RecentAlerts
                        sightings={sightings}
                        onSelectSighting={handleSelectSighting}
                        selectedSightingId={selectedSighting?.id}
                        plateFilter={plateFilter}
                        categoryFilter={categoryFilter}
                    />
                </Grid>
            </Grid>
        </Box>
    );
};

export default MapDashboard;
