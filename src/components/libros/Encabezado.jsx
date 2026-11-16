import { Box, Typography } from '@mui/material';
export default function Encabezado({ etiqueta, titulo, descripcion, accion }) {
  return <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: { xs: 'start', md: 'center' }, flexDirection: { xs: 'column', md: 'row' }, gap: 2, mb: 3.5 }}>
    <Box><Typography variant="overline" sx={{ fontWeight: 900, color: 'primary.light', letterSpacing: '.12em' }}>{etiqueta}</Typography>
      <Typography component="h1" variant="h4" sx={{ fontWeight: 900, fontSize: { xs: 27, sm: 35 }, mt: .6 }}>{titulo}</Typography>
      <Typography color="text.secondary" sx={{ mt: 1, maxWidth: 660, lineHeight: 1.8 }}>{descripcion}</Typography></Box>{accion}
  </Box>;
}