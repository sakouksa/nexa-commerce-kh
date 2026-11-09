import { fileURLToPath, URL } from 'node:url';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        'react-hot-toast': fileURLToPath(new URL('./src/utils/toast', import.meta.url)),
      },
    },
    server: {
      port: 3001,
      strictPort: true,
      open: false,
    },
    define: {
      'process.env.REACT_APP_API_URL': JSON.stringify(env.REACT_APP_API_URL || 'http://localhost:8003'),
      'process.env.REACT_APP_STORE_URL': JSON.stringify(env.REACT_APP_STORE_URL || 'http://localhost:3000'),
      'process.env': JSON.stringify(env),
    },
  };
});
