import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Container, Typography, AppBar, Toolbar, Box } from '@mui/material';
import { SightingsList } from './components/SightingsList';
import { PlateSearchInput } from './components/PlateSearchInput';
import LocalPoliceIcon from '@mui/icons-material/LocalPolice';

const queryClient = new QueryClient();

function App() {
  const [searchPlate, setSearchPlate] = useState('');

  return (
    <QueryClientProvider client={queryClient}>
      <Box sx={{ flexGrow: 1 }}>
        <AppBar position="static">
          <Toolbar>
            <LocalPoliceIcon sx={{ mr: 2 }} />
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Plate-Watch Dashboard
            </Typography>
          </Toolbar>
        </AppBar>
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <Typography variant="h4" gutterBottom>
            Recent Sightings
          </Typography>
          <PlateSearchInput onSearch={setSearchPlate} />
          <SightingsList plateNumber={searchPlate} />
        </Container>
      </Box>
    </QueryClientProvider>
  );
}


export default App;
