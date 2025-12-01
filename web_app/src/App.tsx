import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Container, Typography, AppBar, Toolbar, Box, Button, ThemeProvider, CssBaseline } from '@mui/material';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { SightingsList } from './components/SightingsList';
import { HotlistManager } from './components/HotlistManager';
import LocalPoliceIcon from '@mui/icons-material/LocalPolice';
import MapDashboard from './pages/MapDashboard';
import theme from './theme';

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

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <BrowserRouter>
          <Box sx={{ flexGrow: 1, minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <AppBar position="static" elevation={0}>
              <Toolbar>
                <LocalPoliceIcon sx={{ mr: 2, color: 'primary.main' }} />
                <Typography variant="h6" component="div" sx={{ flexGrow: 1, textTransform: 'uppercase', letterSpacing: 1 }}>
                  Plate-Watch <Box component="span" sx={{ color: 'primary.main' }}>PRO</Box>
                </Typography>
                <Button color="inherit" component={Link} to="/">Dashboard</Button>
                <Button color="inherit" component={Link} to="/map">Map</Button>
                <Button color="inherit" component={Link} to="/hotlists">Hotlists</Button>
              </Toolbar>
            </AppBar>
            <Container maxWidth={false} sx={{ mt: 4, flex: 1 }}>
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/map" element={<MapDashboard />} />
                <Route path="/hotlists" element={<HotlistManager />} />
              </Routes>
            </Container>
          </Box>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  );
}


export default App;
