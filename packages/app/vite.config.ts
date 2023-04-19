import vue from '@vitejs/plugin-vue'
import mkcert from 'vite-plugin-mkcert'
import vueJSX from '@vitejs/plugin-vue-jsx'
import vueI18n from '@intlify/unplugin-vue-i18n/vite'
import Unocss from 'unocss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'
import Fonts from 'unplugin-fonts/vite'
import { defineConfig } from 'vite'

// https://vitejs.dev/config/
export default defineConfig({
  resolve: {
    conditions: ['dev'],
  },
  clearScreen: false,
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:9000',
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  plugins: [
    mkcert(),
    vue(),
    vueJSX(),
    vueI18n({
      runtimeOnly: true,
      compositionOnly: true,
      include: 'src/locales/**',
    }),
    Unocss('unocss.config.ts'),
    AutoImport({
      // global imports to register
      imports: ['vue', 'vue-router', 'pinia', '@vueuse/core', 'vue-i18n'],
      dirs: ['src/composables', 'src/stores'],
      dts: 'src/types/auto-imports.d.ts',
    }),
    Components({
      include: [/\.vue$/, /\.vue\?vue/],
      dirs: 'src/components',
      dts: 'src/types/components.d.ts',
      resolvers: [NaiveUiResolver()],
    }),
    Fonts({
      google: {
        families: ['Fira Code'],
      },
    }),
  ],
  optimizeDeps: {
    include: ['@vueuse/components'],
  },
})
