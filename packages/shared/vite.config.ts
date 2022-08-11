import * as path from 'path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [dts({
    include: 'src/**/*.ts',
    exclude: 'node_modules',
  })],
  build: {
    sourcemap: true,
    minify: process.env.NODE_ENV === 'production',
    watch: process.env.NODE_ENV === 'development' ? {} : undefined,
    lib: {
      entry: path.resolve(__dirname, './src/index.ts'),
      formats: ['es'],
      fileName: () => 'index.js',
    },
  },
})
