import { Link } from 'react-router-dom';
import { useCallback } from 'react';
import { ArrowRight, Globe2, MapPinned, ShieldCheck, Ticket, MoveUpRight } from 'lucide-react';
import { obtenerDestinos } from '../../services/viajesApi.js';
import { useConsultaViajes } from '../../hooks/useConsultaViajes.js';
import DestinoCard from '../../components/viajes/DestinoCard.jsx';
import EstadosViajes from '../../components/viajes/EstadosViajes.jsx';

export default function InicioViajes() {
  const consultar=useCallback((op)=>obtenerDestinos(op),[]);
  const {datos, cargando, actualizando, error, refrescar}=useConsultaViajes('destinos',consultar);
  const destinos=datos||[];
  return <>
    <section className="relative overflow-hidden border-b border-white/10 bg-gradient-to-br from-[#0c2736] via-[#0e2233] to-[#122a3f]">
      <div className="absolute -right-28 top-[-100px] h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-3xl"/>
      <div className="absolute bottom-[-200px] right-1/3 h-[340px] w-[400px] rounded-full bg-blue-500/10 blur-3xl"/>
      <div className="mx-auto max-w-7xl px-5 md:px-8 py-20 md:py-27 relative grid lg:grid-cols-[1.1fr_.9fr] gap-12 items-center">
        <div className="max-w-2xl">
          <span className="inline-flex gap-2 items-center rounded-full bg-white/8 text-[#8ce8de] text-xs font-bold tracking-widest border border-[#71e8dc]/20 px-4 py-2"><Globe2 size={14}/> EL MUNDO TE ESPERA</span>
          <h1 className="text-5xl md:text-6xl xl:text-7xl leading-[1.07] tracking-[-.045em] font-extrabold mt-7">Tu próximo viaje <span className="text-[#61dacf]">empieza aquí.</span></h1>
          <p className="mt-7 max-w-lg leading-8 text-slate-300 text-base md:text-lg">Explora destinos únicos y descubre opciones de vuelos y hoteles para planificar tu próxima aventura, a tu ritmo.</p>
          <div className="flex flex-wrap gap-3 mt-9">
            <Link to="/destinos" className="inline-flex gap-2 items-center rounded-full bg-[#62dbce] text-[#092330] font-bold px-7 py-3.5 hover:bg-[#8cebe3] transition">Explorar destinos <ArrowRight size={19}/></Link>
            <a href="#destinos" className="inline-flex gap-2 items-center rounded-full border border-white/25 text-white font-semibold px-7 py-3.5 hover:bg-white/10 transition">Descubrir opciones</a>
          </div>
          <div className="grid grid-cols-3 gap-4 max-w-md mt-12 pt-8 border-t border-white/10"><div><b className="block text-2xl font-bold">6</b><span className="text-xs text-slate-400">Destinos</span></div><div><b className="block text-2xl font-bold">12</b><span className="text-xs text-slate-400">Vuelos de ejemplo</span></div><div><b className="block text-2xl font-bold">12</b><span className="text-xs text-slate-400">Hoteles de ejemplo</span></div></div>
        </div>
        <div className="relative hidden lg:flex items-center justify-center min-w-0">
          <div className="relative w-full max-w-[560px] aspect-[1.12]">
            <img
              src={`${import.meta.env.BASE_URL}images/hero/mundo.webp`}
              alt="Globo terráqueo con lugares turísticos y un avión que viaja alrededor del mundo"
              width="320"
              height="254"
              loading="eager"
              decoding="async"
              className="h-full w-full object-contain drop-shadow-[0_20px_40px_rgba(30,160,200,.18)]"
              style={{
                maskImage:'radial-gradient(ellipse at center, black 56%, rgba(0,0,0,.92) 72%, transparent 100%)',
                WebkitMaskImage:'radial-gradient(ellipse at center, black 56%, rgba(0,0,0,.92) 72%, transparent 100%)'
              }}
            />
          </div>
        </div>      </div>
    </section>
    <section className="mx-auto max-w-7xl px-5 md:px-8 py-17" id="destinos">
      <div className="flex flex-wrap gap-4 justify-between items-end mb-9"><div><p className="text-[#78e3d8] uppercase font-bold text-xs tracking-[.2em]">DESCUBRE EL MUNDO</p><h2 className="mt-3 text-3xl sm:text-4xl font-extrabold tracking-tight">Destinos para inspirarte</h2><p className="text-slate-400 mt-3">Un lugar para cada tipo de viajero.</p></div><Link to="/destinos" className="text-[#7ce3d7] font-bold inline-flex gap-2 items-center hover:text-white">Ver todos <MoveUpRight size={18}/></Link></div>
      <EstadosViajes cargando={cargando} actualizando={actualizando} error={error} refrescar={refrescar} hayDatos={!!datos} etiqueta="destinos"/>
      {!cargando && !error && destinos.length===0 && <p className="rounded-xl border border-white/15 p-6">No hay destinos disponibles por ahora.</p>}
      {destinos.length>0 && <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">{destinos.slice(0,3).map(destino=><DestinoCard key={destino.id} destino={destino}/>)}</div>}
      <div className="grid sm:grid-cols-3 gap-4 mt-16">
        {[{Icono:MapPinned,title:'Elige un destino',desc:'Conoce el país y descubre actividades para tu viaje.'},{Icono:Ticket,title:'Compara opciones',desc:'Consulta vuelos y hoteles de cada destino.'},{Icono:ShieldCheck,title:'Explora con claridad',desc:'Disponibilidad y precios de demostración, sin compras.'}].map(({Icono,title,desc})=><div key={title} className="flex gap-4 rounded-2xl border border-white/10 p-5 bg-white/[.03]"><div className="h-11 w-11 shrink-0 rounded-xl bg-[#61dacf]/10 text-[#68ddd2] grid place-items-center"><Icono size={22}/></div><div><b>{title}</b><p className="text-slate-400 text-sm leading-relaxed mt-2">{desc}</p></div></div>)}
      </div>
    </section>
  </>;
}
