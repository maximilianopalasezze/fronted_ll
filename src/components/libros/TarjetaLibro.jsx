import { Link } from 'react-router-dom';
import { ArrowForwardRounded } from '@mui/icons-material';
import { Button, Card, CardContent, Chip, Stack, Typography } from '@mui/material';
import { formatoCLP } from '../../utils/catalogo.js';
import PortadaLibro from './PortadaLibro.jsx';

export default function TarjetaLibro({ libro, categoria }) {
  return <Card sx={{ borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
    <PortadaLibro libro={libro} />
    <CardContent sx={{ p: 3, '&:last-child': { pb: 3 }, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" gap={1} flexWrap="wrap">
        <Typography color="primary.light" variant="caption" fontWeight={800}>{categoria?.nombre || 'Libro'}</Typography>
        {libro.destacado && <Chip size="small" label="DESTACADO" sx={{ bgcolor: '#E8CB91', color: '#27220E', fontWeight: 900 }} />}
      </Stack>
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
