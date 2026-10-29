import { USA_MOCK, http } from './http'
import { analizarVacante, rutaSugerida } from '@/utils/matching'
const key = id => `pb.paths.${id}`
const read = id => JSON.parse(localStorage.getItem(key(id)) || '[]')
export const learningService = {
  async list(id) { return USA_MOCK ? read(id) : http.get(`/users/${id}/learning-paths`) },
  async create(id, job, skills) {
    if (!USA_MOCK) return http.post(`/users/${id}/learning-paths`, { vacanteId: job.id })
    const paths = read(id)
    const existing = paths.find(p => p.vacanteId === job.id)
    if (existing) return existing
    await new Promise(resolve => setTimeout(resolve, 2200))
    const gaps = analizarVacante(job, skills).faltantes
    const path = { id: crypto.randomUUID(), vacanteId: job.id, titulo: job.titulo, empresa: job.empresa, cursos: rutaSugerida(gaps.length ? gaps : ['Preparación para entrevistas']).map((c, i) => ({ ...c, id: crypto.randomUUID(), orden: i + 1, completado: false, proveedor: 'Catálogo externo', url: `https://www.coursera.org/search?query=${encodeURIComponent(c.skill)}` })) }
    localStorage.setItem(key(id), JSON.stringify([...paths, path]))
    return path
  },
  async complete(id, pathId, courseId) {
    if (!USA_MOCK) return http.post(`/users/${id}/learning-paths/${pathId}/courses/${courseId}/complete`)
    const paths = read(id), path = paths.find(p => p.id === pathId), course = path?.cursos.find(c => c.id === courseId)
    if (!course) throw new Error('Curso no encontrado')
    course.completado = true
    localStorage.setItem(key(id), JSON.stringify(paths))
    return path
  }
}
