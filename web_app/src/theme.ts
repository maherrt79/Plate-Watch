import { createTheme } from '@mui/material/styles';

const theme = createTheme({
    palette: {
        mode: 'dark',
        primary: {
            main: '#00e5ff', // Neon Cyan
            contrastText: '#000',
        },
        secondary: {
            main: '#d500f9', // Neon Purple
        },
        background: {
            default: '#050b14', // Very dark blue/black
            paper: 'rgba(10, 25, 41, 0.7)', // Semi-transparent
        },
        text: {
            primary: '#ffffff',
            secondary: 'rgba(255, 255, 255, 0.7)',
        },
        error: {
            main: '#ff1744', // Bright Red
        },
        warning: {
            main: '#ff9100',
        },
    },
    typography: {
        fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
        h1: { fontWeight: 700 },
        h2: { fontWeight: 700 },
        h3: { fontWeight: 600 },
        h4: { fontWeight: 600 },
        h5: { fontWeight: 600 },
        h6: { fontWeight: 600, letterSpacing: '0.5px' },
    },
    components: {
        MuiCssBaseline: {
            styleOverrides: {
                body: {
                    backgroundColor: '#050b14',
                    backgroundImage: 'radial-gradient(circle at 50% 50%, #112240 0%, #050b14 100%)',
                    backgroundAttachment: 'fixed',
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: {
                    backdropFilter: 'blur(10px)',
                    backgroundColor: 'rgba(10, 25, 41, 0.7)',
                    border: '1px solid rgba(0, 229, 255, 0.1)',
                    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
                },
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    backgroundColor: 'rgba(5, 11, 20, 0.8)',
                    backdropFilter: 'blur(10px)',
                    borderBottom: '1px solid rgba(0, 229, 255, 0.2)',
                    backgroundImage: 'none',
                },
            },
        },
        MuiTableCell: {
            styleOverrides: {
                root: {
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                },
                head: {
                    fontWeight: 700,
                    color: '#00e5ff',
                    backgroundColor: 'rgba(0, 0, 0, 0.2) !important',
                },
            },
        },
        MuiTableRow: {
            styleOverrides: {
                root: {
                    '&:hover': {
                        backgroundColor: 'rgba(0, 229, 255, 0.08) !important',
                    },
                },
            },
        },
    },
});

export default theme;
