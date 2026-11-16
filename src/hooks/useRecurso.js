import { useCallback, useEffect, useState } from 'react';
import { consultarRecurso, limpiarCache } from '../services/librosApi.js';

const clientePublico = { consultarRecurso, limpiarCache };
const estadoInicial = { datos: [], cargando: true, error: null, fuente: null, diagnostico: null };

// La clave impide mostrar datos de un recurso anterior incluso antes de ejecutar
// el efecto. Una actualización fallida conserva los últimos datos de esa clave.
export function useRecurso(recurso, modo = 'normal', cliente = clientePublico) {
  const [intento, setIntento] = useState(0);
  const clave = recurso + ':' + modo;
  const [estado, setEstado] = useState({ ...estadoInicial, clave, cliente });
  const reintentar = useCallback(() => {
    cliente.limpiarCache(recurso);
    setEstado((previo) => ({ ...(previo.clave === clave && previo.cliente === cliente ? previo : estadoInicial), clave, cliente, cargando: true, error: null }));
    setIntento((anterior) => anterior + 1);
  }, [recurso, clave, cliente]);
  useEffect(() => {
    let vigente = true;
    setEstado((previo) => ({ ...(previo.clave === clave && previo.cliente === cliente ? previo : estadoInicial), clave, cliente, cargando: true, error: null }));
    cliente.consultarRecurso(recurso, { modo })
      .then(({ datos, fuente, diagnostico }) => {
        if (vigente) setEstado({ datos, cargando: false, error: null, fuente, diagnostico, clave, cliente });
      })
      .catch((error) => {
        if (vigente) setEstado((previo) => ({ ...previo, cargando: false, error, fuente: null, diagnostico: error.diagnostico || null, clave, cliente }));
      });
    return () => { vigente = false; };
  }, [recurso, modo, clave, intento, cliente]);
  const actual = estado.clave === clave && estado.cliente === cliente ? estado : estadoInicial;
  return { ...actual, reintentar };
}
