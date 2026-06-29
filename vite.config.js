import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { host: true, open: false },
  esbuild: { loader: 'jsx', include: /\.(jsx?|js)$/ },
  optimizeDeps: { esbuildOptions: { loader: { '.js': 'jsx' } } },
});
