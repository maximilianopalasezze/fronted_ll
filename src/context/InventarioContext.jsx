import { createContext, useContext, useEffect, useMemo, useReducer } from 'react';
import { productosIniciales } from '../data/productosIniciales';
import { ACCIONES, inventarioReducer } from './inventarioReducer';

const InventarioContext = createContext(undefined);
const CLAVE_ALMACENAMIENTO = 'supermercado-pfy2202-inventario-v1';

function cargarInventario() {
  try {
    const almacenado = window.localStorage.getItem(CLAVE_ALMACENAMIENTO);
    if (almacenado !== null) {
      const datos = JSON.parse(almacenado);
      if (Array.isArray(datos) && datos.every((p) => p && typeof p.id === 'string' && typeof p.nombre === 'string')) {
        return datos;
      }
    }
  } catch {
    // Si el navegador bloquea localStorage, la aplicación sigue funcionando.
  }
  return productosIniciales;
}

/** Context API + useReducer permiten compartir productos entre TODAS las páginas. */
export function InventarioProvider({ children }) {
  const [articulos, dispatch] = useReducer(inventarioReducer, undefined, cargarInventario);

  useEffect(() => {
    try {
      window.localStorage.setItem(CLAVE_ALMACENAMIENTO, JSON.stringify(articulos));
    } catch {
      // El almacenamiento local es una mejora, no una condición para usar el sitio.
    }
  }, [articulos]);

  const acciones = useMemo(() => ({
    agregarArticulo: (articulo) => dispatch({ type: ACCIONES.AGREGAR, payload: articulo }),
    eliminarArticulo: (id) => dispatch({ type: ACCIONES.ELIMINAR, payload: id }),
  }), []);

  const valor = useMemo(() => ({ articulos, ...acciones }), [articulos, acciones]);

  return <InventarioContext.Provider value={valor}>{children}</InventarioContext.Provider>;
}

export function useInventario() {
  const contexto = useContext(InventarioContext);
  if (!contexto) throw new Error('useInventario debe utilizarse dentro de InventarioProvider');
  return contexto;
}
