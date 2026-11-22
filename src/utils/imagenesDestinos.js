/**
 * Recurso optimizado con las fotografías aportadas para los seis destinos.
 * Cada imagen ocupa una celda del sprite de 3 columnas × 2 filas.
 * La ruta relativa funciona en Vite y en /fronted_ll/semana5/ con HashRouter.
 */
const ubicaciones = Object.freeze({
  paris:'0% 0%',
  roma:'50% 0%',
  tokio:'100% 0%',
  cusco:'0% 100%',
  cancun:'50% 100%',
  barcelona:'100% 100%'
});

export function estiloFotoDestino(id) {
  return {
    backgroundImage: `url("${import.meta.env.BASE_URL}images/destinos/andes-destinos-sprite.webp")`,
    backgroundPosition: ubicaciones[id] || '50% 50%',
    backgroundSize: '300% 200%',
    backgroundRepeat: 'no-repeat',
    backgroundColor: '#24506a'
  };
}
