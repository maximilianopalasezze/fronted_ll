import test from 'node:test';
import assert from 'node:assert/strict';
import { destinos, opcionesDeDestino } from '../src/data/viajesMock.js';
import { reductorConsulta } from '../src/hooks/useConsultaViajes.js';

test('Se publican seis destinos con países y actividades', () => {
  assert.equal(destinos.length,6);
  assert.equal(new Set(destinos.map(d=>d.id)).size,6);
  assert.ok(destinos.every(d=>d.nombre&&d.pais&&d.actividades.length>=2));
});
test('GraphQL tiene vuelos y hoteles asociados a cada destino',()=>{
  for(const d of destinos){
    const x=opcionesDeDestino(d.id);
    assert.equal(x.destinoId,d.id);
    assert.ok(x.vuelos.length>=2&&x.hoteles.length>=2);
    assert.ok(x.vuelos.every(v=>v.precio>0&&v.salida&&v.regreso&&typeof v.disponibles==='boolean'));
    assert.ok(x.hoteles.every(h=>h.precioNoche>0&&h.estrellas>0&&typeof h.disponibles==='boolean'));
  }
});
test('Un destino desconocido no tiene opciones ficticias',()=> assert.equal(opcionesDeDestino('desconocido'),null));
test('Reducer preserva listado al actualizar, y descarta respuestas de claves anteriores',()=>{
  const a=reductorConsulta({clave:'destinos',datos:[{id:'uno'}],cargando:false,actualizando:false,error:null},{tipo:'inicio',clave:'destinos'});
  assert.equal(a.actualizando,true);
  assert.equal(a.datos.length,1);
  assert.equal(reductorConsulta(a,{tipo:'exito',clave:'otro',datos:[]}),a);
  const b=reductorConsulta(a,{tipo:'exito',clave:'destinos',datos:[{id:'dos'}]});
  assert.equal(b.actualizando,false);
  assert.equal(b.datos[0].id,'dos');
});
