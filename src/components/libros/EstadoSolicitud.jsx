import { Link } from 'react-router-dom';
import { HomeOutlined, RefreshRounded, SearchOffRounded } from '@mui/icons-material';
import { Alert, Box, Button, Card, CardContent, Grid, Skeleton, Stack, Typography } from '@mui/material';
import { describirError } from '../../services/http.js';

export default function EstadoSolicitud({ cargando, error, reintentar, vacio = false, etiqueta = 'información', compacto = false, conservados = false }) {
  if (cargando) return <Box aria-busy="true" aria-live="polite" sx={{ mb: compacto ? 3 : 0 }}>
    <Typography role="status" color="text.secondary" mb={2}>Cargando {etiqueta}...</Typography>
    {!compacto && <Grid container spacing={2.5}>{[1, 2, 3].map((n) => <Grid item xs={12} sm={6} md={4} key={n}>
      <Card sx={{ borderRadius: 3 }}><CardContent><Skeleton variant="rounded" height={100} sx={{ mb: 2 }} /><Skeleton width="70%" height={32} /><Skeleton /><Skeleton width="80%" /></CardContent></Card>
    </Grid>)}</Grid>}
  </Box>;
  if (error) {
    const ayuda = describirError(error);
    return <Alert severity={compacto || conservados ? 'warning' : 'error'} role="alert" sx={{ borderRadius: 3, p: 2, mb: 3 }}>
      <Typography fontWeight={900}>{compacto ? 'No pudimos cargar ' + etiqueta : ayuda.titulo}</Typography>
      <Typography sx={{ my: 1 }}>{ayuda.detalle}</Typography>
      {conservados && <Typography variant="body2" sx={{ mb: 2 }}>Puedes seguir explorando la información disponible mientras lo intentas nuevamente.</Typography>}
      <Stack direction={{ xs: 'column', sm: 'row' }} gap={1}>
        {reintentar && <Button color={compacto || conservados ? 'warning' : 'error'} variant="contained" startIcon={<RefreshRounded />} onClick={reintentar}>Reintentar {etiqueta}</Button>}
        <Button component={Link} to="/" color="inherit" variant="outlined" startIcon={<HomeOutlined />}>Volver al inicio</Button>
      </Stack>
    </Alert>;
  }
  if (vacio) return <Box sx={{ textAlign: 'center', py: 7 }}>
    <SearchOffRounded sx={{ fontSize: 46, color: 'text.secondary' }} />
    <Typography variant="h6" mt={2}>No se encontraron resultados</Typography>
    <Typography color="text.secondary" mt={1}>Prueba con otra categoría o cambia tu búsqueda.</Typography>
  </Box>;
  return null;
}
