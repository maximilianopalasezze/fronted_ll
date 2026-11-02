export const formatoCLP = (monto) =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(Number(monto) || 0);

export const numero = (valor) => new Intl.NumberFormat('es-CL').format(valor);

export function validarArticulo(campos) {
  const errores = {};
  if (!campos.nombre?.trim()) errores.nombre = 'Ingresa el nombre del artículo.';
  if (!campos.marca?.trim()) errores.marca = 'Ingresa la marca del artículo.';
  if (!campos.tipo?.trim()) errores.tipo = 'Selecciona el tipo de producto.';

  const stock = Number(campos.stock);
  if (campos.stock === '' || !Number.isInteger(stock) || stock < 0) {
    errores.stock = 'Ingresa una cantidad entera igual o superior a cero.';
  }
  const precio = Number(campos.precio);
  if (campos.precio === '' || !Number.isFinite(precio) || precio < 0 || !Number.isInteger(precio)) {
    errores.precio = 'Ingresa un precio entero igual o superior a cero.';
  }
  return errores;
}

export const obtenerEstadoStock = (stock) => {
  if (stock === 0) return { etiqueta: 'Agotado', tono: 'error' };
  if (stock <= 10) return { etiqueta: 'Stock bajo', tono: 'warning' };
  return { etiqueta: 'Disponible', tono: 'success' };
};
