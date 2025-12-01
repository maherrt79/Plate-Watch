import React from 'react';
import { Paper, Grid, TextField, Button } from '@mui/material';

interface HotlistFormProps {
    plateNumber: string;
    setPlateNumber: (value: string) => void;
    description: string;
    setDescription: (value: string) => void;
    category: string;
    setCategory: (value: string) => void;
    onSubmit: (e: React.FormEvent) => void;
    isSubmitting: boolean;
}

export const HotlistForm: React.FC<HotlistFormProps> = ({
    plateNumber, setPlateNumber,
    description, setDescription,
    category, setCategory,
    onSubmit,
    isSubmitting
}) => {
    return (
        <Paper sx={{ p: 2, mb: 4 }}>
            <form onSubmit={onSubmit}>
                <Grid container spacing={2} alignItems="center">
                    <Grid size={{ xs: 12, sm: 3 }}>
                        <TextField
                            label="Plate Number"
                            value={plateNumber}
                            onChange={(e) => setPlateNumber(e.target.value)}
                            fullWidth
                            required
                            size="small"
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 4 }}>
                        <TextField
                            label="Description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            fullWidth
                            size="small"
                        />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 3 }}>
                        <TextField
                            select
                            label="Category"
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            fullWidth
                            size="small"
                            SelectProps={{ native: true }}
                        >
                            <option value="danger">Danger (Stolen/Wanted)</option>
                            <option value="banned">Banned (Access Denied)</option>
                            <option value="info">Info (VIP/Resident)</option>
                        </TextField>
                    </Grid>
                    <Grid size={{ xs: 12, sm: 2 }}>
                        <Button
                            type="submit"
                            variant="contained"
                            color="error"
                            fullWidth
                            disabled={isSubmitting}
                        >
                            Add to Hotlist
                        </Button>
                    </Grid>
                </Grid>
            </form>
        </Paper>
    );
};
