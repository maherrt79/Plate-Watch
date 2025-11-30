import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Container, Typography, AppBar, Toolbar, Box, Button } from '@mui/material';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { SightingsList } from './components/SightingsList';
import { PlateSearchInput } from './components/PlateSearchInput';
import { HotlistManager } from './components/HotlistManager';
import LocalPoliceIcon from '@mui/icons-material/LocalPolice';

const queryClient = new QueryClient();

function Dashboard() {
  const [searchPlate, setSearchPlate] = useState('');
  return (
    <>
      <Typography variant="h4" gutterBottom>
        Recent Sightings
      </Typography>
      <PlateSearchInput onSearch={setSearchPlate} />
      <SightingsList plateNumber={searchPlate} />
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Box sx={{ flexGrow: 1 }}>
          <AppBar position="static">
            <Toolbar>
              <LocalPoliceIcon sx={{ mr: 2 }} />
              <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                Plate-Watch Dashboard
              </Typography>
              <Button color="inherit" component={Link} to="/">Dashboard</Button>
              <Button color="inherit" component={Link} to="/hotlists">Hotlists</Button>
            </Toolbar>
          </AppBar>
          <Container maxWidth="lg" sx={{ mt: 4 }}>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/hotlists" element={<HotlistManager />} />
            </Routes>
          </Container>
        </Box>
      </BrowserRouter>
    </QueryClientProvider>
  );
}


export default App;
