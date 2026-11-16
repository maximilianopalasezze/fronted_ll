import { Link } from 'react-router-dom';
import { Button, Stack, Typography } from '@mui/material';
import { HomeOutlined } from '@mui/icons-material';
export default function NoEncontrada() {
  return <Stack alignItems="center" textAlign="center" spacing={2} py={8}>
    <Typography fontSize={64} fontWeight={900}>404</Typography>
    <Typography variant="h5">La página solicitada no existe</Typography>
    <Typography color="text.secondary">Puedes regresar al inicio para seguir explorando libros.</Typography>
    <Button component={Link} to="/" variant="contained" startIcon={<HomeOutlined />}>Volver al inicio</Button>
  </Stack>;
}