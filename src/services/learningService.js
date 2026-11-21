import { USA_MOCK, http } from './http'
import { analizarVacante, rutaSugerida } from '@/utils/matching'
import { certificateService } from './certificateService'
import { gatewayRoutes } from './gatewayRoutes'
import { jobId, normalizarRuta } from './gatewayAdapters'
import { gapService } from './gapService'
import { jobsService } from './jobsService'

const key = id => `pb.paths.${id}`
const read = id => JSON.parse(localStorage.getItem(key(id)) || '[]')

export const learningService = {
  /**
   * El Gateway no tiene un listado de rutas: se consulta GET /learning-paths/{job_id}
   * por cada reporte de brechas del usuario (una ruta se genera siempre desde un reporte).
   * 404 significa que esa vacante aun no tiene ruta.
   */
  async list(id) {
    if (USA_MOCK) return read(id)
    const [reportes, guardadas] = await Promise.all([
      gapService.listar(),
      jobsService.guardadas(id).catch(() => [])
    ])
    const empresas = new Map(guardadas.map(job => [job.id, job.empresa]))
    const rutas = await Promise.all(reportes.map(async reporte => {
      try {
        const dto = await http.get(gatewayRoutes.learningPathByJob(jobId(reporte.vacanteId)))
        return normalizarRuta(dto, { titulo: reporte.titulo, empresa: empresas.get(reporte.vacanteId) })
      } catch (e) {
        if (e.status === 404) return null
        throw e
      }
    }))
    return rutas.filter(Boolean)
  },

  async create(id, job, skills) {
    if (!USA_MOCK) {
      // Requiere un reporte de brechas previo. YouTube puede responder 503: la UI ofrece reintento.
      const dto = await http.post(gatewayRoutes.learningPaths, { job_id: jobId(job.id) })
      return normalizarRuta(dto, { titulo: job.titulo, empresa: job.empresa })
    }

    const existing = read(id).find(path => path.vacanteId === job.id)
    if (existing) return existing

    await new Promise(resolve => setTimeout(resolve, 2200))
    const paths = read(id)
    const createdWhileWaiting = paths.find(path => path.vacanteId === job.id)
    if (createdWhileWaiting) return createdWhileWaiting

    const gaps = analizarVacante(job, skills).faltantes
    const path = {
      id: crypto.randomUUID(),
      vacanteId: job.id,
      titulo: job.titulo,
      empresa: job.empresa,
      cursos: rutaSugerida(gaps.length ? gaps : ['Preparación para entrevistas']).map((course, index) => ({
        ...course,
        id: crypto.randomUUID(),
        orden: index + 1,
        completado: false,
        proveedor: 'Catálogo externo',
        url: `https://www.coursera.org/search?query=${encodeURIComponent(course.skill)}`
      }))
    }

    localStorage.setItem(key(id), JSON.stringify([...paths, path]))
    return path
  },

  /** Marca un video como visto. Devuelve la ruta completa con el progreso recalculado. */
  async marcarVisto(pathId, itemId) {
    // El cuerpo del PATCH no esta descrito en la guia; se envia el estado destino.
    const dto = await http.patch(gatewayRoutes.learningItem(pathId, itemId), { status: 'watched' })
    return normalizarRuta(dto)
  },

  async progreso(pathId) {
    const dto = await http.get(gatewayRoutes.learningProgress(pathId))
    return { progreso: dto.progress_percentage, total: dto.total_items, vistos: dto.watched_items, estado: dto.status }
  },

  async complete(id, pathId, courseId, certificateId) {
    if (!certificateId) {
      throw new Error('Adjunta un certificado PDF validado para completar el curso')
    }
    if (!USA_MOCK) throw new Error('Con el Gateway los videos se marcan como vistos y los certificados se suben aparte')

    certificateService.comprobante(id, certificateId, courseId)
    const paths = read(id)
    const path = paths.find(item => item.id === pathId)
    const course = path?.cursos.find(item => item.id === courseId)
    if (!course) throw new Error('Curso no encontrado')

    course.completado = true
    course.certificateId = certificateId
    localStorage.setItem(key(id), JSON.stringify(paths))
    return path
  }
}
