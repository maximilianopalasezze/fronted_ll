import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Inicio from './pages/Inicio';
import AgregarArticulo from './pages/AgregarArticulo';
import Inventario from './pages/Inventario';
import DetalleArticulo from './pages/DetalleArticulo';
import Carrito from './pages/Carrito';
import NoEncontrada from './pages/NoEncontrada';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Inicio />} />
        <Route path="/agregar" element={<AgregarArticulo />} />
        <Route path="/inventario" element={<Inventario />} />
        <Route path="/inventario/:id" element={<DetalleArticulo />} />
        <Route path="/carrito" element={<Carrito />} />
        <Route path="/404" element={<NoEncontrada />} />
        <Route path="*" element={<Navigate to="/404" replace />} />
      </Route>
    </Routes>
  );
}
