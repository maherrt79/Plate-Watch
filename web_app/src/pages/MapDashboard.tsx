import React, { useEffect, useState } from 'react';
import { Container, Typography, Box, Paper, Grid } from '@mui/material';
import CityMap, { ENTRANCES } from '../components/Map/CityMap';
import RecentAlerts from '../components/Map/RecentAlerts';
import DashboardStats from '../components/Map/DashboardStats';
import type { Sighting } from '../types/sighting';
import { getSightings } from '../services/api';

const MapDashboard: React.FC = () => {
    const [sightings, setSightings] = useState<Sighting[]>([]);
    const [selectedSighting, setSelectedSighting] = useState<Sighting | null>(null);

    useEffect(() => {
        const fetchSightings = async () => {
            try {
                const data = await getSightings();
                // Filter for sightings that have a known location ID (for the map at least)
                // We might want to show all alerts in the table, but for consistency let's stick to Jableh ones if this is the Jableh dashboard
                const mappedSightings = data.filter(s => ENTRANCES[s.location_id]);
                setSightings(mappedSightings);
            } catch (error) {
                console.error("Failed to fetch sightings", error);
            }
        };

        fetchSightings();
        const interval = setInterval(fetchSightings, 5000); // Poll every 5 seconds
        return () => clearInterval(interval);
    }, []);

    const handleSelectSighting = (sighting: Sighting) => {
        setSelectedSighting(sighting);
    };

    return (
        <Container maxWidth="xl" sx={{ mt: 4, mb: 4 }}>
            <Typography component="h2" variant="h5" color="primary" gutterBottom sx={{ mb: 3 }}>
                Live Map Dashboard - Jableh
            </Typography>

            <DashboardStats sightings={sightings} />

            <Paper sx={{ p: 3, display: 'flex', flexDirection: 'column' }}>
                <Grid container spacing={3}>
                    {/* Map Section */}
                    <Grid size={{ xs: 12, md: 9 }}>
                        <CityMap
                            sightings={sightings}
                            selectedSighting={selectedSighting}
                        />
                        <Box sx={{ mt: 2 }}>
                            <Typography variant="body2" color="textSecondary">
                                Monitoring 7 key points: North, South, East, West, Center, Port, and Stadium.
                                Red markers indicate Hotlist alerts. Click an alert to locate it.
                            </Typography>
                        </Box>
                    </Grid>

                    {/* Alerts Side Table */}
                    <Grid size={{ xs: 12, md: 3 }}>
                        <RecentAlerts
                            sightings={sightings}
                            onSelectSighting={handleSelectSighting}
                            selectedSightingId={selectedSighting?.id}
                        />
                    </Grid>
                </Grid>
            </Paper>
        </Container>
    );
};

export default MapDashboard;
