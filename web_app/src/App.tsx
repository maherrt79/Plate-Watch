import { useEffect } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Container, Typography, AppBar, Toolbar, Box, Button, ThemeProvider, CssBaseline } from '@mui/material';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { SightingsList } from './components/SightingsList';
import { HotlistManager } from './components/HotlistManager';
import LocalPoliceIcon from '@mui/icons-material/LocalPolice';
import MapDashboard from './pages/MapDashboard';
import AnalyticsDashboard from './pages/AnalyticsDashboard';
import theme from './theme';
import { ToastProvider, useToast } from './contexts/ToastContext';
import { setupInterceptors } from './services/api';

const queryClient = new QueryClient();

function Dashboard() {
  return (
    <>
      <Typography variant="h4" gutterBottom color="primary">
        Recent Sightings
      </Typography>
      <SightingsList />
    </>
  );
}

function AppContent() {
  const { showToast } = useToast();

  useEffect(() => {
    setupInterceptors(showToast);
  }, [showToast]);

  return (
    <Box sx={{ flexGrow: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <AppBar position="static" elevation={0}>
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            <LocalPoliceIcon sx={{ mr: 2, color: 'primary.main' }} />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, textTransform: 'uppercase', letterSpacing: 1 }}>
              Plate-Watch <Box component="span" sx={{ color: 'primary.main' }}>PRO</Box>
            </Typography>
            <Button color="inherit" component={Link} to="/">Dashboard</Button>
            <Button color="inherit" component={Link} to="/map">Map</Button>
            <Button color="inherit" component={Link} to="/hotlists">Hotlists</Button>
            <Button color="inherit" component={Link} to="/analytics">Analytics</Button>
          </Toolbar>
        </Container>
      </AppBar>
      <Container maxWidth="xl" sx={{ mt: 4, flex: 1 }}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/map" element={<MapDashboard />} />
          <Route path="/hotlists" element={<HotlistManager />} />
          <Route path="/analytics" element={<AnalyticsDashboard />} />
        </Routes>
      </Container>
    </Box>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <ToastProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </ToastProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}


export default App;
