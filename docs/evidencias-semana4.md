# Guía de evidencias — Semana 4

**Proyecto:** Librería Horizonte · Desarrollo Frontend II (PFY2202).

**Estudiante:** Maximiliano Palasezze.

**Rama:** `semana-4`.

Este documento indica qué comprobar y qué capturar para respaldar los cuatro criterios. Es una guía de preparación: no representa capturas ya tomadas ni garantiza una calificación. Los resultados realmente ejecutados están en [validacion-semana4.md](validacion-semana4.md).

## Preparación

1. Abrir el proyecto en IntelliJ IDEA y comprobar `git branch --show-current`: debe indicar `semana-4`.
2. Ejecutar `npm ci`, `npm test` y `npm run build`; conservar la salida completa. En PowerShell puede usarse `npm.cmd` si la política bloquea `npm.ps1`.
3. Iniciar `npm run dev` y abrir la URL que indique Vite.
4. Abrir las herramientas del navegador con `F12` o `Ctrl+Shift+I` y seleccionar **Network / Red**.
5. Activar **Preserve log / Conservar registro** y filtrar por **Fetch/XHR**. Para ver imágenes, seleccionar **All / Todo** o **Img**.
6. Anotar el commit evaluado, la fecha, el entorno y el puerto utilizado. En cada captura deben leerse la ruta, el resultado relevante y los datos necesarios para interpretarla.

Evitar exponer pestañas personales, contraseñas o información privada. Las capturas de la aplicación deben corresponder a su ejecución real.

## Capturas recomendadas

| Archivo sugerido | Qué debe mostrar | Criterio respaldado |
| --- | --- | --- |
| `01-inicio-escritorio.png` | Inicio, logo circular, navegación y categorías cargadas. | Integración REST y presentación del resultado. |
| `02-categorias-http.png` | Categorías renderizadas y petición `/api/categorias` en Network con `200`, método GET y JSON de respuesta. | Integración Mock REST. |
| `03-catalogo-detalle.png` | Catálogo con portadas y detalle de un libro accesible desde su tarjeta. | Integración de datos y navegación. |
| `04-carga.png` | Skeletons y mensaje de carga mientras la petición permanece pendiente. | Control de carga y estado. |
| `05-error-404.png` | Diagnóstico en 404, código/origen, mensaje y opción de reintentar; Network con 404 cuando es HTTP real. | Manejo de errores. |
| `06-error-500.png` | Diagnóstico en 500 y alternativas de recuperación; indicar si es HTTP real o simulación local. | Manejo de errores. |
| `07-sin-conexion.png` | Consulta normal con Network en Offline, mensaje de conexión y acción de reintento. | Manejo de errores de red. |
| `08-recuperacion.png` | Consulta normal exitosa después de retirar el fallo y reintentar. | Recuperación y finalización de carga. |
| `09-filtros-cache.png` | Búsqueda/filtro y Network sin peticiones adicionales a libros al cambiar solo el filtro. | Optimización y eficiencia. |
| `10-vacio.png` | Búsqueda sin coincidencias, sin error de petición ni indicador atascado. | Estados vacíos. |
| `11-movil.png` | Vista móvil con logo, menú, contenido legible y portadas sin deformación. | Calidad de interfaz y navegación. |
| `12-pruebas-build.png` | Terminal con cantidad de pruebas, aprobadas/fallidas y compilación final exitosa. | Evidencia automatizada transversal. |
| `13-github-actions.png` | Workflow del commit entregado finalizado y artefacto de producción. | Reproducibilidad y preparación de publicación. |

Si una sola captura queda ilegible por reunir demasiadas ventanas, dividirla en dos con nombres relacionados. Un archivo de la guía no equivale a una captura generada: guardar únicamente imágenes obtenidas al ejecutar el caso.

## 1. Integración REST y recursos

