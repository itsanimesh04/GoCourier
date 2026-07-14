import { defineConfig } from 'vitest/config';
import { loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const backendOrigin = env.VITE_BACKEND_ORIGIN ?? 'http://127.0.0.1:3000';

  return {
    plugins: [react()],
    test: {
      environment: 'jsdom',
      setupFiles: './src/test/setup.ts',
      css: true
    },
    server: {
      host: '127.0.0.1',
      port: 5173,
      proxy: {
        '/api/v1': {
          target: backendOrigin,
          changeOrigin: true
        }
      }
    }
  };
});
