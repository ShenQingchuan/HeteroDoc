import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  { name: 'landing', path: '/', component: () => import('../pages/landing/index.vue') },
  { name: 'playground', path: '/playground', component: () => import('../pages/playground/playground.vue') },
]

export const mainRouter = createRouter({
  history: createWebHistory(),
  routes,
})
