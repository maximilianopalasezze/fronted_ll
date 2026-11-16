import { useState } from 'react';
import { MenuBookRounded } from '@mui/icons-material';
import { Box } from '@mui/material';

export default function PortadaLibro({ libro, altura = 280, diferida = true, sx = {} }) {
  const [portadaFallida, setPortadaFallida] = useState(null);
  const portada = libro.portada ? import.meta.env.BASE_URL + libro.portada.replace(/^\/+/, '') : null;

  return <Box sx={{ height: altura, width: '100%', flexShrink: 0, display: 'grid', placeItems: 'center', bgcolor: '#101C2C', p: 2, ...sx }}>
    {portada && portadaFallida !== portada ? <Box component="img" src={portada}
      alt={'Portada de ' + libro.titulo} loading={diferida ? 'lazy' : 'eager'} decoding="async"
      onError={() => setPortadaFallida(portada)}
      sx={{ display: 'block', width: '100%', height: '100%', minHeight: 0, objectFit: 'contain' }} /> :
      <Box role="img" aria-label={'Portada no disponible de ' + libro.titulo} sx={{ display: 'grid', placeItems: 'center', height: '100%' }}>
        <MenuBookRounded aria-hidden="true" sx={{ fontSize: 80, color: 'primary.light' }} />
      </Box>}
  </Box>;
}
