import { Link } from 'react-router-dom';
import { ArrowForwardRounded, CategoryOutlined } from '@mui/icons-material';
import { Box, Button, Grid, Paper, Stack, Typography } from '@mui/material';
import { useRecurso } from '../../hooks/useRecurso.js';
import Encabezado from '../../components/libros/Encabezado.jsx';
import EstadoSolicitud from '../../components/libros/EstadoSolicitud.jsx';
import TarjetaCategoria from '../../components/libros/TarjetaCategoria.jsx';

export default function Inicio() {
  const { datos: categorias, cargando, error, reintentar } = useRecurso('categorias');
  return <Box>
    <Paper sx={{ p: { xs: 3, sm: 5 }, borderRadius: 4, background: 'linear-gradient(110deg,#174269,#26355E 70%,#49365F)', mb: 5, overflow: 'hidden' }}>
      <Typography component="h1" variant="h3" sx={{ fontSize: { xs: 34, sm: 48 }, maxWidth: 670, lineHeight: 1.15 }}>Tu próxima historia empieza aquí.</Typography>
      <Typography sx={{ color: '#D6E7F4', my: 2.5, maxWidth: 590, lineHeight: 1.9 }}>Explora libros de ficción, ciencia ficción, fantasía y mucho más.</Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} gap={1.5} alignItems={{ xs: 'stretch', sm: 'center' }}>
        <Button component={Link} to="/catalogo" variant="contained" endIcon={<ArrowForwardRounded />}>Explorar catálogo</Button>
        <Button component={Link} to="/categorias" variant="outlined" sx={{ color: 'white', borderColor: '#B9D8E8' }} startIcon={<CategoryOutlined />}>Ver categorías</Button>
      </Stack>
    </Paper>

    <Encabezado etiqueta="DESCUBRE" titulo="Categorías para explorar" descripcion="Selecciona una categoría para descubrir sus libros."
      accion={<Button component={Link} to="/categorias" endIcon={<ArrowForwardRounded />}>Todas las categorías</Button>} />
    <EstadoSolicitud cargando={cargando} error={error} reintentar={reintentar} conservados={categorias.length > 0} vacio={!categorias.length && !cargando && !error} etiqueta="categorías" />
    {!cargando && <Grid container spacing={2.5}>{categorias.slice(0, 3).map((categoria) =>
      <Grid item xs={12} sm={6} md={4} key={categoria.id}><TarjetaCategoria categoria={categoria} /></Grid>)}</Grid>}
  </Box>;
}
