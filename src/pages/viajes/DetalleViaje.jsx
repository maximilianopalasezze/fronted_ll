import { useCallback } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, CalendarDays, Plane, Hotel, MapPin, CheckCircle2, Compass, RefreshCw } from 'lucide-react';
import { obtenerDestinos, obtenerOpciones } from '../../services/viajesApi.js';
import { useConsultaViajes } from '../../hooks/useConsultaViajes.js';
import EstadosViajes from '../../components/viajes/EstadosViajes.jsx';

const moneda=(n)=>new Intl.NumberFormat('es-CL',{style:'currency',currency:'CLP',maximumFractionDigits:0}).format(n);
const fecha=(t)=>new Date(t+'T12:00:00').toLocaleDateString('es-CL',{day:'numeric',month:'short',year:'numeric'});

export default function DetalleViaje() {
  const {destinoId}=useParams();
  const consultarDestinos=useCallback((op)=>obtenerDestinos(op),[]);
  const consultarOpciones=useCallback((op)=>obtenerOpciones(destinoId,op),[destinoId]);
  const listado=useConsultaViajes('destinos', consultarDestinos);
  const opciones=useConsultaViajes('opciones:'+destinoId,consultarOpciones);
  const destino=listado.datos?.find(d=>d.id===destinoId);
  const existeLista=Array.isArray(listado.datos);
  const cargaPrincipal=(listado.cargando&&!listado.datos)||(opciones.cargando&&!opciones.datos);
  const errorPrincipal=opciones.error||listado.error;
  const refrescar=()=>{listado.refrescar();opciones.refrescar();};
  return <section className="max-w-7xl mx-auto px-5 md:px-8 py-10 md:py-15">
    <Link to="/destinos" className="inline-flex gap-2 items-center text-[#80e6dc] text-sm font-semibold hover:text-white"><ArrowLeft size={18}/> Volver a destinos</Link>
    {!cargaPrincipal && existeLista && !destino ? <div className="mt-9 rounded-2xl border border-amber-400/30 bg-amber-500/10 p-8"><h1 className="text-2xl font-bold">No encontramos este destino</h1><p className="text-slate-300 mt-3">Puedes elegir otro destino del catálogo.</p><Link to="/destinos" className="text-[#74dfd2] underline mt-4 block">Ver destinos</Link></div> : <>
      <div className="mt-9 flex flex-col lg:flex-row justify-between gap-6 items-start">
        <div><p className="uppercase text-[#75e4d7] tracking-[.19em] font-bold text-xs">PLANIFICA TU VIAJE</p><h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mt-3">{destino ? destino.emoji+' '+destino.nombre : 'Explora tu destino'}</h1><p className="text-slate-400 mt-3 max-w-2xl leading-relaxed">{destino?.descripcion||'Consultando información de tu próximo viaje...'}</p>{destino && <p className="flex gap-2 items-center mt-4 text-[#80e6dc] font-semibold text-sm"><MapPin size={16}/>{destino.pais}</p>}</div>
        <button onClick={refrescar} className="rounded-xl inline-flex items-center gap-2 border border-[#73e0d6]/40 px-4 py-3 text-[#80e6dc] font-semibold hover:bg-[#69d9cd]/10"><RefreshCw size={17}/>Actualizar información</button>
      </div>
      {destino && <div className="flex flex-wrap gap-2 mt-7 mb-7">{destino.actividades.map(a=><span key={a} className="rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs text-slate-200"><Compass size={13} className="inline mr-1.5 text-[#71e0d4]"/>{a}</span>)}</div>}
      <div className="mt-9"><EstadosViajes cargando={cargaPrincipal} actualizando={listado.actualizando||opciones.actualizando} error={errorPrincipal} refrescar={refrescar} hayDatos={!!opciones.datos} etiqueta="las opciones de viaje"/></div>
      {opciones.datos && <div className="grid lg:grid-cols-2 gap-7 mt-8">
        <div><div className="flex items-center gap-3 mb-5"><span className="rounded-xl bg-[#61dacf]/15 p-3 text-[#61dacf]"><Plane size={25}/></span><div><h2 className="text-2xl font-extrabold">Vuelos disponibles</h2><p className="text-slate-400 text-sm">Opciones desde Santiago</p></div></div><div className="space-y-4">{opciones.datos.vuelos.map(v=><article key={v.id} className="bg-[#122637] border border-white/10 rounded-2xl p-6"><div className="flex justify-between gap-3"><div><h3 className="font-bold text-lg">{v.aerolinea}</h3><p className="text-xs text-slate-500 mt-1">{v.id}</p></div><strong className="text-[#83eadc] text-lg whitespace-nowrap">{moneda(v.precio)}</strong></div><p className="text-slate-300 text-sm mt-5 flex gap-2 items-center"><CalendarDays size={16}/>Salida: {fecha(v.salida)} · Regreso: {fecha(v.regreso)}</p><p className="mt-4 text-xs text-[#80e7d9] flex items-center gap-2"><CheckCircle2 size={15}/>{v.disponibles?v.cupos+' cupos de ejemplo':'Sin cupos'}</p></article>)}</div></div>
        <div><div className="flex items-center gap-3 mb-5"><span className="rounded-xl bg-[#e9b984]/15 p-3 text-[#ffd49f]"><Hotel size={25}/></span><div><h2 className="text-2xl font-extrabold">Hoteles disponibles</h2><p className="text-slate-400 text-sm">Opciones para tu estadía</p></div></div><div className="space-y-4">{opciones.datos.hoteles.map(h=><article key={h.id} className="bg-[#122637] border border-white/10 rounded-2xl p-6"><div className="flex justify-between gap-3"><div><h3 className="font-bold text-lg">{h.nombre}</h3><p className="text-amber-300 text-sm mt-2" aria-label={h.estrellas+' estrellas'}>{'★'.repeat(h.estrellas)}</p></div><strong className="text-[#83eadc] text-lg whitespace-nowrap">{moneda(h.precioNoche)}</strong></div><p className="text-slate-400 text-xs mt-1">Por noche, tarifa de ejemplo</p><p className="mt-3 text-slate-300 text-sm flex gap-2 items-center"><CalendarDays size={16}/>Estancia sugerida: {fecha(h.fechaEntrada)} al {fecha(h.fechaSalida)}</p><p className="mt-5 text-xs text-[#80e7d9] flex items-center gap-2"><CheckCircle2 size={15}/>{h.disponibles?h.habitaciones+' habitaciones de ejemplo':'Sin habitaciones'}</p></article>)}</div></div>
      </div>}
      {!cargaPrincipal && !errorPrincipal && opciones.datos && <p className="mt-8 text-sm text-slate-400 border-l-2 border-[#6dded0] pl-4">Este sitio utiliza información simulada para fines académicos. No ofrece compras ni reservas reales.</p>}
    </>}
  </section>;
}
