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
    'border-base': 'border-gray-200 dark:border-dark-200',
    'bg-base': 'bg-white dark:bg-dark-100',
    'txt-color-base': 'text-gray-900 dark:text-gray-300',
    'txt-color-fade': 'text-gray-900:50 dark:text-gray-300:50',
  },
  include: path.join(__dirname, 'src/**/*.{vue,ts}'),
})
