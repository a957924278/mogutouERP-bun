import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import AutoImport from 'unplugin-auto-import/vite';
import Components from 'unplugin-vue-components/vite';
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers';
import tailwindcss from '@tailwindcss/vite';
import vueDevTools from "vite-plugin-vue-devtools";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
		vueDevTools(),
    AutoImport({
      imports: ['vue', 'pinia', 'vue-router'],
      resolvers: [
        ElementPlusResolver(),
      ],
    }),
    Components({
      dirs: ['src/components'],
      resolvers: [
        ElementPlusResolver(),
      ],
    }),
  ],
  resolve: {
    alias: {
      '@': '/src',
      '~': '/src/assets',
    },
  },
});
