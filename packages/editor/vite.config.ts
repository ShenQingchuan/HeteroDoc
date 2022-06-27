import * as path from 'path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

const isDev = process.env.NODE_ENV === 'development'

export default defineConfig({
  plugins: [dts()],
  build: {
    sourcemap: isDev,
    lib: {
      entry: path.resolve(__dirname, './index.ts'),
      formats: ['es'],
      fileName: () => 'index.js',
    },
  },
})
