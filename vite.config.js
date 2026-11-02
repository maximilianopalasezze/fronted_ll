import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Las rutas usan HashRouter, por lo que también funcionan en GitHub Pages.
  base: './',
});
