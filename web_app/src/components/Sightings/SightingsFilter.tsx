import React from 'react';
import { Paper, Grid, TextField } from '@mui/material';

interface SightingsFilterProps {
    plateSearch: string;
    setPlateSearch: (value: string) => void;
    locationId: string;
    setLocationId: (value: string) => void;
    startDate: string;
    setStartDate: (value: string) => void;
    endDate: string;
    setEndDate: (value: string) => void;
    alertType: string;
    setAlertType: (value: string) => void;
}

export const SightingsFilter: React.FC<SightingsFilterProps> = ({
    plateSearch, setPlateSearch,
    locationId, setLocationId,
    startDate, setStartDate,
    endDate, setEndDate,
    alertType, setAlertType
}) => {
    return (
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
    );
};
