import * as path from 'path'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '~/': `${path.resolve(__dirname, 'packages')}/`,
    },
  },
  esbuild: {
    target: 'esnext',
  },
  test: {
    globals: true,
    reporters: 'verbose',
    include: [
      path.resolve(
        __dirname,
        'src/test/**/*.{test,spec}.{js,ts,mjs,cjs,mts,cts}',
      ),
    ],
  },
})
