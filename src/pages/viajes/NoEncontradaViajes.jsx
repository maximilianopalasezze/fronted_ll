import {Link} from 'react-router-dom';
import {Compass, ArrowLeft} from 'lucide-react';
export default function NoEncontradaViajes(){return <section className="min-h-[60vh] px-6 flex flex-col items-center justify-center text-center"><Compass size={50} className="text-[#63d6cb]"/><h1 className="text-5xl font-bold mt-5">404</h1><p className="mt-4 text-slate-300 max-w-md">Esa ruta no forma parte de nuestros destinos.</p><Link to="/" className="mt-7 inline-flex items-center gap-2 bg-[#61dacf] text-[#07212d] font-bold rounded-xl px-5 py-3"><ArrowLeft size={18}/> Volver al inicio</Link></section>}
