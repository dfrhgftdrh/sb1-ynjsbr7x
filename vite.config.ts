import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  build: {
    // Enable minification and optimization
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    // Enable chunk splitting
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'router': ['react-router-dom'],
          'supabase': ['@supabase/supabase-js']
        }
      }
    },
    // Enable source maps for production
    sourcemap: true,
    // Optimize asset loading
    assetsInlineLimit: 4096,
    // Enable CSS code splitting
    cssCodeSplit: true,
    // Enable asset optimization
    assetsDir: 'assets',
    // Enable chunk size warnings
    chunkSizeWarningLimit: 500
  },
  server: {
    // Enable compression
    compress: true
  },
  // Add base URL configuration
  base: './',
  // Add preview configuration
  preview: {
    port: 4173,
    host: true
  }
});