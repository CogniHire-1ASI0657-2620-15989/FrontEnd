import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { jobsService } from '@/services/jobsService'
import { USA_MOCK } from '@/services/http'
import { useAuthStore } from './auth'

export const useJobsStore = defineStore('jobs', () => {
  const auth = useAuthStore()
  const resultados = ref([])
  const guardadas = ref([])
  const postulaciones = ref([])
  const cargando = ref(false)
  const buscado = ref(false)
  const total = ref(0)
  const pagina = ref(1)
  const tamano = ref(10)
  const providerStatus = ref('')
  const error = ref('')
  const filtros = ref({ q: '', ubicacion: '', radio: 0, pagina: 1, tamano: 10 })
  const favoritos = computed(() => USA_MOCK ? auth.usuario?.favoritos ?? [] : guardadas.value.map(job => job.id))
  let searchVersion = 0
  let saving = Promise.resolve()

  watch(() => auth.usuario?.id, () => {
    searchVersion++
    resultados.value = []
    guardadas.value = []
    postulaciones.value = []
    buscado.value = false
    total.value = 0
    pagina.value = 1
    providerStatus.value = ''
    cargando.value = false
    error.value = ''
  })

  async function buscar(nuevos = {}) {
    const version = ++searchVersion
    filtros.value = { ...filtros.value, ...nuevos }
    cargando.value = true
    buscado.value = true
    error.value = ''
    resultados.value = []
    total.value = 0
    providerStatus.value = ''

    try {
      const data = await jobsService.buscar(filtros.value)
      if (version === searchVersion) {
        resultados.value = data.items
        total.value = data.total
        pagina.value = data.page
        tamano.value = data.pageSize
        providerStatus.value = data.providerStatus
      }
    } catch (e) {
      if (version === searchVersion) error.value = e.message
    } finally {
      if (version === searchVersion) cargando.value = false
    }
  }

  function limpiarFiltros() {
    searchVersion++
    filtros.value = { q: '', ubicacion: '', radio: 0, pagina: 1, tamano: 10 }
    resultados.value = []
    buscado.value = false
    total.value = 0
    pagina.value = 1
    providerStatus.value = ''
    cargando.value = false
    error.value = ''
  }

  async function cargarGuardadas() {
    const userId = auth.usuario?.id
    if (!userId) return
    const data = await jobsService.guardadas(userId)
    if (auth.usuario?.id === userId) guardadas.value = data.filter(Boolean)
  }

  // Serialize saves so clicking several cards cannot overwrite a previous save.
  function guardarVacante(vacanteId) {
    const userId = auth.usuario.id
    const operation = saving.catch(() => {}).then(async () => {
      if (auth.usuario?.id !== userId) throw new Error('La sesión cambió')
      if (favoritos.value.includes(vacanteId)) return
      if (USA_MOCK) {
        await auth.actualizar({ favoritos: [...favoritos.value, vacanteId] })
      } else {
        const { vacante } = await jobsService.guardar(vacanteId)
        if (auth.usuario?.id === userId && !guardadas.value.some(job => job.id === vacante.id)) {
          guardadas.value.push(vacante)
        }
      }
    })
    saving = operation
    return operation
  }

  async function cargarPostulaciones() {
    const userId = auth.usuario?.id
    if (!userId) return
    const data = await jobsService.postulaciones(userId)
    if (auth.usuario?.id === userId) postulaciones.value = data
  }

  async function marcarPostulacion(vacanteId, estado = 'Postulado') {
    await jobsService.registrarPostulacion(auth.usuario.id, vacanteId, estado)
    await cargarPostulaciones()
  }

  const estadoDe = id => postulaciones.value.find(p => p.vacanteId === id)?.estado ?? null

  return {
    resultados, guardadas, postulaciones, cargando, buscado, total, pagina, tamano,
    providerStatus, error, filtros, favoritos,
    buscar, limpiarFiltros, cargarGuardadas, guardarVacante, cargarPostulaciones,
    marcarPostulacion, estadoDe
  }
})

