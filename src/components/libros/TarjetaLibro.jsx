import { Link } from 'react-router-dom';
import { ArrowForwardRounded, MenuBookRounded } from '@mui/icons-material';
import { Box, Button, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import { formatoCLP } from '../../utils/catalogo.js';
const fondos = ['#183D58', '#3A2B60', '#25463E', '#4F3447', '#254B67', '#504024'];

export default function TarjetaLibro({ libro, categoria }) {
  const numero = [...libro.id].reduce((sum, letra) => sum + letra.charCodeAt(0), 0);
  return <Card sx={{ borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
    <Box sx={{ bgcolor: fondos[numero % fondos.length], minHeight: 140, display: 'grid', placeItems: 'center', position: 'relative' }}>
      <MenuBookRounded sx={{ fontSize: 65, color: '#E0F2FE' }} />
      {libro.destacado && <Chip size="small" label="DESTACADO" sx={{ position: 'absolute', top: 12, right: 12, bgcolor: '#E8CB91', color: '#27220E', fontWeight: 900 }} />}
    </Box>
    <CardContent sx={{ p: 3, '&:last-child': { pb: 3 }, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
      <Typography color="primary.light" variant="caption" fontWeight={800}>{categoria?.nombre || 'Libro'}</Typography>
      <Typography variant="h6" component="h3" sx={{ fontWeight: 850, mt: 1 }}>{libro.titulo}</Typography>
      <Typography color="text.secondary" fontSize={13} mt={.6}>{libro.autor} · {libro.anio}</Typography>
      <Typography color="text.secondary" fontSize={13} sx={{ flexGrow: 1, lineHeight: 1.8, mt: 1.6 }}>{libro.resumen}</Typography>
      <Stack direction="row" justifyContent="space-between" alignItems="center" mt={2.5} gap={1}>
        <Typography fontWeight={900}>{formatoCLP(libro.precio)}</Typography>
        <Button component={Link} to={'/libro/' + encodeURIComponent(libro.id)} size="small" endIcon={<ArrowForwardRounded />}>Detalle</Button>
      </Stack>
    </CardContent>
  </Card>;
}