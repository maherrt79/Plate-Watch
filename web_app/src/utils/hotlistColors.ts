import type { ChipProps } from '@mui/material';

export type HotlistCategory = 'danger' | 'banned' | 'info' | string;

interface CategoryStyle {
    color: ChipProps['color'];
    label: string;
    hex: string; // For non-MUI components like charts/maps
}

export const HOTLIST_CATEGORIES: Record<string, CategoryStyle> = {
    'danger': {
        color: 'error',
        label: 'Danger',
        hex: '#d32f2f' // MUI Error Main
    },
    'banned': {
        color: 'warning',
        label: 'Banned',
        hex: '#ed6c02' // MUI Warning Main
    },
    'info': {
        color: 'info',
        label: 'Info',
        hex: '#0288d1' // MUI Info Main
    },
    'default': {
        color: 'default',
        label: 'Unknown',
        hex: '#757575' // Grey
    }
};

export const getCategoryStyle = (category?: string): CategoryStyle => {
    const key = category?.toLowerCase() || 'default';
    return HOTLIST_CATEGORIES[key] || HOTLIST_CATEGORIES['default'];
};
