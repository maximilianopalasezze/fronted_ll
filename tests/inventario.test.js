import test from 'node:test';
import assert from 'node:assert/strict';
import { ACCIONES, inventarioReducer } from '../src/context/inventarioReducer.js';
import { validarArticulo, obtenerEstadoStock } from '../src/utils/inventario.js';

const producto = { id: 'P-TEST', nombre: 'Arroz', marca: 'Ejemplo', tipo: 'Alimentos', stock: 12, precio: 1500 };

test('el reducer agrega un producto al estado global', () => {
  const resultado = inventarioReducer([], { type: ACCIONES.AGREGAR, payload: producto });
  assert.equal(resultado.length, 1);
  assert.equal(resultado[0].marca, 'Ejemplo');
});

test('el reducer elimina solo el artículo solicitado', () => {
  const resultado = inventarioReducer([producto, { ...producto, id: 'SEGUNDO' }], { type: ACCIONES.ELIMINAR, payload: 'P-TEST' });
  assert.equal(resultado.length, 1);
  assert.equal(resultado[0].id, 'SEGUNDO');
});

test('el formulario exige nombre, marca, tipo, cantidad y precio', () => {
  const errores = validarArticulo({ nombre: '', marca: '  ', tipo: '', stock: '', precio: '' });
  assert.deepEqual(Object.keys(errores).sort(), ['marca', 'nombre', 'precio', 'stock', 'tipo']);
});

test('rechaza números negativos o fraccionarios en el stock', () => {
  assert.ok(validarArticulo({ ...producto, stock: -1 }).stock);
  assert.ok(validarArticulo({ ...producto, stock: 1.5 }).stock);
  assert.equal(validarArticulo({ ...producto, stock: 0 }).stock, undefined);
});

test('reconoce niveles de inventario agotado, bajo y disponible', () => {
  assert.equal(obtenerEstadoStock(0).etiqueta, 'Agotado');
  assert.equal(obtenerEstadoStock(10).etiqueta, 'Stock bajo');
  assert.equal(obtenerEstadoStock(11).etiqueta, 'Disponible');
});
