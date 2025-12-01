import React from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    Skeleton
} from '@mui/material';

export const SightingsTableSkeleton: React.FC = () => {
    return (
        <TableContainer component={Paper}>
            <Table>
                <TableHead>
                    <TableRow>
                        <TableCell>Plate Number</TableCell>
                        <TableCell>Vehicle</TableCell>
                        <TableCell>Color</TableCell>
                        <TableCell>Direction</TableCell>
                        <TableCell>Location</TableCell>
                        <TableCell>Timestamp</TableCell>
                        <TableCell>Seen At</TableCell>
                    </TableRow>
                </TableHead>
                <TableBody>
                    {[...Array(5)].map((_, index) => (
                        <TableRow key={index}>
                            <TableCell><Skeleton variant="rectangular" width={80} height={32} sx={{ borderRadius: 1 }} /></TableCell>
                            <TableCell><Skeleton variant="text" width={120} /></TableCell>
                            <TableCell><Skeleton variant="text" width={60} /></TableCell>
                            <TableCell><Skeleton variant="text" width={80} /></TableCell>
                            <TableCell><Skeleton variant="text" width={100} /></TableCell>
                            <TableCell><Skeleton variant="text" width={150} /></TableCell>
                            <TableCell><Skeleton variant="text" width={150} /></TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </TableContainer>
    );
};
