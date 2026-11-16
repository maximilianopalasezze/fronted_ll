import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowForwardRounded } from '@mui/icons-material';
import { Box, Button, Card, CardContent, Typography } from '@mui/material';

export default function TarjetaCategoria({ categoria }) {
  const [imagenFallida, setImagenFallida] = useState(null);
  const imagen = categoria.imagen ? import.meta.env.BASE_URL + categoria.imagen.replace(/^\/+/, '') : null;

  return <Card sx={{ borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', transition: 'transform .2s', '&:hover': { transform: 'translateY(-4px)' } }}>
    <CardContent sx={{ p: 3, '&:last-child': { pb: 3 }, flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ width: 68, height: 68, borderRadius: '50%', overflow: 'hidden', flexShrink: 0, bgcolor: '#FFFFFF', display: 'grid', placeItems: 'center', mb: 2 }}>
        {imagen && imagenFallida !== imagen ? <Box component="img" src={imagen}
          alt={'Ilustración de la categoría ' + categoria.nombre} loading="lazy" decoding="async"
          onError={() => setImagenFallida(imagen)}
          sx={{ display: 'block', width: '100%', height: '100%', minHeight: 0, objectFit: 'cover', objectPosition: 'center' }} /> :
          <Box sx={{ fontSize: 34 }} aria-hidden="true">{categoria.icono}</Box>}
      </Box>
      <Typography variant="h6" fontWeight={850}>{categoria.nombre}</Typography>
      <Typography color="text.secondary" fontSize={13.5} sx={{ lineHeight: 1.8, flexGrow: 1, mt: 1 }}>{categoria.descripcion}</Typography>
      <Button component={Link} to={'/catalogo?categoria=' + encodeURIComponent(categoria.id)} endIcon={<ArrowForwardRounded />} sx={{ alignSelf: 'start', mt: 2 }}>Explorar libros</Button>
    </CardContent>
  </Card>;
}
