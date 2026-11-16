import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { InputAdornment, Box, Button, Chip, Grid, MenuItem, Stack, TextField, Typography } from '@mui/material';
import { RefreshRounded, SearchRounded } from '@mui/icons-material';
import Encabezado from '../../components/libros/Encabezado.jsx';
import EstadoSolicitud from '../../components/libros/EstadoSolicitud.jsx';
import TarjetaLibro from '../../components/libros/TarjetaLibro.jsx';
import { useRecurso } from '../../hooks/useRecurso.js';
import { filtrarLibros } from '../../utils/catalogo.js';
export default function Catalogo() {
  const [parametros, setParametros] = useSearchParams();
  const categoria = parametros.get('categoria') || 'todas';
  const modo = parametros.get('demo') || 'normal';
  const [texto, setTexto] = useState('');
  const { datos: libros, cargando, error, reintentar } = useRecurso('libros', modo);
  const { datos: categorias } = useRecurso('categorias');
  const visibles = useMemo(() => filtrarLibros(libros, { texto, categoria }), [libros, texto, categoria]);
  const nombreCategoria = categorias.find((c) => c.id === categoria)?.nombre;
  const actualizar = (clave, valor) => {
    const siguientes = new URLSearchParams(parametros);
    if (!valor || valor === 'todas' || valor === 'normal') siguientes.delete(clave);
    else siguientes.set(clave, valor);
    setParametros(siguientes);
  };
  return <Box>
    <Encabezado titulo="Catálogo de libros"
      descripcion="Busca por título o autor y filtra por categoría sin alterar el listado original."
      accion={<Button variant="outlined" onClick={reintentar} startIcon={<RefreshRounded />}>Actualizar datos</Button>} />
    <Grid container spacing={2} mb={2.5}>
      <Grid item xs={12} md={6}>
        <TextField fullWidth value={texto} onChange={(e) => setTexto(e.target.value)} label="Buscar por título o autor"
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchRounded /></InputAdornment> }} />
      </Grid>
      <Grid item xs={12} md={3}><TextField fullWidth select label="Categoría" value={categoria}
        onChange={(e) => actualizar('categoria', e.target.value)}>
        <MenuItem value="todas">Todas las categorías</MenuItem>
        {categorias.map((c) => <MenuItem key={c.id} value={c.id}>{c.nombre}</MenuItem>)}
        {categoria !== 'todas' && !categorias.some((c) => c.id === categoria) && <MenuItem value={categoria}>Categoría desconocida</MenuItem>}
      </TextField></Grid>
      <Grid item xs={12} md={3}><TextField fullWidth select label="Simulador de errores" value={modo}
        onChange={(e) => actualizar('demo', e.target.value)} helperText="Prueba las respuestas y usa Reintentar">
        <MenuItem value="normal">Consulta normal</MenuItem>
        <MenuItem value="404">Simular HTTP 404</MenuItem>
        <MenuItem value="500">Simular HTTP 500</MenuItem>
        <MenuItem value="red">Simular fallo de red</MenuItem>
      </TextField></Grid>
    </Grid>
    <Stack direction="row" gap={1} alignItems="center" flexWrap="wrap" sx={{ mb: 3 }} aria-live="polite">
      <Chip color={error ? 'error' : 'primary'} variant="outlined" label={cargando ? 'Cargando libros…' : error ? 'Consulta fallida' : visibles.length + ' libros encontrados'} />
      {nombreCategoria && <Chip label={'Filtro: ' + nombreCategoria} />}
      {modo !== 'normal' && <Button size="small" onClick={() => actualizar('demo', 'normal')}>Volver al modo normal</Button>}
    </Stack>
    <EstadoSolicitud cargando={cargando} error={error} reintentar={reintentar} vacio={!cargando && !error && visibles.length === 0} etiqueta="libros" />
    {!cargando && !error && <><Grid container spacing={2.5}>
      {visibles.map((libro) => <Grid item xs={12} sm={6} md={4} key={libro.id}>
        <TarjetaLibro libro={libro} categoria={categorias.find((c) => c.id === libro.categoriaId)} />
      </Grid>)}</Grid>
      <Typography color="text.secondary" fontSize={12} mt={3}>si buscas algun libro especifico escribenos al whatsapp para consultarnos</Typography>
    </>}
  </Box>;
}