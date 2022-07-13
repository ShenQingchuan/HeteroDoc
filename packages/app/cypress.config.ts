import cypress, { defineConfig } from 'cypress'

export default defineConfig({
  video: process.env.CYPRESS_VIDEO_RECORD === 'true',
  component: {
    devServer: {
      framework: 'vue',
      bundler: 'vite',
      viteConfig: {
        server: {
          fs: { strict: false },
        },
      },
    },
  },
})
