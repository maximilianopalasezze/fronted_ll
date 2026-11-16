import { useCallback, useEffect, useState } from 'react';
import { consultarRecurso, limpiarCache } from '../services/librosApi.js';

// El mismo recurso se consulta una sola vez mientras haya una petición en curso.
// El efecto ignora respuestas atrasadas si se cambia de pantalla o de modo.
export function useRecurso(recurso, modo = 'normal') {
  const [intento, setIntento] = useState(0);
  const [estado, setEstado] = useState({ datos: [], cargando: true, error: null, fuente: null });
  const reintentar = useCallback(() => {
    limpiarCache(recurso);
    setIntento((anterior) => anterior + 1);
  }, [recurso]);
  useEffect(() => {
    let vigente = true;
    setEstado((previo) => ({ ...previo, cargando: true, error: null }));
    consultarRecurso(recurso, { forzar: intento > 0, modo })
      .then(({ datos, fuente }) => {
        if (vigente) setEstado({ datos, cargando: false, error: null, fuente });
      })
      .catch((error) => {
        if (vigente) setEstado({ datos: [], cargando: false, error, fuente: null });
      });
    return () => { vigente = false; };
  }, [recurso, modo, intento]);
  return { ...estado, reintentar };
}
