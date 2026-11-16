export const ACCIONES = Object.freeze({
  AGREGAR: 'AGREGAR',
  ELIMINAR: 'ELIMINAR',
  AGREGAR_CARRITO: 'AGREGAR_CARRITO',
  CAMBIAR_CANTIDAD_CARRITO: 'CAMBIAR_CANTIDAD_CARRITO',
  QUITAR_CARRITO: 'QUITAR_CARRITO',
});

export const normalizarProducto = (texto) => String(texto ?? '')
  .normalize('NFC').trim().replace(/\s+/g, ' ').toLocaleLowerCase('es-CL');

export const mismoProducto = (primero, segundo) =>
  ['nombre', 'marca', 'tipo'].every((campo) =>
    normalizarProducto(primero[campo]) === normalizarProducto(segundo[campo]));

// Un único reducer actualiza inventario y carrito de forma atómica e inmutable.
export function inventarioReducer(estado, accion) {
  const { articulos, carrito } = estado;
  const { payload } = accion;
  switch (accion.type) {
    case ACCIONES.AGREGAR: {
      if (!payload || !Number.isInteger(Number(payload.stock)) || Number(payload.stock) < 0 ||
          !Number.isInteger(Number(payload.precio)) || Number(payload.precio) < 0) return estado;
      const existente = articulos.find((a) => mismoProducto(a, payload));
      if (!existente) {
        if (articulos.some((a) => a.id === payload.id)) return estado;
        return { ...estado, articulos: [...articulos, payload] };
      }
      // Reingresar un producto suma stock y adopta el último precio ingresado.
      return { ...estado, articulos: articulos.map((a) => a.id === existente.id
        ? { ...a, stock: Number(a.stock) + Number(payload.stock), precio: Number(payload.precio) }
        : a) };
    }
    case ACCIONES.ELIMINAR:
      // No se permite borrar un producto con unidades reservadas en el carrito.
      if (carrito.some((linea) => linea.id === payload)) return estado;
      return { ...estado, articulos: articulos.filter((a) => a.id !== payload) };
    case ACCIONES.AGREGAR_CARRITO: {
      const { id, cantidad } = payload ?? {};
      const articulo = articulos.find((a) => a.id === id);
      if (!articulo || !Number.isInteger(cantidad) || cantidad <= 0 || cantidad > articulo.stock) return estado;
      const existeLinea = carrito.some((linea) => linea.id === id);
      return {
        articulos: articulos.map((a) => a.id === id ? { ...a, stock: a.stock - cantidad } : a),
        carrito: existeLinea
          ? carrito.map((linea) => linea.id === id ? { ...linea, cantidad: linea.cantidad + cantidad } : linea)
          : [...carrito, { id, cantidad }],
      };
    }
    case ACCIONES.CAMBIAR_CANTIDAD_CARRITO: {
      const { id, cambio } = payload ?? {};
      const linea = carrito.find((l) => l.id === id);
      const articulo = articulos.find((a) => a.id === id);
      if (!linea || !articulo || ![-1, 1].includes(cambio) ||
          (cambio === 1 && articulo.stock < 1)) return estado;
      const siguiente = linea.cantidad + cambio;
      if (siguiente < 0) return estado;
      return {
        articulos: articulos.map((a) => a.id === id ? { ...a, stock: a.stock - cambio } : a),
        carrito: siguiente === 0 ? carrito.filter((l) => l.id !== id)
          : carrito.map((l) => l.id === id ? { ...l, cantidad: siguiente } : l),
      };
    }
    case ACCIONES.QUITAR_CARRITO: {
      const linea = carrito.find((l) => l.id === payload);
      if (!linea) return estado;
      return {
        articulos: articulos.map((a) => a.id === payload ? { ...a, stock: a.stock + linea.cantidad } : a),
        carrito: carrito.filter((l) => l.id !== payload),
      };
    }
    default:
      return estado;
  }
}
