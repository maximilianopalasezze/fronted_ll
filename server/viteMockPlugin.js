import { readFileSync } from 'node:fs';
import { resolverMock } from './mockApi.js';

const ARCHIVO_DATOS = new URL('../mock/db.json', import.meta.url);

export default function viteMockPlugin() {
  return {
    name: 'libreria-rest-mock',
    configureServer(servidor) {
      servidor.middlewares.use((req, res, next) => {
        const url = new URL(req.url || '/', 'http://localhost');
        if (!url.pathname.startsWith('/api/')) return next();
        const responder = () => {
          try {
            const datos = JSON.parse(readFileSync(ARCHIVO_DATOS, 'utf8'));
            const respuesta = resolverMock(req.method || 'GET', url.pathname, url.searchParams, datos);
            res.statusCode = respuesta.estado;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.setHeader('Cache-Control', 'no-store');
            res.end(JSON.stringify(respuesta.cuerpo));
          } catch {
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json; charset=utf-8');
            res.end(JSON.stringify({ mensaje: 'El mock no pudo leer su archivo de datos.' }));
          }
        };
        // Pequeña latencia controlada para evidenciar estados de carga.
        setTimeout(responder, 350);
      });
    },
  };
}
