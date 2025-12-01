import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getHotlists, createHotlist, deleteHotlist } from '../services/api';
import { Box, Typography } from '@mui/material';
import WarningIcon from '@mui/icons-material/Warning';
import { HotlistForm } from './Hotlist/HotlistForm';
import { HotlistTable } from './Hotlist/HotlistTable';
import { useToast } from '../contexts/ToastContextDefinition';

export const HotlistManager = () => {
    const queryClient = useQueryClient();
    const { showToast } = useToast();
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
            showToast('Plate added to hotlist', 'success');
        },
        // Error handled globally by interceptor, but we can keep specific handling if needed.
        // For now, let's rely on global handler for generic errors.
    });

    const deleteMutation = useMutation({
        mutationFn: deleteHotlist,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['hotlists'] });
            showToast('Plate removed from hotlist', 'success');
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (plateNumber) {
            createMutation.mutate({ plate_number: plateNumber, description, category });
        }
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
        </Box>
    );
};
