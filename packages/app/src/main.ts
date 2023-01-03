import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createI18nPlugin } from './i18n'

import { mainRouter } from './routers'

import App from './App.vue'

import '@hetero/editor/dist/styles/index.css'
import 'uno.css'

// Override global styles
import './styles/global.less'

const app = createApp(App)

app.use(mainRouter)
app.use(createPinia())
app.use(createI18nPlugin())
app.mount('#app')
