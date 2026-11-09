import { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import { productosIniciales } from '../data/productosIniciales';
import { ACCIONES, inventarioReducer } from './inventarioReducer';

const InventarioContext = createContext(undefined);
const CLAVE_V1 = 'supermercado-pfy2202-inventario-v1';
const CLAVE_V2 = 'supermercado-pfy2202-estado-v2';
const esArticulo = (a) => a && typeof a.id === 'string' && typeof a.nombre === 'string' &&
  Number.isInteger(a.stock) && a.stock >= 0 && Number.isInteger(a.precio) && a.precio >= 0;

export function cargarEstado() {
  const inicial = { articulos: productosIniciales, carrito: [] };
  try {
    const v2 = window.localStorage.getItem(CLAVE_V2);
    if (v2) {
      const dato = JSON.parse(v2);
      if (Array.isArray(dato.articulos) && dato.articulos.every(esArticulo) &&
          Array.isArray(dato.carrito) && dato.carrito.every((l) =>
            l && typeof l.id === 'string' && Number.isInteger(l.cantidad) && l.cantidad > 0 &&
            dato.articulos.some((a) => a.id === l.id))) return dato;
    }
    // Migración sin pérdida de datos de la Semana 2.
    const v1 = window.localStorage.getItem(CLAVE_V1);
    if (v1) {
      const articulos = JSON.parse(v1);
      if (Array.isArray(articulos) && articulos.every(esArticulo)) return { articulos, carrito: [] };
    }
  } catch {
    // El sitio puede usarse aunque el navegador bloquee localStorage.
  }
  return inicial;
}

export function InventarioProvider({ children }) {
  const [estado, dispatch] = useReducer(inventarioReducer, undefined, cargarEstado);
  useEffect(() => {
    try { window.localStorage.setItem(CLAVE_V2, JSON.stringify(estado)); }
    catch { /* Persistencia opcional para el navegador. */ }
  }, [estado]);

  const acciones = useMemo(() => ({
    agregarArticulo: (articulo) => dispatch({ type: ACCIONES.AGREGAR, payload: articulo }),
    eliminarArticulo: (id) => dispatch({ type: ACCIONES.ELIMINAR, payload: id }),
    agregarAlCarrito: (id, cantidad) => dispatch({ type: ACCIONES.AGREGAR_CARRITO, payload: { id, cantidad } }),
    cambiarCantidadCarrito: (id, cambio) => dispatch({ type: ACCIONES.CAMBIAR_CANTIDAD_CARRITO, payload: { id, cambio } }),
    quitarDelCarrito: (id) => dispatch({ type: ACCIONES.QUITAR_CARRITO, payload: id }),
  }), []);

  const unidadesCarrito = estado.carrito.reduce((suma, linea) => suma + linea.cantidad, 0);
  const valor = useMemo(() => ({ ...estado, unidadesCarrito, ...acciones }), [estado, unidadesCarrito, acciones]);
  return <InventarioContext.Provider value={valor}>{children}</InventarioContext.Provider>;
}

export function useInventario() {
  const contexto = useContext(InventarioContext);
  if (!contexto) throw new Error('useInventario debe utilizarse dentro de InventarioProvider');
  return contexto;
}
