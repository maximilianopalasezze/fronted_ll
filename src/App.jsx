import { Navigate, Route, Routes } from 'react-router-dom';
import BookLayout from './components/libros/BookLayout.jsx';
import Inicio from './pages/libros/Inicio.jsx';
import Categorias from './pages/libros/Categorias.jsx';
import Catalogo from './pages/libros/Catalogo.jsx';
import DetalleLibro from './pages/libros/DetalleLibro.jsx';
import NoEncontrada from './pages/libros/NoEncontrada.jsx';
import Diagnostico from './pages/libros/Diagnostico.jsx';

export default function App() {
  return <Routes><Route element={<BookLayout />}>
    <Route index element={<Inicio />} />
    <Route path="/categorias" element={<Categorias />} />
    <Route path="/catalogo" element={<Catalogo />} />
    <Route path="/libro/:id" element={<DetalleLibro />} />
    <Route path="/diagnostico" element={<Diagnostico />} />
    <Route path="/404" element={<NoEncontrada />} />
    <Route path="*" element={<Navigate to="/404" replace />} />
  </Route></Routes>;
}
