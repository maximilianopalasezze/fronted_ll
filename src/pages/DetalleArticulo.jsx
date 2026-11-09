import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Alert, Box, Button, Card, CardContent, Chip, Divider, Grid, Stack, Typography } from '@mui/material';
import { ArrowBackRounded, Inventory2Outlined, ShoppingCartRounded } from '@mui/icons-material';
import { useInventario } from '../context/InventarioContext';
import { formatoCLP, numero, obtenerEstadoStock } from '../utils/inventario';
import ControlCantidad from '../components/ControlCantidad';
import SeccionTitulo from '../components/SeccionTitulo';

export default function DetalleArticulo() {
  const { id } = useParams();
  const { articulos, carrito, agregarAlCarrito } = useInventario();
  const articulo = articulos.find((a) => a.id === id);
  const enCarrito = carrito.find((linea) => linea.id === id)?.cantidad || 0;
  const [cantidad, setCantidad] = useState(1);
  const [mensaje, setMensaje] = useState('');
  useEffect(() => { setCantidad(1); setMensaje(''); }, [id]);
  useEffect(() => {
    if (articulo && cantidad > articulo.stock) setCantidad(Math.max(1, articulo.stock));
  }, [articulo?.stock, cantidad]);

  if (!articulo) {
    return <Box><Alert severity="warning" sx={{ mb: 3 }}>El artículo solicitado no existe o fue eliminado.</Alert>
      <Button component={Link} to="/inventario" startIcon={<ArrowBackRounded />}>Volver al inventario</Button></Box>;
  }
  const estado = obtenerEstadoStock(articulo.stock);
  const agregar = () => {
    if (articulo.stock < cantidad || cantidad < 1) return;
    agregarAlCarrito(articulo.id, cantidad);
    setMensaje(`Agregaste ${cantidad} unidad(es) al carrito. Se descontaron del inventario.`);
    setCantidad(1);
  };

  return (
    <Box>
      <SeccionTitulo indicador="DETALLE DEL ARTÍCULO" titulo={articulo.nombre}
        descripcion="Consulta sus datos y agrega unidades disponibles al carrito."
        accion={<Button component={Link} to="/inventario" variant="outlined" startIcon={<ArrowBackRounded />}>Volver al inventario</Button>} />
      {mensaje && <Alert severity="success" onClose={() => setMensaje('')} sx={{ mb: 3 }}>{mensaje}</Alert>}
      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Card sx={{ borderRadius: 3.5, height: '100%' }}><CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <Stack direction="row" alignItems="center" spacing={2} mb={3}>
              <Box sx={{ bgcolor: '#24334C', color: '#93C5FD', width: 76, height: 76, display: 'grid', placeItems: 'center', borderRadius: 3 }}><Inventory2Outlined sx={{ fontSize: 39 }} /></Box>
              <Box><Typography variant="h5">{articulo.nombre}</Typography><Typography color="text.secondary">Marca: {articulo.marca}</Typography></Box>
            </Stack>
            <Stack direction="row" gap={1} flexWrap="wrap" mb={3}><Chip label={articulo.tipo} variant="outlined" /><Chip label={estado.etiqueta} variant="outlined" color={estado.tono} /></Stack>
            <Divider sx={{ mb: 3 }} />
            <Grid container spacing={3}>
              <Grid item xs={6}><Typography color="text.secondary" variant="body2">Precio unitario</Typography><Typography variant="h5">{formatoCLP(articulo.precio)}</Typography></Grid>
              <Grid item xs={6}><Typography color="text.secondary" variant="body2">Stock disponible</Typography><Typography variant="h5">{numero(articulo.stock)}</Typography></Grid>
              <Grid item xs={6}><Typography color="text.secondary" variant="body2">Fecha de ingreso</Typography><Typography fontWeight={750}>{articulo.fechaIngreso || 'No registrada'}</Typography></Grid>
              <Grid item xs={6}><Typography color="text.secondary" variant="body2">Código del artículo</Typography><Typography sx={{ overflowWrap: 'anywhere', fontSize: 12 }}>{articulo.id}</Typography></Grid>
            </Grid>
          </CardContent></Card>
        </Grid>
        <Grid item xs={12} md={5}>
          <Card sx={{ borderRadius: 3.5 }}><CardContent sx={{ p: { xs: 3, md: 4 } }}>
            <Typography variant="h6" mb={1}>Agregar al carrito</Typography>
            <Typography color="text.secondary" mb={3} fontSize={13}>Selecciona unidades. Cada unidad agregada se descuenta inmediatamente del stock disponible.</Typography>
            {articulo.stock === 0 ? <Alert severity="warning" sx={{ mb: 3 }}>Producto agotado. No puedes agregar más unidades.</Alert> : <Stack spacing={1} mb={3}>
              <Typography fontWeight={700} fontSize={13}>Cantidad a agregar</Typography>
              <ControlCantidad etiqueta={articulo.nombre} valor={cantidad} minimo={1} maximo={articulo.stock} disminuir={() => setCantidad((x) => Math.max(1, x - 1))} aumentar={() => setCantidad((x) => Math.min(articulo.stock, x + 1))} />
            </Stack>}
            <Divider sx={{ my: 2 }} />
            <Stack direction="row" justifyContent="space-between" mb={3}><Typography color="text.secondary">Subtotal</Typography><Typography fontWeight={850}>{formatoCLP(articulo.precio * (articulo.stock === 0 ? 0 : cantidad))}</Typography></Stack>
            <Button variant="contained" fullWidth startIcon={<ShoppingCartRounded />} disabled={articulo.stock === 0} onClick={agregar}>Agregar {cantidad} al carrito</Button>
            <Button component={Link} to="/carrito" fullWidth sx={{ mt: 1.5 }}>Ver carrito {enCarrito ? `(${enCarrito} unidades)` : ''}</Button>
          </CardContent></Card>
        </Grid>
      </Grid>
    </Box>
  );
}
