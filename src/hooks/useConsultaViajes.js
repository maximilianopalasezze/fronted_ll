import { useCallback, useEffect, useReducer, useState } from 'react';

const inicial = { clave:null, datos:null, cargando:true, actualizando:false, error:null };
export function reductorConsulta(estado, accion) {
  switch (accion.tipo) {
    case 'inicio':
      return estado.clave === accion.clave
        ? { ...estado, cargando:estado.datos == null, actualizando:estado.datos != null, error:null }
        : { ...inicial, clave:accion.clave };
    case 'exito':
      if (estado.clave !== accion.clave) return estado;
      return { ...estado, datos:accion.datos, cargando:false, actualizando:false, error:null };
    case 'fallo':
      if (estado.clave !== accion.clave) return estado;
      return { ...estado, cargando:false, actualizando:false, error:accion.error };
    default: return estado;
  }
}
/**
 * Mantiene los datos anteriores visibles durante un refresh.
 * Desestima resultados que llegan después de un cambio de clave o desmontaje.
 */
export function useConsultaViajes(clave, consulta) {
  const [estado, enviar] = useReducer(reductorConsulta, inicial);
  const [intento, setIntento] = useState(0);
  useEffect(() => {
    let vigente = true;
    enviar({ tipo:'inicio', clave });
    consulta({ forzar:intento>0 }).then((datos) => {
      if (vigente) enviar({ tipo:'exito', clave, datos });
    }).catch((error) => {
      if (vigente) enviar({ tipo:'fallo', clave, error });
    });
    return () => { vigente = false; };
  }, [clave, consulta, intento]);
  const refrescar = useCallback(() => setIntento(v=>v+1), []);
  const actual = estado.clave === clave ? estado : { ...inicial, clave };
  return { ...actual, refrescar };
}
