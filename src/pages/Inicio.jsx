import { Link } from 'react-router-dom';
import {
  Box, Button, Card, CardContent, Chip, Grid, Paper, Stack, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Typography,
} from '@mui/material';
import {
  AddCircleOutlineRounded, ArrowForwardRounded, CheckCircleOutlineRounded, Inventory2Outlined,
  LayersOutlined, TrendingDownOutlined, WarehouseOutlined,
} from '@mui/icons-material';
import { useInventario } from '../context/InventarioContext';
import { formatoCLP, numero, obtenerEstadoStock } from '../utils/inventario';

function Estadistica({ titulo, valor, detalle, Icono, colorFondo, colorIcono }) {
  return (
    <Card sx={{ borderRadius: 3.5, height: '100%' }}>
      <CardContent sx={{ p: '24px !important' }}>
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={3}>
          <Typography color="text.secondary" fontWeight={650} fontSize={13.5}>{titulo}</Typography>
          <Box sx={{ width: 46, height: 46, bgcolor: colorFondo, color: colorIcono, display: 'grid', placeItems: 'center', borderRadius: 2.5 }}><Icono /></Box>
        </Stack>
        <Typography sx={{ fontWeight: 850, fontSize: 34, lineHeight: 1.15 }}>{numero(valor)}</Typography>
        <Typography color="text.secondary" variant="caption" sx={{ mt: 1, display: 'block' }}>{detalle}</Typography>
      </CardContent>
    </Card>
  );
}

