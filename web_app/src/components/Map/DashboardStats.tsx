import React from 'react';
import { Paper, Typography, Box } from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import WarningIcon from '@mui/icons-material/Warning';
import type { Sighting } from '../../types/sighting';
import { getCategoryStyle, HOTLIST_CATEGORIES } from '../../utils/hotlistColors';

interface StatCardProps {
    title: string;
    value: string | number;
    icon: React.ReactNode;
    color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => (
    <Paper sx={{ p: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: '100%' }}>
        <Box>
            <Typography variant="caption" color="textSecondary" sx={{ textTransform: 'uppercase', letterSpacing: 0.5 }}>
                {title}
            </Typography>
            <Typography variant="h5" fontWeight="bold">
                {value}
            </Typography>
        </Box>
        <Box sx={{
            backgroundColor: `${color}15`, // Lower opacity
            borderRadius: '50%',
            p: 0.5,
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

    // Initialize counts for standard categories
    const standardCategories = Object.keys(HOTLIST_CATEGORIES).filter(k => k !== 'default');
    const alertsByCategory: Record<string, number> = {};

    standardCategories.forEach(cat => {
        alertsByCategory[cat] = 0;
    });

    // Populate with actual data
    sightings.forEach(s => {
        if (s.is_hot && s.hotlist_category) {
            const cat = s.hotlist_category.toLowerCase();
            alertsByCategory[cat] = (alertsByCategory[cat] || 0) + 1;
        }
    });

    return (
        <Box sx={{ mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Box sx={{ flex: 1, minWidth: '140px' }}>
                <StatCard
                    title="Total Sightings"
                    value={totalSightings}
                    icon={<DirectionsCarIcon />}
                    color="#00e5ff"
                />
            </Box>
            <Box sx={{ flex: 1, minWidth: '140px' }}>
                <StatCard
                    title="Total Alerts"
                    value={activeAlerts}
                    icon={<WarningIcon />}
                    color="#ff1744"
                />
            </Box>
            {Object.entries(alertsByCategory).map(([category, count]) => {
                const style = getCategoryStyle(category);
                return (
                    <Box key={category} sx={{ flex: 1, minWidth: '140px' }}>
                        <StatCard
                            title={style.label}
                            value={count}
                            icon={<WarningIcon />}
                            color={style.hex}
                        />
                    </Box>
                );
            })}
        </Box>
    );
};

export default DashboardStats;
