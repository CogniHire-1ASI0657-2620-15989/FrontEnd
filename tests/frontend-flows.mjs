import assert from 'node:assert/strict'
import { createServer } from 'vite'
import { createPinia, setActivePinia } from 'pinia'

const storage = new Map()
globalThis.localStorage = { getItem: key => storage.get(key) ?? null, setItem: (key, value) => storage.set(key, String(value)), removeItem: key => storage.delete(key) }
const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' })
try {
  const { identityService } = await server.ssrLoadModule('/src/services/identityService.js')
  const { mockApi } = await server.ssrLoadModule('/src/services/mockBackend.js')
  const { learningService } = await server.ssrLoadModule('/src/services/learningService.js')
  const { vacantes } = await server.ssrLoadModule('/src/data/jobs.js')
  const identity = { documento: '12345678', nombre: 'Ana', apellido: 'Prueba', consentimiento: true }
  await assert.rejects(identityService.validar({ ...identity, documento: '123' }), /8/)
  await assert.rejects(identityService.validar({ ...identity, consentimiento: false }), /Autoriza/)
  const verified = await identityService.validar(identity)
  assert.equal(verified.estado, 'simulado')
  const { usuario } = await mockApi.registrar({ ...identity, tipoDocumento: 'DNI', email: 'ana@example.test', password: 'Prueba123', identidad: verified })
  await assert.rejects(identityService.validar(identity), /ya tiene/)
  await assert.rejects(mockApi.registrar({ ...identity, tipoDocumento: 'DNI', email: 'otra@example.test', password: 'Prueba123', identidad: verified }), /documento/)
  const path = await learningService.create(usuario.id, vacantes[0], [])
  assert.ok(path.cursos.length > 0)
  assert.equal((await learningService.create(usuario.id, vacantes[0], [])).id, path.id)
  assert.equal((await learningService.list('different-user')).length, 0)
  setActivePinia(createPinia())
  const { useAuthStore } = await server.ssrLoadModule('/src/stores/auth.js')
  const { useLearningStore } = await server.ssrLoadModule('/src/stores/learning.js')
  const auth = useAuthStore(), learning = useLearningStore()
  await auth.iniciar()
  await learning.cargar()
  assert.equal(learning.activa, undefined)
  learning.elegir(path.id)
  await learning.completar(path.cursos[0].id)
  await learning.completar(path.cursos[0].id)
  assert.equal(auth.usuario.certificados.length, 1)
  assert.ok(learning.progreso(learning.activa) > 0)
  assert.equal((await mockApi.sesionActual()).certificados.length, 1)
  await learning.cargar()
  assert.equal(learning.activa.id, path.id)
  console.log('PASS: DNI format/consent/duplicates, isolated and idempotent paths, persisted progress and one CV certificate on retry.')
} finally { await server.close() }
