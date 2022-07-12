import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import EditorPlaygroundPage from '../pages/misc/playground.vue'

const routes: RouteRecordRaw[] = [
  { name: 'landing', path: '/', component: () => import('../pages/landing/index.vue') },
  { name: 'editor-playground', path: '/playground', component: EditorPlaygroundPage },
]

export const mainRouter = createRouter({
  history: createWebHistory(),
  routes,
})
