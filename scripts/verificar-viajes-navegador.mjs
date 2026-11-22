// Verificación de interfaz Semana 5 en Chromium usando DevTools Protocol.
// Sin dependencias de test adicionales. Node 20 requiere --experimental-websocket.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { access, mkdtemp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createServer, preview } from 'vite';

const wait = (ms) => new Promise(r=>setTimeout(r,ms));
async function chromePath() {
  for (const candidate of [process.env.CHROME_PATH, '/usr/bin/google-chrome','/usr/bin/chromium','/usr/bin/chromium-browser',
    'C:/Program Files/Google/Chrome/Application/chrome.exe','C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe'].filter(Boolean)) {
    try { await access(candidate); return candidate; } catch {}
  }
  throw Error('Se requiere Chrome/Chromium o Edge. Establece CHROME_PATH.');
}
class CDP {
  constructor(ws) {
    this.ws=ws;this.counter=0;this.pending=new Map();this.requests=[];this.errors=[];
    ws.onmessage=({data})=>{
      const msg=JSON.parse(data);
      const entry=this.pending.get(msg.id);
      if(entry){this.pending.delete(msg.id);clearTimeout(entry.timer);msg.error?entry.reject(Error(msg.error.message)):entry.resolve(msg.result)}
      if(msg.method==='Network.requestWillBeSent'){
        const url=msg.params.request.url;
        if(/\/(api\/destinos|graphql)(\?|$)/.test(url)) this.requests.push({method:msg.params.request.method,url,postData:msg.params.request.postData||''});
      }
      if(msg.method==='Runtime.exceptionThrown')this.errors.push(msg.params.exceptionDetails.text);
    };
  }
  send(method,params={}){
    return new Promise((resolve,reject)=>{
      const id=++this.counter,timer=setTimeout(()=>{this.pending.delete(id);reject(Error('CDP timeout '+method))},16000);
      this.pending.set(id,{resolve,reject,timer});this.ws.send(JSON.stringify({id,method,params}));
    });
  }
  async eval(expression){
    const r=await this.send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});
    if(r.exceptionDetails)throw Error(r.exceptionDetails.exception?.description||r.exceptionDetails.text);
    return r.result.value;
  }
  async until(expression,label,limit=18000){
    const start=Date.now();
    while(Date.now()-start<limit){try{if(await this.eval(expression))return;}catch{}await wait(80);}
    const snippet=await this.eval('document.body.innerText.slice(0,500)').catch(()=>'<sin DOM>');
    throw Error('Fallo al esperar '+label+': '+snippet);
  }
  async click(selector){
    await this.eval('(()=>{const el=document.querySelector('+JSON.stringify(selector)+');if(!el)throw Error("No existe control");el.click()})()');
  }
}
const salida=path.resolve('output/semana5');
await mkdir(salida,{recursive:true});
const tmp=await mkdtemp(path.join(tmpdir(),'viajes-chrome-'));
let port=0;
let browser,server,prod;
let approved=0;
try{
  const executable=await chromePath();
  let chromeStderr='';
  browser=spawn(executable,['--headless=new','--no-sandbox','--disable-gpu','--disable-dev-shm-usage','--no-first-run','--no-default-browser-check',
    '--remote-allow-origins=*','--remote-debugging-port=0','--user-data-dir='+tmp,'about:blank'],{stdio:['ignore','ignore','pipe']});
  browser.stderr.on('data',chunk=>{ chromeStderr=(chromeStderr+chunk.toString()).slice(-4000); });
  let endpoint=false;
  for(let i=0;i<200;i++){
    try {
      const registro=(await readFile(path.join(tmp,'DevToolsActivePort'),'utf8')).trim().split(String.fromCharCode(10))[0];
      if(Number.isInteger(Number(registro)) && Number(registro)>0){
        port=Number(registro);
        const respuesta=await fetch('http://127.0.0.1:'+port+'/json/version');
        if(respuesta.ok){ endpoint=true; break; }
      }
    }catch{}
    if(browser.exitCode!==null)break;
    await wait(100);
  }
  if(!endpoint)throw Error('No inició Chromium. Código: '+browser.exitCode+'; stderr: '+chromeStderr);
  server=await createServer({server:{host:'127.0.0.1',port:5517,strictPort:true}});
  await server.listen();
  prod=await preview({preview:{host:'127.0.0.1',port:4517,strictPort:true}});
  for(const item of [{name:'desarrollo',base:'http://127.0.0.1:5517/'},{name:'producción local',base:'http://127.0.0.1:4517/'}]){
    const info=await (await fetch('http://127.0.0.1:'+port+'/json/new?about:blank',{method:'PUT'})).json();
    const socket=new WebSocket(info.webSocketDebuggerUrl);
    await new Promise((resolve,reject)=>{socket.onopen=resolve;socket.onerror=reject});
    const tab=new CDP(socket);
    await tab.send('Page.enable');await tab.send('Network.enable');await tab.send('Runtime.enable');
    await tab.send('Emulation.setDeviceMetricsOverride',{width:1365,height:850,deviceScaleFactor:1,mobile:false});
    await tab.send('Page.navigate',{url:item.base});
    await tab.until('document.querySelector("h1")?.textContent.includes("Tu próximo viaje")',item.name+' inicio');
    await tab.until('document.querySelectorAll(\'a[href*="/destinos/"]\').length===3',item.name+' tarjetas');
    assert.ok(tab.requests.some(x=>x.method==='GET'&&x.url.includes('/api/destinos')));
    console.log('✓ '+item.name+' carga inicial y GET REST');approved++;
    const capturaInicio=await tab.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
    await writeFile(path.join(salida,item.name.replaceAll(' ','-')+'-inicio.png'),Buffer.from(capturaInicio.data,'base64'));
    await tab.click('a[href="#/destinos"]');
    await tab.until('document.querySelectorAll(\'a[href*="/destinos/"]\').length===6',item.name+' destinos');
    console.log('✓ '+item.name+' catálogo de seis destinos');approved++;
    await tab.click('a[href="#/destinos/cusco"]');
    await tab.until('document.body.innerText.includes("Vuelos disponibles") && document.body.innerText.includes("Hoteles disponibles")',item.name+' GraphQL');
    assert.ok(tab.requests.some(x=>x.method==='POST'&&x.url.includes('/graphql')));
    assert.ok(await tab.eval('document.body.innerText.includes("Andes Boutique")'));
    console.log('✓ '+item.name+' POST GraphQL y opciones específicas de Cusco');approved++;
    const capturaDetalle=await tab.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
    await writeFile(path.join(salida,item.name.replaceAll(' ','-')+'-detalle.png'),Buffer.from(capturaDetalle.data,'base64'));
    await tab.eval('(()=>{const boton=[...document.querySelectorAll("button")].find(b=>b.textContent.includes("Actualizar información"));if(!boton)throw Error("No existe actualizar");boton.click()})()');
    await tab.until('document.body.innerText.includes("Actualizando") && document.body.innerText.includes("Vuelos disponibles")',item.name+' actualización conservando listado');
    await tab.send('Emulation.setDeviceMetricsOverride',{width:375,height:812,deviceScaleFactor:1,mobile:true});
    await wait(250);
    assert.ok(await tab.eval('document.documentElement.scrollWidth <= window.innerWidth + 2'));
    console.log('✓ '+item.name+' pantalla móvil sin overflow');approved++;
    const capturaMovil=await tab.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
    await writeFile(path.join(salida,item.name.replaceAll(' ','-')+'-movil.png'),Buffer.from(capturaMovil.data,'base64'));
    await tab.click('button[aria-label="Abrir menú"]');
    await tab.until('document.querySelector("[aria-expanded=true]") !== null',item.name+' menú móvil');
    const menuCaptura=await tab.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:false});
    await writeFile(path.join(salida,item.name.replaceAll(' ','-')+'-movil-menu.png'),Buffer.from(menuCaptura.data,'base64'));
    assert.equal(tab.errors.length,0,tab.errors.join(';'));
    console.log('✓ '+item.name+' sin excepciones de JavaScript');approved++;
    socket.close();
  }
  console.log('Validación de navegador: '+approved+'/'+approved+' comprobaciones aprobadas.');
} finally {
  if(prod?.httpServer)await new Promise(r=>prod.httpServer.close(r));
  if(server)await server.close();
  browser?.kill('SIGTERM');
  await rm(tmp,{recursive:true,force:true,maxRetries:4,retryDelay:200});
}
