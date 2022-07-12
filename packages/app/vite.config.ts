import * as path from 'path'
import vue from '@vitejs/plugin-vue'
import vueI18n from '@intlify/vite-plugin-vue-i18n'
import Unocss from 'unocss/vite'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { NaiveUiResolver } from 'unplugin-vue-components/resolvers'
import { defineConfig } from 'vite'

const fromAppPath = (p: string) => path.resolve(__dirname, p)

// https://vitejs.dev/config/
export default defineConfig({
  clearScreen: false,
  server: {
    port: 5000,
    proxy: {
      '/api': {
        target: 'http://localhost:9000',
        rewrite: path => path.replace(/^\/api/, ''),
      },
    },
  },
  plugins: [
    vue(),
    vueI18n({
      runtimeOnly: true,
      compositionOnly: true,
      include: fromAppPath('src/locales/**'),
    }),
    Unocss(fromAppPath('unocss.config.ts')),
    AutoImport({
      // global imports to register
      imports: ['vue', 'vue-router', 'pinia', '@vueuse/core', 'vue-i18n'],
      dirs: [
        fromAppPath('src/composables'),
        fromAppPath('src/stores'),
      ],
      dts: fromAppPath('src/types/auto-imports.d.ts'),
    }),
    Components({
      include: [/\.vue$/, /\.vue\?vue/],
      dirs: fromAppPath('src/components'),
      dts: fromAppPath('src/types/components.d.ts'),
      resolvers: [NaiveUiResolver()],
    }),
  ],
})
