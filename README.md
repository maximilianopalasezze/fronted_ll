# SuperMarket — Gestión de inventario de un supermercado


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




