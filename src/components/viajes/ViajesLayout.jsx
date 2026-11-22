import { useState } from 'react';
import { Link, NavLink, Outlet } from 'react-router-dom';
import { ArrowUpRight, Compass, Menu, Plane, X } from 'lucide-react';

export default function ViajesLayout() {
  const [menu, setMenu] = useState(false);
  return <div className="min-h-screen flex flex-col bg-[#081521] text-slate-50">
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#081521]/95 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-5 md:px-8 h-20 flex items-center justify-between gap-3">
        <Link to="/" onClick={() => setMenu(false)} className="flex gap-3 items-center min-w-0">
          <span className="h-11 w-11 shrink-0 rounded-2xl grid place-items-center bg-gradient-to-br from-[#48d1cd] to-[#208caf] shadow-lg shadow-cyan-950/40"><Plane size={23} strokeWidth={2.5}/></span>
          <span className="flex flex-col leading-tight min-w-0"><strong className="text-xl font-extrabold tracking-tight">Andes{' '}<span className="text-[#58d6cc]">Viajes</span></strong><small className="text-[9px] sm:text-[10px] uppercase tracking-[.23em] text-slate-400 mt-1">Tu próxima aventura</small></span>
        </Link>
        <nav className="hidden md:flex items-center gap-2">
          <NavLink to="/" end className={({isActive}) => 'nav-link ' + (isActive ? 'nav-active' : '')}>Inicio</NavLink>
          <NavLink to="/destinos" className={({isActive}) => 'nav-link ' + (isActive ? 'nav-active' : '')}>Destinos</NavLink>
          <Link to="/destinos" className="ml-4 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-bold bg-[#61dacf] text-[#07212d] hover:bg-[#88ede2] transition">Explorar viajes <ArrowUpRight size={16}/></Link>
        </nav>
        <button className="md:hidden rounded-xl border border-white/20 p-2.5" aria-label={menu ? 'Cerrar menú':'Abrir menú'} aria-expanded={menu} onClick={() => setMenu(!menu)}>{menu ? <X/> : <Menu/>}</button>
      </div>
      {menu && <nav className="md:hidden border-t border-white/10 flex flex-col p-5 gap-2 bg-[#081521]">
        <NavLink to="/" end onClick={() => setMenu(false)} className="nav-link">Inicio</NavLink>
        <NavLink to="/destinos" onClick={() => setMenu(false)} className="nav-link">Destinos</NavLink>
      </nav>}
    </header>
    <main className="flex-1 w-full"><Outlet/></main>
    <footer className="border-t border-white/10 bg-[#07121d]">
      <div className="mx-auto max-w-7xl px-5 md:px-8 py-9 flex flex-col sm:flex-row justify-between gap-4">
        <div><span className="inline-flex items-center gap-2 font-bold"><Compass size={17} className="text-[#61dacf]"/> Andes Viajes</span><p className="text-xs text-slate-500 mt-2">Explora destinos y descubre nuevas experiencias.</p></div>
        <div className="text-xs text-slate-500 sm:text-right"><p>© 2026 Andes Viajes. Todos los derechos reservados.</p><p className="mt-1">Descubre el mundo a tu manera.</p></div>
      </div>
    </footer>
  </div>;
}
