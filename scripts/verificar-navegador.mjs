// Integración real en Chrome/Edge mediante DevTools Protocol, sin paquetes adicionales.
// Solo usa perfiles temporales y servidores locales; no publica ni modifica GitHub Pages.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { access, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer, preview } from 'vite';

const raiz = fileURLToPath(new URL('../', import.meta.url));
const salida = path.join(raiz, 'output/validacion');
await mkdir(salida, { recursive: true });
const resultados = [];
const pausa = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function comprobar(nombre, accion) {
  try {
    await accion();
    resultados.push({ nombre, estado: 'aprobado' });
    console.log('✓ ' + nombre);
  } catch (error) {
    resultados.push({ nombre, estado: 'fallido', error: error.message });
    throw error;
  }
}

async function encontrarChrome() {
  const candidatos = [process.env.CHROME_PATH, process.env.CHROME_BIN,
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
    '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium',
    '/usr/bin/chromium-browser', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome'];
  for (const candidato of candidatos.filter(Boolean)) {
    try { await access(candidato); return candidato; } catch { /* siguiente */ }
  }
  throw new Error('No se encontró Chrome/Edge. Define CHROME_PATH con la ruta del ejecutable.');
}

class Pestana {
  constructor(socket) {
    this.socket = socket;
    this.id = 0;
    this.pendientes = new Map();
    this.eventos = new Map();
    this.excepciones = [];
    this.peticiones = [];
    socket.onmessage = ({ data }) => {
      const mensaje = JSON.parse(data);
      if (this.pendientes.has(mensaje.id)) {
        const pendiente = this.pendientes.get(mensaje.id);
        this.pendientes.delete(mensaje.id);
        clearTimeout(pendiente.timer);
        mensaje.error ? pendiente.reject(new Error(mensaje.error.message)) : pendiente.resolve(mensaje.result);
      }
      if (mensaje.method === 'Runtime.exceptionThrown') this.excepciones.push(mensaje.params.exceptionDetails.text);
      if (mensaje.method === 'Network.requestWillBeSent') this.peticiones.push(mensaje.params.request.url);
      for (const manejar of this.eventos.get(mensaje.method) || []) manejar(mensaje.params);
    };
  }
  async enviar(method, params = {}) {
    return new Promise((resolve, reject) => {
      const id = ++this.id;
      const timer = setTimeout(() => { this.pendientes.delete(id); reject(new Error('CDP sin respuesta: ' + method)); }, 15000);
      this.pendientes.set(id, { resolve, reject, timer });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }
  async evaluar(expression) {
    const respuesta = await this.enviar('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true });
    if (respuesta.exceptionDetails) throw new Error(respuesta.exceptionDetails.exception?.description || respuesta.exceptionDetails.text);
    return respuesta.result.value;
  }
  async esperar(expression, descripcion = expression, limite = 30000) {
    const inicio = Date.now();
    while (Date.now() - inicio < limite) {
      try { if (await this.evaluar(`Boolean(${expression})`)) return; } catch { /* navegación en curso */ }
      await pausa(40);
    }
    const pagina = await this.evaluar('({url:location.href,texto:document.body.innerText.slice(0,600)})').catch(() => ({}));
    throw new Error('No se cumplió: ' + descripcion + '\n' + JSON.stringify({ pagina, excepciones: this.excepciones }));
  }
  async navegar(url) { await this.enviar('Page.navigate', { url }); }
  async ruta(hash) { await this.evaluar('location.hash = ' + JSON.stringify(hash)); }
  async pulsar(texto) {
    await this.evaluar(`(() => { const control = [...document.querySelectorAll('button,a')].find(e => e.textContent.trim() === ${JSON.stringify(texto)}); if (!control) throw Error('No existe control: '+${JSON.stringify(texto)}); control.click(); })()`);
  }
  async escribir(selector, valor) {
    await this.evaluar(`(() => { const e=document.querySelector(${JSON.stringify(selector)}); if(!e) throw Error('No existe campo'); Object.getOwnPropertyDescriptor(HTMLInputElement.prototype,'value').set.call(e,${JSON.stringify(valor)}); e.dispatchEvent(new Event('input',{bubbles:true})); })()`);
  }
  async seleccionar(selector, valor) {
    await this.evaluar(`(() => { const e=document.querySelector(${JSON.stringify(selector)}); e.value=${JSON.stringify(valor)}; e.dispatchEvent(new Event('change',{bubbles:true})); })()`);
  }
  async captura(nombre) {
    const { data } = await this.enviar('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false });
    await writeFile(path.join(salida, nombre + '.png'), Buffer.from(data, 'base64'));
  }
  async cerrar() { this.socket.close(); }
}

let chrome;
let dev;
let produccion;
let perfil;
let puertoChrome;
const pestanas = [];
async function nuevaPestana() {
  const objetivo = await (await fetch(`http://127.0.0.1:${puertoChrome}/json/new?about:blank`, { method: 'PUT' })).json();
  const socket = new WebSocket(objetivo.webSocketDebuggerUrl);
  await new Promise((resolve, reject) => { socket.onopen = resolve; socket.onerror = reject; });
  const pestana = new Pestana(socket);
  pestanas.push(pestana);
  await pestana.enviar('Page.enable');
  await pestana.enviar('Runtime.enable');
  await pestana.enviar('Network.enable');
  await pestana.enviar('Emulation.setDeviceMetricsOverride', { width: 1280, height: 900, deviceScaleFactor: 1, mobile: false });
  return pestana;
}

async function escenarioPublico(base, entorno) {
  const tab = await nuevaPestana();
  const contiene = (texto) => `document.body.innerText.includes(${JSON.stringify(texto)})`;
  // Retiene la primera respuesta para observar el estado inicial sin depender de la velocidad del equipo.
  let categoriaRetenida;
  if (entorno === 'desarrollo') {
    await tab.enviar('Fetch.enable', { patterns: [{ urlPattern: '*api/categorias' }] });
    tab.eventos.set('Fetch.requestPaused', [({ requestId }) => { categoriaRetenida = requestId; }]);
  }
  await tab.navegar(base);
  if (entorno === 'desarrollo') {
    await comprobar('Desarrollo: indicador al iniciar la consulta', async () => {
      await tab.esperar(`document.querySelector('[aria-busy="true"]')`);
      const inicio = Date.now();
      while (!categoriaRetenida && Date.now() - inicio < 5000) await pausa(20);
      assert.ok(categoriaRetenida, 'No se capturó la petición de categorías.');
      await tab.enviar('Fetch.continueRequest', { requestId: categoriaRetenida });
      await tab.enviar('Fetch.disable');
    });
  }
  await comprobar(entorno + ': inicio y categorías', async () => {
    await tab.esperar(`document.querySelectorAll('main img[alt^="Ilustración"]').length === 3 && !document.querySelector('[aria-busy="true"]')`);
    assert.equal(await tab.evaluar(contiene('Tu próxima historia empieza aquí.')), true);
    await tab.captura(entorno + '-inicio');
  });
  await comprobar(entorno + ': logo circular cargado con fondo de cabecera', async () => {
    const logo = await tab.evaluar(`(() => { const img=document.querySelector('header img'); const caja=img.parentElement; return {cargado:img.complete&&img.naturalWidth>0,radio:getComputedStyle(caja).borderRadius,fondo:getComputedStyle(caja).backgroundColor,cabecera:getComputedStyle(document.querySelector('header')).backgroundColor}; })()`);
    assert.equal(logo.cargado, true); assert.equal(logo.radio, '50%'); assert.equal(logo.fondo, logo.cabecera);
  });
  await comprobar(entorno + ': navegación categorías y reutilización de caché', async () => {
    await tab.pulsar('Todas las categorías');
    await tab.esperar(`document.querySelectorAll('main img[alt^="Ilustración"]').length === 6`);
    const categoriaRequests = tab.peticiones.filter((url) => /\/(api\/categorias|mock\/categorias\.json)(\?|$)/.test(url));
    assert.equal(categoriaRequests.length, 1, 'categorías debe consultarse una sola vez, incluso con StrictMode');
  });
  await tab.ruta('/catalogo');
  await comprobar(entorno + ': catálogo y portadas completas', async () => {
    await tab.esperar(`document.querySelectorAll('main h3').length === 16`);
    await tab.evaluar(`Promise.all([...document.querySelectorAll('main img')].map(img => {img.loading='eager'; return img.decode();}))`);
    assert.equal(await tab.evaluar(`document.querySelectorAll('main img[alt^="Portada"]').length`), 16);
    assert.equal(await tab.evaluar(`/REST|PFY2202|Semana 4|React Router|caché|Simulador de errores/.test(document.body.innerText)`), false);
  });
  const antesFiltros = tab.peticiones.filter((url) => /\/(api\/|mock\/)/.test(url)).length;
  await comprobar(entorno + ': búsqueda sin tildes y sin consultas adicionales', async () => {
    await tab.escribir('input', 'FUNDACION');
    await tab.esperar(`document.querySelectorAll('main h3').length === 1 && ${contiene('Fundación')}`);
    assert.equal(tab.peticiones.filter((url) => /\/(api\/|mock\/)/.test(url)).length, antesFiltros);
  });
  await comprobar(entorno + ': estado vacío', async () => {
    await tab.escribir('input', 'zzzz-sin-coincidencias');
    await tab.esperar(contiene('No se encontraron resultados'));
    assert.equal(await tab.evaluar(`!!document.querySelector('[aria-busy="true"]')`), false);
    await tab.escribir('input', '');
    await tab.esperar(`document.querySelectorAll('main h3').length === 16`);
  });
  await comprobar(entorno + ': detalle y regreso al catálogo', async () => {
    await tab.evaluar(`document.querySelector('main a[href*="/libro/"]').click()`);
    await tab.esperar(contiene('Primera publicación:'));
    await tab.pulsar('Volver al catálogo');
    await tab.esperar(`document.querySelectorAll('main h3').length === 16`);
    assert.equal(tab.peticiones.filter((url) => /\/(api\/libros|mock\/libros\.json)(\?|$)/.test(url)).length, 1);
  });
  await comprobar(entorno + ': filtro por categoría en URL sin consulta adicional', async () => {
    await tab.ruta('/catalogo?categoria=ficcion');
    await tab.esperar(`document.querySelectorAll('main h3').length > 0 && document.querySelectorAll('main h3').length < 16`);
    assert.equal(tab.peticiones.filter((url) => /\/(api\/|mock\/)/.test(url)).length, antesFiltros);
  });
  await comprobar(entorno + ': ruta no encontrada y regreso', async () => {
    await tab.ruta('/ruta-inexistente');
    await tab.esperar(contiene('La página solicitada no existe'));
    await tab.pulsar('Volver al inicio');
    await tab.esperar(contiene('Tu próxima historia empieza aquí.'));
  });
  await comprobar(entorno + ': móvil 320px, menú y recursos sin deformación', async () => {
    await tab.enviar('Emulation.setDeviceMetricsOverride', { width: 320, height: 800, deviceScaleFactor: 1, mobile: true });
    await tab.esperar(`!!document.querySelector('[aria-label="Abrir menú"]')`);
    assert.equal(await tab.evaluar('document.documentElement.scrollWidth <= innerWidth'), true);
    await tab.evaluar(`document.querySelector('[aria-label="Abrir menú"]').click()`);
    await tab.esperar(`!!document.querySelector('[aria-label="Cerrar menú"]')`);
    await tab.evaluar(`document.querySelector('[aria-label="Cerrar menú"]').click()`);
    await tab.ruta('/catalogo');
    await tab.esperar(`document.querySelectorAll('main h3').length === 16`);
    assert.equal(await tab.evaluar('document.documentElement.scrollWidth <= innerWidth'), true);
    await tab.captura(entorno + '-catalogo-movil');
  });
  await comprobar(entorno + ': sin excepciones JavaScript públicas', async () => assert.deepEqual(tab.excepciones, []));
}

async function probarDiagnostico(base, entorno) {
  const tab = await nuevaPestana();
  await tab.navegar(base + '#/diagnostico');
  await tab.esperar(`!!document.querySelector('#diagnostico-escenario')`);
  for (const [modo, codigo] of [['404', 'NO_ENCONTRADO'], ['500', 'SERVIDOR'], ['red', 'RED'], ['json', 'JSON'], ['formato', 'FORMATO'], ['timeout', 'TIMEOUT']]) {
    await comprobar(`${entorno}: diagnóstico ${modo} y retiro del indicador tras fallo`, async () => {
      await tab.seleccionar('#diagnostico-escenario', modo);
      await tab.pulsar('Ejecutar prueba');
      await tab.esperar(`document.body.innerText.includes(${JSON.stringify(codigo)}) && !document.querySelector('[aria-busy="true"]')`);
      assert.equal(await tab.evaluar(`!!document.querySelector('[role="alert"]')`), true);
      if (modo === '404') assert.equal(await tab.evaluar(`document.body.innerText.includes('HTTP 404 real')`), true);
      if (modo === '500') assert.equal(await tab.evaluar(`document.body.innerText.includes(${JSON.stringify('HTTP 500 ' + (entorno === 'desarrollo' ? 'real' : 'simulado'))})`), true);
      if (modo === '500') await tab.captura(entorno + '-diagnostico-500');
    });
  }
  await comprobar(entorno + ': diagnóstico recupera modo normal sin contaminar catálogo', async () => {
    await tab.pulsar('Volver al modo normal');
    await tab.esperar(`document.body.innerText.includes('Estado: correcto')`);
    await tab.ruta('/catalogo');
    await tab.esperar(`document.querySelectorAll('main h3').length === 16`);
    assert.equal(tab.peticiones.filter((url) => /\/(api\/libros|mock\/libros\.json)$/.test(url)).length >= 1, true);
  });
  await comprobar(entorno + ': desconexión real del navegador y recuperación por reintento', async () => {
    await tab.ruta('/diagnostico');
    await tab.esperar(`!!document.querySelector('#diagnostico-escenario')`);
    await tab.enviar('Network.emulateNetworkConditions', { offline: true, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
    await tab.pulsar('Ejecutar prueba');
    await tab.esperar(`document.body.innerText.includes('Código: RED')`);
    await tab.enviar('Network.emulateNetworkConditions', { offline: false, latency: 0, downloadThroughput: -1, uploadThroughput: -1 });
    await tab.pulsar('Reintentar prueba');
    await tab.esperar(`document.body.innerText.includes('Estado: correcto') && !document.body.innerText.includes('Código: RED')`);
  });
}

async function probarHook(base) {
  const tab = await nuevaPestana();
  await tab.navegar(base + 'tests/fixtures/hooks.html');
  const estado = (expresion) => `(() => { const e=JSON.parse(document.querySelector('#estado-hook').textContent); return ${expresion}; })()`;
  await tab.esperar('window.hookPruebas?.consultas === 1');
  await comprobar('Hook: carga inicial, éxito y retiro del indicador', async () => {
    assert.equal(await tab.evaluar(estado('e.cargando')), true);
    await tab.evaluar(`hookPruebas.resolver(0,[{id:'valido'}])`);
    await tab.esperar(estado('!e.cargando && e.datos[0]?.id === "valido" && !e.error'));
  });
  await comprobar('Hook: fallo de refresco conserva datos válidos y permite reintentar', async () => {
    await tab.evaluar('hookPruebas.reintentar()');
    await tab.esperar('hookPruebas.consultas === 2');
    assert.equal(await tab.evaluar(estado('e.cargando')), true);
    await tab.evaluar('hookPruebas.rechazar(1)');
    await tab.esperar(estado('!e.cargando && e.error === "RED" && e.datos[0]?.id === "valido"'));
    await tab.evaluar('hookPruebas.reintentar()');
    await tab.esperar('hookPruebas.consultas === 3');
    await tab.evaluar('hookPruebas.resolver(2,[])');
    await tab.esperar(`document.body.innerText.includes('No se encontraron resultados')`);
    assert.equal(await tab.evaluar('hookPruebas.invalidaciones'), 2);
  });
  await comprobar('Hook: respuestas fuera de orden no sobrescriben la pantalla actual', async () => {
    await tab.evaluar('hookPruebas.cambiar("categorias")');
    await tab.esperar('hookPruebas.consultas === 4');
    await tab.evaluar('hookPruebas.cambiar("libros")');
    await tab.esperar('hookPruebas.consultas === 5');
    await tab.evaluar(`hookPruebas.resolver(4,[{id:'nuevo'}])`);
    await tab.esperar(estado('!e.cargando && e.datos[0]?.id === "nuevo"'));
    await tab.evaluar(`hookPruebas.resolver(3,[{id:'atrasado'}])`);
    await pausa(80);
    assert.equal(await tab.evaluar(estado('e.datos[0].id')), 'nuevo');
  });
}

async function probarFalloAuxiliar(base, entorno) {
  const tab = await nuevaPestana();
  let bloquear = true;
  await tab.enviar('Fetch.enable', { patterns: [{ urlPattern: '*categorias*' }] });
  tab.eventos.set('Fetch.requestPaused', [async ({ requestId }) => {
    try {
      if (bloquear) await tab.enviar('Fetch.fulfillRequest', { requestId, responseCode: 500, responseHeaders: [{ name: 'Content-Type', value: 'application/json' }], body: Buffer.from('{}').toString('base64') });
      else await tab.enviar('Fetch.continueRequest', { requestId });
    } catch (error) { tab.excepciones.push(error.message); }
  }]);
  await tab.navegar(base + '#/catalogo');
  await comprobar(entorno + ': fallo auxiliar de categorías conserva libros y ofrece reintento', async () => {
    await tab.esperar(`document.querySelectorAll('main h3').length === 16 && [...document.querySelectorAll('button')].some(e => e.textContent.trim() === 'Reintentar categorías')`);
    assert.equal(await tab.evaluar(`!!document.querySelector('[aria-busy="true"]')`), false);
    bloquear = false;
    await tab.pulsar('Reintentar categorías');
    await tab.esperar(`!document.querySelector('[role="alert"]')`);
    assert.equal(await tab.evaluar(`document.querySelectorAll('main h3').length`), 16);
  });
}

async function probarFalloPrincipal(base, entorno) {
  const tab = await nuevaPestana();
  let bloquear = true;
  await tab.enviar('Fetch.enable', { patterns: [{ urlPattern: '*api/libros*' }, { urlPattern: '*mock/libros.json*' }] });
  tab.eventos.set('Fetch.requestPaused', [async ({ requestId }) => {
    try {
      if (bloquear) await tab.enviar('Fetch.fulfillRequest', { requestId, responseCode: 500, responseHeaders: [{ name: 'Content-Type', value: 'application/json' }], body: Buffer.from('{}').toString('base64') });
      else await tab.enviar('Fetch.continueRequest', { requestId });
    } catch (error) { tab.excepciones.push(error.message); }
  }]);
  await tab.navegar(base + '#/catalogo');
  await comprobar(entorno + ': fallo de libros no anuncia éxito ni vacío y permite recuperación', async () => {
    await tab.esperar(`document.body.innerText.includes('Reintentar libros') && !document.querySelector('[aria-busy="true"]')`);
    assert.equal(await tab.evaluar(`/libros encontrados|No se encontraron resultados/.test(document.body.innerText)`), false);
    assert.equal(await tab.evaluar(`document.querySelectorAll('main h3').length`), 0);
    bloquear = false;
    await tab.pulsar('Reintentar libros');
    await tab.esperar(`document.querySelectorAll('main h3').length === 16 && !document.querySelector('[role="alert"]')`);
  });
}

try {
  assert.equal(typeof WebSocket, 'function', 'Utiliza Node20.10+ y --experimental-websocket para estas pruebas.');
  await access(path.join(raiz, 'dist/index.html'));
  perfil = await mkdtemp(path.join(tmpdir(), 'libreria-browser-'));
  chrome = spawn(await encontrarChrome(), ['--headless=new', '--no-first-run', '--no-default-browser-check', '--remote-debugging-port=0', '--user-data-dir=' + perfil, ...(process.env.CI ? ['--no-sandbox'] : []), 'about:blank'], { windowsHide: true, stdio: 'ignore' });
  let falloChrome;
  chrome.on('error', (error) => { falloChrome = error; });
  for (let i = 0; i < 200; i++) {
    if (falloChrome) throw falloChrome;
    try { puertoChrome = Number((await readFile(path.join(perfil, 'DevToolsActivePort'), 'utf8')).split('\n')[0]); break; } catch { await pausa(50); }
  }
  assert.ok(puertoChrome, 'Chrome no inició el puerto DevTools.');
  dev = await createServer({ root: raiz, server: { host: '127.0.0.1', port: 0 } });
  await dev.listen();
  produccion = await preview({ root: raiz, base: '/semana4/', preview: { host: '127.0.0.1', port: 0 } });
  const baseDev = `http://127.0.0.1:${dev.httpServer.address().port}/`;
  const baseProd = `http://127.0.0.1:${produccion.httpServer.address().port}/semana4/`;
  await comprobar('REST real: categorías, libros, filtro, detalle y errores 404/500/400', async () => {
    const casos = [['categorias', 200], ['libros', 200], ['libros?categoria=ficcion', 200], ['libros/L001', 200], ['libros/NO-EXISTE', 404], ['libros?error=500', 500], ['libros/%ZZ', 400]];
    for (const [ruta, codigo] of casos) {
      const respuesta = await fetch(baseDev + 'api/' + ruta);
      assert.equal(respuesta.status, codigo, ruta);
      const cuerpo = await respuesta.json();
      if (ruta === 'libros?categoria=ficcion') assert.ok(cuerpo.length && cuerpo.every(libro => libro.categoriaId === 'ficcion'));
      if (ruta === 'libros/L001') assert.equal(cuerpo.id, 'L001');
    }
  });
  await comprobar('Producción estática en subcarpeta: JSON y todas las imágenes por HTTP', async () => {
    for (const recurso of ['categorias', 'libros']) {
      const respuesta = await fetch(baseProd + 'mock/' + recurso + '.json');
      assert.equal(respuesta.status, 200);
      const datos = await respuesta.json();
      for (const item of datos) {
        const imagen = await fetch(baseProd + (item.portada || item.imagen));
        assert.equal(imagen.status, 200);
        assert.match(imagen.headers.get('content-type'), /image\//);
      }
    }
    assert.match((await fetch(baseProd + 'images/marca/logo-horizonte.png')).headers.get('content-type'), /image\//);
  });
  for (const [base, entorno] of [[baseDev, 'desarrollo'], [baseProd, 'produccion']]) {
    await escenarioPublico(base, entorno);
    await probarFalloAuxiliar(base, entorno);
    await probarFalloPrincipal(base, entorno);
    await probarDiagnostico(base, entorno);
  }
  await probarHook(baseDev);
} catch (error) {
  console.error(error);
  for (const [indice, tab] of pestanas.entries()) await tab.captura('fallo-' + indice).catch(() => {});
  process.exitCode = 1;
} finally {
  await writeFile(path.join(salida, 'resultados.json'), JSON.stringify({ fecha: new Date().toISOString(), resultados }, null, 2) + '\n');
  for (const tab of pestanas) await tab.cerrar();
  if (dev) await dev.close();
  if (produccion) await new Promise(resolve => produccion.httpServer.close(resolve));
  if (chrome && chrome.exitCode === null) {
    const fin = new Promise(resolve => chrome.once('exit', resolve));
    chrome.kill();
    await Promise.race([fin, pausa(2000)]);
  }
  if (perfil && path.dirname(path.resolve(perfil)) === path.resolve(tmpdir()) && path.basename(perfil).startsWith('libreria-browser-')) {
    await rm(perfil, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 }).catch(error => console.warn('Perfil temporal retenido:', error.message));
  }
  console.log(`${resultados.filter(r => r.estado === 'aprobado').length}/${resultados.length} comprobaciones de navegador aprobadas.`);
}
