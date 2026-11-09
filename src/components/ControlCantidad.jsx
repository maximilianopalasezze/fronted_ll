import { IconButton, Stack, Typography } from '@mui/material';
import { AddRounded, RemoveRounded } from '@mui/icons-material';

/** Control accesible reutilizado en el detalle y en el carrito. */
export default function ControlCantidad({ valor, disminuir, aumentar, minimo = 0, maximo = Infinity, etiqueta = 'producto' }) {
  return (
    <Stack direction="row" alignItems="center" spacing={1}>
      <IconButton aria-label={`Disminuir cantidad de ${etiqueta}`} onClick={disminuir}
        disabled={valor <= minimo} size="small" sx={{ border: '1px solid', borderColor: 'divider' }}>
        <RemoveRounded fontSize="small" />
      </IconButton>
      <Typography fontWeight={800} textAlign="center" sx={{ minWidth: 34 }} aria-live="polite">{valor}</Typography>
      <IconButton aria-label={`Aumentar cantidad de ${etiqueta}`} onClick={aumentar}
        disabled={valor >= maximo} size="small" sx={{ border: '1px solid', borderColor: 'divider' }}>
        <AddRounded fontSize="small" />
      </IconButton>
    </Stack>
  );
}
