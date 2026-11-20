import assert from 'node:assert/strict'
import { createServer } from 'vite'

// Contratos de la guia del API Gateway: auth, perfil, rutas de aprendizaje, certificados y entrevistas.
// Todas las llamadas HTTP se interceptan: no se escribe en servicios desplegados.
const store = { 'pb.token': 'fixture-jwt' }
globalThis.localStorage = {
  getItem: key => store[key] ?? null,
  setItem: (key, value) => { store[key] = String(value) },
  removeItem: key => { delete store[key] }
}
const originalFetch = globalThis.fetch
const calls = []
let respond
globalThis.fetch = async (url, options = {}) => {
  calls.push({ url: new URL(url), ...options })
  return respond(new URL(url), options)
}

const server = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
  define: {
    'import.meta.env.VITE_USE_MOCK': JSON.stringify('false'),
    'import.meta.env.VITE_API_URL': JSON.stringify('https://gateway.example/api/v1'),
    'import.meta.env.VITE_JOB_SEARCH_PATH': JSON.stringify('/jobs'),
    'import.meta.env.VITE_JOB_DETAIL_PATH': JSON.stringify('/jobs/:id'),
    'import.meta.env.VITE_GAP_ANALYSIS_PATH': JSON.stringify('/gap-reports')
  }
})

const json = (value, status = 200, headers = {}) => new Response(JSON.stringify(value), {
  status, headers: { 'Content-Type': 'application/json', ...headers }
})
const profile = {
  id: 1, name: 'Roxana Delgado Cuellar', email: 'roxana@example.com', segment: 'trabajador',
  city: 'Lima', country: 'Perú',
  hard_skills: [{ name: 'Python', level: 'avanzado' }],
  soft_skills: [{ name: 'Comunicación', level: 'alto' }],
  education: [{ id: 'edu-1', degree: 'Ingeniería', institution: 'Universidad', field_of_study: 'Sistemas', start_year: 2020, end_year: 2024 }],
  experience: [{ company: 'Acme', position: 'Backend Developer', start_date: '2022-01', end_date: '2024-06' }],
  languages: [], professional_summary: 'Desarrolladora de APIs.', created_at: '2026-11-03T12:00:00'
}
const pathDto = {
  id: 7, job_id: 4821, gap_report_id: 10, status: 'active', progress_percentage: 25,
  created_at: '2026-11-03T12:00:00Z', updated_at: '2026-11-03T12:00:00Z',
  items: [
    { id: 32, position: 2, skill_name: 'SQL', skill_type: 'hard', video_title: 'SQL', channel_title: 'C', video_url: 'https://www.youtube.com/watch?v=b', thumbnail_url: 'https://img/b.jpg', status: 'pending', watched_at: null },
    { id: 31, position: 1, skill_name: 'FastAPI', skill_type: 'hard', video_title: 'Curso de FastAPI', channel_title: 'Canal', video_url: 'https://www.youtube.com/watch?v=a', thumbnail_url: 'https://img/a.jpg', status: 'pending', watched_at: null }
  ]
}
const certDto = {
  id: 20, learning_path_id: 7, skill_name: 'FastAPI', provider: 'Udemy', original_filename: 'fastapi.pdf',
  content_type: 'application/pdf', status: 'approved', detected_name: 'Roxana Delgado', detected_course_title: 'FastAPI',
  detected_provider: 'Udemy', validation_detail: null, profile_sync_status: 'completed', gap_refresh_status: 'completed',
  synchronization_detail: null, created_at: '2026-11-03T12:00:00Z', updated_at: '2026-11-03T12:00:00Z'
}

