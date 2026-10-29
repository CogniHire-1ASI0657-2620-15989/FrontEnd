import { USA_MOCK, http } from './http'
export const chatService = {
  async send(userId, conversation) {
    if (!USA_MOCK) return http.post(`/users/${userId}/chat/messages`, conversation)
    await new Promise(resolve => setTimeout(resolve, 700))
    const context = conversation.contexto || 'tu objetivo profesional'
    return { contenido: conversation.modo === 'empleo'
      ? `Para prepararte para ${context}, compara tus habilidades con los requisitos de la vacante. Prepara ejemplos concretos de tus proyectos y resultados. ¿Quieres trabajar tu CV o practicar una entrevista?`
      : `Para avanzar en ${context}, divide el aprendizaje en sesiones de 45 minutos: estudia un concepto, resuelve un ejercicio y explica el resultado con tus palabras. ¿Qué tema te cuesta más?` }
  }
}
