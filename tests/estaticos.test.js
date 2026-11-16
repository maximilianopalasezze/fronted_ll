import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';
import { resolverMock } from '../server/mockApi.js';

const datos = JSON.parse(readFileSync(new URL('../mock/db.json', import.meta.url)));

test('cada portada e ilustración del catálogo corresponde a un archivo público', () => {
  const recursos = [...datos.libros.map((libro) => libro.portada), ...datos.categorias.map((categoria) => categoria.imagen), 'images/marca/logo-horizonte.png'];
  for (const recurso of recursos) {
    assert.equal(typeof recurso, 'string');
    assert.ok(!recurso.startsWith('/') && !recurso.includes('..'), recurso);
    assert.ok(existsSync(new URL('../public/' + recurso, import.meta.url)), recurso);
  }
});

test('el mock rechaza un identificador URI malformado con 400 en lugar de romper el servidor', () => {
  assert.equal(resolverMock('GET', '/api/libros/%ZZ', new URLSearchParams(), datos).estado, 400);
});

test('categorías y libros tienen IDs únicos y referencias consistentes', () => {
  for (const recurso of ['categorias', 'libros']) {
    assert.equal(new Set(datos[recurso].map((item) => item.id)).size, datos[recurso].length);
  }
  assert.ok(datos.libros.every((libro) => datos.categorias.some((categoria) => categoria.id === libro.categoriaId)));
});
