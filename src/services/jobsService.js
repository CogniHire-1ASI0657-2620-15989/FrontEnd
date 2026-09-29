import { USA_MOCK, http } from './http'
import { mockApi } from './mockBackend'

export const jobsService = {
  buscar: (filtros) => (USA_MOCK ? mockApi.buscarVacantes(filtros) : http.post('/jobs/search', filtros)),
  postulaciones: (userId) => (USA_MOCK ? mockApi.postulaciones(userId) : http.get(`/users/${userId}/applications`)),
  registrarPostulacion: (userId, vacanteId, estado) =>
    USA_MOCK
      ? mockApi.registrarPostulacion(userId, vacanteId, estado)
      : http.post(`/users/${userId}/applications`, { vacanteId, estado })
}
