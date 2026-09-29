/**
 * Cliente HTTP minimo para el backend en Python.
 * Se usa solo cuando VITE_USE_MOCK !== 'true'.
 */
const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000/api'

export const USA_MOCK = (import.meta.env.VITE_USE_MOCK ?? 'true') !== 'false'

function token() {
  return localStorage.getItem('pb.token')
}

export async function request(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (auth && token()) headers.Authorization = `Bearer ${token()}`

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined
  })

  const data = await res.json().catch(() => null)
  if (!res.ok) throw new Error(data?.detail ?? data?.message ?? 'No pudimos conectar con el servidor')
  return data
}

export const http = {
  get: (p, o) => request(p, { ...o, method: 'GET' }),
  post: (p, body, o) => request(p, { ...o, method: 'POST', body }),
  put: (p, body, o) => request(p, { ...o, method: 'PUT', body }),
  del: (p, o) => request(p, { ...o, method: 'DELETE' })
}
