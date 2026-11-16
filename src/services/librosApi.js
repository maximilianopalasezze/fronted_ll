import { ErrorPeticion, obtenerJson } from './http.js';

const cache = new Map();
const pendientes = new Map();
const DURACION_CACHE = 5 * 60 * 1000;
const RECURSOS = new Set(['categorias', 'libros']);

function ruta(recurso, modo) {
  const desarrollo = import.meta.env.DEV;
  const raiz = desarrollo ? '/api/' : import.meta.env.BASE_URL + 'mock/';
  if (modo === '404' && !desarrollo) return raiz + '__recurso-inexistente__.json';
  const sufijo = desarrollo ? '' : '.json';
  const error = desarrollo && ['404', '500'].includes(modo) ? '?error=' + modo : '';
  return raiz + recurso + sufijo + error;
}

export function limpiarCache(recurso) {
  if (recurso) cache.delete(recurso);
  else cache.clear();
}

export async function consultarRecurso(recurso, { forzar = false, modo = 'normal' } = {}) {
  if (!RECURSOS.has(recurso)) throw new ErrorPeticion('NO_ENCONTRADO', 'Recurso no configurado.', 404);
  const llave = recurso + ':' + modo;
  const previo = cache.get(recurso);
  if (!forzar && modo === 'normal' && previo && Date.now() - previo.fecha < DURACION_CACHE) {
    return { datos: previo.datos, fuente: 'caché' };
  }
  if (pendientes.has(llave)) return pendientes.get(llave);
  const promesa = (async () => {
    let opciones = {};
    if (!import.meta.env.DEV && modo === '500') {
      // GitHub Pages es estático: simulamos una respuesta HTTP 500 para la demostración.
      opciones = { fetcher: async () => new Response('{"mensaje":"Error simulado"}', { status: 500 }) };
    }
    if (modo === 'red') {
      opciones = { fetcher: async () => { throw new TypeError('Fallo de red simulado'); } };
    }
    const datos = await obtenerJson(ruta(recurso, modo), opciones);
    if (modo === 'normal') cache.set(recurso, { datos, fecha: Date.now() });
    return { datos, fuente: 'red REST mock' };
  })();
  pendientes.set(llave, promesa);
  try {
    return await promesa;
  } finally {
    if (pendientes.get(llave) === promesa) pendientes.delete(llave);
  }
}