try {
  const { authService } = await server.ssrLoadModule('/src/services/authService.js')
  const { learningService } = await server.ssrLoadModule('/src/services/learningService.js')
  const { certificateService } = await server.ssrLoadModule('/src/services/certificateService.js')
  const { interviewService } = await server.ssrLoadModule('/src/services/interviewService.js')
  const { http, setUnauthorizedHandler } = await server.ssrLoadModule('/src/services/http.js')
  const { normalizarUsuario, habilidadesParaApi } = await server.ssrLoadModule('/src/services/gatewayAdapters.js')
  const { createPinia, setActivePinia } = await import('pinia')
  const { useAuthStore } = await server.ssrLoadModule('/src/stores/auth.js')
  const { useLearningStore } = await server.ssrLoadModule('/src/stores/learning.js')
  const { nextTick } = await import('vue')

  // --- Registro: payload del Gateway, estudios y habilidades con el token recien emitido
  respond = (url, options) => {
    if (url.pathname === '/api/v1/auth/register') return json({ access_token: 'new-jwt', token_type: 'bearer', user: { id: 1, name: 'Roxana Delgado Cuellar', email: 'roxana@example.com' } }, 201)
    if (url.pathname === '/api/v1/profile/me' && options.method === 'GET') return json(profile)
    return json(profile, options.method === 'POST' ? 201 : 200)
  }
  const registro = await authService.registrar({
    documento: '46027896', nombre: 'Roxana', apellido: 'Delgado', segundoApellido: 'Cuellar',
    email: 'roxana@example.com', password: 'ClaveSegura123', segmento: 'trabajador', ciudad: 'Lima', pais: 'Perú',
    nivelEstudios: 'Bachiller', carrera: 'Sistemas', institucion: 'Universidad',
    habilidades: [{ nombre: 'Python', nivel: 'Avanzado' }, { nombre: 'Comunicación', nivel: 'Alto', tipo: 'soft' }]
  })
  const [reg, putSkills, postEdu, getProfile] = calls.slice(-4)
  assert.equal(reg.url.pathname, '/api/v1/auth/register')
  assert.deepEqual(JSON.parse(reg.body), {
    dni: '46027896', first_name: 'Roxana', first_last_name: 'Delgado', second_last_name: 'Cuellar',
    email: 'roxana@example.com', password: 'ClaveSegura123', segment: 'trabajador', city: 'Lima', country: 'Perú'
  })
  assert.equal(reg.headers.Authorization, undefined, 'el registro es publico')
  assert.equal(putSkills.method, 'PUT')
  assert.deepEqual(JSON.parse(putSkills.body), {
    hard_skills: [{ name: 'Python', level: 'avanzado' }],
    soft_skills: [{ name: 'Comunicación', level: 'alto' }]
  })
  assert.equal(putSkills.headers.Authorization, 'Bearer new-jwt')
  assert.equal(postEdu.url.pathname, '/api/v1/profile/me/education')
  assert.deepEqual(JSON.parse(postEdu.body), { degree: 'Bachiller', institution: 'Universidad', field_of_study: 'Sistemas' })
  assert.equal(getProfile.headers.Authorization, 'Bearer new-jwt')
  assert.equal(registro.token, 'new-jwt')
  assert.equal(registro.advertencia, '')
  assert.equal(registro.usuario.nombre, 'Roxana Delgado Cuellar')
  assert.deepEqual(registro.usuario.habilidades, [
    { nombre: 'Python', nivel: 'Avanzado' },
    // "alto" (nivel de habilidad blanda en el Gateway) se muestra como Avanzado.
    { nombre: 'Comunicación', nivel: 'Avanzado', tipo: 'soft' }
  ])
  assert.equal(registro.usuario.carrera, 'Sistemas')
  assert.equal(registro.usuario.experiencia[0].periodo, '2022-01 – 2024-06')
  // Nunca se envian encabezados internos.
  assert.ok(calls.every(call => !('X-User-Id' in (call.headers || {})) && !('X-Internal-Api-Key' in (call.headers || {}))))

  // --- Login: token + perfil
  respond = url => url.pathname.endsWith('/auth/login')
    ? json({ access_token: 'login-jwt', token_type: 'bearer', user: { id: 1 } })
    : json(profile)
  const login = await authService.login('roxana@example.com', 'ClaveSegura123')
  assert.equal(login.token, 'login-jwt')
  assert.equal(login.usuario.email, 'roxana@example.com')

  // --- Errores RFC 7807
  let unauthorized = 0
  setUnauthorizedHandler(() => { unauthorized++ })
  respond = () => json({ type: 'urn:pathbridge:problem:http-401', title: 'Unauthorized', status: 401, detail: 'Token de autenticación inválido.' }, 401)
  await assert.rejects(http.get('/profile/me'), e => e.status === 401 && e.message === 'Token de autenticación inválido.')
  assert.equal(unauthorized, 1)
  await assert.rejects(http.post('/auth/login', {}, { auth: false }), e => e.status === 401)
  assert.equal(unauthorized, 1, 'un login fallido no cierra sesion')

  respond = () => json({ detail: 'The request could not be validated.', errors: [{ loc: ['body', 'email'], msg: 'value is not a valid email' }] }, 422)
  await assert.rejects(http.post('/auth/register', {}, { auth: false }), e =>
    e.status === 422 && /email: value is not a valid email/.test(e.message) && e.campos.email === 'value is not a valid email')
  respond = () => json({ detail: 'x' }, 502)
  await assert.rejects(http.get('/jobs'), e => e.status === 502 && e.reintentable && /Intenta de nuevo/.test(e.message))
  respond = () => json({ detail: 'Proveedor caído' }, 503)
  await assert.rejects(http.get('/jobs'), e => e.status === 503 && e.reintentable && e.message === 'Proveedor caído')
  respond = () => json({ detail: 'boom' }, 500, { 'X-Correlation-ID': 'c61ac405' })
  await assert.rejects(http.get('/jobs'), e => e.status === 500 && e.correlationId === 'c61ac405' && /c61ac405/.test(e.message) && !/boom/.test(e.message))
  respond = () => { throw new TypeError('Failed to fetch') }
  await assert.rejects(http.get('/jobs'), e => e.status === 0 && e.reintentable)

  // --- Perfil: PUT solo con lo que cambia, educacion existente por PUT, experiencia nueva por POST
  const actual = normalizarUsuario(profile)
  respond = (url, options) => json(profile, options.method === 'POST' ? 201 : 200)
  await authService.actualizarPerfil(1, {
    resumenProfesional: 'Nuevo resumen',
    habilidades: [{ nombre: 'SQL', nivel: 'Intermedio' }],
    carrera: 'Software', nivelEstudios: actual.nivelEstudios, institucion: actual.institucion,
    experiencia: [
      ...actual.experiencia,
      { puesto: 'Dev', empresa: 'Beta', inicio: '2024-07', fin: '2025-01' }
    ]
  }, actual)
  const tail = calls.slice(-3)
  assert.equal(tail[0].method, 'PUT')
  assert.equal(tail[0].url.pathname, '/api/v1/profile/me')
  assert.deepEqual(JSON.parse(tail[0].body), {
    professional_summary: 'Nuevo resumen',
    hard_skills: [{ name: 'SQL', level: 'intermedio' }],
    soft_skills: []
  })
  assert.equal(tail[1].method, 'PUT')
  assert.equal(tail[1].url.pathname, '/api/v1/profile/me/education/edu-1')
  assert.equal(JSON.parse(tail[1].body).field_of_study, 'Software')
  assert.equal(tail[2].url.pathname, '/api/v1/profile/me/experience')
  assert.deepEqual(JSON.parse(tail[2].body), { company: 'Beta', position: 'Dev', start_date: '2024-07', end_date: '2025-01' })
  await assert.rejects(authService.actualizarPerfil(1, { experiencia: [{ puesto: 'X', empresa: 'Y', inicio: '', fin: '' }] }, actual), /mes de inicio/)

  // --- Contrasena y recuperacion
  respond = () => json(profile)
  await authService.cambiarPassword(1, 'ClaveActual123', 'NuevaClaveSegura123')
  assert.equal(calls.at(-1).method, 'PUT')
  assert.equal(calls.at(-1).url.pathname, '/api/v1/profile/me/password')
  assert.deepEqual(JSON.parse(calls.at(-1).body), { current_password: 'ClaveActual123', new_password: 'NuevaClaveSegura123' })
  respond = () => json({ message: 'Si el correo existe, se ha generado un token de recuperación.', token: 'tok' })
  assert.equal((await authService.recuperarPassword('a@b.co')).token, 'tok')
  respond = () => new Response(null, { status: 204 })
  assert.equal(await authService.restablecerPassword('t'.repeat(20), 'NuevaClaveSegura123'), null)
  assert.deepEqual(JSON.parse(calls.at(-1).body), { token: 't'.repeat(20), new_password: 'NuevaClaveSegura123' })
  assert.deepEqual(habilidadesParaApi([{ nombre: 'Excel', nivel: 'Básico' }]), { hard_skills: [{ name: 'Excel', level: 'basico' }], soft_skills: [] })

  // --- Rutas de aprendizaje: sin listado -> reportes de brechas + GET por empleo (404 = sin ruta)
  const reports = [
    { id: 10, job_id: 4821, job_title: 'Backend Developer' },
    { id: 11, job_id: 999, job_title: 'Sin ruta' }
  ].map(r => ({ ...r, match_percentage: 50, matched_hard_skills: [], missing_hard_skills: [], matched_soft_skills: [], missing_soft_skills: [], analysis_status: 'completed' }))
  respond = url => {
    if (url.pathname === '/api/v1/gap-reports') return json(reports)
    if (url.pathname === '/api/v1/favorites') return json({ items: [{ id: 4821, title: 'Backend Developer', company: 'Acme' }], total: 1, page: 1, page_size: 50 })
    if (url.pathname === '/api/v1/learning-paths/4821') return json(pathDto)
    if (url.pathname === '/api/v1/learning-paths/999') return json({ detail: 'No encontrada' }, 404)
    throw new Error('ruta inesperada ' + url.pathname)
  }
  const rutas = await learningService.list(1)
  assert.equal(rutas.length, 1)
  assert.equal(rutas[0].id, '7')
  assert.equal(rutas[0].titulo, 'Backend Developer')
  assert.equal(rutas[0].empresa, 'Acme')
  assert.equal(rutas[0].progreso, 25)
  assert.deepEqual(rutas[0].cursos.map(c => c.skill), ['FastAPI', 'SQL'], 'ordenados por position')
  assert.equal(rutas[0].cursos[0].url, 'https://www.youtube.com/watch?v=a')
  assert.equal(rutas[0].cursos[0].completado, false)

  respond = () => json(pathDto, 201)
  await learningService.create(1, { id: '4821', titulo: 'Backend Developer', empresa: 'Acme' }, [])
  assert.equal(calls.at(-1).method, 'POST')
  assert.equal(calls.at(-1).url.pathname, '/api/v1/learning-paths')
  assert.deepEqual(JSON.parse(calls.at(-1).body), { job_id: 4821 })

  respond = () => json({ ...pathDto, progress_percentage: 50, items: pathDto.items.map(i => i.id === 31 ? { ...i, status: 'watched', watched_at: '2026-11-04T10:00:00Z' } : i) })
  const visto = await learningService.marcarVisto('7', '31')
  assert.equal(calls.at(-1).method, 'PATCH')
  assert.equal(calls.at(-1).url.pathname, '/api/v1/learning-paths/7/items/31')
  assert.equal(visto.progreso, 50)
  assert.equal(visto.cursos[0].completado, true)

  respond = () => json({ learning_path_id: 7, status: 'active', progress_percentage: 50, total_items: 2, watched_items: 1 })
  assert.deepEqual(await learningService.progreso('7'), { progreso: 50, total: 2, vistos: 1, estado: 'active' })

  respond = () => json({ detail: 'YouTube no disponible' }, 503)
  await assert.rejects(learningService.create(1, { id: '4821' }, []), e => e.status === 503)

  // --- Store: marcar visto conserva titulo/empresa y el progreso del servidor
  setActivePinia(createPinia())
  const auth = useAuthStore()
  auth.usuario = { id: 1 }
  await nextTick()
  const learning = useLearningStore()
  respond = url => {
    if (url.pathname === '/api/v1/gap-reports') return json(reports.slice(0, 1))
    if (url.pathname === '/api/v1/favorites') return json({ items: [{ id: 4821, title: 'Backend Developer', company: 'Acme' }], total: 1, page: 1, page_size: 50 })
    return json(pathDto)
  }
  await learning.cargar()
  learning.elegir('7')
  respond = () => json({ ...pathDto, progress_percentage: 50 })
  await learning.marcarVisto('31')
  assert.equal(learning.progreso(learning.activa), 50)
  assert.equal(learning.activa.titulo, 'Backend Developer')
  assert.equal(learning.activa.empresa, 'Acme')

  // --- Certificados: multipart sin Content-Type manual y campos del contrato
  respond = () => json(certDto, 201)
  const archivo = new File([new Uint8Array([37, 80, 68, 70])], 'fastapi.pdf', { type: 'application/pdf' })
  const cert = await certificateService.validar(1, archivo, { rutaId: 7, skill: 'FastAPI', emisor: 'Udemy' })
  const upload = calls.at(-1)
  assert.equal(upload.method, 'POST')
  assert.equal(upload.url.pathname, '/api/v1/certificates')
  assert.ok(upload.body instanceof FormData)
  assert.equal(upload.headers['Content-Type'], undefined)
  assert.equal(upload.headers.Authorization, 'Bearer fixture-jwt')
  assert.equal(upload.body.get('learning_path_id'), '7')
  assert.equal(upload.body.get('skill_name'), 'FastAPI')
  assert.equal(upload.body.get('provider'), 'Udemy')
  assert.equal(upload.body.get('file').name, 'fastapi.pdf')
  assert.equal(cert.validacion.estado, 'aprobado')
  assert.equal(cert.sincronizado, true)

  await assert.rejects(certificateService.validar(1, new File(['x'], 'a.txt', { type: 'text/plain' }), { rutaId: 7, skill: 'FastAPI' }), /PDF, JPG o PNG/)
  await assert.rejects(certificateService.validar(1, new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'big.png', { type: 'image/png' }), { rutaId: 7, skill: 'FastAPI' }), /5 MB/)
  await assert.rejects(certificateService.validar(1, archivo, { skill: 'FastAPI' }), /curso de tu ruta/)
  respond = () => json({ ...certDto, status: 'rejected', validation_detail: 'No coincide el nombre' }, 201)
  await assert.rejects(certificateService.validar(1, archivo, { rutaId: 7, skill: 'FastAPI' }), /No coincide el nombre/)
  respond = () => json({ ...certDto, profile_sync_status: 'failed', synchronization_detail: 'timeout' })
  assert.equal((await certificateService.obtener(20)).sincronizado, false)
  assert.equal(calls.at(-1).url.pathname, '/api/v1/certificates/20')
  respond = () => json([certDto])
  assert.equal((await certificateService.listar(7)).length, 1)
  assert.equal(calls.at(-1).url.search, '?learning_path_id=7')
  respond = () => json(certDto)
  await certificateService.sincronizar(20)
  assert.equal(calls.at(-1).method, 'POST')
  assert.equal(calls.at(-1).url.pathname, '/api/v1/certificates/20/synchronization')

  // --- Entrevistas
  const sesion = { id: 40, job_id: 4821, job_title: 'Backend Developer', mode: 'mixed', status: 'active', question_count: 1, max_questions: 6, messages: [{ id: 1, sequence: 1, speaker: 'coach', content: 'Cuéntame sobre...' }], report: null }
  respond = () => json(sesion, 201)
  await interviewService.iniciar('4821', 'technical')
  assert.equal(calls.at(-1).url.pathname, '/api/v1/interview-sessions')
  assert.deepEqual(JSON.parse(calls.at(-1).body), { job_id: 4821, mode: 'technical' })
  respond = () => json({ ...sesion, question_count: 2 })
  assert.equal((await interviewService.responder(40, '  Mi respuesta  ')).question_count, 2)
  assert.equal(calls.at(-1).url.pathname, '/api/v1/interview-sessions/40/messages')
  assert.deepEqual(JSON.parse(calls.at(-1).body), { content: 'Mi respuesta' })
  await assert.rejects(interviewService.responder(40, '   '), /entre 1 y 10 000/)
  respond = () => json({ ...sesion, status: 'completed', report: { overall_score: 80, strengths: ['a'] } })
  assert.equal((await interviewService.finalizar(40)).report.overall_score, 80)
  assert.equal(calls.at(-1).url.pathname, '/api/v1/interview-sessions/40/complete')
  assert.equal(calls.at(-1).body, undefined)
  respond = () => json({ detail: 'La vacante debe estar en favoritos.' }, 400)
  await assert.rejects(interviewService.iniciar('4821'), e => e.status === 400 && /favoritos/.test(e.message))

  console.log('PASS Gateway integration: register/login/profile/password, RFC 7807 errors and 401 handling, learning paths via gap reports, certificate multipart + sync, interview sessions.')
} finally {
  globalThis.fetch = originalFetch
  await server.close()
}
