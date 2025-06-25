// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

// vite.config.js
export default {
  // ...other settings
  server: {
    host: '0.0.0.0',
    port: 5173,
  },
  build: {
    outDir: 'dist',
  },
  // 👇 THIS is the fix
  preview: {
    port: 4173,
  },
  // 👇 AND THIS
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  // 👇 MAIN FIX for history mode routing
  base: '/',
  plugins: 
    [react(), tailwindcss()],
    // your plugins here
  
};
