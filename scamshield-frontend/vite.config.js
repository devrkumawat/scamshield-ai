import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react'; // or vue(), svelte(), etc.

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Forward all requests starting with /api to your backend
      '/api': {
        target: 'http://localhost:8001', // <-- Change this to your BACKEND'S port
        changeOrigin: true,
        
        // Optional: If your backend route is just /analyze/text instead of /api/analyze/text, 
        // you can strip the /api prefix by uncommenting the line below:
        // rewrite: (path) => path.replace(/^\/api/, '')
      }
    }
  }
});