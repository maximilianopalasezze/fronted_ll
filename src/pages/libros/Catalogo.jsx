import { useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { InputAdornment, Box, Button, Chip, Grid, MenuItem, Stack, TextField } from '@mui/material';
import { RefreshRounded, SearchRounded } from '@mui/icons-material';
import Encabezado from '../../components/libros/Encabezado.jsx';
import EstadoSolicitud from '../../components/libros/EstadoSolicitud.jsx';
import TarjetaLibro from '../../components/libros/TarjetaLibro.jsx';
import { useRecurso } from '../../hooks/useRecurso.js';
import { filtrarLibros } from '../../utils/catalogo.js';
export default function Catalogo() {
  const [parametros, setParametros] = useSearchParams();
  const categoria = parametros.get('categoria') || 'todas';
  const [texto, setTexto] = useState('');
  const { datos: libros, cargando, error, reintentar } = useRecurso('libros');
  const { datos: categorias, cargando: cargandoCategorias, error: errorCategorias, reintentar: reintentarCategorias } = useRecurso('categorias');
  const visibles = useMemo(() => filtrarLibros(libros, { texto, categoria }), [libros, texto, categoria]);
  const nombreCategoria = categorias.find((c) => c.id === categoria)?.nombre;
  const actualizarCategoria = (valor) => {
    const siguientes = new URLSearchParams();
    if (valor !== 'todas') siguientes.set('categoria', valor);
    setParametros(siguientes);
  };
  return <Box>
    <Encabezado titulo="Catálogo de libros"
      descripcion="Encuentra tu próxima lectura por título, autor o categoría."
      accion={<Button variant="outlined" onClick={reintentar} disabled={cargando} startIcon={<RefreshRounded />}>Actualizar catálogo</Button>} />
    <Grid container spacing={2} mb={2.5}>
      <Grid item xs={12} md={6}>
        <TextField fullWidth value={texto} onChange={(e) => setTexto(e.target.value)} label="Buscar por título o autor"
          InputProps={{ startAdornment: <InputAdornment position="start"><SearchRounded /></InputAdornment> }} />
      </Grid>
      <Grid item xs={12} md={6}><TextField fullWidth select label="Categoría" value={categoria}
        disabled={cargandoCategorias || (!!errorCategorias && !categorias.length && categoria === 'todas')}
        onChange={(e) => actualizarCategoria(e.target.value)}>
        <MenuItem value="todas">Todas las categorías</MenuItem>
        {categorias.map((c) => <MenuItem key={c.id} value={c.id}>{c.nombre}</MenuItem>)}
        {categoria !== 'todas' && !categorias.some((c) => c.id === categoria) && <MenuItem value={categoria}>Categoría seleccionada</MenuItem>}
      </TextField></Grid>
    </Grid>
    <EstadoSolicitud cargando={cargandoCategorias} error={errorCategorias} reintentar={reintentarCategorias} etiqueta="categorías" compacto conservados={libros.length > 0 || categorias.length > 0} />
    {!cargando && !error && <Stack direction="row" gap={1} alignItems="center" flexWrap="wrap" sx={{ mb: 3 }} aria-live="polite">
      <Chip color="primary" variant="outlined" label={visibles.length + ' libros encontrados'} />
      {nombreCategoria && <Chip label={'Filtro: ' + nombreCategoria} />}
      {categoria !== 'todas' && <Button size="small" onClick={() => actualizarCategoria('todas')}>Ver todos los libros</Button>}
    </Stack>}
    <EstadoSolicitud cargando={cargando} error={error} reintentar={reintentar} conservados={libros.length > 0} vacio={!cargando && !error && visibles.length === 0} etiqueta="libros" />
    {!cargando && <Grid container spacing={2.5}>
      {visibles.map((libro) => <Grid item xs={12} sm={6} md={4} key={libro.id}>
        <TarjetaLibro libro={libro} categoria={categorias.find((c) => c.id === libro.categoriaId)} />
      </Grid>)}</Grid>}
  </Box>;
}
