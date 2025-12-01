import React from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper,
    Typography, Chip
} from '@mui/material';
import { format } from 'date-fns';
import { getCategoryStyle } from '../../utils/hotlistColors';
import type { Sighting } from '../../types/sighting';

interface SightingsTableProps {
    sightings: Sighting[];
}

export const SightingsTable: React.FC<SightingsTableProps> = ({ sightings }) => {
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
                    {sightings.map((sighting) => {
                        const categoryStyle = sighting.is_hot ? getCategoryStyle(sighting.hotlist_category) : null;

                        return (
                            <TableRow
                                key={sighting.id}
                                hover
                            >
                                <TableCell>
                                    <Chip
                                        label={sighting.plate_number}
                                        color={categoryStyle ? categoryStyle.color : "primary"}
                                        variant={sighting.is_hot ? "filled" : "outlined"}
                                        sx={{ fontWeight: 'bold' }}
                                    />
                                    {sighting.is_hot && categoryStyle && (
                                        <Typography
                                            variant="caption"
                                            sx={{
                                                ml: 1,
                                                fontWeight: 'bold',
                                                color: categoryStyle.hex,
                                                textTransform: 'uppercase'
                                            }}
                                        >
                                            {categoryStyle.label} ALERT
                                        </Typography>
                                    )}
                                </TableCell>
                                <TableCell>
                                    {sighting.vehicle_make && sighting.vehicle_model
                                        ? `${sighting.vehicle_make} ${sighting.vehicle_model}`
                                        : 'Unknown'}
                                </TableCell>
                                <TableCell>
                                    {sighting.vehicle_color || 'Unknown'}
                                </TableCell>
                                <TableCell>
                                    {sighting.direction || 'Unknown'}
                                </TableCell>
                                <TableCell>{sighting.location_id}</TableCell>
                                <TableCell>
                                    {sighting.timestamp ? format(new Date(sighting.timestamp), 'PPpp') : 'N/A'}
                                </TableCell>
                                <TableCell>
                                    {sighting.created_at ? format(new Date(sighting.created_at), 'PPpp') : 'N/A'}
                                </TableCell>
                            </TableRow>
                        );
                    })}

                    {sightings.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={7} align="center">
                                No sightings recorded yet.
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </TableContainer>
    );
};
