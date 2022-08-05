import * as path from 'path'
import { defineConfig } from 'vite'
import dts from 'vite-plugin-dts'

export default defineConfig({
  plugins: [dts()],
  build: {
    sourcemap: true,
    minify: process.env.NODE_ENV === 'production',
    lib: {
      entry: path.resolve(__dirname, './index.ts'),
      formats: ['es'],
      fileName: () => 'index.js',
    },
    rollupOptions: {
      external: [
        'lodash',
        'prosemirror-commands',
        'prosemirror-history',
        'prosemirror-keymap',
        'prosemirror-model',
        'prosemirror-state',
        'prosemirror-transform',
        'prosemirror-view',
        'y-prosemirror',
        'y-protocols',
        'y-websocket',
        'yjs',
      ],
    },
  },
})
