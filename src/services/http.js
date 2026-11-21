/**
 * Cliente HTTP del API Gateway de PathBridge.
 *
 * - Adjunta `Authorization: Bearer <token>` en las rutas protegidas.
 *   Nunca se envian X-User-Id ni X-Internal-Api-Key: los pone el Gateway.
 * - Interpreta errores RFC 7807 (`application/problem+json`): `detail` es un
 *   mensaje general y `errors` (solo en 422) trae el detalle por campo.
 * - Conserva `X-Correlation-ID` para soporte.
 * - Ante 401 en una ruta protegida limpia la sesion y avisa a la app.
 */
const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8080/api/v1').replace(/\/+$/, '')

export const USA_MOCK = (import.meta.env.VITE_USE_MOCK ?? 'true') !== 'false'
export const TOKEN_KEY = 'pb.token'

let onUnauthorized = null
/** La app registra aqui que hacer cuando el token expira (limpiar estado y llevar a login). */
export const setUnauthorizedHandler = handler => { onUnauthorized = handler }

export class ApiError extends Error {
  constructor(message, { status = 0, problem = null, correlationId = null, campos = {} } = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.problem = problem
    this.correlationId = correlationId
    /** Errores de validacion por campo (422): { email: 'value is not a valid email' } */
    this.campos = campos
  }

  /** 502 y 503 son transitorios: la interfaz debe ofrecer reintento. */
  get reintentable() {
    return this.status === 0 || this.status === 502 || this.status === 503
  }
}

const token = () => {
  try { return localStorage.getItem(TOKEN_KEY) } catch { return null }
}

function erroresPorCampo(errors) {
  const campos = {}
  for (const item of Array.isArray(errors) ? errors : []) {
    const loc = Array.isArray(item.loc) ? item.loc.filter(part => part !== 'body' && part !== 'query') : []
    const campo = String(loc.at(-1) ?? 'solicitud')
    campos[campo] ??= item.msg
  }
  return campos
}

function mensajeDe(status, data, correlationId) {
  const detail = typeof data?.detail === 'string' ? data.detail : ''
  // Formato anterior de FastAPI: detail como arreglo de errores.
  const lista = Array.isArray(data?.detail) ? data.detail : Array.isArray(data?.errors) ? data.errors : null
  const campos = lista
    ? lista.map(item => `${item.loc?.filter(p => p !== 'body' && p !== 'query').join('.') || 'Solicitud'}: ${item.msg}`).join('; ')
    : ''

  if (status === 422) return [detail, campos].filter(Boolean).join(' — ') || 'Revisa los datos ingresados'
  if (status === 502) return 'No pudimos comunicarnos con el servicio. Intenta de nuevo en unos segundos.'
  if (status === 503) return detail || 'El servicio no está disponible temporalmente. Intenta de nuevo en unos instantes.'
  if (status >= 500) return `Ocurrió un error inesperado.${correlationId ? ` Código de soporte: ${correlationId}` : ''}`
  return detail || campos || data?.message || 'No pudimos completar la solicitud'
}

export async function request(path, { method = 'GET', body, auth = true, responseType = 'json', token: tokenOverride } = {}) {
  const multipart = body instanceof FormData
  // Con FormData el navegador define Content-Type (incluye el boundary).
  const headers = multipart ? {} : { 'Content-Type': 'application/json' }
  const bearer = tokenOverride ?? (auth ? token() : null)
  if (bearer) headers.Authorization = `Bearer ${bearer}`

  let res
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body ? (multipart ? body : JSON.stringify(body)) : undefined
    })
  } catch {
    throw new ApiError('No pudimos conectar con el servidor. Revisa tu conexión e intenta de nuevo.')
  }

  const correlationId = res.headers?.get?.('X-Correlation-ID') ?? null
  if (res.ok && responseType === 'blob') return res.blob()
  if (res.status === 204) return null
  const data = await res.json().catch(() => null)
  if (res.ok) return data

  if (res.status === 401 && auth && bearer && onUnauthorized) onUnauthorized()
  throw new ApiError(mensajeDe(res.status, data, correlationId), {
    status: res.status,
    problem: data,
    correlationId,
    campos: res.status === 422 ? erroresPorCampo(data?.errors ?? data?.detail) : {}
  })
}

export const http = {
  blob: (p, o) => request(p, { ...o, responseType: 'blob' }),
  get: (p, o) => request(p, { ...o, method: 'GET' }),
  post: (p, body, o) => request(p, { ...o, method: 'POST', body }),
  put: (p, body, o) => request(p, { ...o, method: 'PUT', body }),
  patch: (p, body, o) => request(p, { ...o, method: 'PATCH', body }),
  del: (p, o) => request(p, { ...o, method: 'DELETE' })
}
