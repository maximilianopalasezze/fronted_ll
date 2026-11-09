import { useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  AppBar, Avatar, Box, Button, Chip, Divider, Drawer, IconButton, List, ListItemButton, ListItemIcon,
  ListItemText, Paper, Stack, Toolbar, Tooltip, Typography, useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useInventario } from '../context/InventarioContext';
import { AddBoxOutlined, ArrowForward, DashboardRounded, Inventory2Outlined, MenuRounded, ShieldOutlined, ShoppingCartOutlined } from '@mui/icons-material';

const anchoMenu = 258;
const rutas = [
  { texto: 'Resumen', url: '/', Icono: DashboardRounded },
  { texto: 'Agregar artículo', url: '/agregar', Icono: AddBoxOutlined },
  { texto: 'Inventario', url: '/inventario', Icono: Inventory2Outlined },
  { texto: 'Carrito', url: '/carrito', Icono: ShoppingCartOutlined },
];

export default function Layout() {
  const [abierto, setAbierto] = useState(false);
  const { unidadesCarrito } = useInventario();
  const theme = useTheme();
  const esMovil = useMediaQuery(theme.breakpoints.down('md'));
  const ubicacion = useLocation();

  const menu = (
    <Stack sx={{ height: '100%', bgcolor: '#111C30', color: 'white', px: 2.2, py: 3 }}>
      <Stack component={Link} to="/" onClick={() => setAbierto(false)} direction="row" spacing={1.3} alignItems="center" sx={{ px: 1, color: 'inherit', mb: 5 }}>
        <Box component="img" src={`${import.meta.env.BASE_URL}Carrito de supermercado lleno de frescura.png`}
          alt="Logo Supermarket" sx={{ width: 48, height: 48, objectFit: 'contain' }} />
        <Box>
          <Typography sx={{ fontWeight: 850, fontSize: 18, letterSpacing: '-.03em', lineHeight: 1.1 }}>super<span style={{ color: '#EFC883' }}>market</span></Typography>
          <Typography sx={{ fontSize: 10.5, letterSpacing: '.11em', color: '#A6C7BE', mt: .45 }}>CONTROL DE INVENTARIO</Typography>
        </Box>
      </Stack>
      <Typography sx={{ color: '#7EA79C', fontSize: 11, fontWeight: 800, letterSpacing: '.14em', px: 1.6, mb: 1.5 }}>MENÚ PRINCIPAL</Typography>
      <List disablePadding sx={{ display: 'grid', gap: .65 }}>
        {rutas.map(({ texto, url, Icono }) => (
          <ListItemButton key={url} component={NavLink} to={url} end={url === '/'} onClick={() => setAbierto(false)}
            sx={{ color: '#CBDDD7', borderRadius: 2, py: 1.2, '& .MuiListItemIcon-root': { color: 'inherit' }, '&.active': { bgcolor: 'rgba(255,255,255,.13)', color: '#FFF', fontWeight: 800 }, '&:hover': { bgcolor: 'rgba(255,255,255,.08)' } }}>
            <ListItemIcon sx={{ minWidth: 42 }}><Icono fontSize="small" /></ListItemIcon>
            <ListItemText primary={texto} primaryTypographyProps={{ fontSize: 14, fontWeight: 650 }} />
            {url === '/carrito' && unidadesCarrito > 0 && <Chip size="small" color="primary" label={unidadesCarrito} aria-label={`${unidadesCarrito} unidades en carrito`} />}
          </ListItemButton>
        ))}
      </List>
      <Box sx={{ flexGrow: 1 }} />
      <Paper sx={{ p: 2, bgcolor: 'rgba(255,255,255,.075)', color: 'white', borderRadius: 3, border: '1px solid rgba(255,255,255,.1)' }} elevation={0}>
        <ShieldOutlined sx={{ color: '#E8C481', mb: 1 }} />
        <Typography fontWeight={800} fontSize={13}>Inventario en orden</Typography>
        <Typography sx={{ color: '#B9D1C9', fontSize: 12, lineHeight: 1.7, my: 1 }}>Registra y consulta tus artículos desde un solo lugar.</Typography>
        <Button component={Link} to="/agregar" onClick={() => setAbierto(false)} endIcon={<ArrowForward sx={{ fontSize: 16 }} />} size="small" sx={{ px: 0, color: '#EFC883', '&:hover': { bgcolor: 'transparent' } }}>Nuevo artículo</Button>
      </Paper>
      <Divider sx={{ borderColor: 'rgba(255,255,255,.12)', mt: 2.7, mb: 2 }} />
      <Typography sx={{ px: .7, color: '#8CB0A5', fontSize: 11.5 }}>PFY2202 · Desarrollo Frontend II</Typography>
    </Stack>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      <Box component="nav" sx={{ width: { md: anchoMenu }, flexShrink: { md: 0 } }} aria-label="Navegación principal">
        {esMovil ? (
          <Drawer variant="temporary" open={abierto} onClose={() => setAbierto(false)} ModalProps={{ keepMounted: true }} sx={{ '& .MuiDrawer-paper': { width: anchoMenu } }}>
            {menu}
          </Drawer>
        ) : (
          <Drawer variant="permanent" open sx={{ '& .MuiDrawer-paper': { width: anchoMenu, border: 0, boxSizing: 'border-box' } }}>
            {menu}
          </Drawer>
        )}
      </Box>
      <Box sx={{ flexGrow: 1, minWidth: 0 }}>
        <AppBar position="sticky" color="inherit" elevation={0} sx={{ bgcolor: '#111C30', borderBottom: '1px solid #2C3B50', zIndex: 1100 }}>
          <Toolbar sx={{ minHeight: '76px !important', px: { xs: 2, sm: 3, lg: 5 }, gap: 2 }}>
            {esMovil && <IconButton edge="start" onClick={() => setAbierto(true)} aria-label="Abrir menú"><MenuRounded /></IconButton>}
            <Box sx={{ flexGrow: 1 }}>
              <Typography fontWeight={800} fontSize={{ xs: 17, sm: 20 }} color="text.primary">{ubicacion.pathname === '/' ? 'Supermarket' : ubicacion.pathname === '/carrito' ? 'Carrito de compras' : ubicacion.pathname.startsWith('/inventario/') ? 'Detalle de artículo' : ubicacion.pathname === '/inventario' ? 'Inventario' : ubicacion.pathname === '/agregar' ? 'Nuevo artículo' : 'Supermarket'}</Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>Sistema de inventario del supermercado</Typography>
            </Box>
            <Tooltip title="Actividad Semana 3">
              <Stack direction="row" alignItems="center" spacing={1.2}>
                <Box sx={{ textAlign: 'right', display: { xs: 'none', sm: 'block' } }}>
                  <Typography fontSize={12} fontWeight={800}>Administrador</Typography>
                  <Typography variant="caption" color="text.secondary">Acceso local</Typography>
                </Box>
                <Avatar sx={{ bgcolor: '#DFF2E9', color: '#0B7655', fontWeight: 800, width: 40, height: 40 }}>A</Avatar>
              </Stack>
            </Tooltip>
          </Toolbar>
        </AppBar>
        <Box component="main" sx={{ maxWidth: 1440, mx: 'auto', px: { xs: 2, sm: 3, lg: 5 }, pt: { xs: 3, sm: 4.5 }, pb: 6 }} className="fade-in">
          <Outlet />
          <Divider sx={{ mt: 7, mb: 2.5 }} />
          <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" spacing={1}>
            <Typography variant="caption" color="text.secondary">Supermarket · Gestión de inventario</Typography>
            <Typography variant="caption" color="text.secondary">Proyecto React · Semana 3 · PFY2202</Typography>
          </Stack>
        </Box>
      </Box>
    </Box>
  );
}
