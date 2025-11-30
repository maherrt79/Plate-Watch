import React from 'react';
import { Grid, Paper, Typography, Box } from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import WarningIcon from '@mui/icons-material/Warning';
import type { Sighting } from '../../types/sighting';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => (
    <Paper sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Box>
            <Typography variant="body2" color="textSecondary">
                {title}
            </Typography>
            <Typography variant="h4" fontWeight="bold">
                {value}
            </Typography>
        </Box>
        <Box sx={{
            backgroundColor: `${color}20`,
            borderRadius: '50%',
            p: 1,
            display: 'flex',
            color: color
        }}>
            {icon}
        </Box>
    </Paper>
);

interface DashboardStatsProps {
    sightings: Sighting[];
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ sightings }) => {
    // Calculate stats
    const totalSightings = sightings.length;
    const activeAlerts = sightings.filter(s => s.is_hot).length;

    // Calculate alerts by category
    const alertsByCategory = sightings
        .filter(s => s.is_hot && s.hotlist_category)
        .reduce((acc, s) => {
            const cat = s.hotlist_category || 'Unknown';
            acc[cat] = (acc[cat] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

    return (
        <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                    title="Total Sightings"
                    value={totalSightings}
                    icon={<DirectionsCarIcon fontSize="large" />}
                    color="#1976d2"
                />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
                <StatCard
                    title="Total Alerts"
                    value={activeAlerts}
                    icon={<WarningIcon fontSize="large" />}
                    color="#d32f2f"
                />
            </Grid>

            {/* Dynamic Category Cards */}
            {Object.entries(alertsByCategory).map(([category, count]) => (
                <Grid key={category} size={{ xs: 12, sm: 6, md: 3 }}>
                    <StatCard
                        title={`${category} Alerts`}
                        value={count}
                        icon={<WarningIcon fontSize="large" />}
                        color="#ed6c02"
                    />
                </Grid>
            ))}
        </Grid>
    );
};

export default DashboardStats;
