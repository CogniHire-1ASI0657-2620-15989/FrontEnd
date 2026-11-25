import { USA_MOCK, http } from './http'
import { gatewayRoutes } from './gatewayRoutes'
import { analizarVacante } from '@/utils/matching'
import { jobId, normalizarReporte } from './gatewayAdapters'

export const gapService = {
  async analizar(userId, vacante, habilidades) {
    if (!USA_MOCK) {
      const dto = await http.post(gatewayRoutes.gapAnalysis, { job_id: jobId(vacante.id) })
      return normalizarReporte(dto)
    }

    await new Promise(resolve => setTimeout(resolve, 1800))
    return {
      id: crypto.randomUUID(),
      vacanteId: vacante.id,
      ...analizarVacante(vacante, habilidades),
      estado: 'completed',
      generadoEn: new Date().toISOString(),
      origen: 'simulado'
    }
  },

  async consultar(id) {
    return normalizarReporte(await http.get(gatewayRoutes.gapReport(jobId(id))))
  },

  async listar() {
    const reports = await http.get(gatewayRoutes.gapAnalysis)
    return reports.map(normalizarReporte)
  }
}
