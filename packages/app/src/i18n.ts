import { createI18n } from 'vue-i18n'
import { localeCacheKey } from './constants/keys'

const localeCache = useStorage(localeCacheKey, 'zhCN') || 'zhCN'

export function createI18nPlugin() {
  return createI18n({
    legacy: false,
    locale: localeCache.value,
    messages: Object.fromEntries(
      Object.entries(import.meta.globEager('./locales/*.y(a)?ml')).map(
        ([key, value]) => {
          const yaml = key.endsWith('.yaml')
          return [key.slice(10, yaml ? -5 : -4), (value as any).default]
        },
      ),
    ),
  })
}
