import { defineConfig } from 'tsup'
import { lessLoader } from 'esbuild-plugin-less'

export default defineConfig({
  entry: ['src/**'],
  format: ['esm'],
  minify: process.env.NODE_ENV === 'production',
  splitting: false,
  sourcemap: true,
  clean: false,
  esbuildPlugins: [lessLoader()],
})
