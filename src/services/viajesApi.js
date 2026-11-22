export class ErrorViajes extends Error {
  constructor(mensaje, estado = 0) { super(mensaje); this.name = 'ErrorViajes'; this.estado = estado; }
}

export const CONSULTA_OPCIONES = `query ObtenerOpcionesDestino($destinoId: ID!) {
  opcionesDestino(destinoId: $destinoId) {
    destinoId
    vuelos { id aerolinea origen salida regreso precio disponibles cupos }
    hoteles { id nombre estrellas precioNoche disponibles habitaciones fechaEntrada fechaSalida }
  }
}`;

const vencimiento = 5 * 60 * 1000;
const cache = new Map();
const pendientes = new Map();
const generaciones = new Map();

function invalidar(clave) {
  cache.delete(clave);
  pendientes.delete(clave);
  generaciones.set(clave, (generaciones.get(clave) || 0) + 1);
}

async function conCache(clave, operacion, forzar = false) {
  if (forzar) invalidar(clave);
  const anterior = cache.get(clave);
  if (anterior && Date.now() - anterior.fecha < vencimiento) return anterior.datos;
  if (pendientes.has(clave)) return pendientes.get(clave);
  const generacion = generaciones.get(clave) || 0;
  const promesa = Promise.resolve().then(operacion).then((datos) => {
    if ((generaciones.get(clave) || 0) === generacion) cache.set(clave, { fecha:Date.now(), datos });
    return datos;
  }).finally(() => {
    if (pendientes.get(clave) === promesa) pendientes.delete(clave);
  });
  pendientes.set(clave, promesa);
  return promesa;
}
async function solicitar(url, opciones = {}) {
  const controlador = new AbortController();
  const timeout = setTimeout(() => controlador.abort(), 10000);
  try {
    const respuesta = await fetch(url, { ...opciones, signal:controlador.signal });
    if (!respuesta.ok) throw new ErrorViajes('No pudimos obtener la información. Intenta nuevamente.', respuesta.status);
    try { return await respuesta.json(); }
    catch { throw new ErrorViajes('La respuesta recibida no es válida.'); }
  } catch (e) {
    if (e instanceof ErrorViajes) throw e;
    throw new ErrorViajes(controlador.signal.aborted ? 'La consulta tardó demasiado. Vuelve a intentarlo.' : 'No se pudo conectar con el servicio.');
  } finally { clearTimeout(timeout); }
}
export function obtenerDestinos({ forzar = false } = {}) {
  return conCache('destinos', async () => {
    const datos = await solicitar(import.meta.env.BASE_URL + 'api/destinos');
    if (!Array.isArray(datos) || !datos.every(d=>d?.id && d?.pais && d?.nombre && Array.isArray(d?.actividades)))
      throw new ErrorViajes('No se pudo validar la lista de destinos.');
    return datos;
  }, forzar);
}
export function obtenerOpciones(destinoId, { forzar = false } = {}) {
  if (!destinoId) return Promise.reject(new ErrorViajes('Debes elegir un destino.'));
  return conCache('opciones:' + destinoId, async () => {
    const respuesta = await solicitar(import.meta.env.BASE_URL + 'graphql', {
      method:'POST', headers:{ 'Content-Type':'application/json', 'Accept':'application/json' },
      body:JSON.stringify({ operationName:'ObtenerOpcionesDestino', query:CONSULTA_OPCIONES, variables:{ destinoId } })
    });
    if (respuesta.errors?.length) throw new ErrorViajes(respuesta.errors.map(e=>e.message).join(' '));
    const resultado = respuesta.data?.opcionesDestino;
    if (!resultado || !Array.isArray(resultado.vuelos) || !Array.isArray(resultado.hoteles))
      throw new ErrorViajes('No se recibieron los vuelos y hoteles esperados.');
    return resultado;
  }, forzar);
}
