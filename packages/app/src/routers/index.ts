import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import EditorTestPage from '../pages/misc/editor-test.vue'

const routes: RouteRecordRaw[] = [
  { name: 'landing', path: '/', component: () => import('../pages/landing/index.vue') },
  { name: 'editor-test', path: '/editor-test', component: EditorTestPage },
]

export const mainRouter = createRouter({
  history: createWebHistory(),
  routes,
})
