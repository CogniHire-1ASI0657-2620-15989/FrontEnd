import { USA_MOCK, http } from './http'

export const chatService = {
  async send(userId, conversation) {
    const payload = { ...conversation, modo: 'empleo' }
    if (!USA_MOCK) return http.post(`/users/${userId}/chat/messages`, payload)

    await new Promise(resolve => setTimeout(resolve, 700))
    const context = payload.contexto || 'tu próxima oportunidad laboral'
    const question = payload.mensajes.at(-1)?.contenido.toLowerCase() || ''

    if (/curso|estudi|aprendizaje/.test(question)) {
      return { contenido: 'Este asistente está enfocado en búsqueda y orientación laboral. Puedo ayudarte a definir filtros de búsqueda, mejorar tu CV o preparar una entrevista para una vacante guardada.' }
    }
    if (/cv|currículum|curriculum/.test(question)) {
      return { contenido: `Para adaptar tu CV a ${context}, abre con un resumen breve, incluye tus habilidades con su dominio y describe proyectos con resultados concretos. Adjunta los certificados relevantes en tu perfil.` }
    }
    return { contenido: `Para prepararte para ${context}, revisa las responsabilidades del puesto y organiza ejemplos de tus proyectos. Guarda las vacantes que te interesen y utiliza Análisis de brechas para comparar sus requisitos. ¿Quieres practicar una entrevista o ajustar tu búsqueda?` }
  }
}
