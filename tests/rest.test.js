import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { resolverMock } from '../server/mockApi.js';
import { ErrorPeticion, describirError, obtenerJson } from '../src/services/http.js';
import { filtrarLibros } from '../src/utils/catalogo.js';

const datos = JSON.parse(readFileSync(new URL('../mock/db.json', import.meta.url), 'utf8'));
const resolver = (ruta, query = '', metodo = 'GET') => resolverMock(metodo, ruta, new URLSearchParams(query), datos);

test('REST GET /api/categorias devuelve una lista de categorías', () => {
  const resultado = resolver('/api/categorias');
  assert.equal(resultado.estado, 200);
  assert.ok(resultado.cuerpo.length >= 2);
  assert.ok(resultado.cuerpo.some((c) => c.nombre === 'Ciencia ficción'));
});
test('REST GET /api/libros devuelve libros y permite filtrar por categoría', () => {
  assert.equal(resolver('/api/libros').cuerpo.length, datos.libros.length);
  const resultado = resolver('/api/libros', 'categoria=ficcion');
  assert.equal(resultado.estado, 200);
  assert.ok(resultado.cuerpo.every((libro) => libro.categoriaId === 'ficcion'));
});
test('REST devuelve un libro por ID y 404 para recursos desconocidos', () => {
  assert.equal(resolver('/api/libros/L001').cuerpo.id, 'L001');
  assert.equal(resolver('/api/libros/NO-EXISTE').estado, 404);
  assert.equal(resolver('/api/desconocido').estado, 404);
  assert.equal(resolver('/api/libros', '', 'POST').estado, 405);
});
test('mock genera respuestas 404 y 500 verificables', () => {
  assert.equal(resolver('/api/categorias', 'error=404').estado, 404);
  assert.equal(resolver('/api/categorias', 'error=500').estado, 500);
});
test('GET maneja respuesta exitosa y valida JSON', async () => {
  const resultado = await obtenerJson('/api/categorias', { fetcher: async () => new Response('[{"id":"ficcion"}]', { status: 200 }) });
  assert.deepEqual(resultado, [{ id: 'ficcion' }]);
});
test('GET distingue 404 y 500 para mostrar mensajes específicos', async () => {
  await assert.rejects(obtenerJson('/api', { fetcher: async () => new Response('{}', { status: 404 }) }), (error) => error instanceof ErrorPeticion && error.codigo === 'NO_ENCONTRADO');
  await assert.rejects(obtenerJson('/api', { fetcher: async () => new Response('{}', { status: 500 }) }), (error) => error instanceof ErrorPeticion && error.codigo === 'SERVIDOR');
  assert.match(describirError(new ErrorPeticion('SERVIDOR', 'Error')).titulo, /servidor/i);
});
test('GET gestiona JSON inválido y formatos no esperados', async () => {
  await assert.rejects(obtenerJson('/api', { fetcher: async () => new Response('no-json') }), (e) => e.codigo === 'JSON');
  await assert.rejects(obtenerJson('/api', { fetcher: async () => new Response('{"items":[]}') }), (e) => e.codigo === 'FORMATO');
});
test('GET detecta fallo de red y evita errores genéricos', async () => {
  await assert.rejects(obtenerJson('/api', { fetcher: async () => { throw new TypeError('offline'); } }), (e) => e.codigo === 'RED');
});
test('GET detecta tiempo de espera agotado', async () => {
  await assert.rejects(obtenerJson('/api', { limiteMs: 5, fetcher: (_url, opciones) => new Promise((_resolve, reject) => {
    opciones.signal.addEventListener('abort', () => reject(new Error('abort')));
  }) }), (e) => e.codigo === 'TIMEOUT');
});
test('filtro de catálogo respeta categorías, búsqueda y tildes', () => {
  const resultado = filtrarLibros(datos.libros, { texto: 'FUNDACION', categoria: 'ciencia-ficcion' });
  assert.deepEqual(resultado.map((libro) => libro.id), ['L004']);
  assert.equal(datos.libros.length, 16);
});
test('archivos para GitHub Pages coinciden con el mock REST', () => {
  for (const recurso of ['categorias', 'libros']) {
    const estaticos = JSON.parse(readFileSync(new URL('../public/mock/' + recurso + '.json', import.meta.url), 'utf8'));
    assert.deepEqual(estaticos, datos[recurso]);
  }
});
