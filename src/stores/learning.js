import { defineStore } from 'pinia'
import { ref, computed, watch } from 'vue'
import { learningService } from '@/services/learningService'
import { certificateService } from '@/services/certificateService'
import { USA_MOCK } from '@/services/http'
import { useAuthStore } from './auth'

export const useLearningStore = defineStore('learning', () => {
  const auth = useAuthStore()
  const rutas = ref([])
  const seleccion = ref('')
  const activa = computed(() => rutas.value.find(p => p.id === seleccion.value))
  // Con el Gateway el porcentaje lo calcula el servidor (progress_percentage).
  const progreso = p => p?.progreso ?? (p?.cursos.length
    ? Math.round(p.cursos.filter(c => c.completado).length / p.cursos.length * 100)
    : 0)

  watch(() => auth.usuario?.id, () => {
    rutas.value = []
    seleccion.value = ''
  })

  async function cargar() {
    const userId = auth.usuario.id
    const paths = await learningService.list(userId)
    if (auth.usuario?.id !== userId) return
    rutas.value = paths
    seleccion.value = localStorage.getItem(`pb.selected.${userId}`) || ''
  }

  function elegir(id) {
    seleccion.value = id
    localStorage.setItem(`pb.selected.${auth.usuario.id}`, id)
  }

  async function crear(job) {
    const path = await learningService.create(auth.usuario.id, job, auth.habilidades)
    await cargar()
    elegir(path.id)
  }

  /** Marca un video como visto y actualiza solo esa ruta, conservando titulo y empresa. */
  async function marcarVisto(courseId) {
    const ruta = activa.value
    if (!ruta) return
    const actualizada = await learningService.marcarVisto(ruta.id, courseId)
    const i = rutas.value.findIndex(p => p.id === ruta.id)
    if (i !== -1) rutas.value[i] = { ...actualizada, titulo: ruta.titulo, empresa: ruta.empresa }
  }

  /** Un certificado aprobado puede sumar la habilidad al perfil y recalcular el reporte. */
  async function certificadoAprobado() {
    await Promise.all([auth.recargar(), cargar()])
  }

  async function completar(courseId, certificate) {
    if (!activa.value || !certificate?.id || certificate.validacion?.estado !== 'aprobado') {
      throw new Error('Adjunta y valida el certificado PDF antes de completar el curso')
    }
    const pathId = activa.value.id
    if (!activa.value.cursos.some(course => course.id === courseId)) {
      throw new Error('El curso no pertenece a la ruta seleccionada')
    }
    if (USA_MOCK) certificateService.comprobante(auth.usuario.id, certificate.id, courseId)
    // Preserve the PDF in the profile before marking the course complete.
    // If the second request fails, the same evidence can be retried safely.
    await auth.agregarCertificado(certificate)
    await learningService.complete(auth.usuario.id, pathId, courseId, certificate.id)
    await cargar()
  }

  return { rutas, seleccion, activa, progreso, cargar, elegir, crear, completar, marcarVisto, certificadoAprobado }
})
