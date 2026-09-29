/**
 * Backend simulado sobre localStorage.
 * Permite que la app funcione al 100% sin el servidor en Python.
 * Cada funcion imita la respuesta de un endpoint REST.
 */
import { vacantes } from '@/data/jobs'

const KEY_USERS = 'pb.users'
const KEY_SESSION = 'pb.session'
const KEY_APPS = 'pb.applications'

const leer = (k, fallback) => {
  try { return JSON.parse(localStorage.getItem(k)) ?? fallback } catch { return fallback }
}
const guardar = (k, v) => localStorage.setItem(k, JSON.stringify(v))
const espera = (ms = 320) => new Promise((r) => setTimeout(r, ms))

/** Hash didactico: NO es seguro, en produccion lo hace el backend (bcrypt/argon2). */
const hash = (texto) => btoa(unescape(encodeURIComponent(`pb::${texto}`)))

const usuarios = () => leer(KEY_USERS, [])
const publico = ({ password, ...resto }) => resto

export const mockApi = {
  async registrar(datos) {
    await espera()
    const lista = usuarios()
    if (lista.some((u) => u.email.toLowerCase() === datos.email.toLowerCase())) {
      throw new Error('Ese correo ya esta registrado')
    }
    if (lista.some((u) => u.documento === datos.documento)) {
      throw new Error('Ese numero de documento ya esta registrado')
    }
    const usuario = {
      id: crypto.randomUUID(),
      creadoEn: new Date().toISOString(),
      ...datos,
      password: hash(datos.password),
      habilidades: datos.habilidades ?? [],
      experiencia: [],
      certificados: [],
      resumenProfesional: '',
      favoritos: []
    }
    lista.push(usuario)
    guardar(KEY_USERS, lista)
    const token = hash(usuario.id)
    guardar(KEY_SESSION, { token, userId: usuario.id })
    return { token, usuario: publico(usuario) }
  },

  async login(email, password) {
    await espera()
    const usuario = usuarios().find((u) => u.email.toLowerCase() === String(email).toLowerCase())
    if (!usuario || usuario.password !== hash(password)) {
      throw new Error('Correo o contrasena incorrectos')
    }
    const token = hash(usuario.id)
    guardar(KEY_SESSION, { token, userId: usuario.id })
    return { token, usuario: publico(usuario) }
  },

  async sesionActual() {
    const s = leer(KEY_SESSION, null)
    if (!s) return null
    const usuario = usuarios().find((u) => u.id === s.userId)
    return usuario ? publico(usuario) : null
  },

  async logout() {
    localStorage.removeItem(KEY_SESSION)
  },

  async actualizarPerfil(id, cambios) {
    await espera(200)
    const lista = usuarios()
    const i = lista.findIndex((u) => u.id === id)
    if (i === -1) throw new Error('No encontramos tu cuenta')
    lista[i] = { ...lista[i], ...cambios }
    guardar(KEY_USERS, lista)
    return publico(lista[i])
  },

  async recuperarPassword(email) {
    await espera()
    const existe = usuarios().some((u) => u.email.toLowerCase() === String(email).toLowerCase())
    if (!existe) throw new Error('No encontramos una cuenta con ese correo')
    return { mensaje: 'Te enviamos un enlace para crear una contrasena nueva' }
  },

  async buscarVacantes({ q = '', ubicacion = '', modalidad = '', nivel = '', sector = '' } = {}) {
    await espera(260)
    const texto = q.trim().toLowerCase()
    return vacantes.filter((v) => {
      const enTexto =
        !texto ||
        v.titulo.toLowerCase().includes(texto) ||
        v.empresa.toLowerCase().includes(texto) ||
        v.sector.toLowerCase().includes(texto) ||
        v.hardSkills.some((s) => s.toLowerCase().includes(texto))
      const enUbicacion = !ubicacion || v.ubicacion.toLowerCase().includes(ubicacion.toLowerCase())
      const enModalidad = !modalidad || v.modalidad === modalidad
      const enNivel = !nivel || v.nivel === nivel
      const enSector = !sector || v.sector === sector
      return enTexto && enUbicacion && enModalidad && enNivel && enSector
    })
  },

  async postulaciones(userId) {
    return leer(KEY_APPS, []).filter((a) => a.userId === userId)
  },

  async registrarPostulacion(userId, vacanteId, estado = 'Postulado') {
    const lista = leer(KEY_APPS, [])
    const i = lista.findIndex((a) => a.userId === userId && a.vacanteId === vacanteId)
    const registro = { userId, vacanteId, estado, fecha: new Date().toISOString() }
    if (i === -1) lista.push(registro)
    else lista[i] = registro
    guardar(KEY_APPS, lista)
    return registro
  }
}
