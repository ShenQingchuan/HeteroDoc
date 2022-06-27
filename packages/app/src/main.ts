import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createI18n } from 'vue-i18n'

import { mainRouter } from './routers'
import { localeCacheKey } from './constants/keys'

import App from './App.vue'

import './styles/prosemirror.css'
import 'uno.css'

const app = createApp(App)
const localeCache = useStorage(localeCacheKey, 'zhCN') || 'zhCN'

app.use(mainRouter)
app.use(createPinia())
app.use(createI18n({
  legacy: false,
  locale: localeCache.value,
  messages: Object.fromEntries(
    Object.entries(import.meta.globEager('./locales/*.y(a)?ml')).map(
      ([key, value]) => {
        const yaml = key.endsWith('.yaml')
        return [key.slice(10, yaml ? -5 : -4), value.default]
      },
    ),
  ),
}))
app.mount('#app')
