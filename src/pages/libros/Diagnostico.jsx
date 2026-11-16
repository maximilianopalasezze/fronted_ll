import { useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { Alert, Box, Button, Card, CardContent, Chip, Divider, Grid, Stack, TextField, Typography } from '@mui/material';
import Encabezado from '../../components/libros/Encabezado.jsx';
import EstadoSolicitud from '../../components/libros/EstadoSolicitud.jsx';
import { crearApiLibros } from '../../services/librosApi.js';

const escenarios = [
  ['normal', 'Consulta normal'], ['404', 'Error 404'], ['500', 'Error 500'],
  ['red', 'Fallo de conexión'], ['json', 'JSON inválido'],
  ['formato', 'Estructura incorrecta'], ['timeout', 'Tiempo de espera agotado'],
];

export default function Diagnostico() {
  // El cliente tiene caché y peticiones propias: nunca altera las de la tienda.
  const cliente = useMemo(() => crearApiLibros(), []);
  const secuencia = useRef(0);
  const [recurso, setRecurso] = useState('libros');
  const [modo, setModo] = useState('normal');
  const [estado, setEstado] = useState({ cargando: false, resultado: null, error: null });
  useEffect(() => () => { secuencia.current += 1; }, []);

  const reiniciar = (cambiar) => {
    secuencia.current += 1;
    cambiar();
    setEstado({ cargando: false, resultado: null, error: null });
  };
  const ejecutar = async (escenario = modo) => {
    const actual = ++secuencia.current;
    setEstado({ cargando: true, resultado: null, error: null });
    try {
      const resultado = await cliente.consultarRecurso(recurso, { modo: escenario, forzar: true });
      if (actual === secuencia.current) setEstado({ cargando: false, resultado, error: null });
    } catch (error) {
      if (actual === secuencia.current) setEstado({ cargando: false, resultado: null, error });
    }
  };
  const metadata = estado.resultado?.diagnostico || estado.error?.diagnostico;
  const terminada = !!estado.resultado || !!estado.error;
  const volverNormal = () => { setModo('normal'); ejecutar('normal'); };

  return <Box>
    <Encabezado etiqueta="VERIFICACIÓN ACADÉMICA" titulo="Diagnóstico de consultas"
      descripcion="Pruebas de solo lectura con un cliente aislado del catálogo. No modifica los libros ni las consultas de otras pantallas."
      accion={<Button component={Link} to="/catalogo" variant="outlined">Volver al catálogo</Button>} />
    <Alert severity="info" sx={{ mb: 3 }}>
      {import.meta.env.DEV
        ? 'En desarrollo, los modos normal, 404 y 500 reciben respuestas HTTP reales del servidor mock local.'
        : 'En esta compilación estática, el modo normal solicita archivos JSON por HTTP y el 404 solicita un archivo inexistente. El 500 se simula localmente; no existe un servidor REST en GitHub Pages.'}
      {' Los fallos de conexión, JSON inválido, estructura incorrecta y tiempo agotado son simulaciones locales controladas.'}
    </Alert>
    <Card sx={{ borderRadius: 3 }}><CardContent sx={{ p: { xs: 3, sm: 4 } }}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}><TextField id="diagnostico-recurso" label="Recurso" select fullWidth value={recurso} SelectProps={{ native: true }}
          onChange={(e) => reiniciar(() => setRecurso(e.target.value))}>
          <option value="libros">Libros</option><option value="categorias">Categorías</option>
        </TextField></Grid>
        <Grid item xs={12} sm={6}><TextField id="diagnostico-escenario" label="Escenario" select fullWidth value={modo} SelectProps={{ native: true }}
          onChange={(e) => reiniciar(() => setModo(e.target.value))}>
          {escenarios.map(([valor, texto]) => <option key={valor} value={valor}>{texto}</option>)}
        </TextField></Grid>
      </Grid>
      <Stack direction={{ xs: 'column', sm: 'row' }} gap={1.5} sx={{ my: 3 }}>
        <Button variant="contained" disabled={estado.cargando} onClick={() => ejecutar()}>Ejecutar prueba</Button>
        <Button variant="outlined" disabled={estado.cargando} onClick={volverNormal}>Volver al modo normal</Button>
      </Stack>
      <Divider sx={{ mb: 3 }} />
      <Typography role="status" aria-live="polite" fontWeight={800} sx={{ mb: 2 }}>
        Estado: {estado.cargando ? 'cargando' : estado.error ? 'error' : estado.resultado ? 'correcto' : 'sin ejecutar'}
      </Typography>
      <EstadoSolicitud cargando={estado.cargando} error={estado.error} reintentar={() => ejecutar()} etiqueta="prueba" compacto />
      {estado.resultado && <Typography sx={{ mb: 2 }}>{estado.resultado.datos.length} elementos recibidos correctamente.</Typography>}
      {terminada && <Stack gap={1.5}>
        <Stack direction="row" gap={1} flexWrap="wrap">
          <Chip label={'Código: ' + (estado.error?.codigo || 'OK')} color={estado.error ? 'error' : 'success'} variant="outlined" />
          <Chip label={metadata?.estado ? 'HTTP ' + metadata.estado + (metadata.simulado ? ' simulado' : ' real') : 'Sin respuesta HTTP'} variant="outlined" />
        </Stack>
        <Typography variant="body2">Origen: {metadata?.origen || 'No disponible'}</Typography>
        {metadata?.url && <Typography variant="body2" sx={{ overflowWrap: 'anywhere' }}>Solicitud: {metadata.url}</Typography>}
        <Typography variant="body2" color="text.secondary">{metadata?.simulado ? 'Este escenario se resuelve localmente y puede no aparecer en Network.' : 'Comprueba la petición y su código de estado en la pestaña Network del navegador.'}</Typography>
      </Stack>}
    </CardContent></Card>
  </Box>;
}
