import { AlertCircle, RefreshCw } from 'lucide-react';

export default function EstadosViajes({ cargando, actualizando, error, refrescar, hayDatos, etiqueta = 'información' }) {
  return <div role="status" aria-live="polite" className="space-y-4">
    {cargando && !hayDatos && <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5" aria-busy="true" aria-label={'Cargando '+etiqueta}>{[0,1,2].map(i=><div key={i} className="h-64 rounded-3xl border border-white/10 bg-white/5 animate-pulse"><div className="h-36 rounded-t-3xl bg-white/5"/><div className="h-5 w-40 bg-white/10 rounded mt-6 mx-5"/><div className="h-4 w-60 bg-white/5 rounded mt-4 mx-5"/></div>)}</div>}
    {actualizando && hayDatos && <p className="inline-flex items-center gap-2 text-sm text-[#70dfd3]"><RefreshCw size={16} className="animate-spin"/> Actualizando {etiqueta} sin ocultar lo que ya estás viendo...</p>}
    {error && <div role="alert" className="rounded-2xl border border-rose-400/40 bg-rose-500/10 p-5 flex items-start gap-3"><AlertCircle className="shrink-0 text-rose-300 mt-1" size={22}/><div className="flex-1"><strong className="text-rose-100">No pudimos cargar {etiqueta}</strong><p className="text-rose-100/80 text-sm mt-1">{error.message}</p><button onClick={refrescar} className="mt-3 rounded-lg bg-rose-200 text-rose-950 px-4 py-2 font-semibold text-sm hover:bg-white">Reintentar</button></div></div>}
  </div>;
}
