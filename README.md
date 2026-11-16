# Librería Horizonte — Semana 4 · Desarrollo Frontend II (PFY2202)

**Estudiante:** Maximiliano Palasezze · Duoc UC  
**Rama de trabajo:** \`semana-4\`  
**Repositorio:** https://github.com/maximilianopalasezze/fronted_ll/tree/semana-4

Esta es la continuación separada de la entrega de la Semana 3. **La rama \`main\` conserva Supermarket.** La Semana 4 pide una tienda de libros con categorías obtenidas desde un mock REST y navegación React Router.

## Requisitos

- React 18 + Vite 5, JavaScript, HTML, CSS, Material UI 5, React Router 6 con HashRouter.
- Mock REST local real, provisto por middleware Vite: \`GET /api/categorias\`, \`GET /api/libros\`, \`GET /api/libros?categoria=ficcion\`, \`GET /api/libros/L001\`.
- Datos centralizados en \`mock/db.json\` (categorías y libros ficticios).
- Versión estática del mock en \`public/mock/\` para GitHub Pages, sincronizada automáticamente al ejecutar \`npm run build\`. **En Pages se consulta JSON por HTTP, no se ejecuta el servidor REST Vite**.
- Manejo explícito de 404, 500, fallo de red, tiempo de espera, JSON inválido y formatos inesperados.
- Skeletons al cargar; estados vacíos; mensajes accesibles; reintentos; enlaces de regreso.
- Caché de 5 minutos y deduplicación de solicitudes simultáneas; filtrado local con \`useMemo\`.
- Demostración de errores desde el desplegable "Simulador de errores REST" en \`/#/catalogo\`.

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

## Publicación de la Semana 4 (sin alterar el sitio publicado de main)

**La URL existente de GitHub Pages todavía publica Supermarket** hasta que expresamente se despliegue una versión diferente. No ejecutar \`npx gh-pages -d dist\` sobre el mismo destino sin decidir primero si se quiere reemplazar la publicación anterior. La rama de Semana 4 se mantiene separada para correcciones. Puede publicarse en un repositorio o destino de Pages separado.

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

## Observación sobre la pauta

La instrucción Word incluye el nombre de repositorio \`hospital-nombre-apellido-siglaCurso\`, a pesar de describir una **tienda de libros**. Este proyecto conserva \`fronted_ll\` en una rama de desarrollo tal como se solicitó para continuar el trabajo. Confirmar con el profesor el nombre final requerido antes de entregar.
