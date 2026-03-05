import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    // @ts-ignore
  // @ts-ignore
  return {
      // Gitee Pages 部署路径前缀，仓库名若不同请改为 '/你的仓库名/'
      base: mode === 'gh' ?'/eduword/' : '/',
      server: {
        port: 3000,
        host: '0.0.0.0',
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      build: {
        outDir: 'docs',
        // Keep manually maintained CSV files in docs/ across builds.
        emptyOutDir: false
      }
    };
});
