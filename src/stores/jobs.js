import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { jobsService } from '@/services/jobsService'
import { analizarVacante } from '@/utils/matching'
import { useAuthStore } from './auth'

export const useJobsStore = defineStore('jobs', () => {
  const auth = useAuthStore()

  const resultados = ref([])
  const postulaciones = ref([])
  const cargando = ref(false)
  const error = ref('')
  const filtros = ref({ q: '', ubicacion: '', modalidad: '', nivel: '', sector: '' })

  /** Cada vacante se enriquece con su analisis de brechas. */
  const vacantesAnalizadas = computed(() =>
    resultados.value
      .map((v) => ({ ...v, analisis: analizarVacante(v, auth.habilidades) }))
      .sort((a, b) => b.analisis.match - a.analisis.match)
  )

  const favoritos = computed(() => auth.usuario?.favoritos ?? [])
  const vacantesFavoritas = computed(() => vacantesAnalizadas.value.filter((v) => favoritos.value.includes(v.id)))
  const matchPromedio = computed(() => {
    const lista = vacantesAnalizadas.value
    if (!lista.length) return 0
    return Math.round(lista.reduce((t, v) => t + v.analisis.match, 0) / lista.length)
  })

  async function buscar(nuevos = {}) {
    filtros.value = { ...filtros.value, ...nuevos }
    cargando.value = true
    error.value = ''
    try {
      resultados.value = await jobsService.buscar(filtros.value)
    } catch (e) {
      error.value = e.message
      resultados.value = []
    } finally {
      cargando.value = false
    }
  }

  function limpiarFiltros() {
    filtros.value = { q: '', ubicacion: '', modalidad: '', nivel: '', sector: '' }
    return buscar()
  }

  async function alternarFavorito(vacanteId) {
    const actuales = [...favoritos.value]
    const i = actuales.indexOf(vacanteId)
    if (i === -1) actuales.push(vacanteId)
    else actuales.splice(i, 1)
    await auth.actualizar({ favoritos: actuales })
  }

  async function cargarPostulaciones() {
    if (!auth.usuario) return
    postulaciones.value = await jobsService.postulaciones(auth.usuario.id)
  }

  async function marcarPostulacion(vacanteId, estado) {
    await jobsService.registrarPostulacion(auth.usuario.id, vacanteId, estado)
    await cargarPostulaciones()
  }

  const estadoDe = (vacanteId) => postulaciones.value.find((p) => p.vacanteId === vacanteId)?.estado ?? null

  return {
    resultados, postulaciones, cargando, error, filtros,
    vacantesAnalizadas, favoritos, vacantesFavoritas, matchPromedio,
    buscar, limpiarFiltros, alternarFavorito, cargarPostulaciones, marcarPostulacion, estadoDe
  }
})
