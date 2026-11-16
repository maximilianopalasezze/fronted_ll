export const formatoCLP = (precio) =>
  new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 })
    .format(Number(precio) || 0);

export function normalizarTexto(texto) {
  return String(texto ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim().toLowerCase();
}

export function filtrarLibros(libros, { texto = '', categoria = 'todas' } = {}) {
  const consulta = normalizarTexto(texto);
  return libros.filter((libro) =>
    (categoria === 'todas' || libro.categoriaId === categoria) &&
    normalizarTexto(libro.titulo + ' ' + libro.autor).includes(consulta));
}
