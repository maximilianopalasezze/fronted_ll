import { Link, useParams } from 'react-router-dom';
import { ArrowBackRounded } from '@mui/icons-material';
import { Alert, Box, Button, Card, CardContent, Chip, Grid, Stack, Typography } from '@mui/material';
import { useRecurso } from '../../hooks/useRecurso.js';
import Encabezado from '../../components/libros/Encabezado.jsx';
import EstadoSolicitud from '../../components/libros/EstadoSolicitud.jsx';
import PortadaLibro from '../../components/libros/PortadaLibro.jsx';
import { formatoCLP } from '../../utils/catalogo.js';
export default function DetalleLibro() {
  const { id } = useParams();
  const { datos: libros, cargando, error, reintentar } = useRecurso('libros');
  const { datos: categorias } = useRecurso('categorias');
  const libro = libros.find((item) => item.id === id);
  const categoria = categorias.find((c) => c.id === libro?.categoriaId);
  return <Box>
    <Encabezado etiqueta="DETALLE DEL CATÁLOGO" titulo={libro?.titulo || 'Detalle del libro'}
      descripcion="Descubre su historia, conoce al autor y encuentra tu próxima lectura."
      accion={<Button component={Link} to="/catalogo" startIcon={<ArrowBackRounded />} variant="outlined">Volver al catálogo</Button>} />
    <EstadoSolicitud cargando={cargando} error={error} reintentar={reintentar} etiqueta="detalle" />
    {!cargando && !error && !libro && <Alert severity="warning">No existe un libro con el código solicitado. <Button component={Link} to="/catalogo">Ver catálogo</Button></Alert>}
    {!cargando && !error && libro && <Grid container spacing={3}>
      <Grid item xs={12} md={5}><PortadaLibro libro={libro} altura={{ xs: 380, sm: 480 }} diferida={false} sx={{ borderRadius: 3 }} /></Grid>
      <Grid item xs={12} md={7}><Card sx={{ borderRadius: 3, height: '100%' }}><CardContent sx={{ p: { xs: 3, sm: 4 } }}>
        <Stack direction="row" flexWrap="wrap" gap={1} mb={3}><Chip color="primary" label={categoria?.nombre || libro.categoriaId} variant="outlined" />{libro.destacado && <Chip label="Destacado" color="secondary" />}</Stack>
        <Typography variant="h4" fontWeight={900}>{libro.titulo}</Typography>
        <Typography color="text.secondary" mt={1}>Escrito por {libro.autor}</Typography>
        <Typography color="text.secondary" mt={.5}>Primera publicación: {libro.anio}</Typography>
        <Typography mt={3} lineHeight={1.9}>{libro.resumen}</Typography>
        <Typography variant="h5" mt={4} fontWeight={900} color="primary.light">{formatoCLP(libro.precio)}</Typography>
        <Typography color="text.secondary" variant="caption" sx={{ display: 'block', mt: 2 }}>Referencia: {libro.id} · Precio de ejemplo.</Typography>
      </CardContent></Card></Grid>
    </Grid>}
  </Box>;
}
