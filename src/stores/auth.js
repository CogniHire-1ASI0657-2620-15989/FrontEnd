import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { authService } from '@/services/authService'
import { USA_MOCK, TOKEN_KEY } from '@/services/http'
import { normalizarHabilidades } from '@/utils/skills'

export const useAuthStore = defineStore('auth', () => {
  const usuario = ref(null)
  const cargando = ref(false)
  const listo = ref(false)
  // Aviso de un solo uso mostrado en el perfil tras registrarse (ej. fallo parcial al guardar estudios).
  const avisoInicial = ref('')
  const errorSesion = ref('')
  let certificateQueue = Promise.resolve()

  const autenticado = computed(() => usuario.value !== null)
  const habilidades = computed(() => normalizarHabilidades(usuario.value?.habilidades))

  /** Porcentaje de completitud del perfil, usado en el dashboard. */
  const perfilCompleto = computed(() => {
    const u = usuario.value
    if (!u) return 0
    // El Gateway solo informa nombre completo, ciudad y estudios; telefono y documento no se muestran.
    const campos = USA_MOCK
      ? [
          u.nombre, u.apellido, u.documento, u.telefono, u.ciudad,
          u.carrera, u.institucion, u.nivelEstudios,
          u.resumenProfesional, u.habilidades?.length, u.experiencia?.length
        ]
      : [
          u.nombre, u.ciudad, u.carrera, u.institucion, u.nivelEstudios,
          u.resumenProfesional, u.habilidades?.length, u.experiencia?.length
        ]
    const llenos = campos.filter(Boolean).length
    return Math.round((llenos / campos.length) * 100)
  })

  async function iniciar() {
    try { usuario.value = await authService.sesionActual() }
    catch (e) {
      usuario.value = null
      if (e.status === 401) localStorage.removeItem(TOKEN_KEY)
      // Gateway apagado o inaccesible: no romper la carga; se llega a login con el motivo.
      else errorSesion.value = e.message
    }
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
      const { token, usuario: u, advertencia } = await authService.registrar(datos)
      localStorage.setItem(TOKEN_KEY, token)
      avisoInicial.value = advertencia || ''
      usuario.value = u
      return u
    } finally {
      cargando.value = false
    }
  }

  async function actualizar(cambios) {
    usuario.value = await authService.actualizarPerfil(usuario.value.id, cambios, usuario.value)
    return usuario.value
  }

  /** Vuelve a pedir el perfil al servidor (ej. tras aprobar un certificado que suma una habilidad). */
  async function recargar() {
    const userId = usuario.value?.id
    const fresco = await authService.sesionActual()
    if (fresco && usuario.value?.id === userId) usuario.value = fresco
    return usuario.value
  }

  async function cambiarPassword(actual, nueva) {
    usuario.value = await authService.cambiarPassword(usuario.value.id, actual, nueva)
  }

  /** Descarta la sesion local sin llamar al servidor (token vencido). */
  function cerrarSesionLocal() {
    localStorage.removeItem(TOKEN_KEY)
    usuario.value = null
  }

  function agregarCertificado(certificate) {
    // Con el Gateway el certificado ya queda registrado en el servidor al subirlo.
    if (!USA_MOCK) return Promise.resolve()
    const userId = usuario.value.id
    const operation = certificateQueue.catch(() => {}).then(async () => {
      if (usuario.value?.id !== userId) throw new Error('La sesión cambió; vuelve a cargar tu perfil')
      const certificates = usuario.value.certificados || []
      if (!certificates.some(c => c.id === certificate.id)) {
        await actualizar({ certificados: [...certificates, certificate] })
      }
    })
    certificateQueue = operation
    return operation
  }

  async function logout() {
    try { await authService.logout() } finally { cerrarSesionLocal() }
  }

  return { usuario, cargando, listo, autenticado, habilidades, perfilCompleto, iniciar, login, registrar, actualizar, agregarCertificado, logout,
    avisoInicial, errorSesion, recargar, cambiarPassword, cerrarSesionLocal }
})
