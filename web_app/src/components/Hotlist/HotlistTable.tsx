import React from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    IconButton, Chip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import type { Hotlist } from '../../services/api';

interface HotlistTableProps {
    hotlists: Hotlist[];
    onDelete: (id: string) => void;
}

export const HotlistTable: React.FC<HotlistTableProps> = ({ hotlists, onDelete }) => {
    return (
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
                    {hotlists.map((item) => (
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
                                    onClick={() => onDelete(item.id)}
                                    color="error"
                                    size="small"
                                >
                                    <DeleteIcon />
                                </IconButton>
                            </TableCell>
                        </TableRow>
                    ))}
                    {hotlists.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={4} align="center">
                                No hotlist entries.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
};
