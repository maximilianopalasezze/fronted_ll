import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins:[react(), tailwindcss()],
  // Compatible con /fronted_ll/semana5/ y HashRouter.
  base:'./'
});
