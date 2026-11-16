import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { CategoryOutlined, CloseRounded, HomeOutlined, MenuRounded, SearchRounded } from '@mui/icons-material';
import { Box, Button, Container, Drawer, IconButton, Stack, Toolbar, Typography, useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const rutas = [
  { url: '/', titulo: 'Inicio', Icono: HomeOutlined },
  { url: '/categorias', titulo: 'Categorías', Icono: CategoryOutlined },
  { url: '/catalogo', titulo: 'Catálogo', Icono: SearchRounded },
];
function Navegacion({ cerrar }) {
  return <Stack direction={{ xs: 'column', md: 'row' }} gap={1}>
    {rutas.map(({ url, titulo, Icono }) =>
      <Button key={url} component={NavLink} to={url} end={url === '/'} startIcon={<Icono />} onClick={cerrar}
        sx={{ color: 'text.secondary', justifyContent: 'flex-start', px: 2, borderRadius: 2,
          '&.active': { color: 'primary.light', bgcolor: 'rgba(125,211,252,.12)' } }}>{titulo}</Button>)}
  </Stack>;
}
export default function BookLayout() {
  const [abierto, setAbierto] = useState(false);
  const movil = useMediaQuery(useTheme().breakpoints.down('md'));
  return <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
    <Box component="header" sx={{ bgcolor: '#101C2C', borderBottom: '1px solid #30455D', position: 'sticky', top: 0, zIndex: 1100 }}>
      <Container maxWidth="lg"><Toolbar disableGutters sx={{ minHeight: '76px !important', gap: 2 }}>
        <Stack component={Link} to="/" direction="row" alignItems="center" spacing={{ xs: 1, sm: 1.5 }} sx={{ flexGrow: 1, minWidth: 0 }}>
          <Box sx={{ width: { xs: 48, sm: 56 }, height: { xs: 48, sm: 56 }, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, bgcolor: '#101C2C', border: '1px solid', borderColor: 'divider', p: '6px' }}>
            <Box component="img" src={import.meta.env.BASE_URL + 'images/marca/logo-horizonte.png'} alt="Logo de Librería Horizonte"
              width="1280" height="1280" sx={{ display: 'block', width: '100%', height: '100%', objectFit: 'contain' }} />
          </Box>
          <Box sx={{ minWidth: 0 }}><Typography sx={{ fontSize: { xs: 16, sm: 19 }, fontWeight: 900, lineHeight: 1.1 }}>Librería <Box component="span" sx={{ color: 'primary.light' }}>Horizonte</Box></Typography>
            <Typography color="text.secondary" variant="caption" sx={{ fontSize: { xs: 9, sm: 12 }, letterSpacing: '.08em' }}>EXPLORA NUEVAS HISTORIAS</Typography></Box>
        </Stack>
        {movil ? <IconButton aria-label="Abrir menú" onClick={() => setAbierto(true)}><MenuRounded /></IconButton> : <Navegacion cerrar={() => {}} />}
      </Toolbar></Container>
    </Box>
    <Drawer anchor="right" open={abierto} onClose={() => setAbierto(false)} PaperProps={{ sx: { width: 280, bgcolor: '#101C2C', p: 3 } }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={4}><Typography fontWeight={850}>Navegación</Typography>
        <IconButton onClick={() => setAbierto(false)} aria-label="Cerrar menú"><CloseRounded /></IconButton></Stack>
      <Navegacion cerrar={() => setAbierto(false)} />
    </Drawer>
    <Container component="main" maxWidth="lg" sx={{ flexGrow: 1, py: { xs: 4, sm: 5 } }}><Outlet /></Container>
    <Box component="footer" sx={{ bgcolor: '#101C2C', borderTop: '1px solid #30455D', py: 3 }}>
      <Container maxWidth="lg"><Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" gap={1}>
        <Typography variant="caption" color="text.secondary">© 2026 Librería Horizonte. Todos los derechos reservados.</Typography>
        <Typography variant="caption" color="text.secondary">Descubre, imagina y vive nuevas historias</Typography>
      </Stack></Container>
    </Box>
  </Box>;
}
