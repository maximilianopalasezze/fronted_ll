import { Link } from 'react-router-dom';
import { ArrowUpRight, MapPin } from 'lucide-react';
import { estiloFotoDestino } from '../../utils/imagenesDestinos.js';
const fondos={ azul:'from-[#285781] via-[#2b7890] to-[#1d394d]',terracota:'from-[#8f4735] via-[#ac6c4f] to-[#57332f]',rosa:'from-[#9a4569] via-[#a66e89] to-[#472a5d]',verde:'from-[#34715e] via-[#55917b] to-[#1a3d4e]',turquesa:'from-[#1a8b9a] via-[#48aba0] to-[#194f67]',naranja:'from-[#a85c34] via-[#d08b58] to-[#65415a]'};
export default function DestinoCard({destino}) {
  return <Link to={'/destinos/'+destino.id} className="group block rounded-3xl bg-[#112434] border border-white/10 overflow-hidden hover:border-[#66ddd0]/70 hover:-translate-y-1 transition-all duration-200 focus-visible:outline-2 focus-visible:outline-[#66ddd0]">
    <div className={'relative h-48 overflow-hidden bg-gradient-to-br '+(fondos[destino.color]||fondos.azul)}>
      <div role="img" aria-label={'Fotografía de ' + destino.nombre} className="absolute inset-0 transition-transform duration-300 group-hover:scale-105" style={estiloFotoDestino(destino.id)}/>
      <div className="absolute inset-0 bg-gradient-to-t from-[#081521]/85 via-transparent to-[#081521]/20 pointer-events-none"/>
      <span className="absolute bottom-5 left-6 inline-flex items-center gap-1.5 text-xs font-bold text-white drop-shadow"><MapPin size={14}/>{destino.pais}</span>
      <span className="absolute top-5 left-5 text-[10px] uppercase tracking-widest font-semibold bg-black/20 border border-white/20 rounded-full px-3 py-1.5">Destino destacado</span>
    </div>
    <div className="px-6 py-6"><div className="flex items-center justify-between"><h3 className="text-2xl font-extrabold tracking-tight">{destino.nombre}</h3><span className="grid place-items-center w-9 h-9 rounded-full border border-white/20 group-hover:bg-[#61dacf] group-hover:text-[#081521] transition"><ArrowUpRight size={17}/></span></div>
      <p className="mt-2 text-slate-400 text-sm leading-relaxed">{destino.lema}</p>
      <p className="mt-5 text-xs text-slate-300"><strong className="text-[#74e0d5]">Explora:</strong> {destino.actividades.slice(0,2).join(' · ')}</p>
    </div>
  </Link>;
}
