import React, { useState } from 'react';
import { TextField, InputAdornment, IconButton, Paper } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';

interface PlateSearchInputProps {
    onSearch: (plateNumber: string) => void;
}

export const PlateSearchInput: React.FC<PlateSearchInputProps> = ({ onSearch }) => {
    const [value, setValue] = useState('');

    const handleSearch = () => {
        onSearch(value);
    };

    const handleClear = () => {
        setValue('');
        onSearch('');
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <Paper sx={{ p: 2, mb: 2 }}>
            <TextField
                fullWidth
                label="Search License Plate (Partial Match Supported)"
                variant="outlined"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                onKeyPress={handleKeyPress}
                InputProps={{
                    endAdornment: (
                        <InputAdornment position="end">
                            {value && (
                                <IconButton onClick={handleClear}>
                                    <ClearIcon />
                                </IconButton>
                            )}
                            <IconButton onClick={handleSearch} edge="end">
                                <SearchIcon />
                            </IconButton>
                        </InputAdornment>
                    ),
                }}
            />
        </Paper>
    );
};
