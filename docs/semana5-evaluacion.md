# Semana 5 — Matriz de evaluación y pruebas

Actividad: **Integrando nuestro frontend con backend** (PFY2202). La aplicación es una **agencia de viajes**. Las tarifas, fechas y cupos son ficticios.

## Requisitos del documento

1. React/HTML/JS/CSS: destinos, vuelos, hoteles y actividades.
2. API REST mock que lista destinos, países y actividades.
3. API GraphQL mock que devuelve vuelos y hoteles por destino (precios, fechas, disponibilidad).
4. Selección de destino y navegación con React Router.
5. Código en GitHub. El nombre de repositorio pedido es **viajes-nombre-apellido-siglaCurso**; el repositorio de trabajo sigue siendo `fronted_ll` para conservar semanas anteriores. Resolver esta diferencia antes de entregar.

## Rúbrica de 100 puntos

| Criterio | Máximo | Evidencia requerida |
| --- | ---: | --- |
| Interfaz funcional y responsiva | 15 | Inicio, catálogo, detalle y vista móvil |
| REST mock: destinos | 15 | Network GET `/api/destinos` + lista y actividades |
| GraphQL mock: vuelos y hoteles | 15 | Network POST `/graphql` con `operationName` y variables `destinoId` |
| React Router | 10 | Navegación interna Inicio → Destinos → Detalle → Inicio + 404 |
| Modularidad | 10 | Componentes / hooks / servicios / mocks separados |
| Estado con useState/useEffect | 10 | Filtrado, consulta, reintento, useReducer + useEffect |
| GitHub / documentación / gh-pages | 10 | Rama y carpeta desplegada, README y URL pública verificable |
| Pruebas en distintos navegadores | 15 | Evidencias en Chrome, Edge/Firefox y Vivaldi; responsive y funciones |

## Lecciones de la Semana 4 aplicadas

- MSW se inicia antes de montar React, y controla tanto GET REST como POST GraphQL.
- El trabajador de MSW se sirve desde el mismo directorio base, compatible con GitHub Pages.
- GraphQL consulta las opciones de **un solo destino** según `variables.destinoId`, sin solicitar vuelos/hoteles de todos.
- Un refresh conserva los datos y añade indicador "Actualizando"; solo la primera carga sin datos presenta esqueletos.
- En detalle, el progreso principal unifica destinos REST y opciones GraphQL.
- El hook `useConsultaViajes` usa un reducer con claves para evitar aplicar resultados obsoletos.

## Escenarios a capturar manualmente

1. Primera carga: abrir DevTools → Network; verificar `GET .../api/destinos` y 200 de MSW.
2. Seleccionar Cusco: identificar `POST .../graphql`, la operación `ObtenerOpcionesDestino`, variable `destinoId: "cusco"` y vuelos/hoteles del destino.
3. Actualizar con datos: ver que el listado sigue visible y aparece "Actualizando".
4. Navegar a otra ciudad rápidamente: confirmar que no quedan vuelos del destino anterior.
5. Fallo REST: con desarrollo, probar `/api/destinos?error=500` y comprobar manejo de fallo en herramientas; no modificar la interfaz del cliente para mostrar fallos reales de la plataforma.
6. Probar GitHub Pages: mismo GET y POST interceptados con MSW, no lectura directa de los JSON de Semana 4.
7. Capturas con Chrome, Edge y Firefox o Vivaldi, en escritorio 1440 px y móvil 375 px. Verificar el menú, enlaces, búsqueda y tarjetas.
8. Revisar Consola sin errores inesperados y rutas 404.

No dar por realizadas las capturas manuales si no fueron tomadas. Un script de Node que aprueba no equivale por sí solo a una comprobación de varios navegadores.
