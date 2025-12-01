import React from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Typography,
    Chip,
    Box
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import type { Sighting } from '../../types/sighting';
import { ENTRANCES } from './CityMap';
import { getCategoryStyle } from '../../utils/hotlistColors';

interface RecentAlertsProps {
    sightings: Sighting[];
    onSelectSighting: (sighting: Sighting) => void;
    selectedSightingId?: string;
    plateFilter: string;
    categoryFilter: string;
}

const RecentAlerts: React.FC<RecentAlertsProps> = ({
    sightings,
    onSelectSighting,
    selectedSightingId,
    plateFilter,
    categoryFilter
}) => {

    // Filter for hot sightings and sort by timestamp descending
    const alerts = sightings
        .filter(s => s.is_hot)
        .filter(s => s.plate_number.toLowerCase().includes(plateFilter.toLowerCase()))
        .filter(s => categoryFilter === 'All' || s.hotlist_category === categoryFilter)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 10); // Show last 10 alerts

    return (
        <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
            <Box sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', color: 'error.main', mb: 0 }}>
                    <WarningIcon sx={{ mr: 1 }} /> Recent Alerts
                </Typography>
            </Box>

            {alerts.length === 0 ? (
                <Box sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="body2" color="textSecondary">
                        No alerts match filters.
                    </Typography>
                </Box>
            ) : (
                <Table stickyHeader size="small">
                    <TableHead>
                        <TableRow>
                            <TableCell>Plate</TableCell>
                            <TableCell>Location</TableCell>
                            <TableCell>Time</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {alerts.map((alert) => {
                            const isSelected = selectedSightingId === alert.id;
                            return (
                                <TableRow
                                    key={alert.id}
                                    onClick={() => onSelectSighting(alert)}
                                    sx={{
                                        backgroundColor: isSelected ? 'rgba(255, 23, 68, 0.2)' : 'rgba(255, 23, 68, 0.05)',
                                        cursor: 'pointer',
                                        borderLeft: isSelected ? '4px solid #ff1744' : '4px solid transparent',
                                        transition: 'all 0.2s',
                                        '&:hover': {
                                            backgroundColor: 'rgba(255, 23, 68, 0.15)',
                                        }
                                    }}
                                >
                                    <TableCell>
                                        <Typography variant="subtitle2" fontWeight="bold">
                                            {alert.plate_number}
                                        </Typography>
                                        {alert.hotlist_category && (
                                            <Chip
                                                label={alert.hotlist_category}
                                                size="small"
                                                color={getCategoryStyle(alert.hotlist_category).color}
                                                variant="outlined"
                                                sx={{ mt: 0.5, height: 20, fontSize: '0.7rem' }}
                                            />
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        {ENTRANCES[alert.location_id]?.label || alert.location_id}
                                    </TableCell>
                                    <TableCell>
                                        {new Date(alert.timestamp).toLocaleTimeString()}
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            )}
        </TableContainer>
    );
};

export default RecentAlerts;
