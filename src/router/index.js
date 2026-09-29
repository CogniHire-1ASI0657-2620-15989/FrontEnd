import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  { path: '/', redirect: '/dashboard' },
  {
    path: '/ingresar',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: { publico: true, titulo: 'Ingresar' }
  },
  {
    path: '/crear-cuenta',
    name: 'registro',
    component: () => import('@/views/RegisterView.vue'),
    meta: { publico: true, titulo: 'Crear cuenta' }
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('@/views/DashboardView.vue'),
    meta: { titulo: 'Dashboard' }
  },
  {
    path: '/empleos',
    name: 'empleos',
    component: () => import('@/views/JobSearchView.vue'),
    meta: { titulo: 'Busqueda de trabajo' }
  },
  {
    path: '/perfil',
    name: 'perfil',
    component: () => import('@/views/ProfileView.vue'),
    meta: { titulo: 'Mi perfil' }
  },
  { path: '/:pathMatch(.*)*', name: 'no-encontrado', component: () => import('@/views/NotFoundView.vue') }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 })
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()
  if (!auth.listo) await auth.iniciar()

  if (!to.meta.publico && !auth.autenticado) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
  if (to.meta.publico && auth.autenticado) {
    return { name: 'dashboard' }
  }
  document.title = to.meta.titulo ? `${to.meta.titulo} · PathBridge` : 'PathBridge'
  return true
})

export default router
