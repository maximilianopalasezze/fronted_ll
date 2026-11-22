import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import App from './App.jsx';
import './styles.css';

async function iniciar() {
  // Iniciar la simulación ANTES de React: evita que la primera petición escape de MSW.
  const { worker } = await import('./mocks/browser.js');
  await worker.start({
    onUnhandledRequest: 'bypass',
    serviceWorker: { url: import.meta.env.BASE_URL + 'mockServiceWorker.js' }
  });
  ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode><HashRouter><App /></HashRouter></React.StrictMode>
  );
}

iniciar().catch(error => {
  console.error('No se pudo iniciar el servicio de demostración.', error);
  const raiz = document.getElementById('root');
  raiz.innerHTML = '<main class="p-8 max-w-xl mx-auto text-white"><h1 class="text-2xl font-bold mb-3">No pudimos iniciar la agencia</h1><p>Revisa que el navegador permita Service Workers y vuelve a cargar la página.</p><button onclick="location.reload()" class="mt-5 rounded-xl px-4 py-2 bg-sky-500 text-slate-950">Reintentar</button></main>';
});
