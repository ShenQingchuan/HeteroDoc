import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  { name: 'landing', path: '/', component: () => import('../pages/landing/index.vue') },
]

export const mainRouter = createRouter({
  history: createWebHistory(),
  routes,
})
