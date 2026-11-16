import { Link } from 'react-router-dom';
import { ArrowForwardRounded } from '@mui/icons-material';
import { Box, Button, Card, CardContent, Typography } from '@mui/material';

export default function TarjetaCategoria({ categoria }) {
  return <Card sx={{ borderRadius: 3, height: '100%', transition: 'transform .2s', '&:hover': { transform: 'translateY(-4px)' } }}>
    <CardContent sx={{ p: 3, '&:last-child': { pb: 3 }, height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ fontSize: 34, bgcolor: 'rgba(125,211,252,.12)', borderRadius: 3, width: 68, height: 68, display: 'grid', placeItems: 'center', mb: 2 }} aria-hidden="true">{categoria.icono}</Box>
      <Typography variant="h6" fontWeight={850}>{categoria.nombre}</Typography>
      <Typography color="text.secondary" fontSize={13.5} sx={{ lineHeight: 1.8, flexGrow: 1, mt: 1 }}>{categoria.descripcion}</Typography>
      <Button component={Link} to={'/catalogo?categoria=' + encodeURIComponent(categoria.id)} endIcon={<ArrowForwardRounded />} sx={{ alignSelf: 'start', mt: 2 }}>Explorar libros</Button>
    </CardContent>
  </Card>;
}