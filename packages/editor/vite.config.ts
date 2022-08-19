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
    minify: process.env.NODE_ENV === 'development' ? false : 'esbuild',
    lib: {
      entry: path.resolve(__dirname, './src/index.ts'),
      formats: ['es'],
      fileName: () => 'index.js',
    },
    rollupOptions: {
      external: [
        'lodash',
        'highlight.js',
        'prosemirror-highlightjs',
        'prosemirror-commands',
        'prosemirror-history',
        'prosemirror-keymap',
        'prosemirror-model',
        'prosemirror-state',
        'prosemirror-transform',
        'prosemirror-view',
        'prosemirror-utils',
        'prosemirror-tables',
        'y-prosemirror',
        'y-protocols',
        'y-websocket',
        'yjs',
      ],
    },
  },
})
