import React, { useState } from 'react';
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
    Box,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    type SelectChangeEvent
} from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import type { Sighting } from '../../types/sighting';
import { ENTRANCES } from './CityMap';

interface RecentAlertsProps {
    sightings: Sighting[];
    onSelectSighting: (sighting: Sighting) => void;
    selectedSightingId?: string;
}

const RecentAlerts: React.FC<RecentAlertsProps> = ({ sightings, onSelectSighting, selectedSightingId }) => {
    const [plateFilter, setPlateFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('All');

    // Get unique categories
    const categories = Array.from(new Set(sightings
        .filter(s => s.is_hot && s.hotlist_category)
        .map(s => s.hotlist_category!)
    ));

    // Filter for hot sightings and sort by timestamp descending
    const alerts = sightings
        .filter(s => s.is_hot)
        .filter(s => s.plate_number.toLowerCase().includes(plateFilter.toLowerCase()))
        .filter(s => categoryFilter === 'All' || s.hotlist_category === categoryFilter)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 10); // Show last 10 alerts

    const handleCategoryChange = (event: SelectChangeEvent) => {
        setCategoryFilter(event.target.value as string);
    };

    return (
        <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
            <Box sx={{ p: 2 }}>
                <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', color: 'error.main', mb: 2 }}>
                    <WarningIcon sx={{ mr: 1 }} /> Recent Alerts
                </Typography>

                <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    <TextField
                        label="Plate"
                        variant="outlined"
                        size="small"
                        fullWidth
                        value={plateFilter}
                        onChange={(e) => setPlateFilter(e.target.value)}
                    />
                    <FormControl size="small" fullWidth>
                        <InputLabel>Type</InputLabel>
                        <Select
                            value={categoryFilter}
                            label="Type"
                            onChange={handleCategoryChange}
                        >
                            <MenuItem value="All">All</MenuItem>
                            {categories.map(cat => (
                                <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
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
                                        backgroundColor: isSelected ? '#ffebee' : '#fff0f0',
                                        cursor: 'pointer',
                                        borderLeft: isSelected ? '4px solid #d32f2f' : 'none',
                                        '&:hover': {
                                            backgroundColor: '#ffcdd2',
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
                                                color="error"
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
