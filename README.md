# Andes Viajes — Semana 5 · Desarrollo Frontend II (PFY2202)

**Autor:** Maximiliano Palasezze  


## Descripción

Agencia de viajes para explorar destinos, actividades populares, vuelos y hoteles. La interfaz está hecha con **React, Vite, Tailwind CSS y React Router**. El frontend consume **REST y GraphQL simulados mediante Mock Service Worker (MSW)**.

## Cómo funciona

- `GET /api/destinos`: entrega 6 destinos con país, descripción y actividades populares.
- `POST /graphql`: consulta GraphQL `ObtenerOpcionesDestino($destinoId: ID!)` y responde únicamente vuelos/hoteles del destino seleccionado.
- **MSW** intercepta ambas solicitudes HTTP en el navegador, en desarrollo y en publicación. Se inicializa **antes de montar React**, para que también intercepte la primera petición.
- Las peticiones se realizan desde `src/services/viajesApi.js`, no desde los componentes de presentación.
- Caché en memoria de 5 minutos, deduplicación y protección de respuestas atrasadas por generación.
- Hook `useConsultaViajes` con `useReducer`, `useEffect`, carga inicial, reintentos y refresh sin ocultar datos.
- `HashRouter` permite navegar por GitHub Pages sin servidor para reescribir rutas.
- Las seis fotografías entregadas para los destinos se publican como un recurso WebP optimizado (sprite) en `public/images/destinos/andes-destinos-sprite.webp`. El componente `DestinoCard` y la vista de detalle muestran cada foto según el destino.

### Estructura

```text
src/main.jsx                       Arranque de MSW antes de montar React
src/mocks/browser.js               setupWorker de MSW
src/mocks/handlers.js              Handlers REST y GraphQL mock
src/data/viajesMock.js             Datos ficticios solo para los handlers
src/services/viajesApi.js          Cliente HTTP, consulta GraphQL y caché
src/hooks/useConsultaViajes.js     useReducer + useEffect para estados
src/components/viajes/            Layout, tarjetas y estados reutilizables
src/utils/imagenesDestinos.js       Imagen y posición de cada destino en el recurso WebP
src/pages/viajes/                 Inicio, destinos, detalle y 404
tests/viajes.test.js               Tests de datos y reducer
tests/viajesHttp.test.js           Tests HTTP de REST y GraphQL usando MSW
docs/semana5-evaluacion.md         Matriz de rúbrica y guía de evidencias
```

### Instalación

Necesitas Node.js 20 o superior.

```powershell
git clone --branch semana-5 --single-branch https://github.com/maximilianopalasezze/fronted_ll.git
cd fronted_ll
npm ci
npm test
npm run test:browser
npm run dev
```
### Compilación

```powershell
npm run build
npm run preview
```

El script `prebuild` genera `public/mockServiceWorker.js`, incorporado al directorio `dist`. La URL del Service Worker se basa en `import.meta.env.BASE_URL`, por lo que no depende de desplegarse en la raíz del dominio.

### GraphQL

La interfaz utiliza una operación nombrada en vez de descargar todos los registros:

```graphql
query ObtenerOpcionesDestino($destinoId: ID!) {
  opcionesDestino(destinoId: $destinoId) {
    destinoId
    vuelos { id aerolinea salida regreso precio disponibles cupos }
    hoteles { id nombre estrellas precioNoche disponibles habitaciones }
  }
}
```

Ejemplo de variables: `{"destinoId":"paris"}`.

GraphQL es **mock con MSW**, no un servidor GraphQL de producción con esquema ejecutable. La solicitud sí viaja por `fetch` y aparece como POST /graphql en la pestaña Network.

### Evaluación y pruebas

```powershell
npm test
npm run build
```

