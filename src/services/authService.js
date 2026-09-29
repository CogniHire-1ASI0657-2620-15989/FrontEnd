import { USA_MOCK, http } from './http'
import { mockApi } from './mockBackend'

/**
 * Capa unica de autenticacion.
 * Cambiando VITE_USE_MOCK a false, la app habla con el backend en Python
 * sin tocar componentes ni stores.
 */
export const authService = {
  registrar: (datos) => (USA_MOCK ? mockApi.registrar(datos) : http.post('/auth/register', datos, { auth: false })),
  login: (email, password) =>
    USA_MOCK ? mockApi.login(email, password) : http.post('/auth/login', { email, password }, { auth: false }),
  sesionActual: () => (USA_MOCK ? mockApi.sesionActual() : http.get('/auth/me')),
  logout: () => (USA_MOCK ? mockApi.logout() : http.post('/auth/logout')),
  actualizarPerfil: (id, cambios) =>
    USA_MOCK ? mockApi.actualizarPerfil(id, cambios) : http.put(`/users/${id}`, cambios),
  recuperarPassword: (email) =>
    USA_MOCK ? mockApi.recuperarPassword(email) : http.post('/auth/forgot-password', { email }, { auth: false })
}
