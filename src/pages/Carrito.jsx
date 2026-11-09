import { Link } from 'react-router-dom';
import { Alert, Box, Button, Card, CardContent, Chip, Divider, Grid, IconButton, Stack, Typography } from '@mui/material';
import { ArrowForwardRounded, DeleteOutlineRounded, ShoppingCartOutlined } from '@mui/icons-material';
import { useInventario } from '../context/InventarioContext';
import { formatoCLP, numero } from '../utils/inventario';
import ControlCantidad from '../components/ControlCantidad';
import SeccionTitulo from '../components/SeccionTitulo';

export default function Carrito() {
  const { articulos, carrito, unidadesCarrito, cambiarCantidadCarrito, quitarDelCarrito } = useInventario();
  const lineas = carrito.map((l) => ({ ...l, articulo: articulos.find((a) => a.id === l.id) })).filter((l) => l.articulo);
  const total = lineas.reduce((suma, l) => suma + l.cantidad * l.articulo.precio, 0);

  return (
    <Box>
      <SeccionTitulo indicador="COMPRA EN CURSO" titulo="Carrito de compras"
        descripcion="Aumenta o disminuye cantidades y observa cómo se actualiza el inventario general."
        accion={<Button component={Link} to="/inventario" variant="outlined" endIcon={<ArrowForwardRounded />}>Seguir viendo productos</Button>} />
      <Alert severity="info" sx={{ mb: 3, borderRadius: 2 }}>Las unidades agregadas se reservan y descuentan inmediatamente del inventario. Al disminuir o quitar un artículo, se devuelven al stock.</Alert>
      {lineas.length === 0 ? (
        <Card sx={{ borderRadius: 3.5, textAlign: 'center' }}><CardContent sx={{ py: 8 }}>
          <ShoppingCartOutlined sx={{ fontSize: 55, color: '#93C5FD', mb: 2 }} />
          <Typography variant="h6">Tu carrito está vacío</Typography>
          <Typography color="text.secondary" mb={3}>Abre el detalle de un artículo para agregar unidades.</Typography>
          <Button component={Link} to="/inventario" variant="contained">Ir al inventario</Button>
        </CardContent></Card>
      ) : <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Stack spacing={2}>
            {lineas.map(({ id, cantidad, articulo }) => (
              <Card key={id} sx={{ borderRadius: 3 }}><CardContent>
                <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }} gap={2}>
                  <Box sx={{ minWidth: 0 }}>
                    <Typography component={Link} to={`/inventario/${encodeURIComponent(id)}`} sx={{ color: '#93C5FD', fontWeight: 800, '&:hover': { textDecoration: 'underline' } }}>{articulo.nombre}</Typography>
                    <Typography color="text.secondary" fontSize={12}>{articulo.marca} · {articulo.tipo}</Typography>
                    <Typography color="text.secondary" fontSize={12} mt={.5}>{formatoCLP(articulo.precio)} cada uno · Disponible: {numero(articulo.stock)}</Typography>
                  </Box>
                  <Stack direction="row" alignItems="center" justifyContent="space-between" gap={2}>
                    <ControlCantidad etiqueta={articulo.nombre} valor={cantidad} minimo={0} maximo={cantidad + articulo.stock}
                      disminuir={() => cambiarCantidadCarrito(id, -1)} aumentar={() => cambiarCantidadCarrito(id, 1)} />
                    <Typography fontWeight={850} sx={{ minWidth: 95, textAlign: 'right' }}>{formatoCLP(articulo.precio * cantidad)}</Typography>
                    <IconButton aria-label={`Quitar ${articulo.nombre} del carrito`} color="error" onClick={() => quitarDelCarrito(id)}><DeleteOutlineRounded /></IconButton>
                  </Stack>
                </Stack>
              </CardContent></Card>
            ))}
          </Stack>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card sx={{ borderRadius: 3.5 }}><CardContent sx={{ p: 3 }}>
            <Typography variant="h6" mb={2}>Resumen del carrito</Typography>
            <Stack direction="row" justifyContent="space-between" mb={1.5}><Typography color="text.secondary">Productos distintos</Typography><Typography fontWeight={700}>{lineas.length}</Typography></Stack>
            <Stack direction="row" justifyContent="space-between" mb={2}><Typography color="text.secondary">Unidades reservadas</Typography><Chip label={numero(unidadesCarrito)} size="small" color="primary" /></Stack>
            <Divider sx={{ mb: 2 }} />
            <Stack direction="row" justifyContent="space-between" alignItems="center"><Typography fontWeight={800}>Total estimado</Typography><Typography variant="h5">{formatoCLP(total)}</Typography></Stack>
            <Typography color="text.secondary" fontSize={12} mt={2}>Simulación académica: no se procesan pagos ni pedidos reales.</Typography>
          </CardContent></Card>
        </Grid>
      </Grid>}
    </Box>
  );
}
