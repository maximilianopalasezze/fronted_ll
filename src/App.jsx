import { Navigate, Route, Routes } from 'react-router-dom';
import ViajesLayout from './components/viajes/ViajesLayout.jsx';
import InicioViajes from './pages/viajes/InicioViajes.jsx';
import DestinosViajes from './pages/viajes/DestinosViajes.jsx';
import DetalleViaje from './pages/viajes/DetalleViaje.jsx';
import NoEncontradaViajes from './pages/viajes/NoEncontradaViajes.jsx';

export default function App() {
  return <Routes>
    <Route element={<ViajesLayout />}>
      <Route index element={<InicioViajes />} />
      <Route path="/destinos" element={<DestinosViajes />} />
      <Route path="/destinos/:destinoId" element={<DetalleViaje />} />
      <Route path="/404" element={<NoEncontradaViajes />} />
      <Route path="*" element={<Navigate to="/404" replace />} />
    </Route>
  </Routes>;
}
