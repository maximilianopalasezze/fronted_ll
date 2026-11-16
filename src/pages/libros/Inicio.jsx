import { Link } from 'react-router-dom';
import { ArrowForwardRounded, AutoStoriesRounded, CategoryOutlined, CloudDoneOutlined, MenuBookRounded } from '@mui/icons-material';
import { Box, Button, Card, CardContent, Chip, Grid, Paper, Stack, Typography } from '@mui/material';
import { useRecurso } from '../../hooks/useRecurso.js';
import Encabezado from '../../components/libros/Encabezado.jsx';
import EstadoSolicitud from '../../components/libros/EstadoSolicitud.jsx';
import TarjetaCategoria from '../../components/libros/TarjetaCategoria.jsx';

export default function Inicio() {
  const { datos: categorias, cargando, error, reintentar, fuente } = useRecurso('categorias');
  return <Box>
    <Paper sx={{ p: { xs: 3, sm: 5 }, borderRadius: 4, background: 'linear-gradient(110deg,#174269,#26355E 70%,#49365F)', mb: 5, overflow: 'hidden' }}>
      <Chip icon={<AutoStoriesRounded />} label="SEMANA 4 · INTEGRACIÓN REST" sx={{ bgcolor: '#E8CB91', color: '#302813', fontWeight: 900, mb: 3 }} />
      <Typography component="h1" variant="h3" sx={{ fontSize: { xs: 34, sm: 48 }, maxWidth: 670, lineHeight: 1.15 }}>Tu próxima historia empieza aquí.</Typography>
      <Typography sx={{ color: '#D6E7F4', my: 2.5, maxWidth: 590, lineHeight: 1.9 }}>Explora libros de ficción, ciencia ficción, fantasía y mucho más. Nuestro catálogo se carga desde un servicio REST mock integrado con React.</Typography>
      <Stack direction={{ xs: 'column', sm: 'row' }} gap={1.5} alignItems={{ xs: 'stretch', sm: 'center' }}>
        <Button component={Link} to="/catalogo" variant="contained" endIcon={<ArrowForwardRounded />}>Explorar catálogo</Button>
        <Button component={Link} to="/categorias" variant="outlined" sx={{ color: 'white', borderColor: '#B9D8E8' }} startIcon={<CategoryOutlined />}>Ver categorías</Button>
      </Stack>
    </Paper>
    <Grid container spacing={2} sx={{ mb: 5 }}>
      {[{ titulo: 'REST mock', texto: 'Información obtenida mediante peticiones HTTP GET.', Icono: CloudDoneOutlined },
        { titulo: 'React Router', texto: 'Navegación fluida entre categorías y detalle.', Icono: MenuBookRounded },
        { titulo: 'Experiencia segura', texto: 'Errores, reintentos y controles de carga visibles.', Icono: AutoStoriesRounded }].map(({ titulo, texto, Icono }) =>
        <Grid key={titulo} item xs={12} md={4}><Card sx={{ height: '100%', borderRadius: 3 }}><CardContent sx={{ p: 3 }}>
          <Icono color="primary" sx={{ mb: 1 }} /><Typography variant="h6">{titulo}</Typography><Typography color="text.secondary" fontSize={13.5} mt={1}>{texto}</Typography>
        </CardContent></Card></Grid>)}
    </Grid>
    <Encabezado etiqueta="DESCUBRE" titulo="Categorías para explorar" descripcion="Esta sección se alimenta desde la API mock. Selecciona una categoría para descubrir sus libros."
      accion={<Button component={Link} to="/categorias" endIcon={<ArrowForwardRounded />}>Todas las categorías</Button>} />
    <EstadoSolicitud cargando={cargando} error={error} reintentar={reintentar} vacio={!categorias.length && !cargando && !error} etiqueta="categorías" />
    {!cargando && !error && <><Grid container spacing={2.5}>{categorias.slice(0, 3).map((categoria) =>
      <Grid item xs={12} sm={6} md={4} key={categoria.id}><TarjetaCategoria categoria={categoria} /></Grid>)}</Grid>
      <Typography color="text.secondary" variant="caption" sx={{ display: 'block', mt: 2 }} role="status">Datos obtenidos desde {fuente}.</Typography></>}
  </Box>;
}