import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    strictPort: false,
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 650,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (id.includes('@tensorflow')) return 'tfjs';
            if (id.includes('recharts') || id.includes('react-chartjs') || id.includes('chart.js')) return 'charts';
            if (id.includes('framer-motion')) return 'motion';
            if (id.includes('jspdf') || id.includes('html2canvas')) return 'pdf';
            if (id.includes('@google/generative-ai')) return 'gemini';
            if (id.includes('@supabase')) return 'supabase';
            if (id.includes('lucide-react')) return 'icons';
            if (id.includes('react-dom') || id.includes('/react/')) return 'react-vendor';
          }
        },
      },
    },
  },
});
