# Registro de validación — Librería Horizonte

Fecha: 16 de noviembre de 2026. Entorno local: Windows, PowerShell, Node.js 24.15.0 y Chrome sin ventana. Rama: `semana-4`.

Este registro describe comprobaciones ejecutadas, sin asignar una nota académica. La validación remota del commit se consulta en [GitHub Actions de Semana 4](https://github.com/maximilianopalasezze/fronted_ll/actions/workflows/semana4-ci.yml).

## Auditoría inicial

- Árbol de trabajo limpio y rama `semana-4`, partiendo del commit `406b529`.
- `main` local y remoto: `b7cd3e1d98d3ba14517fc96be5be11be281d8097`. No se cambia de rama, no se hace merge ni se modifica su publicación.
- `npm test`: 26 pruebas aprobadas, ninguna fallida, antes de editar.
- Se identificaron errores auxiliares de categorías sin mostrar, simulador público y código de Supermarket desconectado del árbol de importaciones de la librería.

## Cambios por mejora

1. **Publicación:** se conserva `base: './'` y `HashRouter`. Se verifican JSON e imágenes en producción bajo `/semana4/`. `.github/workflows/semana4-ci.yml` prepara un artefacto `dist/`, con permisos de lectura y sin pasos de despliegue. `docs/publicacion-semana4.md` explica el destino independiente pendiente.
2. **README:** `README.md` se reescribe en español con arquitectura, endpoints, instalación Windows, pruebas, diagnóstico, pauta y la inconsistencia del nombre de repositorio.
3. **Errores:** `src/services/http.js`, `src/services/librosApi.js`, `src/hooks/useRecurso.js`, `EstadoSolicitud.jsx`, `Catalogo.jsx` y `DetalleLibro.jsx` cubren timeout total, estructuras inválidas, categorías independientes, reintento y respuestas atrasadas.
4. **Pruebas:** se añaden `tests/api.test.js`, `tests/http.test.js`, `tests/estaticos.test.js`, fixtures del hook y `scripts/verificar-navegador.mjs`. Se preservan todas las pruebas previas. La guía de capturas está en `docs/evidencias-semana4.md`.
5. **Interfaz:** inicio, categorías, catálogo y detalle usan mensajes públicos. `Diagnostico.jsx` y su ruta en `App.jsx` aíslan siete escenarios técnicos fuera del menú. `index.html` usa título, descripción y favicon de la librería. Logo, paleta, portadas y categorías se conservan.
6. **Limpieza:** se retiran cuatro componentes, seis páginas, el contexto, datos y recursos gráficos exclusivos de Supermarket. Su reducer y utilidades pasan a `tests/legado/`; `tests/inventario.test.js` conserva sus 15 casos. No se elimina ninguna dependencia compartida ni se cambia de versión mayor.

## Resultados finales locales

| Comando | Resultado |
| --- | --- |
| `npm ci` | Correcto: instalación reproducible desde el lockfile. |
| `npm test` | 55 pruebas ejecutadas, 55 aprobadas, 0 fallidas. |
| `npm run build` | Correcto: JSON sincronizados y salida `dist/`; sin advertencias de compilación de Vite. |
| `npm run test:browser` | 48 comprobaciones ejecutadas, 48 aprobadas, 0 fallidas. |
| `git diff --check` | Sin errores de whitespace. Git avisa de normalización LF/CRLF en Windows. |

El primer intento de `npm ci` encontró `EPERM` porque un Vite anterior mantenía abierto `esbuild.exe`. Se identificaron y cerraron únicamente los procesos de ese proyecto, y la instalación se repitió correctamente. Durante el desarrollo del runner se corrigieron comprobaciones de serialización DOM e interceptación; las cantidades anteriores corresponden a la ejecución final completa.

### Integración efectivamente comprobada

- Peticiones HTTP reales al middleware de Vite: categorías, libros, filtro por categoría, detalle, 404, 500 e identificador malformado con 400.
- Producción servida por HTTP desde una subcarpeta: ambos JSON, las 16 portadas, las seis ilustraciones y el logo.
- Navegación inicio → categorías → catálogo → detalle → catálogo, ruta no encontrada y regreso al inicio, en desarrollo y producción.
- Logo circular cargado y fondo idéntico al de la cabecera; todas las portadas decodificadas correctamente.
- Búsqueda sin tildes, filtros y navegación sin repetir las consultas de categorías y libros; deduplicación comprobada con React StrictMode.
- Pantalla vacía sin error ni indicador atascado; fallo de libros sin anuncio de éxito y con recuperación por reintento.
- Fallo independiente de categorías con libros visibles y recuperación de la consulta secundaria.
- Diagnóstico: 404, 500, red, JSON inválido, estructura incorrecta y timeout; retorno al modo normal. Se comprueba la distinción HTTP real/simulado en ambos entornos.
- Desconexión real mediante DevTools Protocol y recuperación con Reintentar después de restaurar la conexión, en ambos entornos.
- Hook renderizado: carga, éxito, fallo, conservación de datos, vacío, invalidación y respuestas fuera de orden.
- Vista móvil de 320 px, menú operable, ausencia de desbordamiento horizontal y ausencia de excepciones JavaScript en el recorrido público.
- En pruebas de servicio: caché de cinco minutos, expiración exacta, consultas simultáneas, reintento, aislamiento del diagnóstico e invalidación con solicitudes todavía pendientes.

### Capturas y límites de la comprobación visual

El runner genera resultados reales en `output/validacion/resultados.json` y capturas de inicio, catálogo móvil y diagnóstico 500 para ambos entornos. Se revisaron visualmente la página de inicio, el catálogo móvil y el diagnóstico estático. Esos archivos se excluyen del código fuente y el workflow los conserva como artefacto descargable.

No se afirma que existan capturas manuales de la pestaña Network. Para la entrega académica, seguir `docs/evidencias-semana4.md` y tomar las capturas legibles de Network y terminal solicitadas por el docente. Estas pruebas no constituyen una auditoría integral de accesibilidad.

## Comparación con la pauta

| Requisito | Situación encontrada | Cambio | Evidencia | Estado |
| --- | --- | --- | --- | --- |
| Integración Mock REST | Middleware y cliente existentes, esquema limitado a arrays. | Validación de elementos y compatibilidad estática verificada. | Pruebas REST, HTTP y recursos en subcarpeta. | Cumple en entornos verificados. |
| Manejo de errores | Clasificación básica; categorías auxiliares sin todos sus estados. | Errores independientes, timeout del cuerpo, reintento y diagnóstico aislado. | Pruebas de fallos, desconexión real y recuperación. | Cumple en entornos verificados. |
| Control de carga y estado | Hook existente con falta de pruebas de estados. | Protección de clave, conservación de datos y mensajes públicos. | Hook renderizado, skeletons, éxito, fallo, vacío y desorden. | Cumple en entornos verificados. |
| Optimización y eficiencia | Caché y deduplicación sin pruebas específicas. | Invalidación segura y cliente independiente de diagnóstico. | Expiración/deduplicación/invalidation y recuento HTTP durante filtros/navegación. | Cumple en entornos verificados. |

## Pendientes y límites de publicación

- No se despliega Librería Horizonte sobre GitHub Pages de Supermarket. Se deja preparado el artefacto de producción. Falta elegir y autorizar un destino independiente, desplegarlo y verificar su URL real.
- Antes de entregar, consultar al docente la inconsistencia `hospital-nombre-apellido-siglaCurso`. No se renombra el repositorio automáticamente.
- `npm audit` informó cuatro avisos: tres moderados y uno alto, asociados a Vite/esbuild y React Router. npm propone cambios de versión mayor; no se ejecutó `audit fix --force` para evitar una migración no validada. Su resolución requiere una revisión de actualización separada. El build correcto no significa ausencia de vulnerabilidades.
- GitHub Actions debe comprobarse para el SHA que se entregue. El workflow también ejecuta las 48 comprobaciones en Ubuntu/Node 20; un resultado local no sustituye el resultado remoto.
- Se conserva el lockfile y las versiones de React, Router, MUI y Vite. El npm local emite un aviso de configuración de entorno `min-release-age`, ajeno a los archivos del proyecto.
