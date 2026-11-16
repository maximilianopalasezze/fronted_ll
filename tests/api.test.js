import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { crearApiLibros, validarRecurso } from '../src/services/librosApi.js';
import { filtrarLibros } from '../src/utils/catalogo.js';

const datos = JSON.parse(readFileSync(new URL('../mock/db.json', import.meta.url), 'utf8'));
const respuesta = (lista) => new Response(JSON.stringify(lista));
const diferida = () => {
  let resolve;
  const promise = new Promise((completar) => { resolve = completar; });
  return { promise, resolve };
};

test('servicio usa endpoints HTTP del mock en desarrollo para ambos recursos', async () => {
  const urls = [];
  const api = crearApiLibros({ desarrollo: true, fetcher: async (url) => {
    urls.push(url);
    return respuesta(url.includes('categorias') ? datos.categorias : datos.libros);
  } });
  assert.deepEqual((await api.consultarRecurso('categorias')).datos, datos.categorias);
  assert.deepEqual((await api.consultarRecurso('libros')).datos, datos.libros);
  assert.deepEqual(urls, ['/api/categorias', '/api/libros']);
});

test('servicio estático respeta el subdirectorio de publicación y declara HTTP de archivos', async () => {
  const urls = [];
  const api = crearApiLibros({ desarrollo: false, baseUrl: '/semana-4/', fetcher: async (url) => {
    urls.push(url);
    return respuesta(datos.categorias);
  } });
  const resultado = await api.consultarRecurso('categorias');
  assert.deepEqual(urls, ['/semana-4/mock/categorias.json']);
  assert.equal(resultado.fuente, 'archivo estático HTTP');
  assert.deepEqual(resultado.diagnostico, {
    origen: 'HTTP de archivos estáticos', url: urls[0], estado: 200, simulado: false,
  });
});

test('esquemas rechazan elementos incompletos, IDs repetidos y precios inválidos', () => {
  assert.equal(validarRecurso('categorias', datos.categorias), true);
  assert.equal(validarRecurso('libros', datos.libros), true);
  assert.equal(validarRecurso('libros', []), true);
  for (const lista of [[null], [{}], [{ ...datos.libros[0], precio: '14990' }],
    [{ ...datos.libros[0], titulo: '' }], [{ ...datos.libros[0], destacado: 'sí' }],
    [datos.libros[0], datos.libros[0]]]) assert.equal(validarRecurso('libros', lista), false);
  assert.equal(validarRecurso('categorias', [{ id: 'ficcion', nombre: 'Ficción' }]), false);
  assert.equal(validarRecurso('desconocido', []), false);
});

test('servicio no entrega a React una lista con objetos inesperados y permite recuperarse', async () => {
  let llamadas = 0;
  const api = crearApiLibros({ fetcher: async () => respuesta(++llamadas === 1 ? [{ id: 'incompleto' }] : datos.libros) });
  await assert.rejects(api.consultarRecurso('libros'), (error) => error.codigo === 'FORMATO');
  assert.deepEqual((await api.consultarRecurso('libros')).datos, datos.libros);
  assert.equal(llamadas, 2);
});

test('caché se reutiliza durante cinco minutos y expira exactamente al límite', async () => {
  let tiempo = 1000;
  let llamadas = 0;
  const api = crearApiLibros({ ahora: () => tiempo, fetcher: async () => { llamadas++; return respuesta(datos.libros); } });
  await api.consultarRecurso('libros');
  tiempo += 299999;
  assert.equal((await api.consultarRecurso('libros')).fuente, 'caché');
  assert.equal(llamadas, 1);
  tiempo++;
  assert.notEqual((await api.consultarRecurso('libros')).fuente, 'caché');
  assert.equal(llamadas, 2);
});

test('consultas simultáneas del mismo recurso comparten una sola petición', async () => {
  const carga = diferida();
  let llamadas = 0;
  const api = crearApiLibros({ fetcher: () => { llamadas++; return carga.promise; } });
  const primera = api.consultarRecurso('libros');
  const segunda = api.consultarRecurso('libros');
  const tercera = api.consultarRecurso('libros', { forzar: true });
  assert.equal(llamadas, 1);
  carga.resolve(respuesta(datos.libros));
  const resultados = await Promise.all([primera, segunda, tercera]);
  assert.strictEqual(resultados[0].datos, resultados[1].datos);
});

test('fallos no se almacenan en caché y un reintento consulta nuevamente', async () => {
  let llamadas = 0;
  const api = crearApiLibros({ fetcher: async () => {
    if (++llamadas === 1) throw new TypeError('Sin conexión');
    return respuesta(datos.categorias);
  } });
  await assert.rejects(api.consultarRecurso('categorias'), (error) => error.codigo === 'RED');
  api.limpiarCache('categorias');
  const recuperado = await api.consultarRecurso('categorias', { forzar: true });
  assert.equal(recuperado.datos.length, 6);
  assert.equal(llamadas, 2);
  await api.consultarRecurso('categorias');
  assert.equal(llamadas, 2);
});

test('actualización forzada omite caché y la nueva respuesta se reutiliza', async () => {
  let llamadas = 0;
  const api = crearApiLibros({ fetcher: async () => { llamadas++; return respuesta(datos.libros); } });
  await api.consultarRecurso('libros');
  await api.consultarRecurso('libros', { forzar: true });
  await api.consultarRecurso('libros');
  assert.equal(llamadas, 2);
});

