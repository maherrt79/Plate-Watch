import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getHotlists, createHotlist, deleteHotlist } from '../services/api';
import { Box, Typography, Snackbar, Alert } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import { AxiosError } from 'axios';
import { HotlistForm } from './Hotlist/HotlistForm';
import { HotlistTable } from './Hotlist/HotlistTable';

export const HotlistManager = () => {
    const queryClient = useQueryClient();
    const [plateNumber, setPlateNumber] = useState('');
    const [description, setDescription] = useState('');
    const [category, setCategory] = useState('danger');
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

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
            setSuccess('Plate added to hotlist');
            setError(null);
        },
        onError: (err: AxiosError<{ detail: string }>) => {
            if (err.response?.status === 400) {
                setError(err.response.data.detail || 'Plate already exists in hotlist');
            } else {
                setError('Failed to add plate');
            }
            setSuccess(null);
        }
    });

    const deleteMutation = useMutation({
        mutationFn: deleteHotlist,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['hotlists'] });
            setSuccess('Plate removed from hotlist');
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (plateNumber) {
            createMutation.mutate({ plate_number: plateNumber, description, category });
        }
    };

    const handleCloseSnackbar = () => {
        setError(null);
        setSuccess(null);
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <WarningIcon color="error" /> Hotlist Manager
            </Typography>

            <HotlistForm
                plateNumber={plateNumber}
                setPlateNumber={setPlateNumber}
                description={description}
                setDescription={setDescription}
                category={category}
                setCategory={setCategory}
                onSubmit={handleSubmit}
                isSubmitting={createMutation.isPending}
            />

            <HotlistTable
                hotlists={hotlists || []}
                onDelete={(id) => deleteMutation.mutate(id)}
            />

            <Snackbar open={!!error} autoHideDuration={6000} onClose={handleCloseSnackbar}>
                <Alert onClose={handleCloseSnackbar} severity="error" sx={{ width: '100%' }}>
                    {error}
                </Alert>
            </Snackbar>
            <Snackbar open={!!success} autoHideDuration={6000} onClose={handleCloseSnackbar}>
                <Alert onClose={handleCloseSnackbar} severity="success" sx={{ width: '100%' }}>
                    {success}
                </Alert>
            </Snackbar>
        </Box>
    );
};
