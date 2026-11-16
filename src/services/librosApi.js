import { ErrorPeticion, obtenerJson } from './http.js';

const RECURSOS = ['categorias', 'libros'];
const MODOS = ['normal', '404', '500', 'red', 'json', 'formato', 'timeout'];
const esTexto = (valor) => typeof valor === 'string' && valor.trim().length > 0;

// Se validan también los elementos: una lista con objetos incompletos no debe llegar a React.
export function validarRecurso(recurso, datos) {
  if (!RECURSOS.includes(recurso) || !Array.isArray(datos)) return false;
  const ids = new Set();
  return datos.every((item) => {
    if (!item || typeof item !== 'object' || Array.isArray(item) || !esTexto(item.id) || ids.has(item.id)) return false;
    ids.add(item.id);
    if (recurso === 'categorias') return ['nombre', 'descripcion'].every((campo) => esTexto(item[campo])) &&
      ['imagen', 'icono'].every((campo) => item[campo] === undefined || esTexto(item[campo]));
    return ['titulo', 'autor', 'categoriaId', 'resumen'].every((campo) => esTexto(item[campo])) &&
      Number.isInteger(item.anio) && Number.isFinite(item.precio) && item.precio >= 0 &&
      typeof item.destacado === 'boolean' && (item.portada === undefined || esTexto(item.portada));
  });
}

// Cada instancia tiene caché propia; diagnóstico y pruebas no alteran el catálogo público.
export function crearApiLibros({
  desarrollo = import.meta.env?.DEV ?? false,
  baseUrl = import.meta.env?.BASE_URL ?? './',
  fetcher = (...args) => fetch(...args),
  ahora = () => Date.now(),
  duracionCache = 5 * 60 * 1000,
  limiteMs = 10000,
} = {}) {
  const cache = new Map();
  const pendientes = new Map();
  const versiones = new Map(RECURSOS.map((recurso) => [recurso, 0]));
  const raiz = desarrollo ? '/api/' : baseUrl.replace(/\/?$/, '/') + 'mock/';

  function ruta(recurso, modo) {
    if (modo === '404' && !desarrollo) return raiz + '__recurso-inexistente__.json';
    const error = desarrollo && ['404', '500'].includes(modo) ? '?error=' + modo : '';
    return raiz + recurso + (desarrollo ? '' : '.json') + error;
  }

  function limpiarCache(recurso) {
    // Invalidar una petición en curso permite que Reintentar lance una consulta nueva.
    // Su respuesta anterior seguirá resolviendo para sus suscriptores, pero no repoblará caché.
    for (const nombre of recurso ? [recurso] : RECURSOS) {
      cache.delete(nombre);
      versiones.set(nombre, (versiones.get(nombre) || 0) + 1);
      for (const llave of pendientes.keys()) if (llave.startsWith(nombre + ':')) pendientes.delete(llave);
    }
  }

  async function consultarRecurso(recurso, { forzar = false, modo = 'normal' } = {}) {
    if (!RECURSOS.includes(recurso)) throw new ErrorPeticion('NO_ENCONTRADO', 'Recurso no configurado.', 404);
    if (!MODOS.includes(modo)) throw new ErrorPeticion('FORMATO', 'Modo de consulta no configurado.');
    const previo = cache.get(recurso);
    if (!forzar && modo === 'normal' && previo && ahora() - previo.fecha < duracionCache) {
      return { datos: previo.datos, fuente: 'caché', diagnostico: { ...previo.diagnostico, origen: 'Caché en memoria' } };
    }
    const llave = recurso + ':' + modo;
    if (pendientes.has(llave)) return pendientes.get(llave);
    const version = versiones.get(recurso);
    const simulado = ['red', 'json', 'formato', 'timeout'].includes(modo) || (!desarrollo && modo === '500');
    const diagnostico = {
      origen: simulado ? 'Simulación local' : desarrollo ? 'HTTP del mock de desarrollo' : 'HTTP de archivos estáticos',
      url: ruta(recurso, modo), estado: 0, simulado,
    };
    const promesa = (async () => {
      let transporte = fetcher;
      if (!desarrollo && modo === '500') transporte = async () => new Response('{}', { status: 500 });
      if (modo === 'red') transporte = async () => { throw new TypeError('Fallo de conexión simulado'); };
      if (modo === 'json') transporte = async () => new Response('no es JSON');
      if (modo === 'formato') transporte = async () => new Response('[{"id":"incompleto"}]');
      if (modo === 'timeout') transporte = (_url, { signal }) => new Promise((_resolve, reject) => {
        signal.addEventListener('abort', () => reject(new DOMException('Interrumpido', 'AbortError')), { once: true });
      });
      try {
        const datos = await obtenerJson(diagnostico.url, {
          fetcher: async (...args) => {
            const respuesta = await transporte(...args);
            diagnostico.estado = respuesta.status;
            return respuesta;
          },
          limiteMs: modo === 'timeout' ? Math.min(80, limiteMs) : limiteMs,
          validar: (lista) => validarRecurso(recurso, lista),
        });
        if (modo === 'normal' && versiones.get(recurso) === version) cache.set(recurso, { datos, fecha: ahora(), diagnostico });
        return { datos, fuente: simulado ? 'simulación local' : desarrollo ? 'red REST mock' : 'archivo estático HTTP', diagnostico };
      } catch (error) {
        error.diagnostico = { ...diagnostico, estado: error.estado || 0 };
        throw error;
      }
    })();
    pendientes.set(llave, promesa);
    try {
      return await promesa;
    } finally {
      if (pendientes.get(llave) === promesa) pendientes.delete(llave);
    }
  }
  return { consultarRecurso, limpiarCache };
}

const api = crearApiLibros();
export const consultarRecurso = api.consultarRecurso;
export const limpiarCache = api.limpiarCache;
