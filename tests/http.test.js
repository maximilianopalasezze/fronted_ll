import test from 'node:test';
import assert from 'node:assert/strict';
import { obtenerJson, describirError, ErrorPeticion } from '../src/services/http.js';

test('GET envía Accept JSON, método de lectura y señal de cancelación', async () => {
  let opciones;
  const resultado = await obtenerJson('/lista', { fetcher: async (_url, config) => {
    opciones = config;
    return new Response('[]');
  } });
  assert.deepEqual(resultado, []);
  assert.equal(opciones.method, 'GET');
  assert.equal(opciones.headers.Accept, 'application/json');
  assert.ok(opciones.signal instanceof AbortSignal);
  assert.equal(opciones.signal.aborted, false);
});

test('GET conserva el estado HTTP y distingue errores 400, 404 y 503', async () => {
  for (const [estado, codigo] of [[400, 'HTTP'], [404, 'NO_ENCONTRADO'], [503, 'SERVIDOR']]) {
    await assert.rejects(obtenerJson('/lista', { fetcher: async () => new Response('{}', { status: estado }) }),
      (error) => error.codigo === codigo && error.estado === estado);
  }
});

test('GET identifica JSON inválido con HTTP 200 y acepta un validador de estructura', async () => {
  await assert.rejects(obtenerJson('/lista', { fetcher: async () => new Response('roto') }),
    (error) => error.codigo === 'JSON' && error.estado === 200);
  const dato = await obtenerJson('/detalle', {
    fetcher: async () => new Response('{"id":"L001"}'), validar: (item) => item.id === 'L001',
  });
  assert.equal(dato.id, 'L001');
});

test('GET rechaza valores JSON inesperados en una consulta de listas', async () => {
  for (const contenido of ['null', '{}', '"lista"', '42']) {
    await assert.rejects(obtenerJson('/lista', { fetcher: async () => new Response(contenido) }),
      (error) => error.codigo === 'FORMATO');
  }
});

test('timeout termina aunque fetch ignore AbortSignal', async () => {
  let signal;
  await assert.rejects(obtenerJson('/lento', { limiteMs: 5, fetcher: (_url, opciones) => {
    signal = opciones.signal;
    return new Promise(() => {});
  } }), (error) => error.codigo === 'TIMEOUT');
  assert.equal(signal.aborted, true);
});

test('timeout incluye la lectura del cuerpo tras recibir HTTP 200', async () => {
  await assert.rejects(obtenerJson('/cuerpo-lento', { limiteMs: 5, fetcher: async () => ({
    ok: true, status: 200, json: () => new Promise(() => {}),
  }) }), (error) => error.codigo === 'TIMEOUT' && error.estado === 200);
});

test('timeout no se confunde con JSON inválido cuando aborta la lectura', async () => {
  await assert.rejects(obtenerJson('/cuerpo-abortado', { limiteMs: 5, fetcher: async (_url, { signal }) => ({
    ok: true, status: 200, json: () => new Promise((_resolve, reject) => {
      signal.addEventListener('abort', () => reject(new DOMException('Abortado', 'AbortError')));
    }),
  }) }), (error) => error.codigo === 'TIMEOUT');
});

test('fallo de conexión mientras se descarga el cuerpo se informa como red', async () => {
  await assert.rejects(obtenerJson('/cuerpo-roto', { fetcher: async () => ({
    ok: true, status: 200, json: async () => { throw new TypeError('Conexión interrumpida'); },
  }) }), (error) => error.codigo === 'RED');
});

test('mensajes públicos ofrecen alternativas sin filtrar la causa técnica', () => {
  for (const codigo of ['NO_ENCONTRADO', 'SERVIDOR', 'RED', 'TIMEOUT', 'JSON', 'FORMATO', 'HTTP']) {
    const ayuda = describirError(new ErrorPeticion(codigo, 'secreto técnico'));
    assert.ok(ayuda.titulo && ayuda.detalle);
    assert.doesNotMatch(ayuda.titulo + ayuda.detalle, /secreto técnico/);
  }
});
