import assert from 'node:assert/strict'
import { createServer } from 'vite'
import { createPinia, setActivePinia } from 'pinia'

const storage = new Map()
globalThis.localStorage = {
  getItem: key => storage.get(key) ?? null,
  setItem: (key, value) => storage.set(key, String(value)),
  removeItem: key => storage.delete(key)
}

const server = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
  // Esta suite prueba el modo simulado, sin importar lo que diga .env.
  define: { 'import.meta.env.VITE_USE_MOCK': JSON.stringify('true') }
})

try {
  const { mockApi } = await server.ssrLoadModule('/src/services/mockBackend.js')
  const { jobsService } = await server.ssrLoadModule('/src/services/jobsService.js')
  const { learningService } = await server.ssrLoadModule('/src/services/learningService.js')
  const { gapService } = await server.ssrLoadModule('/src/services/gapService.js')
  const { certificateService, validarFormatoPdf, pdfStorage } = await server.ssrLoadModule('/src/services/certificateService.js')
  const { normalizarHabilidades } = await server.ssrLoadModule('/src/utils/skills.js')
  const { vacantes } = await server.ssrLoadModule('/src/data/jobs.js')
  const { request } = await server.ssrLoadModule('/src/services/http.js')

  const account = {
    documento: '12345678',
    nombre: 'Ana',
    apellido: 'Prueba',
    tipoDocumento: 'DNI',
    email: 'ana@example.test',
    password: 'Prueba123',
    habilidades: ['Excel', { nombre: 'SQL', nivel: 'Avanzado' }]
  }
  await assert.rejects(mockApi.registrar({ ...account, documento: '123' }), /8/)
  const { usuario } = await mockApi.registrar(account)
  await assert.rejects(mockApi.registrar({ ...account, email: 'otra@example.test' }), /documento/)
  assert.deepEqual(normalizarHabilidades(['Excel', ' excel ', { nombre: 'SQL', nivel: 'Avanzado' }]), [
    { nombre: 'Excel', nivel: 'Básico' },
    { nombre: 'SQL', nivel: 'Avanzado' }
  ])

  setActivePinia(createPinia())
  const { useAuthStore } = await server.ssrLoadModule('/src/stores/auth.js')
  const { useJobsStore } = await server.ssrLoadModule('/src/stores/jobs.js')
  const { useLearningStore } = await server.ssrLoadModule('/src/stores/learning.js')
  const auth = useAuthStore()
  await auth.iniciar()
  const jobs = useJobsStore()
  const learning = useLearningStore()

  let searches = 0
  const search = jobsService.buscar
  jobsService.buscar = async filters => {
    searches++
    return search(filters)
  }
  assert.equal(jobs.resultados.length, 0)
  assert.equal(jobs.buscado, false)
  assert.equal(searches, 0)
  await jobs.buscar({ q: 'Contabilidad', ubicacion: 'Lima' })
  assert.ok(jobs.resultados.length)
  assert.equal(searches, 1)
  assert.equal('analisis' in jobs.resultados[0], false)
  jobs.limpiarFiltros()
  assert.equal(searches, 1)
  assert.equal(jobs.buscado, false)

  await Promise.all([
    jobs.guardarVacante(vacantes[0].id),
    jobs.guardarVacante(vacantes[1].id)
  ])
  await jobs.cargarGuardadas()
  assert.equal(jobs.favoritos.length, 2)
  assert.equal(jobs.guardadas.length, 2)
  assert.equal(jobs.resultados.length, 0)
  await jobs.guardarVacante(vacantes[0].id)
  assert.equal(jobs.favoritos.length, 2)

  const analysis = await gapService.analizar(usuario.id, vacantes[0], auth.habilidades)
  assert.ok(analysis.cubiertas.includes('Excel'))
  assert.ok(analysis.faltantes.length)
  await jobs.marcarPostulacion(vacantes[0].id)
  assert.equal(jobs.postulaciones.length, 1)
  assert.equal((await learningService.list(usuario.id)).length, 0)

  await learning.crear(vacantes[0])
  const path = learning.activa
  assert.equal((await learningService.create(usuario.id, vacantes[0], auth.habilidades)).id, path.id)
  assert.equal((await learningService.list('different-user')).length, 0)
  const course = path.cursos[0]
  await assert.rejects(learning.completar(course.id), /PDF/)
  assert.equal((await learningService.list(usuario.id))[0].cursos[0].completado, false)

  const pdf = new File(['%PDF-1.4\n1 0 obj\n<< /Type /Catalog >>\nendobj\n%%EOF'], 'certificado.pdf', { type: 'application/pdf' })
  await assert.rejects(validarFormatoPdf(new File(['plain text'], 'falso.pdf', { type: 'application/pdf' })), /estructura/)
  await assert.rejects(validarFormatoPdf(new File(['%PDF-1.4'], 'incompleto.pdf')), /estructura/)
  await assert.rejects(validarFormatoPdf(new File(['text'], 'documento.txt')), /formato PDF/)
  await assert.rejects(validarFormatoPdf({ name: 'grande.pdf', type: 'application/pdf', size: 11 * 1024 * 1024 }), /10 MB/)

  // Browser tests exercise real IndexedDB; this test isolates persistence failures.
  const documents = new Map()
  pdfStorage.put = async (key, file) => documents.set(key, file)
  pdfStorage.get = async key => documents.get(key)
  const stages = []
  const evidence = await certificateService.validar(usuario.id, pdf, {
    nombre: course.titulo,
    courseId: course.id
  }, stage => stages.push(stage))
  assert.equal(stages.length, 3)
  assert.equal(evidence.validacion.estado, 'aprobado')
  assert.equal(evidence.validacion.tipo, 'tecnica-local')
  assert.equal((await certificateService.documento(usuario.id, evidence.id)).name, 'certificado.pdf')
  assert.throws(() => certificateService.comprobante('different-user', evidence.id), /Adjunta/)
  assert.throws(() => certificateService.comprobante(usuario.id, evidence.id, 'wrong-course'), /Adjunta/)

  const complete = learningService.complete
  learningService.complete = async () => { throw new Error('Temporary failure') }
  await assert.rejects(learning.completar(course.id, evidence), /Temporary failure/)
  assert.equal(auth.usuario.certificados.length, 1)
  assert.equal((await learningService.list(usuario.id))[0].cursos[0].completado, false)
  learningService.complete = complete

  await learning.completar(course.id, evidence)
  await learning.completar(course.id, evidence)
  assert.equal(auth.usuario.certificados.length, 1)
  assert.ok(learning.progreso(learning.activa) > 0)
  assert.equal(learning.activa.cursos[0].certificateId, evidence.id)
  assert.equal((await mockApi.sesionActual()).certificados.length, 1)

  const profileEvidence = await certificateService.validar(usuario.id, pdf, { nombre: 'Certificado del perfil' })
  await auth.agregarCertificado(profileEvidence)
  assert.equal(auth.usuario.certificados.length, 2)
  await learning.cargar()
  assert.equal(learning.activa.id, path.id)

  const originalFetch = globalThis.fetch
  let sent
  globalThis.fetch = async (url, options) => {
    sent = { url, ...options }
    return new Response(JSON.stringify({ ok: true }), { status: 200 })
  }
  localStorage.setItem('pb.token', 'test-token')
  const multipart = new FormData()
  multipart.append('file', pdf)
  await request('/certificates/validate', { method: 'POST', body: multipart })
  assert.equal(sent.body, multipart)
  assert.equal('Content-Type' in sent.headers, false)
  assert.equal(sent.headers.Authorization, 'Bearer test-token')
  await request('/jobs/search', { method: 'POST', body: { q: 'Vue' } })
  assert.deepEqual(JSON.parse(sent.body), { q: 'Vue' })
  globalThis.fetch = originalFetch

  await auth.logout()
  await new Promise(resolve => setTimeout(resolve, 0))
  assert.equal(jobs.resultados.length, 0)
  assert.equal(jobs.guardadas.length, 0)
  assert.equal(learning.rutas.length, 0)

  console.log('PASS: explicit search, multiple saved jobs, independent gap analysis and applications, skill migration, PDF rejection and approval, evidence persistence, completion retries, multipart transport and session isolation.')
} finally {
  await server.close()
}

