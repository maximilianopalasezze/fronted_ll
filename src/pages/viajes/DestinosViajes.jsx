import { useCallback, useMemo, useState } from 'react';
import { MapPinned, Search, RefreshCw } from 'lucide-react';
import { obtenerDestinos } from '../../services/viajesApi.js';
import { useConsultaViajes } from '../../hooks/useConsultaViajes.js';
import DestinoCard from '../../components/viajes/DestinoCard.jsx';
import EstadosViajes from '../../components/viajes/EstadosViajes.jsx';

export default function DestinosViajes() {
  const consultar=useCallback((op)=>obtenerDestinos(op),[]);
  const {datos,cargando,actualizando,error,refrescar}=useConsultaViajes('destinos',consultar);
  const [busqueda,setBusqueda]=useState('');
  const [region,setRegion]=useState('Todas');
  const destinos=useMemo(()=> (datos||[]).filter(d=>{
    const texto=(d.nombre+' '+d.pais+' '+d.actividades.join(' ')).normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
    const q=busqueda.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
    return texto.includes(q) && (region==='Todas'||d.continente===region);
  }),[datos,busqueda,region]);
  return <section className="max-w-7xl mx-auto px-5 md:px-8 py-13">
    <p className="text-[#71e0d4] uppercase text-xs font-bold tracking-[.2em]">ELIGE TU PRÓXIMA AVENTURA</p>
    <h1 className="mt-3 text-4xl md:text-5xl font-extrabold tracking-tight">Explora nuestros destinos</h1>
    <p className="mt-4 text-slate-400 max-w-2xl leading-7">Recorre las opciones disponibles, descubre sus actividades populares y selecciona el lugar que más te inspire.</p>
    <div className="mt-9 mb-7 rounded-2xl bg-[#112434] border border-white/10 p-4 grid md:grid-cols-[1fr_240px_auto] gap-3">
      <label className="flex items-center gap-3 bg-[#0a1929] rounded-xl px-4 text-slate-400 border border-white/10"><Search size={19}/><span className="sr-only">Buscar destinos</span><input type="search" value={busqueda} onChange={e=>setBusqueda(e.target.value)} placeholder="Busca un destino, país o actividad..." className="bg-transparent min-w-0 w-full outline-none h-12 text-white placeholder:text-slate-500 text-sm"/></label>
      <label className="sr-only" htmlFor="region">Filtrar por región</label>
      <select id="region" value={region} onChange={e=>setRegion(e.target.value)} className="h-12 rounded-xl bg-[#0a1929] border border-white/10 px-4 text-white text-sm">
        {['Todas','Europa','Asia','Sudamérica','Norteamérica'].map(v=><option key={v} value={v}>{v==='Todas'?'Todas las regiones':v}</option>)}
      </select>
      <button onClick={refrescar} className="h-12 flex items-center justify-center gap-2 rounded-xl border border-[#61dacf]/40 text-[#74e4d7] px-4 hover:bg-[#61dacf]/10 font-semibold text-sm"><RefreshCw size={17}/>Actualizar</button>
    </div>
    <div className="mb-6 text-slate-400 text-sm flex items-center gap-2"><MapPinned size={17} className="text-[#73ded5]"/>{cargando&&!datos?'Cargando destinos…':destinos.length+' destinos encontrados'}</div>
    <EstadosViajes cargando={cargando} actualizando={actualizando} error={error} refrescar={refrescar} hayDatos={!!datos} etiqueta="destinos"/>
    {destinos.length>0 && <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">{destinos.map(d=><DestinoCard key={d.id} destino={d}/>)}</div>}
    {!cargando && !error && destinos.length===0 && <div className="rounded-2xl border border-white/10 bg-[#122637] p-12 text-center"><Search className="mx-auto text-[#70d5c9]" size={36}/><h2 className="mt-4 text-xl font-bold">No encontramos destinos</h2><p className="text-slate-400 mt-2">Prueba con otra búsqueda o región.</p></div>}
  </section>;
}
