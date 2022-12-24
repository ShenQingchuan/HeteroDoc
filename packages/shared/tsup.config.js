import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/**'],
  format: ['esm'],
  minify: process.env.NODE_ENV === 'production',
  splitting: false,
  dts: true,
  sourcemap: true,
  clean: true,
})
