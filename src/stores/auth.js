import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '@/services/authService'

export const useAuthStore = defineStore('auth', () => {
  const usuario = ref(null)
  const cargando = ref(false)
  const listo = ref(false)

  const autenticado = computed(() => usuario.value !== null)
  const habilidades = computed(() => usuario.value?.habilidades ?? [])

  /** Porcentaje de completitud del perfil, usado en el dashboard. */
  const perfilCompleto = computed(() => {
    const u = usuario.value
    if (!u) return 0
    const campos = [
      u.nombre, u.apellido, u.documento, u.telefono, u.ciudad,
      u.carrera, u.institucion, u.nivelEstudios, u.sectorObjetivo, u.cargoObjetivo,
      u.resumenProfesional, u.habilidades?.length, u.experiencia?.length
    ]
    const llenos = campos.filter(Boolean).length
    return Math.round((llenos / campos.length) * 100)
  })

  async function iniciar() {
    usuario.value = await authService.sesionActual()
    listo.value = true
  }

  async function login(email, password) {
    cargando.value = true
    try {
      const { token, usuario: u } = await authService.login(email, password)
      localStorage.setItem('pb.token', token)
      usuario.value = u
      return u
    } finally {
      cargando.value = false
    }
  }

  async function registrar(datos) {
    cargando.value = true
    try {
      const { token, usuario: u } = await authService.registrar(datos)
      localStorage.setItem('pb.token', token)
      usuario.value = u
      return u
    } finally {
      cargando.value = false
    }
  }

  async function actualizar(cambios) {
    usuario.value = await authService.actualizarPerfil(usuario.value.id, cambios)
    return usuario.value
  }

  async function logout() {
    await authService.logout()
    localStorage.removeItem('pb.token')
    usuario.value = null
  }

  return { usuario, cargando, listo, autenticado, habilidades, perfilCompleto, iniciar, login, registrar, actualizar, logout }
})
