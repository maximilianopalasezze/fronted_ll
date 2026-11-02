import { useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Alert, Box, Button, Card, Chip, Dialog, DialogActions, DialogContent, DialogTitle, IconButton, InputAdornment,
  MenuItem, Stack, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  TextField, Tooltip, Typography,
} from '@mui/material';
import { AddRounded, DeleteOutlineRounded, Inventory2Outlined, SearchRounded, TuneRounded } from '@mui/icons-material';
import { useInventario } from '../context/InventarioContext';
import { tiposProducto } from '../data/productosIniciales';
import { formatoCLP, numero, obtenerEstadoStock } from '../utils/inventario';
import SeccionTitulo from '../components/SeccionTitulo';

export default function Inventario() {
  const { articulos, eliminarArticulo } = useInventario();
  const [busqueda, setBusqueda] = useState('');
  const [categoria, setCategoria] = useState('Todas');
  const [porEliminar, setPorEliminar] = useState(null);
  const ubicacion = useLocation();
  const navigate = useNavigate();

  const visibles = useMemo(() => articulos.filter((producto) => {
    const texto = `${producto.nombre} ${producto.marca}`.toLocaleLowerCase('es-CL');
    return texto.includes(busqueda.trim().toLocaleLowerCase('es-CL')) && (categoria === 'Todas' || producto.tipo === categoria);
  }), [articulos, busqueda, categoria]);

  const confirmarEliminacion = () => {
    if (porEliminar) eliminarArticulo(porEliminar.id);
    setPorEliminar(null);
  };

  return (
    <Box>
      <SeccionTitulo indicador="CATÁLOGO DE ARTÍCULOS" titulo="Inventario de productos" descripcion="Consulta y organiza todos los artículos registrados en el supermercado." accion={<Button variant="contained" component={Link} to="/agregar" startIcon={<AddRounded />}>Agregar artículo</Button>} />
      {ubicacion.state?.agregado && <Alert severity="success" onClose={() => navigate(ubicacion.pathname, { replace: true, state: null })} sx={{ mb: 3, borderRadius: 2.5 }}>El artículo <strong>{ubicacion.state.agregado}</strong> se agregó correctamente al inventario.</Alert>}
      <Card sx={{ borderRadius: 3.5 }}>
        <Box sx={{ px: { xs: 2, sm: 3 }, pt: 3, pb: 2.7 }}>
          <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ xs: 'stretch', md: 'center' }} justifyContent="space-between" spacing={2.5}>
            <Box>
              <Stack direction="row" alignItems="center" spacing={1.2}><Typography variant="h6">Listado de artículos</Typography><Chip label={`${numero(articulos.length)} productos`} size="small" sx={{ bgcolor: '#EAF5EF', color: '#07805B' }} /></Stack>
              <Typography fontSize={12.5} color="text.secondary" mt={.7}>Busca por nombre o marca y filtra por tipo de producto.</Typography>
            </Box>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5}>
              <TextField size="small" placeholder="Buscar artículo..." value={busqueda} onChange={(e) => setBusqueda(e.target.value)} inputProps={{ 'aria-label': 'Buscar por nombre o marca' }} InputProps={{ startAdornment: <InputAdornment position="start"><SearchRounded fontSize="small" /></InputAdornment> }} sx={{ minWidth: { md: 215 } }} />
              <TextField size="small" select value={categoria} onChange={(e) => setCategoria(e.target.value)} aria-label="Filtrar tipo de producto" InputProps={{ startAdornment: <InputAdornment position="start"><TuneRounded fontSize="small" /></InputAdornment> }} sx={{ minWidth: { md: 186 } }}>
                <MenuItem value="Todas">Todas las categorías</MenuItem>
                {tiposProducto.map((tipo) => <MenuItem key={tipo} value={tipo}>{tipo}</MenuItem>)}
              </TextField>
            </Stack>
          </Stack>
        </Box>
        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table aria-label="Tabla de artículos del inventario" sx={{ minWidth: 775 }}>
            <TableHead><TableRow><TableCell sx={{ pl: 3 }}>ARTÍCULO / MARCA</TableCell><TableCell>TIPO DE PRODUCTO</TableCell><TableCell align="right">PRECIO</TableCell><TableCell align="center">CANTIDAD</TableCell><TableCell>ESTADO</TableCell><TableCell align="right" sx={{ pr: 3 }}>ACCIONES</TableCell></TableRow></TableHead>
            <TableBody>
              {visibles.map((producto) => {
                const estado = obtenerEstadoStock(Number(producto.stock));
                return <TableRow key={producto.id} hover sx={{ '& td': { py: 2.2 } }}>
                  <TableCell sx={{ pl: 3 }}>
                    <Stack direction="row" alignItems="center" spacing={1.7}>
                      <Box sx={{ width: 43, height: 43, bgcolor: '#EAF5EF', borderRadius: 2, color: '#14805D', display: 'grid', placeItems: 'center', flexShrink: 0 }}><Inventory2Outlined fontSize="small" /></Box>
                      <Box><Typography fontWeight={800} fontSize={13.5}>{producto.nombre}</Typography><Typography color="text.secondary" fontSize={12}>{producto.marca}</Typography></Box>
                    </Stack>
                  </TableCell>
                  <TableCell><Chip size="small" variant="outlined" label={producto.tipo} sx={{ fontSize: 11.5, borderColor: '#DCE7E1', color: '#55716A' }} /></TableCell>
                  <TableCell align="right"><Typography fontWeight={800} fontSize={13.5}>{formatoCLP(producto.precio)}</Typography></TableCell>
                  <TableCell align="center"><Typography fontWeight={750} fontSize={13.5}>{numero(Number(producto.stock))}</Typography></TableCell>
                  <TableCell><Chip label={estado.etiqueta} color={estado.tono} size="small" variant="outlined" sx={{ fontSize: 10.5 }} /></TableCell>
                  <TableCell align="right" sx={{ pr: 3 }}><Tooltip title={`Eliminar ${producto.nombre}`}><IconButton onClick={() => setPorEliminar(producto)} size="small" color="error" aria-label={`Eliminar ${producto.nombre}`}><DeleteOutlineRounded fontSize="small" /></IconButton></Tooltip></TableCell>
                </TableRow>;
              })}
              {visibles.length === 0 && <TableRow><TableCell colSpan={6} align="center" sx={{ py: 9 }}><Inventory2Outlined sx={{ color: '#AAC3B7', fontSize: 42 }} /><Typography fontWeight={800} mt={1.5}>No se encontraron artículos</Typography><Typography color="text.secondary" fontSize={13} mt={1}>Prueba otra búsqueda o agrega un nuevo producto.</Typography><Button component={Link} to="/agregar" size="small" sx={{ mt: 2 }}>Agregar producto</Button></TableCell></TableRow>}
            </TableBody>
          </Table>
        </TableContainer>
        <Box sx={{ bgcolor: '#152238', p: 2.5, px: 3, borderTop: '1px solid #2C3B50' }}>
          <Typography fontSize={12.5} color="text.secondary">Mostrando <strong>{numero(visibles.length)}</strong> de <strong>{numero(articulos.length)}</strong> artículos registrados</Typography>
        </Box>
      </Card>
      <Dialog open={Boolean(porEliminar)} onClose={() => setPorEliminar(null)} fullWidth maxWidth="xs" aria-labelledby="titulo-eliminar">
        <DialogTitle id="titulo-eliminar" fontWeight={800}>¿Eliminar este artículo?</DialogTitle>
        <DialogContent><Typography color="text.secondary" fontSize={14}>Se eliminará <strong>{porEliminar?.nombre}</strong> del inventario. Esta acción no se puede deshacer.</Typography></DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}><Button variant="outlined" color="inherit" onClick={() => setPorEliminar(null)}>Cancelar</Button><Button variant="contained" color="error" onClick={confirmarEliminacion}>Sí, eliminar</Button></DialogActions>
      </Dialog>
    </Box>
  );
}