export default function Inicio() {
  const { articulos } = useInventario();
  const categorias = new Set(articulos.map((p) => p.tipo)).size;
  const unidades = articulos.reduce((acumulado, p) => acumulado + Number(p.stock || 0), 0);
  const escasos = articulos.filter((p) => Number(p.stock) <= 10).length;
  const recientes = [...articulos].slice(-5).reverse();

  return (
    <Box>
      <Stack spacing={.5} mb={3}>
        <Typography variant="overline" sx={{ color: '#93C5FD', fontWeight: 850, letterSpacing: '.14em' }}>BIENVENIDO A SUPERMARKET</Typography>
        <Typography variant="h4" sx={{ fontSize: { xs: 28, sm: 35 } }}>Tu supermercado, bajo control.</Typography>
        <Typography color="text.secondary" fontSize={14.5}>Un vistazo a los artículos registrados y su disponibilidad.</Typography>
      </Stack>

      <Paper elevation={0} className="hero-card" sx={{ borderRadius: 4, bgcolor: '#172554', background: 'linear-gradient(120deg, #172554 0%, #1D4ED8 100%)', color: 'white', p: { xs: 3, md: 4.5 }, mb: 3.5 }}>
        <Box sx={{ position: 'relative', zIndex: 1, maxWidth: 620 }}>
          <Chip size="small" label="GESTIÓN SIMPLE Y RÁPIDA" sx={{ bgcolor: 'rgba(233,192,125,.16)', color: '#F4D494', fontSize: 11, fontWeight: 800, letterSpacing: '.06em', mb: 2 }} />
          <Typography variant="h3" sx={{ fontSize: { xs: 29, md: 38 }, lineHeight: 1.15, mb: 1.3 }}>Todo tu inventario, en un solo lugar.</Typography>
          <Typography sx={{ color: '#DBEAFE', fontSize: 14.5, lineHeight: 1.85, maxWidth: 480, mb: 3 }}>Registra nuevos productos, revisa existencias y mantén la información organizada para tu supermercado.</Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.3} alignItems="flex-start">
            <Button variant="contained" component={Link} to="/agregar" startIcon={<AddCircleOutlineRounded />} sx={{ bgcolor: '#F2C77B', color: '#163D33', '&:hover': { bgcolor: '#F8D89A' } }}>Agregar artículo</Button>
            <Button variant="outlined" component={Link} to="/inventario" endIcon={<ArrowForwardRounded />} sx={{ borderColor: 'rgba(255,255,255,.55)', color: 'white', '&:hover': { borderColor: 'white', bgcolor: 'rgba(255,255,255,.08)' } }}>Ver inventario</Button>
          </Stack>
        </Box>
      </Paper>

      <Grid container spacing={2.2} sx={{ mb: 4.5 }}>
        <Grid item xs={12} sm={6} xl={3}><Estadistica titulo="Artículos registrados" valor={articulos.length} detalle="Referencias en el inventario" Icono={Inventory2Outlined} colorFondo="#E2F4EB" colorIcono="#087D58" /></Grid>
        <Grid item xs={12} sm={6} xl={3}><Estadistica titulo="Unidades disponibles" valor={unidades} detalle="Suma de las existencias" Icono={WarehouseOutlined} colorFondo="#E7F0FC" colorIcono="#4779BF" /></Grid>
        <Grid item xs={12} sm={6} xl={3}><Estadistica titulo="Categorías activas" valor={categorias} detalle="Tipos de producto registrados" Icono={LayersOutlined} colorFondo="#F8EDDC" colorIcono="#C38A3A" /></Grid>
        <Grid item xs={12} sm={6} xl={3}><Estadistica titulo="Stock bajo / agotado" valor={escasos} detalle="Artículos con 10 unidades o menos" Icono={TrendingDownOutlined} colorFondo="#FBECEB" colorIcono="#C45E58" /></Grid>
      </Grid>

      <Grid container spacing={2.5}>
        <Grid item xs={12} lg={8}>
          <Card sx={{ borderRadius: 3.5, height: '100%' }}>
            <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1.5} sx={{ px: 3, pt: 3, pb: 2 }}>
              <Box><Typography variant="h6">Últimos artículos registrados</Typography><Typography fontSize={12.5} color="text.secondary">Resumen de las últimas incorporaciones</Typography></Box>
              <Button component={Link} to="/inventario" endIcon={<ArrowForwardRounded />} size="small" sx={{ whiteSpace: 'nowrap' }}>Ver todos</Button>
            </Stack>
            <TableContainer>
              <Table aria-label="Últimos artículos" size="medium">
                <TableHead><TableRow><TableCell>Producto</TableCell><TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Categoría</TableCell><TableCell>Precio</TableCell><TableCell>Estado</TableCell></TableRow></TableHead>
                <TableBody>
                  {recientes.length === 0 ? <TableRow><TableCell colSpan={4}>No hay artículos registrados.</TableCell></TableRow> : recientes.map((articulo) => {
                    const estado = obtenerEstadoStock(articulo.stock);
                    return <TableRow key={articulo.id} hover><TableCell><Typography fontSize={13.5} fontWeight={750}>{articulo.nombre}</Typography><Typography variant="caption" color="text.secondary">{articulo.marca}</Typography></TableCell><TableCell sx={{ display: { xs: 'none', sm: 'table-cell' } }}><Typography fontSize={12.5}>{articulo.tipo}</Typography></TableCell><TableCell sx={{ whiteSpace: 'nowrap', fontWeight: 700, fontSize: 13 }}>{formatoCLP(articulo.precio)}</TableCell><TableCell><Chip size="small" label={estado.etiqueta} color={estado.tono} variant="outlined" sx={{ fontSize: 10.5 }} /></TableCell></TableRow>;
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Card>
        </Grid>
        <Grid item xs={12} lg={4}>
          <Card sx={{ borderRadius: 3.5, height: '100%', p: 3 }}>
            <Typography variant="h6" mb={1}>¿Cómo empezar?</Typography>
            <Typography color="text.secondary" fontSize={13.5} mb={3}>Tres pasos para mantener el inventario y el carrito actualizados.</Typography>
            <Stack spacing={3}>
              <Stack direction="row" spacing={1.7} alignItems="flex-start">
                <Box sx={{ bgcolor: '#E1F3EA', color: '#12805C', width: 42, height: 42, borderRadius: 2.2, display: 'grid', placeItems: 'center', flexShrink: 0 }}><AddCircleOutlineRounded /></Box>
                <Box><Typography fontWeight={800} fontSize={13.5}>1. Agrega productos</Typography><Typography color="text.secondary" fontSize={12.7} lineHeight={1.8}>Registra nombre, marca, tipo, stock y precio desde el formulario.</Typography></Box>
              </Stack>
              <Stack direction="row" spacing={1.7} alignItems="flex-start">
                <Box sx={{ bgcolor: '#E8F0FC', color: '#4974B4', width: 42, height: 42, borderRadius: 2.2, display: 'grid', placeItems: 'center', flexShrink: 0 }}><CheckCircleOutlineRounded /></Box>
                <Box><Typography fontWeight={800} fontSize={13.5}>2. Consulta el inventario</Typography><Typography color="text.secondary" fontSize={12.7} lineHeight={1.8}>Visualiza los artículos en la tabla y filtra por categoría.</Typography></Box>
              </Stack>
            </Stack>
            <Button component={Link} to="/carrito" variant="outlined" fullWidth sx={{ mt: 3.5 }}>Ver carrito de compras</Button>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
