import { defineConfig, loadEnv } from 'vite';
import { resolve } from 'path';
import { createHtmlPlugin } from 'vite-plugin-html';

export default defineConfig(({ command, mode }) => {
  // Carrega as variáveis de ambiente do arquivo .env
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    // Diretório base para caminhos relativos
    base: '/',
    
    // Diretório raiz do projeto
    root: '.',
    
    // Diretório de arquivos públicos
    publicDir: 'public',
    
    // Configurações de build
    build: {
      // Diretório de saída
      outDir: 'dist',
      
      // Limpa o diretório de saída antes de construir
      emptyOutDir: true,
      
      // Gera sourcemaps para depuração
      sourcemap: mode === 'development',
      
      // Configurações do Rollup
      rollupOptions: {
        input: {
          main: resolve(__dirname, 'index.html'),
        },
        output: {
          // Gera nomes de arquivos de ativos com hash para cache busting
          assetFileNames: 'assets/[name].[hash][extname]',
          chunkFileNames: 'assets/[name].[hash].js',
          entryFileNames: 'assets/[name].[hash].js',
        },
      },
      
      // Tamanho mínimo para avisos de bundle
      chunkSizeWarningLimit: 1000,
      
      // Minificação otimizada para produção
      minify: mode === 'production' ? 'terser' : false,
      
      // Configurações adicionais para o Terser
      terserOptions: mode === 'production' ? {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      } : {},
    },
    
    // Configurações do servidor de desenvolvimento
    server: {
      // Porta do servidor
      port: 3000,
      
      // Abre o navegador automaticamente
      open: true,
      
      // Habilita o CORS
      cors: true,
      
      // Configura o proxy para a API
      proxy: {
        '^/api': {
          target: env.VITE_API_BASE_URL || 'http://localhost:8000',
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path.replace(/^\/api/, ''),
        },
      },
      
      // Configuração de HMR (Hot Module Replacement)
      hmr: {
        overlay: true,
      },
    },
    
    // Plugins do Vite
    plugins: [
      // Plugin para processar o HTML
      createHtmlPlugin({
        minify: mode === 'production',
        inject: {
          data: {
            title: env.VITE_APP_NAME || 'ImagAIne',
            description: 'Plataforma de geração de imagens com IA',
            keywords: 'ia, imagens, geração, ai, art',
            author: 'Sua Empresa',
          },
        },
      }),
    ],
    
    // Configurações de resolução
    resolve: {
      // Aliases para caminhos de importação
      alias: {
        '@': resolve(__dirname, './src'),
        '@assets': resolve(__dirname, './src/assets'),
        '@components': resolve(__dirname, './src/components'),
        '@pages': resolve(__dirname, './src/pages'),
        '@services': resolve(__dirname, './src/services'),
        '@styles': resolve(__dirname, './src/styles'),
        '@utils': resolve(__dirname, './src/utils'),
      },
    },
    
    // Configurações de otimização
    optimizeDeps: {
      include: ['axios'],
      exclude: ['@fortawesome/fontawesome-free'],
    },
    
    // Configurações de CSS
    css: {
      // Configuração do pré-processador (se necessário)
      preprocessorOptions: {
        scss: {
          additionalData: `@import "@/styles/variables.scss";`,
        },
      },
      
      // Gera sourcemaps em desenvolvimento
      devSourcemap: mode === 'development',
    },
    
    // Configurações de preview
    preview: {
      port: 3000,
      open: true,
      cors: true,
    },
  };
});
