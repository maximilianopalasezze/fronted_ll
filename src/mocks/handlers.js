import { http, HttpResponse, graphql, delay } from 'msw';
import { destinos, opcionesDeDestino } from '../data/viajesMock.js';

const graph = graphql.link('*/graphql');

export const handlers = [
  http.get('*/api/destinos', async ({ request }) => {
    await delay(450);
    const error = new URL(request.url).searchParams.get('error');
    if (error === '500') return HttpResponse.json({ mensaje:'Servidor de prueba no disponible' }, { status:500 });
    return HttpResponse.json(destinos);
  }),
  graph.query('ObtenerOpcionesDestino', async ({ variables }) => {
    await delay(500);
    const destinoId = variables?.destinoId;
    const opcionesDestino = opcionesDeDestino(destinoId);
    if (!opcionesDestino) {
      return HttpResponse.json({ data:{ opcionesDestino:null }, errors:[{ message:'No hay información para este destino.' }] });
    }
    return HttpResponse.json({ data:{ opcionesDestino } });
  })
];
