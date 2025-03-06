import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 3000,
    open: true,
  },
  build: {
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'split.js'],
          
        },
      },
    },
    // Skip TypeScript type checking during build
    minify: true,
    sourcemap: false,
  },
  // Skip TypeScript type checking
  esbuild: {
    logOverride: { 'this-is-undefined-in-esm': 'silent' },
  },
}); 