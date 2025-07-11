// vite.config.js
import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [
    tailwindcss(),
    react()],
    alias: {
      '@': path.resolve(__dirname, 'src'), // <--- sets '@' to 'src/'
    },
});
