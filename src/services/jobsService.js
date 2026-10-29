import { USA_MOCK, http } from './http'
import { mockApi } from './mockBackend'

export const jobsService = {
  detalle: id => USA_MOCK ? mockApi.buscarVacantes({}).then(items => items.find(v => String(v.id) === String(id))) : http.get(`/jobs/${encodeURIComponent(id)}`),
  buscar: (filtros) => (USA_MOCK ? mockApi.buscarVacantes(filtros) : http.post('/jobs/search', filtros)),
  postulaciones: (userId) => (USA_MOCK ? mockApi.postulaciones(userId) : http.get(`/users/${userId}/applications`)),
  registrarPostulacion: (userId, vacanteId, estado) =>
    USA_MOCK
      ? mockApi.registrarPostulacion(userId, vacanteId, estado)
      : http.post(`/users/${userId}/applications`, { vacanteId, estado })
}
