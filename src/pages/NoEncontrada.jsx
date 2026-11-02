import { Box, Button, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { HomeOutlined } from '@mui/icons-material';

export default function NoEncontrada() {
  return (
    <Box sx={{ textAlign: 'center', py: 12 }}>
      <Typography sx={{ color: 'primary.main', fontSize: 85, fontWeight: 900 }}>404</Typography>
      <Typography variant="h5" mb={1}>No encontramos esa página</Typography>
      <Typography color="text.secondary" mb={4}>Puedes volver al panel principal desde el menú o usando este botón.</Typography>
      <Button component={Link} to="/" variant="contained" startIcon={<HomeOutlined />}>Ir al inicio</Button>
    </Box>
  );
}
