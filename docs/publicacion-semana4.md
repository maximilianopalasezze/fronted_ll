# Publicación independiente de Librería Horizonte

La aplicación de Semana 4 se prepara desde la rama `semana-4`. La rama `main` y el destino actual de GitHub Pages de Supermarket deben conservarse.

## Estado y alcance

- Vite genera `dist/` mediante `npm run build`.
- La compilación incluye los archivos de `public/`, incluidos `mock/*.json`, portadas, categorías y logo.
- `base: './'` permite recursos relativos en un sitio alojado en un subdirectorio.
- `HashRouter` permite visitar y recargar las rutas del catálogo sin reglas especiales de servidor.
- El workflow de Semana 4 verifica el proyecto y conserva un artefacto de producción. No publica sobre GitHub Pages.
- No se considera verificada una URL pública de Librería Horizonte hasta abrirla y comprobar rutas, recursos y consultas.

La validación efectivamente realizada y sus resultados están en [validacion-semana4.md](validacion-semana4.md).

## Por qué se usa un artefacto como preparación segura

Un mismo destino de Pages puede estar configurado para el contenido de Supermarket. Cambiar su rama, carpeta, workflow o archivos podría reemplazar esa publicación. Generar un ZIP de `dist/` permite conservar una compilación revisable sin modificar el alojamiento existente.

En GitHub, abrir **Actions**, elegir la ejecución exitosa de Semana 4 correspondiente al commit entregado y descargar el artefacto de producción. Es un paquete de archivos web; no equivale a una URL publicada ni ejecuta un servidor REST.

## Decisión pendiente

Elegir un destino independiente para Semana 4. Una alternativa es un repositorio distinto, por ejemplo `libreria-horizonte-semana4`, con su propio GitHub Pages. El nombre es una propuesta y debe confirmarse; también debe resolverse con el docente la referencia a `hospital-nombre-apellido-siglaCurso` en las instrucciones oficiales.

No crear, renombrar o mover automáticamente repositorios. No hacer merge a `main`, no usar `push --force` y no cambiar Settings → Pages del repositorio que aloja Supermarket.

## Procedimiento preparado para un destino independiente

Cuando el destino esté elegido y autorizado:

1. Confirmar que pertenece al estudiante y que no aloja otra entrega que deba conservarse.
2. Usar el artefacto de una ejecución exitosa del commit que se entregará, o ejecutar instalación, pruebas y compilación de ese mismo commit.
3. Publicar **el contenido** de `dist/` en la raíz web del destino nuevo, incluyendo `index.html`, `assets/`, `images/` y `mock/`.
4. Configurar el alojamiento únicamente en el nuevo destino. Si se utiliza un workflow de Pages, revisar sus permisos y que el artefacto corresponda a esa publicación nueva.
5. Obtener la URL real del alojamiento; no deducirla solo a partir del nombre propuesto del repositorio.
6. Abrir inicio, categorías, catálogo, detalle y la ruta 404. Recargar rutas con `/#/` y comprobar el menú móvil.
7. Revisar Network: recursos sin 404 y consultas HTTP exitosas a `mock/categorias.json` y `mock/libros.json`.
8. Abrir `/#/diagnostico` y comprobar los casos aplicables al entorno estático, identificando los fallos simulados localmente.
9. Verificar que la URL anterior de Supermarket conserva su contenido.
10. Incorporar a README la URL de Librería Horizonte solo después de esas comprobaciones, junto con el commit publicado.

## Qué hace el alojamiento estático

El servidor Vite y su middleware `server/viteMockPlugin.js` funcionan durante el desarrollo. Un alojamiento como GitHub Pages entrega archivos y no ejecuta ese middleware.

| Operación | Desarrollo | Alojamiento estático |
| --- | --- | --- |
| Categorías | `GET /api/categorias` | `GET ./mock/categorias.json` |
| Libros | `GET /api/libros` | `GET ./mock/libros.json` |
| Filtrado en la interfaz | Sobre la lista HTTP en caché. | Sobre la lista HTTP en caché. |
| Detalle en la interfaz | Selección del libro desde la lista compartida. | Selección del libro desde la lista compartida. |
| Endpoint de detalle | `/api/libros/:id` disponible para verificar el mock. | No existe un endpoint REST dinámico. |
| Diagnóstico 404 | Respuesta HTTP del mock. | Solicitud HTTP de un archivo inexistente. |
| Diagnóstico 500 | Respuesta HTTP del mock. | Respuesta construida localmente por el cliente. |
| Fallo de red de diagnóstico | Rechazo local controlado. | Rechazo local controlado. |

Para reproducir este último entorno en el computador, usar `npm run build` seguido de `npm run preview`. Abrir archivos mediante `file://` no constituye una prueba válida de alojamiento web.