1. Recargar la aplicación desde el inicio y observar `/api/categorias`.
2. En Network abrir **Headers**: método GET, URL y estado `200`.
3. En **Response / Respuesta** comprobar que se recibe un array con categorías como Ficción y Ciencia ficción.
4. Abrir categorías y navegar al catálogo de Ficción. Debe mostrarse la categoría elegida y solo sus libros.
5. En Network comprobar `/api/libros`, su estado y sus datos.
6. Abrir el detalle desde una tarjeta. Deben coincidir título, autor, portada y precio.

El detalle de la interfaz se obtiene de la lista ya consultada; no es obligatorio observar otra petición para cada libro. El endpoint individual REST se verifica por separado:

```powershell
curl.exe -i http://localhost:5173/api/libros/L001
curl.exe -i "http://localhost:5173/api/libros?categoria=ficcion"
curl.exe -i http://localhost:5173/api/libros/NO-EXISTE
```

El primero devuelve un objeto y `200`; el segundo, un array filtrado y `200`; el tercero, `404` y un mensaje. Para las portadas y el logo, cambiar Network a **Img** y comprobar que los archivos cargan sin 404. Una portada con respaldo visual no prueba que su archivo original haya respondido correctamente: revisar también Network.

## 2. Carga, finalización y estados vacíos

1. Usar una ventana nueva o recargar para reiniciar la caché en memoria.
2. Elegir **Slow 3G / 3G lento** en el selector de Network.
3. Entrar al catálogo o a categorías y capturar el indicador mientras la petición sigue pendiente.
4. Esperar el éxito: el indicador debe retirarse y aparecer el contenido.
5. Repetir con un error desde diagnóstico: el indicador debe retirarse al mostrarse el mensaje.
6. Restaurar **No throttling / Sin limitación**.
7. En el catálogo, buscar una cadena que no exista, por ejemplo `zzzz-sin-coincidencias`; debe mostrarse el estado vacío, sin presentarlo como fallo de red.

Las pruebas automatizadas complementan estas capturas para peticiones que terminan fuera de orden. No provocar fallos aleatorios ni inferir ese comportamiento solo porque una página carga correctamente.

## 3. Errores y recuperación

Acceder directamente a `/#/diagnostico` en la URL local. Esta ruta no aparece en el menú de visitantes. Elegir **Recurso**, elegir **Escenario** y pulsar **Ejecutar prueba**.

### 404 y 500

- En desarrollo, los escenarios **Error 404** y **Error 500** solicitan `/api/...` con `?error=404` o `?error=500`. Capturar el estado HTTP real en Network junto con el mensaje de la pantalla.
- En producción estática, 404 solicita un archivo inexistente. 500 es una respuesta construida en el cliente: su código mostrado no demuestra que Pages respondió 500.
- La propia pantalla indica el origen de la prueba. Conservar esa explicación dentro de la captura.
- **Reintentar prueba** con una condición que sigue activa volverá a fallar: para recuperarse, pulsar **Volver al modo normal**, que ejecuta una nueva consulta normal.

### Conexión real y conexión simulada

- El escenario **Fallo de conexión** produce un rechazo local controlado; no necesita apagar internet.
- Para una evidencia de desconexión del navegador, seleccionar **Offline / Sin conexión** en Network y ejecutar una consulta normal del diagnóstico.
- Comprobar el mensaje de conexión y que el indicador de carga termine. Restaurar **No throttling** y reintentar en modo normal.
- No confundir el rechazo controlado con un estado HTTP: una conexión fallida no recibe necesariamente una respuesta del servidor.

### JSON, estructura y tiempo de espera

Los escenarios **JSON inválido**, **Estructura incorrecta** y **Tiempo de espera agotado** son simulaciones locales identificadas en la pantalla. Las pruebas automatizadas verifican también JSON ilegible, objetos o elementos con formato incorrecto, y vencimiento del tiempo límite durante la petición o la lectura del cuerpo.

Si una condición se verifica solamente con una prueba automatizada, adjuntar su salida e identificarla como tal; no inventar una captura de Network.

### Fallo de categorías auxiliares

