import { Box, Chip, Grid, Stack } from '@mui/material';
import Encabezado from '../../components/libros/Encabezado.jsx';
import EstadoSolicitud from '../../components/libros/EstadoSolicitud.jsx';
import TarjetaCategoria from '../../components/libros/TarjetaCategoria.jsx';
import { useRecurso } from '../../hooks/useRecurso.js';
export default function Categorias() {
  const { datos, cargando, error, reintentar } = useRecurso('categorias');
  return <Box>
    <Encabezado titulo="Categorías de libros"
      descripcion="Explora los géneros disponibles." />
    {!cargando && !error && <Stack direction="row" gap={1} mb={3} flexWrap="wrap">
      <Chip label={datos.length + ' categorías disponibles'} color="primary" variant="outlined" />
    </Stack>}
    <EstadoSolicitud cargando={cargando} error={error} reintentar={reintentar} conservados={datos.length > 0} vacio={!datos.length && !error && !cargando} etiqueta="categorías" />
    {!cargando && <Grid container spacing={3}>{datos.map((categoria) =>
      <Grid item xs={12} sm={6} md={4} key={categoria.id}><TarjetaCategoria categoria={categoria} /></Grid>)}</Grid>}
  </Box>;
}
