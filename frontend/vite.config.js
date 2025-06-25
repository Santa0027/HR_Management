    import { defineConfig } from 'vite';
    import react from '@vitejs/plugin-react';

  import tailwindcss from '@tailwindcss/vite';

    export default defineConfig({
      plugins: [react(),tailwindcss()],
      server: {
        host: '0.0.0.0',
        port: 5173,    
        // hmr: {
         
        //   host: process.env.VITE_HMR_HOST || 'localhost',
        //   clientPort: process.env.VITE_HMR_PORT ? parseInt(process.env.VITE_HMR_PORT) : 5173,
        //   overlay: true,
        // },
        watch: {
          usePolling: true 
        }
      }
    });
    
