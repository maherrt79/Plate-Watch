import React from 'react';
import { Box, Typography } from '@mui/material';
import AlertFeed from '../components/AlertFeed/AlertFeed';

const AlertsPage: React.FC = () => {
    return (
        <Box sx={{ height: 'calc(100vh - 100px)', display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h4" color="primary" sx={{ textTransform: 'uppercase', letterSpacing: 2 }}>
                Command Center // Live Feed
            </Typography>
            <Box sx={{ flex: 1, overflow: 'hidden' }}>
                <AlertFeed />
            </Box>
        </Box>
    );
};

export default AlertsPage;
