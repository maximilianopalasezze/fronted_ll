
export const ACCIONES = {
  AGREGAR: 'AGREGAR',
  ELIMINAR: 'ELIMINAR',
};

// Normaliza los textos para comparar productos.
const normalizar = (valor) =>
    String(valor ?? '')
        .trim()
        .replace(/\s+/g, ' ')
        .toLocaleLowerCase('es-CL');

export function inventarioReducer(estado, accion) {
  switch (accion.type) {
    case ACCIONES.AGREGAR: {
      const nuevo = accion.payload;

      // Buscar si el artículo ya existe.
      const existente = estado.find((producto) =>
          normalizar(producto.nombre) === normalizar(nuevo.nombre) &&
          normalizar(producto.marca) === normalizar(nuevo.marca) &&
          normalizar(producto.tipo) === normalizar(nuevo.tipo)
      );

      // Si no existe, agregarlo como producto nuevo.
      if (!existente) {
        return [...estado, nuevo];
      }

      // Si ya existe, sumar las cantidades.
      return estado.map((producto) =>
          producto.id === existente.id
              ? {
                ...producto,
                stock: Number(producto.stock) + Number(nuevo.stock),
                precio: Number(nuevo.precio),
              }
              : producto
      );
    }

    case ACCIONES.ELIMINAR:
      return estado.filter(
          (articulo) => articulo.id !== accion.payload
      );

    default:
      return estado;
  }
}
