import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Alert, Box, Button, Card, Chip, Dialog, DialogActions, DialogContent, DialogTitle,
  InputAdornment, MenuItem, Stack, Table, TableBody, TableCell, TableContainer, TableHead,
  TableRow, TextField, Typography,
} from '@mui/material';
import { AddRounded, Inventory2Outlined, SearchRounded, TuneRounded } from '@mui/icons-material';
import { useInventario } from '../context/InventarioContext';
import { tiposProducto } from '../data/productosIniciales';
import { filtrarArticulos, numero } from '../utils/inventario';
import SeccionTitulo from '../components/SeccionTitulo';
import FilaArticulo from '../components/FilaArticulo';

export default function Inventario() {
  const { articulos, carrito, eliminarArticulo } = useInventario();
  const [busqueda, setBusqueda] = useState('');
  const [categoria, setCategoria] = useState('Todas');
  const [porEliminar, setPorEliminar] = useState(null);
  const ubicacion = useLocation();
  const navigate = useNavigate();
  // La lista original nunca se modifica al filtrar: es un estado derivado.
  const visibles = useMemo(() => filtrarArticulos(articulos, categoria, busqueda), [articulos, categoria, busqueda]);
  const confirmarEliminacion = () => {
    if (porEliminar) eliminarArticulo(porEliminar.id);
    setPorEliminar(null);
  };

  return (
    <Box>
      <SeccionTitulo indicador="CATÁLOGO DE ARTÍCULOS" titulo="Inventario de productos"
        descripcion="Consulta los productos, filtra por categoría y abre el detalle para agregarlos al carrito."
        accion={<Button variant="contained" component={Link} to="/agregar" startIcon={<AddRounded />}>Agregar artículo</Button>} />
      {ubicacion.state?.agregado && <Alert severity="success" onClose={() => navigate(ubicacion.pathname, { replace: true, state: null })} sx={{ mb: 3 }}>
        Se registró <strong>{ubicacion.state.agregado}</strong>. Si ya existía, se sumaron unidades y se actualizó su precio.
      </Alert>}
      <Card sx={{ borderRadius: 3.5 }}>
        <Box sx={{ px: { xs: 2, sm: 3 }, pt: 3, pb: 2.7 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ xs: 'stretch', md: 'center' }} justifyContent="space-between" spacing={2.5}>
            <Box>
              <Stack direction="row" alignItems="center" spacing={1.2}>
                <Typography variant="h6">Listado de artículos</Typography>
                <Chip label={`${numero(articulos.length)} productos`} size="small" color="primary" variant="outlined" />
              </Stack>
              <Typography fontSize={12.5} color="text.secondary" mt={.7}>Selecciona el nombre o el ícono de detalle para abrir un artículo.</Typography>
            </Box>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <TextField size="small" placeholder="Buscar artículo..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)}
                inputProps={{ 'aria-label': 'Buscar por nombre o marca' }}
                InputProps={{ startAdornment: <InputAdornment position="start"><SearchRounded fontSize="small" /></InputAdornment> }} sx={{ minWidth: { md: 215 } }} />
              <TextField size="small" select value={categoria} onChange={(e) => setCategoria(e.target.value)}
                aria-label="Filtrar categoría" InputProps={{ startAdornment: <InputAdornment position="start"><TuneRounded fontSize="small" /></InputAdornment> }} sx={{ minWidth: { md: 186 } }}>
                <MenuItem value="Todas">Todas las categorías</MenuItem>
                {tiposProducto.map((tipo) => <MenuItem key={tipo} value={tipo}>{tipo}</MenuItem>)}
              </TextField>
            </Stack>
          </Stack>
        </Box>
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table aria-label="Tabla de artículos del inventario" sx={{ minWidth: 950 }}>
            <TableHead><TableRow>
              <TableCell sx={{ pl: 3 }}>ARTÍCULO / MARCA</TableCell>
              <TableCell>TIPO DE PRODUCTO</TableCell>
              <TableCell align="right">PRECIO</TableCell>
              <TableCell align="center">STOCK</TableCell>
              <TableCell>ESTADO</TableCell>
              <TableCell>FECHA INGRESO</TableCell>
              <TableCell align="right">ACCIONES</TableCell>
            </TableRow></TableHead>
            <TableBody>
              {visibles.map((articulo) => <FilaArticulo key={articulo.id} articulo={articulo}
                enCarrito={carrito.some((l) => l.id === articulo.id)} onEliminar={setPorEliminar} />)}
              {visibles.length === 0 && <TableRow><TableCell colSpan={7} align="center" sx={{ py: 7 }}>
                <Inventory2Outlined sx={{ color: '#93C5FD', fontSize: 42 }} />
                <Typography fontWeight={800} mt={1.5}>No se encontraron artículos</Typography>
                <Typography color="text.secondary" fontSize={13} mt={1}>Prueba otra categoría o búsqueda. Tus productos originales siguen guardados.</Typography>
                <Button onClick={() => { setBusqueda(''); setCategoria('Todas'); }} size="small" sx={{ mt: 2 }}>Quitar filtros</Button>
              </TableCell></TableRow>}
            </TableBody>
          </Table>
        </TableContainer>
        <Box sx={{ bgcolor: '#152238', p: 2.5, px: 3, borderTop: '1px solid #2C3B50' }}>
          <Typography fontSize={12.5} color="text.secondary">Mostrando <strong>{numero(visibles.length)}</strong> de <strong>{numero(articulos.length)}</strong> artículos registrados.</Typography>
        </Box>
      </Card>
      <Dialog open={Boolean(porEliminar)} onClose={() => setPorEliminar(null)} fullWidth maxWidth="xs" aria-labelledby="titulo-eliminar">
        <DialogTitle id="titulo-eliminar" fontWeight={800}>¿Eliminar este artículo?</DialogTitle>
        <DialogContent><Typography color="text.secondary" fontSize={14}>Se eliminará <strong>{porEliminar?.nombre}</strong> del inventario. Esta acción no se puede deshacer.</Typography></DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button variant="outlined" color="inherit" onClick={() => setPorEliminar(null)}>Cancelar</Button>
          <Button variant="contained" color="error" onClick={confirmarEliminacion}>Sí, eliminar</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
