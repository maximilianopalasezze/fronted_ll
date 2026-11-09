import { Link } from 'react-router-dom';
import { Box, Button, Chip, IconButton, Stack, TableCell, TableRow, Tooltip, Typography } from '@mui/material';
import { DeleteOutlineRounded, Inventory2Outlined, VisibilityOutlined } from '@mui/icons-material';
import { formatoCLP, numero, obtenerEstadoStock } from '../utils/inventario';

export default function FilaArticulo({ articulo, enCarrito = false, onEliminar }) {
  const estado = obtenerEstadoStock(articulo.stock);
  return (
    <TableRow hover sx={{ '& td': { py: 2 } }}>
      <TableCell sx={{ pl: 3 }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box sx={{ width: 42, height: 42, bgcolor: '#24334C', borderRadius: 2, color: '#93C5FD', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
            <Inventory2Outlined fontSize="small" />
          </Box>
          <Box>
            <Typography component={Link} to={`/inventario/${encodeURIComponent(articulo.id)}`}
              fontWeight={800} fontSize={13.5} sx={{ color: '#93C5FD', '&:hover': { textDecoration: 'underline' } }}>
              {articulo.nombre}
            </Typography>
            <Typography color="text.secondary" fontSize={12}>{articulo.marca}</Typography>
          </Box>
        </Stack>
      </TableCell>
      <TableCell><Chip size="small" variant="outlined" label={articulo.tipo} sx={{ fontSize: 11.5 }} /></TableCell>
      <TableCell align="right"><Typography fontWeight={750} fontSize={13}>{formatoCLP(articulo.precio)}</Typography></TableCell>
      <TableCell align="center"><Typography fontWeight={750}>{numero(articulo.stock)}</Typography></TableCell>
      <TableCell><Chip size="small" variant="outlined" color={estado.tono} label={estado.etiqueta} /></TableCell>
      <TableCell><Typography fontSize={12} color="text.secondary">{articulo.fechaIngreso || '—'}</Typography></TableCell>
      <TableCell align="right" sx={{ pr: 2, whiteSpace: 'nowrap' }}>
        <Tooltip title="Abrir detalle">
          <IconButton component={Link} to={`/inventario/${encodeURIComponent(articulo.id)}`} color="primary" aria-label={`Ver detalle de ${articulo.nombre}`}>
            <VisibilityOutlined fontSize="small" />
          </IconButton>
        </Tooltip>
        <Tooltip title={enCarrito ? 'Quita este producto del carrito antes de eliminarlo' : 'Eliminar artículo'}>
          <span><IconButton onClick={() => onEliminar(articulo)} disabled={enCarrito} color="error" aria-label={`Eliminar ${articulo.nombre}`}>
            <DeleteOutlineRounded fontSize="small" />
          </IconButton></span>
        </Tooltip>
      </TableCell>
    </TableRow>
  );
}
