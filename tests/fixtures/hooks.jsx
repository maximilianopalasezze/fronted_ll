// Fixture de integración: solo Vite de desarrollo lo sirve; no se importa en la aplicación.
import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from '@mui/material';
import { theme } from '../../src/theme.js';
import { useRecurso } from '../../src/hooks/useRecurso.js';
import EstadoSolicitud from '../../src/components/libros/EstadoSolicitud.jsx';
import { ErrorPeticion } from '../../src/services/http.js';

const consultas = [];
let invalidaciones = 0;
const cliente = {
  consultarRecurso(recurso) {
    return new Promise((resolve, reject) => consultas.push({ recurso, resolve, reject }));
  },
  limpiarCache() { invalidaciones++; },
};

function Prueba() {
  const [recurso, setRecurso] = useState('libros');
  const resultado = useRecurso(recurso, 'normal', cliente);
  window.hookPruebas = {
    get consultas() { return consultas.length; },
    get invalidaciones() { return invalidaciones; },
    cambiar: setRecurso,
    reintentar: resultado.reintentar,
    resolver: (indice, datos) => consultas[indice].resolve({ datos, fuente: 'prueba' }),
    rechazar: (indice) => consultas[indice].reject(new ErrorPeticion('RED', 'Sin conexión')),
  };
  return <><output id="estado-hook">{JSON.stringify({ recurso, datos: resultado.datos, cargando: resultado.cargando, error: resultado.error?.codigo || null })}</output>
    <EstadoSolicitud {...resultado} vacio={!resultado.datos.length && !resultado.cargando && !resultado.error} etiqueta={recurso} />
  </>;
}
createRoot(document.getElementById('root')).render(<ThemeProvider theme={theme}><MemoryRouter><Prueba /></MemoryRouter></ThemeProvider>);
