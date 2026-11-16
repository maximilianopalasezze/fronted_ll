export class ErrorPeticion extends Error {
  constructor(codigo, mensaje, estado = 0) {
    super(mensaje);
    this.name = 'ErrorPeticion';
    this.codigo = codigo;
    this.estado = estado;
  }
}

// El límite cubre también la lectura del cuerpo, incluso si el transporte ignora abort().
export async function obtenerJson(url, { fetcher = fetch, limiteMs = 10000, validar = Array.isArray } = {}) {
  const controller = new AbortController();
  let vencido = false;
  let estado = 0;
  let temporizador;
  const expiracion = new Promise((_resolve, reject) => {
    temporizador = setTimeout(() => {
      vencido = true;
      reject(new ErrorPeticion('TIMEOUT', 'La carga está tardando más de lo esperado.', estado));
      controller.abort();
    }, limiteMs);
  });
  const peticion = (async () => {
    const respuesta = await fetcher(url, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });
    estado = respuesta.status;
    if (!respuesta.ok) {
      if (estado === 404) throw new ErrorPeticion('NO_ENCONTRADO', 'No encontramos la información solicitada.', estado);
      if (estado >= 500) throw new ErrorPeticion('SERVIDOR', 'Tenemos dificultades para cargar la información.', estado);
      throw new ErrorPeticion('HTTP', 'No fue posible completar la consulta.', estado);
    }
    let datos;
    try {
      datos = await respuesta.json();
    } catch (error) {
      // La interrupción del cuerpo es distinta de un documento JSON mal formado.
      if (error instanceof TypeError || error?.name === 'AbortError') throw error;
      throw new ErrorPeticion('JSON', 'No pudimos interpretar la información recibida.', estado);
    }
    if (!validar(datos)) throw new ErrorPeticion('FORMATO', 'La información recibida está incompleta.', estado);
    return datos;
  })();
  try {
    return await Promise.race([peticion, expiracion]);
  } catch (error) {
    if (vencido) throw new ErrorPeticion('TIMEOUT', 'La carga está tardando más de lo esperado.', estado);
    if (error instanceof ErrorPeticion) throw error;
    throw new ErrorPeticion('RED', 'No pudimos establecer conexión.', estado);
  } finally {
    clearTimeout(temporizador);
  }
}

export function describirError(error) {
  switch (error?.codigo) {
    case 'NO_ENCONTRADO':
      return { titulo: 'No encontramos la información solicitada', detalle: 'Vuelve al catálogo o intenta cargarla nuevamente.' };
    case 'SERVIDOR':
      return { titulo: 'Tenemos dificultades con el servidor', detalle: 'No pudimos cargar la información. Inténtalo nuevamente en unos momentos.' };
    case 'TIMEOUT':
      return { titulo: 'La carga está tardando más de lo esperado', detalle: 'Revisa tu conexión y vuelve a intentarlo.' };
    case 'RED':
      return { titulo: 'No pudimos establecer conexión', detalle: 'Revisa internet y vuelve a intentarlo.' };
    case 'JSON':
    case 'FORMATO':
      return { titulo: 'No pudimos mostrar la información', detalle: 'Recibimos información incompleta. Intenta cargarla nuevamente.' };
    default:
      return { titulo: 'No fue posible cargar la información', detalle: 'Puedes reintentar o volver al inicio.' };
  }
}
