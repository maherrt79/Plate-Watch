import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Paper, Typography, Box, Skeleton } from '@mui/material';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import WarningIcon from '@mui/icons-material/Warning';
import { getSightingStats } from '../../services/api';
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

const DashboardStats: React.FC = () => {
    const { data: stats, isLoading } = useQuery({
        queryKey: ['sightingStats'],
        queryFn: getSightingStats,
        refetchInterval: 10000, // Refresh every 10s
    });

    if (isLoading || !stats) {
        return (
            <Box sx={{ mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {[...Array(5)].map((_, index) => (
                    <Box key={index} sx={{ flex: 1, minWidth: '140px' }}>
                        <Paper sx={{ p: 1.5, height: '100%' }}>
                            <Skeleton variant="text" width="60%" height={20} sx={{ mb: 1 }} />
                            <Skeleton variant="rectangular" width="40%" height={32} />
                        </Paper>
                    </Box>
                ))}
            </Box>
        );
    }

    const { total_sightings, total_alerts, alerts_by_category } = stats;
    const standardCategories = Object.keys(HOTLIST_CATEGORIES).filter(k => k !== 'default');

    return (
        <Box sx={{ mb: 2, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
            <Box sx={{ flex: 1, minWidth: '140px' }}>
                <StatCard
                    title="Total Sightings"
                    value={total_sightings}
                    icon={<DirectionsCarIcon />}
                    color="#00e5ff"
                />
            </Box>
            <Box sx={{ flex: 1, minWidth: '140px' }}>
                <StatCard
                    title="Total Alerts"
                    value={total_alerts}
                    icon={<WarningIcon />}
                    color="#ff1744"
                />
            </Box>
            {standardCategories.map(category => {
                const count = alerts_by_category[category] || 0;
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
