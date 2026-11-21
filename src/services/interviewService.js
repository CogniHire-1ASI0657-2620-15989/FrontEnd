import { http } from './http'
import { gatewayRoutes } from './gatewayRoutes'
import { jobId } from './gatewayAdapters'

/**
 * Simulador de entrevistas del Gateway (/interview-sessions).
 * Requisitos del servidor: la vacante debe estar en favoritos y el proveedor de IA configurado.
 */
export const modosEntrevista = [
  { valor: 'mixed', texto: 'Mixta (técnica y conductual)' },
  { valor: 'technical', texto: 'Técnica' },
  { valor: 'behavioral', texto: 'Conductual' }
]

export const interviewService = {
  listar: () => http.get(gatewayRoutes.interviews),
  consultar: id => http.get(gatewayRoutes.interview(id)),
  iniciar: (vacanteId, mode = 'mixed') => http.post(gatewayRoutes.interviews, { job_id: jobId(vacanteId), mode }),

  /** Registra la respuesta; mientras la sesion siga activa el servidor agrega la siguiente pregunta. */
  async responder(id, content) {
    const texto = content.trim()
    if (!texto || texto.length > 10000) throw new Error('Tu respuesta debe tener entre 1 y 10 000 caracteres')
    const sesion = await http.post(gatewayRoutes.interviewMessages(id), { content: texto })
    return Array.isArray(sesion?.messages) ? sesion : http.get(gatewayRoutes.interview(id))
  },

  /** Finaliza y evalua: la sesion devuelta incluye `report`. */
  async finalizar(id) {
    const sesion = await http.post(gatewayRoutes.interviewComplete(id))
    return sesion?.report ? sesion : http.get(gatewayRoutes.interview(id))
  }
}
