import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getHotlists, createHotlist, deleteHotlist } from '../services/api';
import {
    Box, Typography, Paper, TextField, Button, Table, TableBody,
    TableCell, TableContainer, TableHead, TableRow, IconButton, Chip,
    Grid
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import WarningIcon from '@mui/icons-material/Warning';

export const HotlistManager = () => {
    const queryClient = useQueryClient();
    const [plateNumber, setPlateNumber] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('danger');

    const { data: hotlists } = useQuery({
        queryKey: ['hotlists'],
        queryFn: getHotlists,
    });

    const createMutation = useMutation({
        mutationFn: createHotlist,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['hotlists'] });
            setPlateNumber('');
            setDescription('');
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteHotlist,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['hotlists'] });
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (plateNumber) {
            createMutation.mutate({ plate_number: plateNumber, description, category });
        }
    };

    return (
        <Box>
            <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <WarningIcon color="error" /> Hotlist Manager
            </Typography>

            <Paper sx={{ p: 2, mb: 4 }}>
                <form onSubmit={handleSubmit}>
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
                                disabled={createMutation.isPending}
                            >
                                Add to Hotlist
                            </Button>
                        </Grid>
                    </Grid>
                </form>
            </Paper>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Plate</TableCell>
                            <TableCell>Category</TableCell>
                            <TableCell>Description</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {hotlists?.map((item) => (
                            <TableRow key={item.id}>
                                <TableCell>
                                    <Chip
                                        label={item.plate_number}
                                        color={item.category === 'danger' ? 'error' : (item.category === 'banned' ? 'warning' : 'info')}
                                        variant="outlined"
                                        sx={{ fontWeight: 'bold' }}
                                    />
                                </TableCell>
                                <TableCell>{item.category.toUpperCase()}</TableCell>
                                <TableCell>{item.description}</TableCell>
                                <TableCell align="right">
                                    <IconButton
                                        onClick={() => deleteMutation.mutate(item.id)}
                                        color="error"
                                        size="small"
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                        {hotlists?.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={4} align="center">
                                    No hotlist entries.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};
