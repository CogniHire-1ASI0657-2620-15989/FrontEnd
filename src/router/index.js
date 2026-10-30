import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { jobsService } from '@/services/jobsService'

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
  { 
    path: '/:pathMatch(.*)*', 
    name: 'no-encontrado', 
    component: () => import('@/views/NotFoundView.vue') },
  { 
    path: '/empleos/:id', 
    component: () => import('@/views/JobDetailView.vue'), 
    meta: { titulo: 'Detalle del empleo' } 
  },
  { 
    path: '/aprendizaje', 
    component: () => import('@/views/LearningPathView.vue'), 
    meta: { titulo: 'Learning Path' } 
  },
  { 
    path: '/certificados/:id', 
    component: () => import('@/views/CertificateView.vue'), 
    meta: { titulo: 'Constancia de aprendizaje' } },
    { 
      path: '/asistente', 
      component: () => import('@/views/ChatView.vue'), 
      meta: { titulo: 'Asistente profesional' } 
    }
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior: () => ({ top: 0 })
})

router.beforeEach(async (to) => {
  const auth = useAuthStore()

  if (!auth.listo) {
    await auth.iniciar()
  }

  if (!to.meta.publico && !auth.autenticado) {
    return {
      name: 'login',
      query: { redirect: to.fullPath }
    }
  }

  if (to.meta.publico && auth.autenticado) {
    return { name: 'dashboard' }
  }

  if (to.name === 'dashboard' && auth.autenticado) {
    try {
      const applications = await jobsService.postulaciones(auth.usuario.id)

      if (!applications.length) {
        return {
          name: 'empleos',
          query: { inicio: '1' }
        }
      }
    } catch {
      // El dashboard mostrará los errores al cargar sus datos.
    }
  }

  document.title = to.meta.titulo
    ? `${to.meta.titulo} · PathBridge`
    : 'PathBridge'

  return true
})

export default router