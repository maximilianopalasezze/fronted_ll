import test from 'node:test';
import assert from 'node:assert/strict';
import { ACCIONES, inventarioReducer } from '../src/context/inventarioReducer.js';
import { fechaLocal, filtrarArticulos, obtenerEstadoStock, validarArticulo } from '../src/utils/inventario.js';

const producto = { id: 'P-1', nombre: 'Bebida cola 1,5 L', marca: 'Coca-Cola', tipo: 'Bebidas', stock: 18, precio: 1990, fechaIngreso: '2026-11-08' };
const otro = { id: 'P-2', nombre: 'Arroz', marca: 'Tucapel', tipo: 'Alimentos', stock: 5, precio: 1690 };
const inicial = () => ({ articulos: [producto, otro].map((a) => ({ ...a })), carrito: [] });
const aplicar = (estado, type, payload) => inventarioReducer(estado, { type, payload });

test('registra un producto nuevo sin alterar los existentes', () => {
  const base = inicial();
  const nuevo = { ...producto, id: 'P-3', nombre: 'Leche' };
  const resultado = aplicar(base, ACCIONES.AGREGAR, nuevo);
  assert.equal(resultado.articulos.length, 3);
  assert.equal(base.articulos.length, 2);
});

test('duplicados normalizados suman stock y adoptan nuevo precio conservando fecha e ID', () => {
  const resultado = aplicar(inicial(), ACCIONES.AGREGAR, { ...producto, id: 'nueva-id', nombre: ' bebida  COLA 1,5 l ', marca: 'COCA-COLA', stock: 12, precio: 2290 });
  assert.equal(resultado.articulos.length, 2);
  assert.equal(resultado.articulos[0].stock, 30);
  assert.equal(resultado.articulos[0].precio, 2290);
  assert.equal(resultado.articulos[0].id, 'P-1');
  assert.equal(resultado.articulos[0].fechaIngreso, '2026-11-08');
});

test('filtro por categoría y búsqueda no modifica estado original', () => {
  const base = inicial();
  assert.deepEqual(filtrarArticulos(base.articulos, 'Bebidas').map((a) => a.id), ['P-1']);
  assert.deepEqual(filtrarArticulos(base.articulos, 'Todas', 'tuca').map((a) => a.id), ['P-2']);
  assert.equal(base.articulos.length, 2);
});

test('agregar al carrito descuenta stock y aumenta unidades reservadas', () => {
  const base = inicial();
  const resultado = aplicar(base, ACCIONES.AGREGAR_CARRITO, { id: 'P-1', cantidad: 3 });
  assert.equal(resultado.articulos[0].stock, 15);
  assert.deepEqual(resultado.carrito, [{ id: 'P-1', cantidad: 3 }]);
  assert.equal(base.articulos[0].stock, 18);
});

test('agregar otro lote al carrito consolida la línea', () => {
  const a = aplicar(inicial(), ACCIONES.AGREGAR_CARRITO, { id: 'P-1', cantidad: 2 });
  const b = aplicar(a, ACCIONES.AGREGAR_CARRITO, { id: 'P-1', cantidad: 3 });
  assert.equal(b.carrito.length, 1);
  assert.equal(b.carrito[0].cantidad, 5);
  assert.equal(b.articulos[0].stock, 13);
});

test('impide añadir más que el disponible y no genera cambios parciales', () => {
  const base = inicial();
  for (const cantidad of [19, 0, -2, 1.5]) {
    assert.strictEqual(aplicar(base, ACCIONES.AGREGAR_CARRITO, { id: 'P-1', cantidad }), base);
  }
});

test('aumentar y disminuir desde carrito mantiene stock consistente', () => {
  const a = aplicar(inicial(), ACCIONES.AGREGAR_CARRITO, { id: 'P-1', cantidad: 2 });
  const b = aplicar(a, ACCIONES.CAMBIAR_CANTIDAD_CARRITO, { id: 'P-1', cambio: 1 });
  assert.equal(b.carrito[0].cantidad, 3);
  assert.equal(b.articulos[0].stock, 15);
  const c = aplicar(b, ACCIONES.CAMBIAR_CANTIDAD_CARRITO, { id: 'P-1', cambio: -1 });
  assert.equal(c.carrito[0].cantidad, 2);
  assert.equal(c.articulos[0].stock, 16);
});

test('disminuir hasta 0 quita línea y devuelve sus unidades', () => {
  const a = aplicar(inicial(), ACCIONES.AGREGAR_CARRITO, { id: 'P-1', cantidad: 1 });
  const b = aplicar(a, ACCIONES.CAMBIAR_CANTIDAD_CARRITO, { id: 'P-1', cambio: -1 });
  assert.deepEqual(b.carrito, []);
  assert.equal(b.articulos[0].stock, 18);
});

test('quitar producto del carrito devuelve todas sus unidades', () => {
  const a = aplicar(inicial(), ACCIONES.AGREGAR_CARRITO, { id: 'P-1', cantidad: 10 });
  const b = aplicar(a, ACCIONES.QUITAR_CARRITO, 'P-1');
  assert.equal(b.articulos[0].stock, 18);
  assert.equal(b.carrito.length, 0);
});

test('no permite aumentar carrito cuando el stock es 0', () => {
  const a = aplicar(inicial(), ACCIONES.AGREGAR_CARRITO, { id: 'P-2', cantidad: 5 });
  assert.equal(a.articulos[1].stock, 0);
  assert.strictEqual(aplicar(a, ACCIONES.CAMBIAR_CANTIDAD_CARRITO, { id: 'P-2', cambio: 1 }), a);
});

test('impide eliminar producto con unidades reservadas en carrito', () => {
  const a = aplicar(inicial(), ACCIONES.AGREGAR_CARRITO, { id: 'P-1', cantidad: 1 });
  assert.strictEqual(aplicar(a, ACCIONES.ELIMINAR, 'P-1'), a);
});

test('elimina artículos no reservados', () => {
  const b = aplicar(inicial(), ACCIONES.ELIMINAR, 'P-2');
  assert.deepEqual(b.articulos.map((x) => x.id), ['P-1']);
});

test('valida todos los campos, formatos especiales y cantidades', () => {
  assert.deepEqual(Object.keys(validarArticulo({ nombre: '', marca: ' ', tipo: '', stock: '', precio: '' })).sort(), ['marca', 'nombre', 'precio', 'stock', 'tipo']);
  assert.ok(validarArticulo({ ...producto, nombre: '<script>' }).nombre);
  assert.ok(validarArticulo({ ...producto, marca: '@@@' }).marca);
  assert.ok(validarArticulo({ ...producto, stock: -1 }).stock);
  assert.ok(validarArticulo({ ...producto, stock: 1.5 }).stock);
  assert.ok(validarArticulo({ ...producto, precio: 1.5 }).precio);
  assert.deepEqual(validarArticulo({ ...producto, stock: 0 }), {});
});

test('fecha local respeta el día local de Date sin utilizar UTC', () => {
  const fecha = new Date(2026, 10, 8, 23, 55);
  assert.equal(fechaLocal(fecha), '2026-11-08');
});

test('reconoce los estados disponible, bajo y agotado', () => {
  assert.equal(obtenerEstadoStock(0).etiqueta, 'Agotado');
  assert.equal(obtenerEstadoStock(10).etiqueta, 'Stock bajo');
  assert.equal(obtenerEstadoStock(11).etiqueta, 'Disponible');
});
