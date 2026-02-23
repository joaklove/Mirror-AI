import { defineConfig, loadEnv } from "vite";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd());
  
  return {
    server: {
      host: "::",
      port: 8080,
      proxy: {
        '/api': {
          target: 'https://openrouter.ai',
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, ''),
          headers: {
            'Authorization': `Bearer ${env.OPENROUTER_API_KEY}`,
            'Content-Type': 'application/json',
          },
        },
      },
    },
    plugins: [],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    base: '/',
    build: {
      outDir: 'dist',
    }
  };
});