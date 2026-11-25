import assert from 'node:assert/strict'
import { createServer } from 'vite'

// Fixtures follow the Pydantic resources in the three supplied repositories.
// All HTTP calls are intercepted: this test does not write to deployed services.
globalThis.localStorage = { getItem: key => key === 'pb.token' ? 'fixture-jwt' : null }
const originalFetch = globalThis.fetch
const calls = []
let respond
globalThis.fetch = async (url, options) => {
  calls.push({ url: new URL(url), ...options })
  return respond(new URL(url), options)
}

const server = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
  define: {
    'import.meta.env.VITE_USE_MOCK': JSON.stringify('false'),
    'import.meta.env.VITE_API_URL': JSON.stringify('https://gateway.example/api/v1/'),
    'import.meta.env.VITE_JOB_SEARCH_PATH': JSON.stringify('/jobs'),
    'import.meta.env.VITE_JOB_DETAIL_PATH': JSON.stringify('/jobs/:id'),
    'import.meta.env.VITE_GAP_ANALYSIS_PATH': JSON.stringify('/gap-reports')
  }
})

const json = (value, status = 200) => new Response(JSON.stringify(value), {
  status,
  headers: { 'Content-Type': 'application/json' }
})
const job = {
  id: 42,
  provider: 'jooble_pe',
  title: 'Backend Developer',
  company: 'Empresa de prueba',
  location: 'Lima',
  description_snippet: 'Desarrollo de APIs Python y SQL',
  salary: 'S/ 4000',
  employment_type: 'Tiempo completo',
  source: 'Jooble',
  external_url: 'https://jobs.example/42',
  provider_updated_at: null
}
const report = {
  id: 7,
  job_id: 42,
  job_title: job.title,
  job_description_snippet: job.description_snippet,
  match_percentage: 50,
  matched_hard_skills: [{ name: 'Python', skill_type: 'hard' }],
  missing_hard_skills: [{ name: 'SQL', skill_type: 'hard' }],
  matched_soft_skills: [],
  missing_soft_skills: [],
  analysis_source: 'title_and_description_snippet',
  analysis_status: 'completed',
  analysis_engine: 'rule_based_fallback',
  created_at: '2026-11-07T12:00:00Z',
  updated_at: '2026-11-07T12:00:00Z'
}

