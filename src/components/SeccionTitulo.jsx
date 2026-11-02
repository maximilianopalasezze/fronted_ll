import { Box, Typography } from '@mui/material';

export default function SeccionTitulo({ indicador, titulo, descripcion, accion }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, flexWrap: 'wrap', alignItems: 'center', mb: 3.4 }}>
      <Box>
        {indicador && <Typography variant="overline" sx={{ color: 'primary.main', fontWeight: 800, letterSpacing: '.14em' }}>{indicador}</Typography>}
        <Typography variant="h4" sx={{ fontSize: { xs: 27, md: 33 }, mb: .7 }}>{titulo}</Typography>
        {descripcion && <Typography color="text.secondary" fontSize={14.5}>{descripcion}</Typography>}
      </Box>
      {accion}
    </Box>
  );
}
