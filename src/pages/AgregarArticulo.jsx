import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Alert, Box, Button, Card, CardContent, Chip, Divider, Grid, InputAdornment, MenuItem,
  Paper, Stack, TextField, Typography,
} from '@mui/material';
import {
  ArrowBackRounded, CheckCircleOutlineRounded, Inventory2Outlined, SaveOutlined, ShoppingBagOutlined,
} from '@mui/icons-material';
import { useInventario } from '../context/InventarioContext';
import { tiposProducto } from '../data/productosIniciales';
import { formatoCLP, validarArticulo } from '../utils/inventario';
import SeccionTitulo from '../components/SeccionTitulo';

const vacio = { nombre: '', marca: '', tipo: '', stock: '', precio: '' };

export default function AgregarArticulo() {
  const [campos, setCampos] = useState(vacio);
  const [errores, setErrores] = useState({});
  const { agregarArticulo } = useInventario();
  const navigate = useNavigate();

  const cambiar = (e) => {
    const { name, value } = e.target;
    setCampos((anterior) => ({ ...anterior, [name]: value }));
    setErrores((anterior) => ({ ...anterior, [name]: undefined }));
  };

  const enviar = (e) => {
    e.preventDefault();
    const nuevosErrores = validarArticulo(campos);
    if (Object.keys(nuevosErrores).length > 0) {
      setErrores(nuevosErrores);
      return;
    }
    const articulo = {
      id: `P-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      nombre: campos.nombre.trim(),
      marca: campos.marca.trim(),
      tipo: campos.tipo,
      stock: Number(campos.stock),
      precio: Number(campos.precio),
      fechaIngreso: new Date().toISOString().slice(0, 10),
    };
    agregarArticulo(articulo);
    navigate('/inventario', { state: { agregado: articulo.nombre } });
  };

  return (
    <Box>
      <SeccionTitulo indicador="GESTIÓN DE ARTÍCULOS" titulo="Registrar nuevo artículo" descripcion="Completa los datos del producto para incorporarlo al inventario." accion={<Button component={Link} to="/inventario" variant="outlined" startIcon={<ArrowBackRounded />}>Volver al inventario</Button>} />
      <Grid container spacing={3} alignItems="flex-start">
        <Grid item xs={12} lg={8}>
          <Card sx={{ borderRadius: 3.5 }}>
            <CardContent sx={{ p: { xs: 2.5, sm: 4 }, '&:last-child': { pb: 4 } }}>
              <Stack direction="row" spacing={1.8} alignItems="center" mb={3.5}>
                <Box sx={{ width: 48, height: 48, borderRadius: 2.5, display: 'grid', placeItems: 'center', bgcolor: '#E6F5ED', color: '#087A5A' }}><ShoppingBagOutlined /></Box>
                <Box><Typography variant="h6">Información del producto</Typography><Typography fontSize={12.5} color="text.secondary">Los campos marcados con * son obligatorios.</Typography></Box>
              </Stack>
              <Box component="form" onSubmit={enviar} noValidate aria-label="Formulario para agregar artículo">
                <Grid container spacing={2.6}>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth required label="Nombre del artículo" name="nombre" placeholder="Ej. Arroz grado 1" value={campos.nombre} onChange={cambiar} error={Boolean(errores.nombre)} helperText={errores.nombre || 'Nombre con el que se identifica el producto'} inputProps={{ maxLength: 100 }} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth required label="Marca" name="marca" placeholder="Ej. Tucapel" value={campos.marca} onChange={cambiar} error={Boolean(errores.marca)} helperText={errores.marca || 'Fabricante o marca comercial'} inputProps={{ maxLength: 80 }} />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField select fullWidth required name="tipo" label="Tipo de producto" value={campos.tipo} onChange={cambiar} error={Boolean(errores.tipo)} helperText={errores.tipo || 'Selecciona la categoría que mejor representa el artículo'}>
                      {tiposProducto.map((tipo) => <MenuItem key={tipo} value={tipo}>{tipo}</MenuItem>)}
                    </TextField>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth required type="number" name="stock" label="Cantidad en stock" value={campos.stock} onChange={cambiar} error={Boolean(errores.stock)} helperText={errores.stock || 'Número de unidades disponibles'} inputProps={{ min: 0, step: 1 }} />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField fullWidth required type="number" name="precio" label="Precio unitario" value={campos.precio} onChange={cambiar} error={Boolean(errores.precio)} helperText={errores.precio || 'Valor en pesos chilenos'} InputProps={{ startAdornment: <InputAdornment position="start">$</InputAdornment> }} inputProps={{ min: 0, step: 1 }} />
                  </Grid>
                </Grid>
                <Divider sx={{ my: 4 }} />
                <Stack direction={{ xs: 'column-reverse', sm: 'row' }} justifyContent="flex-end" spacing={1.5}>
                  <Button variant="outlined" color="inherit" onClick={() => { setCampos(vacio); setErrores({}); }}>Limpiar formulario</Button>
                  <Button type="submit" variant="contained" startIcon={<SaveOutlined />} size="large">Guardar artículo</Button>
                </Stack>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} lg={4}>
          <Stack spacing={2.5}>
            <Paper variant="outlined" sx={{ borderRadius: 3.5, p: 3, borderColor: '#E4EDE8' }}>
              <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2.5}>
                <Typography fontWeight={800}>Vista previa</Typography>
                <Chip size="small" label="EN EDICIÓN" sx={{ bgcolor: '#F8ECCC', color: '#967020', fontWeight: 800, fontSize: 10 }} />
              </Stack>
              <Box sx={{ bgcolor: '#24334C', color: '#93C5FD', height: 94, borderRadius: 3, display: 'grid', placeItems: 'center', mb: 2.5 }}><Inventory2Outlined sx={{ fontSize: 41 }} /></Box>
              <Typography fontWeight={800} fontSize={19}>{campos.nombre.trim() || 'Nombre del producto'}</Typography>
              <Typography color="text.secondary" fontSize={13}>{campos.marca.trim() || 'Marca sin definir'}</Typography>
              <Chip variant="outlined" size="small" label={campos.tipo || 'Sin categoría'} sx={{ mt: 2, mb: 2.5 }} />
              <Divider sx={{ mb: 2 }} />
              <Stack direction="row" justifyContent="space-between" alignItems="center"><Typography color="text.secondary" fontSize={13}>Precio unitario</Typography><Typography fontWeight={850}>{campos.precio !== '' && Number.isFinite(Number(campos.precio)) && Number(campos.precio) >= 0 ? formatoCLP(campos.precio) : '—'}</Typography></Stack>
              <Stack direction="row" justifyContent="space-between" mt={1.5}><Typography color="text.secondary" fontSize={13}>Existencias</Typography><Typography fontWeight={800} fontSize={13}>{campos.stock !== '' && Number(campos.stock) >= 0 ? `${campos.stock} unidades` : '—'}</Typography></Stack>
            </Paper>
            <Alert icon={<CheckCircleOutlineRounded />} severity="info" sx={{ borderRadius: 3, alignItems: 'flex-start', '& .MuiAlert-message': { fontSize: 12.5, lineHeight: 1.8 } }}>Al guardar, el artículo aparecerá automáticamente en la tabla del inventario gracias al estado global compartido con React Context.</Alert>
          </Stack>
        </Grid>
      </Grid>
    </Box>
  );
}
