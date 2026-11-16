// Genera el respaldo estático usado en GitHub Pages a partir de la misma BD mock.
import { readFileSync, mkdirSync, writeFileSync } from 'node:fs';
const datos = JSON.parse(readFileSync(new URL('../mock/db.json', import.meta.url), 'utf8'));
const carpeta = new URL('../public/mock/', import.meta.url);
mkdirSync(carpeta, { recursive: true });
for (const recurso of ['categorias', 'libros']) {
  if (!Array.isArray(datos[recurso])) throw new Error('Recurso inválido: ' + recurso);
  writeFileSync(new URL(recurso + '.json', carpeta), JSON.stringify(datos[recurso], null, 2) + '\n');
}
console.log('Mock estático sincronizado para GitHub Pages.');
