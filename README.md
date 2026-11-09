# Supermarket — Semana 3 | Desarrollo Frontend II (PFY2202)

**Actividad sumativa:** Desarrollando sitios web con React avanzado.  
**Estudiante:** Maximiliano Palasezze · Duoc UC Online.  
**Código:** https://github.com/maximilianopalasezze/fronted_ll  
**Página:** https://maximilianopalasezze.github.io/fronted_ll/

Esta entrega **continúa el proyecto de la Semana 2**. Incluye inicio, registro de artículos, inventario con filtro por categoría, pantalla de detalle y carrito con modificación dinámica de existencias. Las unidades del carrito se consideran *reservadas*: al agregarlas disminuye el stock, y al reducir o quitar un producto regresan al inventario.

## Requisitos implementados

| Pauta Semana 3 | Implementación |
|---|---|
| Listado completo (15) | Nombre, marca, categoría, precio, stock, estado, fecha y botón de detalle |
| Filtro dinámico (15) | Estado local de categoría/búsqueda + `useMemo`; inventario original intacto |
| Detalle interactivo (15) | Ruta `/#/inventario/:id`, selección de cantidad y agregar al carrito |
| Modificación del inventario (15) | `useReducer` aplica cambios de carrito y stock de manera atómica |
| Framework CSS (15) | Material UI 5, tema oscuro responsive, semántica y controles accesibles |
| Modularidad (15) | `FilaArticulo`, `ControlCantidad`, vistas separadas, Context API, utilidades |
| Publicación (10) | Repositorio GitHub con README, rama de despliegue `gh-pages` |

## Cómo ejecutar en IntelliJ IDEA / PowerShell

Necesitas Node.js 18+; se recomienda Node 20 o 22.

```powershell
npm install
npm run dev
```

Luego abre `http://localhost:5173` (o la URL mostrada por Vite).

### Pruebas y compilación

```powershell
npm test
npm run build
npm run preview
```

### Publicación en GitHub Pages

`vite.config.js` usa `base: './'` y las rutas usan `HashRouter` para funcionar dentro del subdirectorio de GitHub Pages. Después de subir `main`, ejecutar:

```powershell
npm run build
npx gh-pages -d dist
```

En Settings → Pages: Deploy from a branch, rama `gh-pages`, carpeta `/(root)`.

## Rutas

- `/#/`: inicio e indicadores.
- `/#/agregar`: registro con validación por campo.
- `/#/inventario`: tabla y filtro de categorías sin pérdida de artículos.
- `/#/inventario/P001`: detalle de ejemplo (también desde el enlace de cada producto).
- `/#/carrito`: listado de artículos reservados, botones `+`, `−` y quitar.
- `/#/404`: manejo de rutas no existentes.

## Reglas de negocio explícitas

1. **Duplicados:** se consideran iguales si coinciden nombre, marca y categoría después de normalizar mayúsculas y espacios. Reingresar unidades **suma stock** y el **último precio** reemplaza el anterior. Se conserva el identificador y la fecha de ingreso del original. El formulario avisa esta regla.
2. **Carrito y stock:** añadir *n* unidades resta *n* del inventario; incrementar resta una; disminuir devuelve una; quitar devuelve todas. No se puede agregar más que lo disponible, aceptar cantidades no enteras, ni dejar stock negativo. Al disminuir a cero, se elimina la línea del carrito.
3. **Eliminar producto:** si tiene unidades en el carrito, se deshabilita su eliminación para no perder la reserva.
4. **Fechas:** los productos nuevos usan fecha local del navegador en formato `AAAA-MM-DD`, sin `toISOString()` para evitar discrepancias por UTC.
5. **Identificadores:** nuevos artículos usan `crypto.randomUUID()` en entorno HTTPS o localhost.
6. **Persistencia:** estado global de inventario y carrito en `localStorage` con clave versión 2. Se migran automáticamente productos guardados con la clave versión 1 de la Semana 2. Se almacenan por navegador y dispositivo; no existe servidor multiusuario.
7. **Precios:** el total del carrito usa el precio actual del producto. Es una simulación académica, sin pagos reales.

## Organización del código

```text
src/
  components/        # Layout, SeccionTitulo, FilaArticulo, ControlCantidad
  context/           # InventarioProvider + reducer global atómico
  data/              # Productos iniciales, categorías
  pages/             # Inicio, AgregarArticulo, Inventario, DetalleArticulo, Carrito, 404
  utils/             # Validación con regex, fecha local, filtro y formato
  App.jsx            # Rutas
  main.jsx           # ThemeProvider, HashRouter, InventarioProvider
  theme.js           # Tema Material UI oscuro
  styles.css         # CSS complementario
 tests/              # Pruebas de lógica de stock, carrito, filtro y validación
```

## Tecnologías / compatibilidad

React 18, `react-router-dom` **6.28**, Context API, `useReducer`, Material UI **5**, Vite 5. No se migra a React Router 7 porque la instalación v6 actual ya es compatible con estos imports, y una migración debe probarse por separado. El proyecto no usa backend.

## Pruebas manuales sugeridas

1. Registrar producto válido, comprobar su aparición y persistencia al recargar.
2. Reingresar mismo nombre/marca/tipo con otra cantidad y precio: una sola fila, stock acumulado, nuevo precio.
3. Filtrar por Bebidas y volver a Todas: restaurar todas las filas, sin pérdida.
4. Abrir detalle de `Bebida cola 1,5 L`, añadir 3: stock 18 → 15, carrito 3.
5. En carrito pulsar `+`: stock 15 → 14, cantidad 4; pulsar `−`: stock 14 → 15, cantidad 3.
6. Quitar producto: stock vuelve a 18, carrito vacío.
7. Intentar agregar más que lo disponible o agregar un producto agotado: acción deshabilitada/rechazada.
8. Recargar estando en el carrito: los artículos y las existencias deben conservarse.
9. Repetir en ancho móvil; menú lateral, tarjetas y controles deben ser utilizables.
