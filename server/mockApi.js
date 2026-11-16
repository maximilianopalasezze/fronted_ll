// Servidor REST mock para la ejecución local con Vite.
// Las respuestas se construyen desde mock/db.json (fuente única de datos).
export function resolverMock(method, ruta, parametros, datos) {
  if (method !== 'GET') {
    return { estado: 405, cuerpo: { mensaje: 'Método no permitido en este mock de solo lectura.' } };
  }
  const codigo = parametros.get('error');
  if (codigo === '404') return { estado: 404, cuerpo: { mensaje: 'Recurso de prueba no encontrado.' } };
  if (codigo === '500') return { estado: 500, cuerpo: { mensaje: 'Error simulado del servidor REST.' } };
  if (ruta === '/api/categorias') {
    return { estado: 200, cuerpo: datos.categorias };
  }
  if (ruta === '/api/libros') {
    const categoria = parametros.get('categoria');
    const libros = categoria ? datos.libros.filter((l) => l.categoriaId === categoria) : datos.libros;
    return { estado: 200, cuerpo: libros };
  }
  if (ruta.startsWith('/api/libros/')) {
    let id;
    try {
      id = decodeURIComponent(ruta.slice('/api/libros/'.length));
    } catch {
      return { estado: 400, cuerpo: { mensaje: 'Identificador de libro inválido.' } };
    }
    const libro = datos.libros.find((l) => l.id === id);
    return libro
      ? { estado: 200, cuerpo: libro }
      : { estado: 404, cuerpo: { mensaje: 'El libro solicitado no existe.' } };
  }
  return { estado: 404, cuerpo: { mensaje: 'Ruta REST desconocida.' } };
}
