
import test, { before, after, afterEach } from 'node:test';
import assert from 'node:assert/strict';
import { setupServer } from 'msw/node';
import { http, HttpResponse } from 'msw';
import { handlers } from '../src/mocks/handlers.js';

const servidor = setupServer(...handlers);
before(() => servidor.listen({ onUnhandledRequest:'error' }));
after(() => servidor.close());
afterEach(() => servidor.resetHandlers());

test('REST simulado: GET destinos responde 200 con 6 países y actividades', async()=>{
  const respuesta=await fetch('http://localhost:7401/api/destinos');
  assert.equal(respuesta.status,200);
  const destinos=await respuesta.json();
  assert.equal(destinos.length,6);
  assert.ok(destinos.every(d=>d.pais&&d.actividades.length));
});
test('REST simulado: responde 500 tipificado en el endpoint de prueba', async()=>{
  const respuesta=await fetch('http://localhost:7401/api/destinos?error=500');
  assert.equal(respuesta.status,500);
  assert.match((await respuesta.json()).mensaje,/servidor/i);
});
test('GraphQL simulado: consulta nombrada con variables y solo devuelve el destino solicitado',async()=>{
  const consulta=`query ObtenerOpcionesDestino($destinoId: ID!) {
    opcionesDestino(destinoId: $destinoId) {
      destinoId
      vuelos { id aerolinea salida regreso precio disponibles cupos }
      hoteles { id nombre estrellas precioNoche disponibles habitaciones }
    }
  }`;
  const respuesta=await fetch('http://localhost:7401/graphql',{
    method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({operationName:'ObtenerOpcionesDestino',query:consulta,variables:{destinoId:'cusco'}})
  });
  assert.equal(respuesta.status,200);
  const cuerpo=await respuesta.json();
  assert.equal(cuerpo.data.opcionesDestino.destinoId,'cusco');
  assert.equal(cuerpo.data.opcionesDestino.vuelos.length,2);
  assert.equal(cuerpo.data.opcionesDestino.hoteles.length,2);
  assert.ok(cuerpo.data.opcionesDestino.vuelos.every(v=>v.precio>0));
});
test('GraphQL simulado: destino desconocido devuelve error GraphQL verificable',async()=>{
  const query=`query ObtenerOpcionesDestino($destinoId: ID!) {
    opcionesDestino(destinoId: $destinoId) {
      destinoId
    }
  }`;
  const respuesta=await fetch('http://localhost:7401/graphql',{
    method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({query,variables:{destinoId:'desconocido'},operationName:'ObtenerOpcionesDestino'})
  });
  assert.equal(respuesta.status,200);
  const datos=await respuesta.json();
  assert.equal(datos.data.opcionesDestino,null);
  assert.ok(datos.errors?.length>0);
});
test('El cliente puede distinguir un fallo real de conexión HTTP simulado por MSW', async()=>{
  servidor.use(http.get('*/api/destinos',()=>HttpResponse.error()));
  await assert.rejects(fetch('http://localhost:7401/api/destinos'));
});