try {
  const { jobsService, parametrosBusqueda } = await server.ssrLoadModule('/src/services/jobsService.js')
  const { gapService } = await server.ssrLoadModule('/src/services/gapService.js')
  const { normalizarReporte } = await server.ssrLoadModule('/src/services/gatewayAdapters.js')
  const { useAuthStore } = await server.ssrLoadModule('/src/stores/auth.js')
  const { useJobsStore } = await server.ssrLoadModule('/src/stores/jobs.js')
  const { createPinia, setActivePinia } = await import('pinia')
  const { nextTick } = await import('vue')

  assert.throws(() => parametrosBusqueda({ q: 'Python' }), /ubicación/)
  assert.throws(() => parametrosBusqueda({ ubicacion: 'Lima' }), /puesto/)
  assert.throws(() => parametrosBusqueda({ q: 'Python', ubicacion: 'Lima', pagina: 4 }), /3 páginas/)
  assert.throws(() => parametrosBusqueda({ q: 'Python', ubicacion: 'Lima', radio: 5 }), /radio/)
  assert.equal(calls.length, 0)

  respond = () => json({ items: [job], total: 30, page: 2, page_size: 10, provider_status: 'available' })
  const results = await jobsService.buscar({ q: ' Python ', ubicacion: ' Lima ', radio: 16, pagina: 2 })
  const call = calls.at(-1)
  assert.equal(call.method, 'GET')
  assert.equal(call.url.pathname, '/api/v1/jobs')
  assert.deepEqual(Object.fromEntries(call.url.searchParams), {
    keywords: 'Python', location: 'Lima', page: '2', page_size: '10', radius_km: '16'
  })
  assert.equal(call.body, undefined)
  assert.deepEqual(call.headers, { 'Content-Type': 'application/json', Authorization: 'Bearer fixture-jwt' })
  assert.equal(results.items[0].id, '42')
  assert.equal(results.items[0].titulo, job.title)
  assert.equal(results.items[0].salario, job.salary)
  assert.equal(results.items[0].urlExterna, job.external_url)
  assert.deepEqual(results.items[0].hardSkills, [])
  assert.equal(results.total, 30)
  assert.equal(results.providerStatus, 'available')

  respond = () => json(job)
  assert.equal((await jobsService.detalle('42')).titulo, job.title)
  assert.equal(calls.at(-1).url.pathname, '/api/v1/jobs/42')
  await assert.rejects(jobsService.detalle('jd-001'), /ID numérico/)

  respond = url => {
    assert.equal(url.pathname, '/api/v1/favorites')
    const page = Number(url.searchParams.get('page'))
    return json({
      items: page === 1 ? Array.from({ length: 50 }, (_, i) => ({ ...job, id: i + 1 })) : [{ ...job, id: 51 }],
      total: 51, page, page_size: 50
    })
  }
  const favorites = await jobsService.guardadas(999)
  assert.equal(favorites.length, 51)
  assert.equal(favorites.at(-1).id, '51')

  respond = () => json({ job, created: false })
  const saved = await jobsService.guardar('42')
  assert.equal(saved.vacante.id, '42')
  assert.equal(saved.creada, false)
  assert.equal(calls.at(-1).method, 'POST')
  assert.equal(calls.at(-1).url.pathname, '/api/v1/jobs/42/favorite')
  assert.equal(calls.at(-1).body, undefined)
  respond = () => new Response(null, { status: 204 })
  assert.equal(await jobsService.quitarGuardada('42'), null)
  assert.equal(calls.at(-1).method, 'DELETE')

  respond = () => json(report, 201)
  const analysis = await gapService.analizar(999, { id: '42' }, [{ nombre: 'Python', nivel: 'Avanzado' }])
  assert.equal(calls.at(-1).url.pathname, '/api/v1/gap-reports')
  assert.equal(calls.at(-1).method, 'POST')
  assert.deepEqual(JSON.parse(calls.at(-1).body), { job_id: 42 })
  assert.equal(analysis.match, 50)
  assert.equal(analysis.matchDuras, 50)
  assert.equal(analysis.matchBlandas, null)
  assert.deepEqual(analysis.cubiertas, ['Python'])
  assert.deepEqual(analysis.faltantes, ['SQL'])
  assert.equal(analysis.estado, 'completed')
  assert.equal(analysis.motor, 'rule_based_fallback')

  respond = () => json(report)
  await gapService.consultar('42')
  assert.equal(calls.at(-1).url.pathname, '/api/v1/gap-reports/42')
  respond = () => json([report])
  assert.equal((await gapService.listar()).length, 1)
  assert.equal(calls.at(-1).url.pathname, '/api/v1/gap-reports')
  assert.equal(normalizarReporte({ ...report, analysis_status: 'insufficient_job_data' }).estado, 'insufficient_job_data')

  setActivePinia(createPinia())
  const auth = useAuthStore()
  auth.usuario = { id: 999, favoritos: [] }
  await nextTick()
  const jobs = useJobsStore()
  respond = () => json({ items: [job], total: 1, page: 1, page_size: 50 })
  await jobs.cargarGuardadas()
  assert.deepEqual(jobs.favoritos, ['42'])
  respond = () => json({ job: { ...job, id: 43 }, created: true })
  await jobs.guardarVacante('43')
  assert.deepEqual(jobs.favoritos, ['42', '43'])
  assert.equal(calls.at(-1).url.pathname, '/api/v1/jobs/43/favorite')

  respond = () => json({ items: [], total: 0, page: 1, page_size: 10, provider_status: 'unavailable' })
  await jobs.buscar({ q: 'Python', ubicacion: 'Lima' })
  assert.equal(jobs.providerStatus, 'unavailable')
  assert.equal(jobs.total, 0)

  respond = () => json({ detail: [{ loc: ['query', 'keywords'], msg: 'Field required' }] }, 422)
  await assert.rejects(jobsService.detalle('42'), error => error.status === 422 && /keywords/.test(error.message))
  respond = () => json({ detail: 'Token de autenticación inválido.' }, 401)
  await assert.rejects(gapService.consultar('42'), error => error.status === 401)

  console.log('PASS Gateway contract: GET search query/pagination, DTO adapters, paginated remote favorites, bodyless saves, 204 deletes, job_id-only gap reports, analysis status, bearer identity and 401/422 errors.')
} finally {
  globalThis.fetch = originalFetch
  await server.close()
}
