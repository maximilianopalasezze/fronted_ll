# Librería Horizonte

Proyecto académico de la **Semana 4 de Desarrollo Frontend II (PFY2202), Duoc UC**.

**Estudiante:** Maximiliano Palasezze.

**Rama de trabajo:** `semana-4`.

Librería Horizonte permite descubrir categorías, buscar libros por título o autor, filtrar el catálogo y consultar el detalle de cada libro. Conserva sus portadas, ilustraciones, logo circular y diseño adaptable a móviles. Los datos se solicitan mediante HTTP desde servicios independientes de los componentes React.

El objetivo de la actividad es construir una tienda de libros con React, integrar una API REST mock para las categorías, configurar la navegación y entregar el código en GitHub. El catálogo es académico: los precios son de ejemplo y no hay pagos, autenticación ni pedidos reales.

- [Repositorio y código de Semana 4](https://github.com/maximilianopalasezze/fronted_ll/tree/semana-4).
- [Guía de capturas y evidencias](docs/evidencias-semana4.md).
- [Estrategia de publicación independiente](docs/publicacion-semana4.md).
- [Registro de validación y limitaciones observadas](docs/validacion-semana4.md).

**Publicación:** no se incluye una URL pública de Librería Horizonte sin verificarla. La compilación está preparada para alojamiento estático; el destino independiente de Semana 4 debe confirmarse antes de desplegar. La publicación de Supermarket se conserva.

> Las instrucciones oficiales mencionan el nombre de repositorio `hospital-nombre-apellido-siglaCurso`, aunque describen una tienda de libros. Esta inconsistencia debe consultarse con el docente antes de entregar. El repositorio actual no se renombra ni se mueve automáticamente.

## Tecnologías y requisitos

- React 18, componentes funcionales y hooks.
- React Router 6 con `HashRouter`.
- Material UI 5 y Emotion para estilos, formularios, tarjetas y navegación.
- Vite 5 para desarrollo y compilación.
- `fetch`, `AbortController` y módulos JavaScript para el acceso HTTP.
- `node:test` y `node:assert` para pruebas; Chrome o Edge sin ventana para las comprobaciones de navegador.
- GitHub Actions para instalar, verificar y conservar el artefacto de producción.

Usar Node.js **20.10 o superior** y npm. La verificación de navegador emplea la API WebSocket de Node; en Node 20 se habilita mediante el script del proyecto. Git, IntelliJ IDEA y Chrome o Edge permiten realizar el flujo completo en Windows. La instalación reproduce las versiones registradas en `package-lock.json`; cualquier actualización debe comprobarse antes de incorporarla.

## Instalación y ejecución

En una terminal de IntelliJ IDEA o PowerShell:

```powershell
git clone --branch semana-4 --single-branch https://github.com/maximilianopalasezze/fronted_ll.git
cd fronted_ll
npm ci
npm test
npm run dev
```

Abrir la URL que muestre Vite, normalmente `http://localhost:5173/`. Si el puerto está ocupado, Vite puede elegir otro. En PowerShell, si la política de ejecución bloquea `npm.ps1`, usar `npm.cmd ci`, `npm.cmd test` y `npm.cmd run dev`; no hace falta cambiar la política del sistema.

Para verificar producción local:

```powershell
npm run build
npm run preview
```

Abrir la URL indicada por `preview`, normalmente `http://localhost:4173/`. Servir `dist/` mediante HTTP: abrir `dist/index.html` con `file://` no reproduce el funcionamiento de una publicación web.

Otros comandos:

```powershell
npm run sync:mock
npm run test:browser
```

`sync:mock` regenera los JSON estáticos desde la fuente única. La compilación también realiza esta sincronización automáticamente. `test:browser` inicia y verifica desarrollo y producción local, detecta Chrome o Edge y admite la variable `CHROME_PATH` si el navegador está instalado en otra ubicación. Guarda resultados y capturas reales en `output/validacion/`, carpeta excluida de Git. Consultar su resultado en el [registro de validación](docs/validacion-semana4.md).

## Estructura y responsabilidades

```text
mock/db.json                         Fuente única: categorías y libros
server/mockApi.js                    Resolución REST GET y estados HTTP
server/viteMockPlugin.js             Middleware REST del servidor Vite
scripts/sync-mock.mjs                Generación de JSON para producción
scripts/verificar-navegador.mjs      Integración y navegación en navegador
public/images/                      Logo, categorías y portadas
public/mock/                        categorias.json y libros.json generados
src/App.jsx                         Rutas de la librería y diagnóstico
src/main.jsx                        ThemeProvider y HashRouter
src/theme.js                        Paleta y estilos compartidos
src/components/libros/              Layout, tarjetas, portadas y estados
src/pages/libros/                   Inicio, categorías, catálogo, detalle y 404
src/hooks/useRecurso.js              Carga, error, datos y reintento
src/services/http.js                Cliente HTTP, timeout y errores
src/services/librosApi.js            Rutas, validación, caché y deduplicación
src/utils/catalogo.js                Filtros derivados y formato de precios
tests/                              Pruebas REST, HTTP, recursos e inventario
tests/legado/                       Lógica mínima para conservar pruebas previas
docs/                               Evidencias, publicación y validación
.github/workflows/semana4-ci.yml      Verificación de la rama semana-4
```

Los componentes de Supermarket que no participan en la librería se retiran de la aplicación de esta rama. Sus 15 pruebas anteriores se conservan en `tests/inventario.test.js`, con el código mínimo necesario aislado en `tests/legado/`. Esto no modifica la rama `main`.

## Arquitectura de datos: desarrollo y producción

En desarrollo, el recorrido es:

```text
Pantalla → useRecurso → librosApi → obtenerJson → HTTP /api/...
                                               ↓
                             middleware Vite → mock/db.json
```

El middleware es un servidor REST mock de solo lectura. Devuelve estados HTTP y JSON reales, con una breve latencia controlada para comprobar la carga. React no importa `mock/db.json` ni inserta los datos del catálogo directamente en las pantallas.

En producción estática, el recorrido cambia en el servicio:

```text
mock/db.json → sync-mock.mjs → public/mock/*.json → dist/mock/*.json
Pantalla → useRecurso → librosApi → HTTP ./mock/*.json
```

GitHub Pages **sirve archivos JSON mediante HTTP; no ejecuta el servidor REST de Vite**. En ese modo se descargan las listas de libros y categorías. El filtrado y la selección de detalle se resuelven sobre los datos obtenidos, reutilizando la caché. No existen `/api/libros/:id` ni un backend dinámico en Pages.

`vite.config.js` usa `base: './'`. Las rutas de recursos se construyen con `import.meta.env.BASE_URL`, y `HashRouter` mantiene la navegación dentro del fragmento de la URL. Así, recargar `/#/catalogo` o `/#/libro/L001` solicita el mismo `index.html`, sin necesitar reglas de reescritura del alojamiento.

## Endpoints REST de desarrollo

Estos ejemplos corresponden al servidor iniciado con `npm run dev`:

| Petición | Resultado esperado |
| --- | --- |
| `GET /api/categorias` | `200`: array de categorías. |
| `GET /api/libros` | `200`: array de libros. |
| `GET /api/libros?categoria=ficcion` | `200`: array de libros de Ficción. Una categoría sin coincidencias devuelve `[]`. |
| `GET /api/libros/:id`, por ejemplo `/api/libros/L001` | `200`: objeto del libro solicitado, no un array. |
| `GET /api/libros/NO-EXISTE` | `404`: objeto con `mensaje`. |
| `GET /api/desconocido` | `404`: ruta no encontrada. |
| `GET /api/libros?error=404` | `404`: error controlado del mock. |
| `GET /api/libros?error=500` | `500`: error controlado del mock. |
| `POST /api/libros` | `405`: el mock admite únicamente lectura. |

Ejemplo de categoría incluida en una respuesta exitosa:

```json
{
  "id": "ficcion",
  "nombre": "Ficción",
  "descripcion": "Historias contemporáneas, emociones y grandes personajes.",
  "icono": "📖",
  "imagen": "images/categorias/ficcion.png"
}
```

Ejemplo de error de detalle:

```json
{ "mensaje": "El libro solicitado no existe." }
```

Comprobaciones rápidas desde Windows, ajustando el puerto si Vite indica otro:

```powershell
curl.exe -i http://localhost:5173/api/categorias
curl.exe -i "http://localhost:5173/api/libros?categoria=ficcion"
curl.exe -i http://localhost:5173/api/libros/L001
curl.exe -i "http://localhost:5173/api/libros?error=500"
```

## Errores y estados de carga

El cliente diferencia errores HTTP `404` y `500`, pérdida de conexión, tiempo de espera agotado, JSON inválido y estructura de datos inesperada. Las validaciones se realizan antes de incorporar una respuesta a la caché. Un error no se presenta como un listado vacío exitoso.

La interfaz pública muestra mensajes comprensibles, una acción para reintentar y alternativas de navegación. Las categorías auxiliares y los libros tienen estados independientes: un fallo de categorías no elimina los libros que sí cargaron. Al actualizar un recurso, se conservan sus últimos datos válidos para poder recuperarse de un fallo. Las respuestas antiguas no sustituyen el resultado de una petición más reciente.

Los indicadores de carga comienzan al solicitar datos y terminan tanto en éxito como en error. Se usan skeletons y regiones accesibles con mensajes como «Cargando categorías…». El contador de resultados y el estado vacío solo se muestran como resultado de una consulta terminada correctamente.

## Optimización

- Caché en memoria por recurso durante cinco minutos; se reinicia al recargar la página.
- Deduplicación: los consumidores simultáneos del mismo recurso comparten la petición en curso.
- Reintento que invalida el recurso y permite obtener datos nuevos; los errores no se guardan como respuestas válidas.
- Protección frente a respuestas antiguas durante cambios de recurso o actualizaciones.
- Búsqueda y filtrado derivados con `useMemo`, sin volver a consultar HTTP por cada tecla o categoría.
- Listas compartidas entre catálogo y detalle, e imágenes con carga diferida cuando corresponde.

La caché de la aplicación es distinta de la caché HTTP del navegador. Activar **Disable cache** en Network no elimina los datos guardados en memoria por el servicio; para evidenciar nuevas peticiones, usar la actualización o el diagnóstico.

## Diagnóstico académico

Abrir directamente `http://localhost:5173/#/diagnostico`, usando el puerto real de Vite. La ruta no aparece en el menú principal. Elegir **Recurso** y **Escenario**, y pulsar **Ejecutar prueba**. Se muestran carga, resultado o error, código interno, código HTTP, origen y URL de la solicitud. Tras un fallo se ofrece **Reintentar prueba**; **Volver al modo normal** ejecuta de nuevo una consulta normal.

El diagnóstico utiliza una instancia independiente del cliente de recursos. Sus pruebas no alteran el catálogo, la caché ni las consultas de los visitantes. Es una herramienta de evaluación; no administra datos, no ofrece autenticación ni contiene secretos.

| Escenario | Desarrollo con Vite | Producción estática |
| --- | --- | --- |
| Consulta normal | HTTP real al mock `/api/`. | HTTP real a un archivo `mock/*.json`. |
| Error 404 | HTTP real: el mock responde 404. | HTTP real: se solicita un archivo inexistente. |
| Error 500 | HTTP real: el mock responde 500. | Respuesta 500 construida localmente; no demuestra un 500 del alojamiento. |
| Fallo de conexión | Fallo controlado local del cliente. | Fallo controlado local del cliente. |
| JSON inválido, estructura incorrecta y tiempo agotado | Simulación local identificada. | Simulación local identificada. |

Para evidenciar una desconexión real, seleccionar **Offline** en Network y ejecutar una consulta normal que requiera red. Volver a **No throttling** al terminar. Los códigos y el origen de la respuesta se muestran en diagnóstico, sin exponer detalles técnicos en las pantallas de la librería.

## Pruebas y verificación de la pauta

Ejecutar en este orden desde una instalación limpia:

```powershell
npm ci
npm test
npm run build
npm run test:browser
```

`npm test` conserva las pruebas anteriores y añade casos de integración del cliente HTTP y del servicio de recursos. La verificación de navegador complementa esas pruebas con la aplicación renderizada. El número ejecutado, los resultados y las limitaciones se registran en [validacion-semana4.md](docs/validacion-semana4.md); no se debe deducir una nota académica únicamente del resultado de la compilación.

| Criterio | Implementación y comprobación |
| --- | --- |
| Integración Mock REST | Middleware `/api/`, fuente única, cliente HTTP y JSON estáticos sincronizados; pruebas de rutas, respuestas y recursos de producción. |
| Manejo de errores | Errores diferenciados, validación de datos, mensajes, reintento y diagnóstico aislado; pruebas HTTP y de recuperación. |
| Control de carga y estado | Hook reutilizable, skeletons, éxito, error, vacío y protección frente a respuestas fuera de orden; comprobaciones automatizadas y guía visual. |
| Optimización y eficiencia | Caché, deduplicación, expiración, invalidación y filtros derivados; pruebas del servicio y observación de Network. |

Para las pruebas manuales, recorrer inicio → categorías → catálogo filtrado → detalle → volver al catálogo. Buscar «FUNDACION» para comprobar tildes, buscar un texto inexistente para el estado vacío, abrir una URL desconocida y comprobar la adaptación móvil. La [guía de evidencias](docs/evidencias-semana4.md) explica cada captura, sus pasos y el criterio que respalda.

## Entrega y protección de Semana 3

Trabajar y subir cambios únicamente en `semana-4`. No hacer merge a `main`, no utilizar `push --force` y no publicar `dist/` sobre el destino actual de Supermarket. El flujo de verificación de Semana 4 conserva un artefacto descargable de producción y no despliega sobre GitHub Pages.

Antes de entregar, verificar el commit y GitHub Actions, consultar la inconsistencia del nombre de repositorio y elegir un destino de publicación independiente si el docente requiere una URL de la aplicación. Los pasos preparados y la decisión pendiente están en [publicacion-semana4.md](docs/publicacion-semana4.md).
