import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import viteMockPlugin from './server/viteMockPlugin.js';

export default defineConfig({
  plugins: [react(), viteMockPlugin()],
  // HashRouter y rutas relativas son compatibles con GitHub Pages.
  base: './',
});
