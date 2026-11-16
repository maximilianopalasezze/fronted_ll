export class ErrorPeticion extends Error {
  constructor(codigo, mensaje, estado = 0) {
    super(mensaje);
    this.name = 'ErrorPeticion';
    this.codigo = codigo;
    this.estado = estado;
  }
}

// Cliente GET reutilizable: comprueba HTTP, formato JSON, estructura y tiempo de espera.
export async function obtenerJson(url, { fetcher = fetch, limiteMs = 10000 } = {}) {
  const controller = new AbortController();
  let vencido = false;
  const temporizador = setTimeout(() => { vencido = true; controller.abort(); }, limiteMs);
  try {
    const respuesta = await fetcher(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    if (!respuesta.ok) {
      if (respuesta.status === 404) throw new ErrorPeticion('NO_ENCONTRADO', 'El recurso solicitado no fue encontrado.', 404);
      if (respuesta.status >= 500) throw new ErrorPeticion('SERVIDOR', 'El servidor no pudo completar la petición.', respuesta.status);
      throw new ErrorPeticion('HTTP', 'La petición devolvió un estado inesperado.', respuesta.status);
    }
    let datos;
    try {
      datos = await respuesta.json();
    } catch {
      throw new ErrorPeticion('JSON', 'El servidor devolvió datos que no son JSON válido.');
    }
    if (!Array.isArray(datos)) throw new ErrorPeticion('FORMATO', 'La respuesta no contiene una lista de elementos.');
    return datos;
  } catch (error) {
    if (error instanceof ErrorPeticion) throw error;
    if (vencido) throw new ErrorPeticion('TIMEOUT', 'El servidor tardó demasiado en responder.');
    throw new ErrorPeticion('RED', 'No fue posible establecer conexión con el servicio.');
  } finally {
    clearTimeout(temporizador);
  }
}

export function describirError(error) {
  const codigo = error?.codigo;
  switch (codigo) {
    case 'NO_ENCONTRADO':
      return { titulo: 'No encontramos ese recurso', detalle: 'Comprueba la dirección o vuelve al catálogo principal.' };
    case 'SERVIDOR':
      return { titulo: 'El servidor presenta problemas', detalle: 'Puedes reintentar la consulta en unos momentos.' };
    case 'TIMEOUT':
      return { titulo: 'La consulta tardó demasiado', detalle: 'Revisa tu conexión y vuelve a intentarlo.' };
    case 'RED':
      return { titulo: 'Sin conexión con el servicio', detalle: 'Comprueba internet o utiliza otra sección mientras se restablece.' };
    case 'JSON':
    case 'FORMATO':
      return { titulo: 'Recibimos datos incorrectos', detalle: 'La respuesta no tiene el formato esperado. Intenta recargar los datos.' };
    default:
      return { titulo: 'No fue posible cargar la información', detalle: 'Puedes reintentar o volver al inicio.' };
  }
}
