import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { learningService } from '@/services/learningService'
import { useAuthStore } from './auth'
export const useLearningStore = defineStore('learning', () => {
  const auth = useAuthStore(), rutas = ref([]), seleccion = ref('')
  const activa = computed(() => rutas.value.find(p => p.id === seleccion.value))
  const progreso = p => p?.cursos.length ? Math.round(p.cursos.filter(c => c.completado).length / p.cursos.length * 100) : 0
  async function cargar() { rutas.value = await learningService.list(auth.usuario.id); seleccion.value = localStorage.getItem(`pb.selected.${auth.usuario.id}`) || '' }
  function elegir(id) { seleccion.value = id; localStorage.setItem(`pb.selected.${auth.usuario.id}`, id) }
  async function crear(job) { const p = await learningService.create(auth.usuario.id, job, auth.habilidades); await cargar(); elegir(p.id) }
  async function completar(courseId) {
    const pathId = activa.value.id
    const path = await learningService.complete(auth.usuario.id, pathId, courseId)
    const course = path.cursos.find(c => c.id === courseId), id = `${pathId}:${courseId}`
    if (!auth.usuario.certificados?.some(c => c.id === id)) await auth.actualizar({ certificados: [...(auth.usuario.certificados || []), { id, nombre: course.titulo, emisor: 'PathBridge · Finalización autodeclarada', anio: String(new Date().getFullYear()) }] })
    await cargar()
  }
  return { rutas, seleccion, activa, progreso, cargar, elegir, crear, completar }
})
