import { USA_MOCK, http } from './http'
import { mockApi } from './mockBackend'
import {
  educacionParaApi, habilidadesParaApi, normalizarUsuario, registroParaApi
} from './gatewayAdapters'

const perfilActual = token => http.get('/profile/me', { token }).then(normalizarUsuario)

/**
 * Capa unica de autenticacion y perfil.
 * Con VITE_USE_MOCK=false habla con el API Gateway (/auth/* y /profile/me).
 * Las funciones devuelven siempre el usuario con la forma que usan las vistas.
 */
async function registrarReal(datos) {
  const { access_token: token } = await http.post('/auth/register', registroParaApi(datos), { auth: false })

  // El registro solo recibe identidad: estudios y habilidades se cargan despues con el token nuevo.
  let advertencia = ''
  try {
    if (datos.habilidades?.length) await http.put('/profile/me', habilidadesParaApi(datos.habilidades), { token })
    const educacion = educacionParaApi(datos)
    if (Object.keys(educacion).length) await http.post('/profile/me/education', educacion, { token })
  } catch {
    advertencia = 'Tu cuenta se creó, pero no pudimos guardar tus estudios y habilidades. Complétalos desde tu perfil.'
  }
  return { token, usuario: await perfilActual(token), advertencia }
}

async function loginReal(email, password) {
  const { access_token: token } = await http.post('/auth/login', { email, password }, { auth: false })
  return { token, usuario: await perfilActual(token) }
}

const mesValido = value => /^\d{4}-(0[1-9]|1[0-2])$/.test(value || '')

async function actualizarPerfilReal(cambios, actual) {
  let perfil = null
  const body = {}
  if ('resumenProfesional' in cambios) body.professional_summary = cambios.resumenProfesional || null
  if ('habilidades' in cambios) Object.assign(body, habilidadesParaApi(cambios.habilidades))
  if (Object.keys(body).length) perfil = await http.put('/profile/me', body)

  const camposEstudio = ['nivelEstudios', 'carrera', 'institucion']
  if (camposEstudio.some(key => key in cambios && cambios[key] !== actual?.[key])) {
    const educacion = educacionParaApi({
      nivelEstudios: cambios.nivelEstudios ?? actual?.nivelEstudios,
      carrera: cambios.carrera ?? actual?.carrera,
      institucion: cambios.institucion ?? actual?.institucion
    })
    if (Object.keys(educacion).length) {
      perfil = actual?.educacionId
        ? await http.put(`/profile/me/education/${encodeURIComponent(actual.educacionId)}`, educacion)
        : await http.post('/profile/me/education', educacion)
    }
  }

  // El Gateway solo permite agregar experiencia: las ya guardadas no se editan ni se borran.
  const nuevas = (cambios.experiencia || []).filter(item => !item.guardada)
  for (const item of nuevas) {
    if (!item.puesto?.trim() || !item.empresa?.trim() || !mesValido(item.inicio) || !mesValido(item.fin)) {
      throw new Error('Cada experiencia necesita puesto, empresa y mes de inicio y de fin.')
    }
  }
  for (const item of nuevas) {
    perfil = await http.post('/profile/me/experience', {
      company: item.empresa.trim(),
      position: item.puesto.trim(),
      start_date: item.inicio,
      end_date: item.fin
    })
  }

  return normalizarUsuario(perfil ?? await http.get('/profile/me'))
}

export const authService = {
  registrar: datos => (USA_MOCK ? mockApi.registrar(datos) : registrarReal(datos)),

  login: (email, password) => (USA_MOCK ? mockApi.login(email, password) : loginReal(email, password)),

  sesionActual: async () => {
    if (USA_MOCK) return mockApi.sesionActual()
    if (!localStorage.getItem('pb.token')) return null
    return normalizarUsuario(await http.get('/profile/me'))
  },

  // El Gateway no expone logout: la sesion es el JWT, que se descarta en el cliente.
  logout: () => (USA_MOCK ? mockApi.logout() : Promise.resolve()),

  actualizarPerfil: (id, cambios, actual) =>
    USA_MOCK ? mockApi.actualizarPerfil(id, cambios) : actualizarPerfilReal(cambios, actual),

  recuperarPassword: async email => {
    if (USA_MOCK) return mockApi.recuperarPassword(email)
    const data = await http.post('/auth/password-recovery', { email }, { auth: false })
    // `token` solo llega en el entorno academico; en produccion se usa el flujo de correo.
    return { mensaje: data?.message, token: data?.token || '' }
  },

  restablecerPassword: (token, nuevaPassword) =>
    USA_MOCK
      ? mockApi.restablecerPassword()
      : http.post('/auth/password-reset', { token, new_password: nuevaPassword }, { auth: false }),

  cambiarPassword: async (id, actual, nueva) =>
    USA_MOCK
      ? mockApi.cambiarPassword(id, actual, nueva)
      : normalizarUsuario(await http.put('/profile/me/password', { current_password: actual, new_password: nueva }))
}