Para comprobar el catálogo o detalle cuando categorías falla sin afectar libros, puede utilizarse el bloqueo de solicitudes de DevTools:

1. Abrir **More tools → Network request blocking / Bloqueo de solicitudes**.
2. Bloquear únicamente `*/api/categorias*` en desarrollo o `*/mock/categorias.json*` en producción.
3. Recargar directamente en `/#/catalogo` para evitar reutilizar categorías de la caché en memoria.
4. Capturar los libros válidos junto con el aviso independiente y el reintento de categorías.
5. Quitar el bloqueo y reintentar categorías; comprobar su recuperación.

Este bloqueo reproduce un fallo de conexión del recurso auxiliar, no un 500 HTTP. Repetir en un detalle directo si se necesita demostrar ambas pantallas.

## 4. Caché, deduplicación y filtrado

1. Recargar para iniciar una sesión de caché nueva y limpiar el registro de Network.
2. Cargar categorías y catálogo una vez.
3. Navegar por el menú entre categorías, catálogo y detalle, sin recargar la página.
4. Durante los cinco minutos siguientes, comprobar que no se vuelve a descargar la lista que sigue vigente.
5. Escribir una búsqueda y cambiar categorías: los resultados deben cambiar sin nuevas peticiones a libros por cada tecla o filtro.
6. Usar la acción de actualización o reintento y comprobar una nueva petición HTTP.

**Disable cache** afecta la caché del navegador; el servicio mantiene una caché propia en memoria. Una recarga borra esta última. No concluir que la deduplicación funciona porque el navegador respondió desde su disco: la prueba automatizada cuenta llamadas al cliente y verifica consultas simultáneas, expiración e invalidación.

La expiración de cinco minutos se prueba con un reloj controlado en las pruebas del servicio. No es necesario esperar cinco minutos para cada captura, aunque puede realizarse como comprobación adicional y registrarse.

## 5. Navegación y adaptación móvil

Recorrer, usando los controles de la interfaz:

```text
/#/ → /#/categorias → /#/catalogo?categoria=ficcion
    → /#/libro/L001 → /#/catalogo
/#/ruta-inexistente → pantalla 404 → inicio
```

Recargar directamente en catálogo y detalle. Las rutas deben seguir funcionando con `HashRouter`. Abrir `/#/diagnostico` directamente y comprobar que no existe una entrada de diagnóstico en el menú principal.

Activar la barra de dispositivos de DevTools y revisar al menos 320 o 360 píxeles de ancho, además de una vista de escritorio. Comprobar el menú móvil, foco de teclado visible, controles accesibles, ausencia de desbordamiento horizontal, contraste y proporción de las imágenes. Registrar cualquier limitación detectada en lugar de declarar conformidad sin revisarla.

## 6. Producción estática y entrega

1. Ejecutar `npm run build` y comprobar `dist/mock/categorias.json`, `dist/mock/libros.json` y las imágenes.
2. Ejecutar `npm run preview` y recorrer las rutas anteriores.
3. En Network, las peticiones deben apuntar a `mock/*.json`, no a un servidor `/api/`.
4. Repetir consulta normal y diagnóstico. Identificar explícitamente 500/red locales en este entorno.
5. Adjuntar resultado de `npm run test:browser` cuando se haya ejecutado. Sus archivos reales quedan en `output/validacion/`; pueden incluirse como evidencia sin confundirlos con las capturas de DevTools.
6. Verificar GitHub Actions para el commit entregado. Descargar su artefacto de producción si se requiere conservar la compilación.

No desplegar estos archivos sobre la publicación de Supermarket. Si se requiere una aplicación accesible públicamente, completar primero la decisión descrita en [publicacion-semana4.md](publicacion-semana4.md).

## Registro para completar al tomar evidencias

```text
Fecha y hora:
Commit:
Entorno: desarrollo / preview estático / publicación independiente
URL y puerto:
Navegador y versión:
Resolución:
Caso ejecutado:
Resultado observado:
Captura o salida adjunta:
Limitaciones o acción pendiente:
```
