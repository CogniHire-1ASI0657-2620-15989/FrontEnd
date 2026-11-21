import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import { useAuthStore } from './stores/auth'
import { setUnauthorizedHandler } from './services/http'
import './assets/styles/main.css'
import './assets/styles/career.css'

const app = createApp(App).use(createPinia()).use(router)

// Un 401 en una ruta protegida significa token ausente, vencido o invalido:
// se limpia la sesion y se lleva al usuario a login conservando a donde iba.
const auth = useAuthStore()
setUnauthorizedHandler(() => {
  if (!auth.listo || !auth.autenticado) return
  auth.cerrarSesionLocal()
  const actual = router.currentRoute.value
  if (!actual.meta.publico) {
    router.replace({ name: 'login', query: { redirect: actual.fullPath, expirada: '1' } })
  }
})

app.mount('#app')