test('limpiar una caché no borra el otro recurso', async () => {
  let llamadas = 0;
  const api = crearApiLibros({ fetcher: async (url) => {
    llamadas++; return respuesta(url.includes('categorias') ? datos.categorias : datos.libros);
  } });
  await api.consultarRecurso('categorias');
  await api.consultarRecurso('libros');
  api.limpiarCache('libros');
  assert.equal((await api.consultarRecurso('categorias')).fuente, 'caché');
  await api.consultarRecurso('libros');
  assert.equal(llamadas, 3);
  api.limpiarCache();
  await api.consultarRecurso('categorias');
  assert.equal(llamadas, 4);
});

test('respuesta anterior a invalidación no repuebla caché ni elimina la petición nueva', async () => {
  const anterior = diferida();
  const nueva = diferida();
  let llamadas = 0;
  const api = crearApiLibros({ fetcher: () => (++llamadas === 1 ? anterior.promise : nueva.promise) });
  const vieja = api.consultarRecurso('categorias');
  api.limpiarCache('categorias');
  const actual = api.consultarRecurso('categorias', { forzar: true });
  anterior.resolve(respuesta([{ ...datos.categorias[0], nombre: 'Antigua' }]));
  await vieja;
  const compartida = api.consultarRecurso('categorias');
  assert.equal(llamadas, 2);
  nueva.resolve(respuesta(datos.categorias));
  await Promise.all([actual, compartida]);
  assert.deepEqual((await api.consultarRecurso('categorias')).datos, datos.categorias);
});

test('respuestas fuera de orden conservan en caché la generación vigente', async () => {
  const anterior = diferida();
  let llamadas = 0;
  const api = crearApiLibros({ fetcher: async () => ++llamadas === 1 ? anterior.promise : respuesta(datos.categorias) });
  const vieja = api.consultarRecurso('categorias');
  api.limpiarCache();
  await api.consultarRecurso('categorias');
  anterior.resolve(respuesta([{ ...datos.categorias[0], nombre: 'Antigua' }]));
  await vieja;
  assert.deepEqual((await api.consultarRecurso('categorias')).datos, datos.categorias);
});

test('buscar, filtrar y obtener detalle desde datos descargados no genera HTTP adicional', async () => {
  let llamadas = 0;
  const api = crearApiLibros({ fetcher: async () => { llamadas++; return respuesta(datos.libros); } });
  const { datos: libros } = await api.consultarRecurso('libros');
  assert.equal(filtrarLibros(libros, { texto: 'FUNDACION' })[0].id, 'L004');
  assert.equal(filtrarLibros(libros, { categoria: 'ficcion' }).length, 3);
  assert.equal(filtrarLibros(libros, { texto: 'sin resultados xyz' }).length, 0);
  assert.equal(libros.find((libro) => libro.id === 'L001').titulo, 'Cien años de soledad');
  await api.consultarRecurso('libros');
  assert.equal(llamadas, 1);
});

test('diagnóstico independiente no altera la caché del catálogo', async () => {
  let llamadas = 0;
  const fetcher = async () => { llamadas++; return respuesta(datos.libros); };
  const publico = crearApiLibros({ fetcher });
  const diagnostico = crearApiLibros({ fetcher });
  await publico.consultarRecurso('libros');
  await diagnostico.consultarRecurso('libros');
  diagnostico.limpiarCache();
  await assert.rejects(diagnostico.consultarRecurso('libros', { modo: 'red' }));
  assert.equal((await publico.consultarRecurso('libros')).fuente, 'caché');
  assert.equal(llamadas, 2);
});

test('diagnóstico de desarrollo obtiene HTTP 404 y 500 reales del mock', async () => {
  const urls = [];
  const api = crearApiLibros({ desarrollo: true, fetcher: async (url) => {
    urls.push(url); return new Response('{}', { status: Number(new URL(url, 'http://localhost').searchParams.get('error')) });
  } });
  for (const modo of ['404', '500']) {
    await assert.rejects(api.consultarRecurso('libros', { modo }),
      (error) => error.estado === Number(modo) && error.diagnostico.simulado === false);
  }
  assert.deepEqual(urls, ['/api/libros?error=404', '/api/libros?error=500']);
});

test('diagnóstico estático distingue 404 HTTP de 500 simulado en memoria', async () => {
  let llamadas = 0;
  const api = crearApiLibros({ desarrollo: false, fetcher: async (url) => {
    llamadas++; assert.match(url, /__recurso-inexistente__\.json$/); return new Response('{}', { status: 404 });
  } });
  await assert.rejects(api.consultarRecurso('libros', { modo: '404' }),
    (error) => error.estado === 404 && error.diagnostico.simulado === false);
  await assert.rejects(api.consultarRecurso('libros', { modo: '500' }),
    (error) => error.estado === 500 && error.diagnostico.simulado === true);
  assert.equal(llamadas, 1);
});

test('diagnóstico simula red, JSON, formato y timeout sin peticiones ni cambios públicos', async () => {
  let llamadas = 0;
  const api = crearApiLibros({ fetcher: async () => { llamadas++; return respuesta(datos.libros); }, limiteMs: 5 });
  for (const [modo, codigo] of [['red', 'RED'], ['json', 'JSON'], ['formato', 'FORMATO'], ['timeout', 'TIMEOUT']]) {
    await assert.rejects(api.consultarRecurso('libros', { modo }),
      (error) => error.codigo === codigo && error.diagnostico.simulado === true);
  }
  assert.equal(llamadas, 0);
  assert.equal((await api.consultarRecurso('libros')).datos.length, 16);
});

test('recurso o modo desconocido se rechaza sin enviar solicitudes', async () => {
  const api = crearApiLibros({ fetcher: async () => assert.fail('No debe consultar') });
  await assert.rejects(api.consultarRecurso('usuarios'), (error) => error.codigo === 'NO_ENCONTRADO');
  await assert.rejects(api.consultarRecurso('libros', { modo: 'desconocido' }), (error) => error.codigo === 'FORMATO');
});
