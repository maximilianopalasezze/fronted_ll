# Librería Horizonte — Semana 4 · Desarrollo Frontend II (PFY2202)

**Estudiante:** Maximiliano Palasezze · Duoc UC  
**Rama de trabajo:** \`semana-4\`  
**Repositorio:** https://github.com/maximilianopalasezze/fronted_ll/tree/semana-4




> Nota: el simulador usa \`?error=404\` o \`?error=500\` contra el servidor de desarrollo. En GitHub Pages, que es estático, el 404 se obtiene solicitando un archivo inexistente y el 500 se simula con un \`Response\` local. El fallo de red también se simula de forma controlada. Estos modos se usan solo como evidencias, no representan fallos reales del alojamiento.

## Ejecutar y probar en el computador

Requiere Node.js 20 recomendado (18 o superior para este proyecto).

\`\`\`powershell
git clone --branch semana-4 --single-branch https://github.com/maximilianopalasezze/fronted_ll.git
cd fronted_ll
npm ci
npm test
npm run dev
\`\`\`

Abrir la URL que muestra Vite, habitualmente \`http://localhost:5173\`. Comprobar el mock desde \`http://localhost:5173/api/categorias\` y \`http://localhost:5173/api/libros\`.

Para probar producción local:

\`\`\`powershell
npm run build
npm run preview
\`\`\`


## Arquitectura

\`\`\`text
mock/db.json                    # Fuente única de datos ficticios
server/mockApi.js               # Resolvedor REST GET y estados HTTP
server/viteMockPlugin.js        # Middleware de desarrollo
scripts/sync-mock.mjs           # Generación JSON para publicación estática
public/mock/                    # JSON accesible en GitHub Pages
src/services/http.js            # Cliente fetch, errores y timeout
src/services/librosApi.js       # Endpoints, caché y deduplicación
src/hooks/useRecurso.js         # Estado de carga/error y reintento
src/utils/catalogo.js          # Búsqueda y filtrado derivados
src/components/libros/          # Layout, tarjetas y feedback reutilizables
src/pages/libros/               # Inicio, categorías, catálogo, detalle y 404
tests/rest.test.js              # Pruebas automatizadas de REST y errores
\`\`\`

## Pruebas manuales para evidencias

1. Inicio: categorías provenientes de la petición HTTP.
2. Categorías: cards y navegación a libros de esa categoría.
3. Catálogo: filtrado por autor, título y categoría; búsqueda con tildes y sin tildes.
4. Detalle: abrir un libro y volver.
5. DevTools Network: comprobar \`GET /api/categorias\` y \`GET /api/libros\` localmente.
6. DevTools: confirmar ausencia de cargas repetidas innecesarias al navegar.
7. En catálogo elegir 404 y comprobar mensaje y Reintentar.
8. Repetir con 500, fallo de red y volver a consulta normal.
9. Verificar skeletons de carga y visualización móvil.
10. Ejecutar \`npm test\` y \`npm run build\`.

