# SuperMarket — Gestión de inventario de un supermercado

**Duoc UC Online · Desarrollo Frontend II · PFY2202 · Semana 2**  
**Actividad:** Implementando gestión de estado en componentes frontend con React.  
**Alumno:** Maximiliano Palasezze.

Aplicación web desarrollada con React para registrar y consultar artículos de un supermercado. Incluye un panel de inicio, un formulario de ingreso y una tabla de inventario con filtrado. El inventario es un **estado global compartido**, por lo que cualquier artículo añadido desde el formulario aparece inmediatamente en el listado.


## Tecnologías

- **React 18**: interfaz por componentes funcionales.
- **React Router DOM 6**: navegación entre páginas (`HashRouter`).
- **Context API + `useReducer`**: estado global de artículos disponible en todas las páginas.
- **Material UI (MUI)**: framework CSS y componentes visuales responsivos.
- **Vite**: entorno de desarrollo y compilación.


## Páginas / rutas

| Ruta | Página | Funcionalidad |
|---|---|---|
| `/#/` | Resumen | Inicio, indicadores y últimos productos. |
| `/#/agregar` | Agregar artículo | Formulario validado para nombre, marca, tipo, cantidad y precio. |
| `/#/inventario` | Inventario | Tabla con todos los artículos; búsqueda, filtros y eliminación con confirmación. |

## Estructura del proyecto

```text
supermercado-maximiliano-palasezze-PFY2202/
├── public/
├── src/
│   ├── components/
│   │   ├── Layout.jsx                # Menú y navegación responsive
│   │   └── SeccionTitulo.jsx
│   ├── context/
│   │   ├── InventarioContext.jsx     # Context API + Provider + localStorage
│   │   └── inventarioReducer.js      # Gestión de estado global
│   ├── data/
│   │   └── productosIniciales.js
│   ├── pages/
│   │   ├── Inicio.jsx
│   │   ├── AgregarArticulo.jsx       # Formulario
│   │   ├── Inventario.jsx           # Tabla
│   │   └── NoEncontrada.jsx
│   ├── utils/
│   │   └── inventario.js            # Validación / formato / stock
│   ├── App.jsx                       # Definición de rutas
│   ├── main.jsx                      # Providers / Router
│   ├── styles.css
│   └── theme.js                      # Tema de Material UI
├── tests/
│   └── inventario.test.js
├── .gitignore
├── index.html
├── package.json
├── package-lock.json                 # Si npm install se completó
├── vite.config.js
└── README.md
```




