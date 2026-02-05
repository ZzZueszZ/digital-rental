import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';
import { visualizer } from 'rollup-plugin-visualizer';
import vitePluginImp from 'vite-plugin-imp';
import preload from 'vite-plugin-preload';

export default defineConfig({
  server: {
    port: 8000,
    hmr: {
      overlay: true, // Show error overlay
    },
    watch: {
      usePolling: false, // Set to true if hot reload doesn't work on Windows
    },
    proxy: {
      '/pub': {
        target: `http://localhost:8082`,
        changeOrigin: true,
        secure: false,
      },
      '/api': {
        target: `http://localhost:8082`,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/api\//, '/'),
      },
    },
  },
  resolve: {
    alias: {
      '@': path.join(__dirname, 'src'),
    },
  },
  plugins: [
    react({
      // Enable Fast Refresh
      fastRefresh: true,
      // Include .tsx and .ts files
      include: "**/*.{jsx,js,tsx,ts}",
    }),

    preload(),
    vitePluginImp({
      optimize: true,
      libList: [
        {
          libName: 'antd',
          libDirectory: 'es',
          style: (name: unknown) => `antd/es/${name}/style`,
        },
      ],
    }),
    visualizer(),

  ],
  css: {
    preprocessorOptions: {
      less: {
        javascriptEnabled: true,
        modifyVars: {
          'primary-color': '#1DA57A', // Customize your AntD variables here
          'link-color': '#1DA57A',
          'border-radius-base': '4px',
        },
      },
    },
    modules: {
      // Enable CSS modules with a local scope naming pattern
      generateScopedName: '[local]__[hash:base64:5]',
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id: string) {
          // if (id.includes('node_modules/@ant-design/pro-form') || id.includes('node_modules/@ant-design/pro-table')) {
          //   return 'ant-design';
          // }
          // if (id.includes('antd') || id.includes('@ant-design')) {
          //   return '@ant-design';
          // }
          if (id.includes('react-i18next') || id.includes('i18next') ||
            id.includes('i18next-browser-languagedetector') || id.includes('i18next-http-backend')) {
            return '@i18next';
          }
        },
      },
    },
  },
  optimizeDeps: {
    include: [
      'antd/es/*'
    ],
  },
});
