export const formatoCLP = (monto) =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(Number(monto) || 0);
export const numero = (valor) => new Intl.NumberFormat('es-CL').format(valor);

// Acepta nombres de productos en español: letras acentuadas, números, espacios y puntuación comercial.
const PATRON_TEXTO = /^[\p{L}\p{N}][\p{L}\p{N}\s.,º°%/'()&+\-]*$/u;
export function validarArticulo(campos) {
  const errores = {};
  const nombre = String(campos.nombre ?? '').trim();
  const marca = String(campos.marca ?? '').trim();
  if (!nombre) errores.nombre = 'Ingresa el nombre del artículo.';
  else if (nombre.length < 2 || nombre.length > 100 || !PATRON_TEXTO.test(nombre))
    errores.nombre = 'Usa entre 2 y 100 caracteres: letras, números y signos comerciales válidos.';
  if (!marca) errores.marca = 'Ingresa la marca del artículo.';
  else if (marca.length < 2 || marca.length > 80 || !PATRON_TEXTO.test(marca))
    errores.marca = 'Usa entre 2 y 80 caracteres: letras, números y signos comerciales válidos.';
  if (!String(campos.tipo ?? '').trim()) errores.tipo = 'Selecciona el tipo de producto.';

  const stock = Number(campos.stock);
  if (campos.stock === '' || !Number.isSafeInteger(stock) || stock < 0)
    errores.stock = 'Ingresa unidades enteras, desde cero y sin decimales.';
  const precio = Number(campos.precio);
  if (campos.precio === '' || !Number.isSafeInteger(precio) || precio < 0)
    errores.precio = 'Ingresa un precio entero en pesos chilenos, desde cero.';
  return errores;
}

export function fechaLocal(fecha = new Date()) {
  const pad = (numero) => String(numero).padStart(2, '0');
  return `${fecha.getFullYear()}-${pad(fecha.getMonth() + 1)}-${pad(fecha.getDate())}`;
}
export const obtenerEstadoStock = (stock) => {
  if (stock === 0) return { etiqueta: 'Agotado', tono: 'error' };
  if (stock <= 10) return { etiqueta: 'Stock bajo', tono: 'warning' };
  return { etiqueta: 'Disponible', tono: 'success' };
};

export function filtrarArticulos(articulos, categoria, busqueda = '') {
  const filtro = busqueda.trim().toLocaleLowerCase('es-CL');
  return articulos.filter((a) =>
    (categoria === 'Todas' || a.tipo === categoria) &&
    `${a.nombre} ${a.marca}`.toLocaleLowerCase('es-CL').includes(filtro));
}
