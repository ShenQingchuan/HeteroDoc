import * as path from 'path'
import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetUno,
} from 'unocss'

export default defineConfig({
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons(),
  ],
  shortcuts: {
    'flex-items-center': 'flex items-center',
  },
  include: path.join(__dirname, 'src/**/*.{vue,ts}'),
})
