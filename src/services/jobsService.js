import { USA_MOCK, http } from './http'
import { mockApi } from './mockBackend'
import { gatewayRoutes } from './gatewayRoutes'
import { jobId, normalizarPagina, normalizarVacante } from './gatewayAdapters'

export function parametrosBusqueda(filters = {}) {
  const keywords = (filters.q || '').trim()
  const location = (filters.ubicacion || '').trim()
  if (!keywords || keywords.length > 200) throw new Error('Escribe un puesto o habilidad de entre 1 y 200 caracteres')
  if (!location || location.length > 200) throw new Error('Escribe una ubicación de entre 1 y 200 caracteres')

  const page = Number(filters.pagina ?? 1)
  const pageSize = Number(filters.tamano ?? 10)
  const radius = Number(filters.radio ?? 0)
  if (!Number.isInteger(page) || page < 1 || page > 3) throw new Error('La búsqueda permite consultar hasta 3 páginas')
  if (!Number.isInteger(pageSize) || pageSize < 1 || pageSize > 20) throw new Error('El tamaño de página debe estar entre 1 y 20')
  if (![0, 4, 8, 16, 26, 40, 80].includes(radius)) throw new Error('Selecciona un radio de búsqueda válido')

  return new URLSearchParams({
    keywords,
    location,
    page: String(page),
    page_size: String(pageSize),
    radius_km: String(radius)
  })
}

export const jobsService = {
  async detalle(id) {
    if (USA_MOCK) {
      const items = await mockApi.buscarVacantes({})
      return items.find(job => String(job.id) === String(id))
    }
    return normalizarVacante(await http.get(gatewayRoutes.detail(jobId(id))))
  },

  async buscar(filters) {
    const params = parametrosBusqueda(filters)
    if (!USA_MOCK) return normalizarPagina(await http.get(`${gatewayRoutes.search}?${params}`))

    const items = await mockApi.buscarVacantes({ q: params.get('keywords'), ubicacion: params.get('location') })
    const page = Number(params.get('page'))
    const pageSize = Number(params.get('page_size'))
    const total = Math.min(items.length, pageSize * 3)
    return {
      items: items.slice((page - 1) * pageSize, Math.min(page * pageSize, total)),
      total,
      page,
      pageSize,
      providerStatus: 'simulado'
    }
  },

  async guardadas(userId) {
    if (USA_MOCK) {
      const user = await mockApi.sesionActual()
      if (user?.id !== userId) return []
      const items = await mockApi.buscarVacantes({})
      return items.filter(job => (user.favoritos || []).includes(job.id))
    }

    const result = []
    let page = 1
    while (true) {
      const data = normalizarPagina(await http.get(`${gatewayRoutes.favorites}?page=${page}&page_size=50`))
      result.push(...data.items)
      if (!data.items.length || result.length >= data.total) return result
      page++
    }
  },

  async guardar(id) {
    const data = await http.post(gatewayRoutes.favorite(jobId(id)))
    return { vacante: normalizarVacante(data.job), creada: data.created }
  },

  quitarGuardada: id => http.del(gatewayRoutes.favorite(jobId(id))),

  // The current Gateway has no applications endpoint. Track this frontend feature
  // locally instead of sending a request to a non-existent route.
  postulaciones: userId => mockApi.postulaciones(userId),
  registrarPostulacion: (userId, vacanteId, estado) =>
    mockApi.registrarPostulacion(userId, vacanteId, estado)
}

