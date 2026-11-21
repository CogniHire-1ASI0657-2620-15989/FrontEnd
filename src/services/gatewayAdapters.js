// DTOs alineados con la guia de integracion del API Gateway.
import { nivelDesdeApi, nivelParaApi } from '@/utils/skills'
export function jobId(value) {
  const text = String(value)
  if (!/^\d+$/.test(text) || !Number.isSafeInteger(Number(text)) || Number(text) <= 0) {
    throw new Error('La vacante debe tener un ID numérico válido del servicio de empleos')
  }
  return Number(text)
}

export function normalizarVacante(dto) {
  return {
    id: String(dto.id),
    titulo: dto.title,
    empresa: dto.company || 'Empresa no informada',
    ubicacion: dto.location || 'Ubicación no informada',
    descripcion: dto.description_snippet || 'El proveedor no incluyó una descripción del puesto.',
    salario: dto.salary || 'Sueldo no publicado',
    tipoEmpleo: dto.employment_type || '',
    fuente: dto.source || dto.provider,
    proveedor: dto.provider,
    urlExterna: urlSegura(dto.external_url),
    publicada: dto.provider_updated_at,
    // Job Discovery does not return skills, responsibilities, seniority or sector.
    hardSkills: [],
    softSkills: [],
    responsabilidades: []
  }
}

function urlSegura(value) {
  try {
    const url = new URL(value)
    return ['http:', 'https:'].includes(url.protocol) ? url.href : ''
  } catch {
    return ''
  }
}

export function normalizarPagina(dto) {
  if (!dto || !Array.isArray(dto.items)) throw new Error('El servicio de empleos devolvió una respuesta inesperada')
  return {
    items: dto.items.map(normalizarVacante),
    total: dto.total,
    page: dto.page,
    pageSize: dto.page_size,
    providerStatus: dto.provider_status || ''
  }
}

export function normalizarReporte(dto) {
  const names = skills => (skills || []).map(skill => skill.name)
  const matchedHard = names(dto.matched_hard_skills)
  const missingHard = names(dto.missing_hard_skills)
  const matchedSoft = names(dto.matched_soft_skills)
  const missingSoft = names(dto.missing_soft_skills)
  const percentage = (matched, missing) => matched.length + missing.length
    ? Math.round(matched.length * 100 / (matched.length + missing.length))
    : null

  return {
    id: dto.id,
    vacanteId: String(dto.job_id),
    titulo: dto.job_title,
    descripcion: dto.job_description_snippet,
    match: dto.match_percentage,
    matchDuras: percentage(matchedHard, missingHard),
    matchBlandas: percentage(matchedSoft, missingSoft),
    cubiertas: [...matchedHard, ...matchedSoft],
    faltantes: [...missingHard, ...missingSoft],
    faltantesDuras: missingHard,
    cubiertasDuras: matchedHard,
    cubiertasBlandas: matchedSoft,
    faltantesBlandas: missingSoft,
    estado: dto.analysis_status,
    origen: dto.analysis_source,
    motor: dto.analysis_engine,
    generadoEn: dto.updated_at || dto.created_at
  }
}

// ---------------------------------------------------------------------------
// Identity / perfil — contrato de la guía del Gateway (sección 1)
// ---------------------------------------------------------------------------

/** Opciones de segmento aceptadas por el registro. La guia solo ejemplifica "trabajador". */
export const segmentos = [
  { valor: 'trabajador', texto: 'Estoy trabajando o buscando empleo' },
  { valor: 'estudiante', texto: 'Soy estudiante o recién egresado' }
]

const periodo = (inicio, fin) => [inicio, fin].filter(Boolean).join(' – ')

/** Perfil del Gateway -> usuario que consumen las vistas. */
export function normalizarUsuario(dto) {
  const educacion = dto.education?.[0] || null
  const habilidades = [
    ...(dto.hard_skills || []).map(s => ({ nombre: s.name, nivel: nivelDesdeApi(s.level) })),
    ...(dto.soft_skills || []).map(s => ({ nombre: s.name, nivel: nivelDesdeApi(s.level), tipo: 'soft' }))
  ]
  return {
    id: dto.id,
    email: dto.email,
    // El Gateway devuelve un unico campo `name` (nombre completo).
    nombre: dto.name || '',
    apellido: '',
    tipoDocumento: 'DNI',
    segmento: dto.segment || '',
    ciudad: dto.city || '',
    pais: dto.country || '',
    resumenProfesional: dto.professional_summary || '',
    habilidades,
    idiomas: dto.languages || [],
    educacionId: educacion?.id ?? null,
    nivelEstudios: educacion?.degree || '',
    carrera: educacion?.field_of_study || '',
    institucion: educacion?.institution || '',
    experiencia: (dto.experience || []).map(item => ({
      id: item.id ?? `${item.company}-${item.start_date}`,
      puesto: item.position || '',
      empresa: item.company || '',
      inicio: item.start_date || '',
      fin: item.end_date || '',
      periodo: periodo(item.start_date, item.end_date),
      detalle: '',
      guardada: true
    })),
    certificados: [],
    favoritos: [],
    creadoEn: dto.created_at
  }
}

/** Habilidades de la UI -> { hard_skills, soft_skills } del Gateway. */
export function habilidadesParaApi(habilidades = []) {
  const convertir = skill => ({ name: skill.nombre, level: nivelParaApi(skill.nivel) })
  return {
    hard_skills: habilidades.filter(s => s.tipo !== 'soft').map(convertir),
    soft_skills: habilidades.filter(s => s.tipo === 'soft').map(convertir)
  }
}

export function educacionParaApi({ nivelEstudios, carrera, institucion }) {
  const body = {}
  if (nivelEstudios) body.degree = nivelEstudios
  if (institucion) body.institution = institucion
  if (carrera) body.field_of_study = carrera
  return body
}

export function registroParaApi(datos) {
  return {
    dni: String(datos.documento).trim(),
    first_name: datos.nombre.trim(),
    first_last_name: datos.apellido.trim(),
    second_last_name: datos.segundoApellido.trim(),
    email: datos.email.trim(),
    password: datos.password,
    segment: datos.segmento,
    city: datos.ciudad?.trim() || undefined,
    country: datos.pais?.trim() || undefined
  }
}

// ---------------------------------------------------------------------------
// Rutas de aprendizaje y certificados — sección 4
// ---------------------------------------------------------------------------
const estaVisto = item => Boolean(item.watched_at) || ['watched', 'completed'].includes(item.status)

export function normalizarRuta(dto, vacante = {}) {
  return {
    id: String(dto.id),
    vacanteId: String(dto.job_id),
    reporteId: dto.gap_report_id,
    titulo: vacante.titulo || `Vacante ${dto.job_id}`,
    empresa: vacante.empresa || '',
    estado: dto.status,
    progreso: dto.progress_percentage ?? 0,
    actualizada: dto.updated_at,
    cursos: [...(dto.items || [])]
      .sort((a, b) => a.position - b.position)
      .map(item => ({
        id: String(item.id),
        orden: item.position,
        skill: item.skill_name,
        tipoSkill: item.skill_type,
        titulo: item.video_title || item.skill_name,
        canal: item.channel_title || '',
        descripcion: item.video_description || '',
        url: urlSegura(item.video_url),
        miniatura: urlSegura(item.thumbnail_url),
        completado: estaVisto(item),
        vistoEn: item.watched_at
      }))
  }
}

export function normalizarCertificado(dto) {
  const aprobado = dto.status === 'approved'
  return {
    id: String(dto.id),
    rutaId: dto.learning_path_id,
    skill: dto.skill_name,
    nombre: dto.detected_course_title || dto.skill_name,
    emisor: dto.provider || dto.detected_provider || 'Proveedor no informado',
    anio: dto.created_at ? String(new Date(dto.created_at).getFullYear()) : '',
    archivoOriginal: dto.original_filename,
    nombreDetectado: dto.detected_name || '',
    estado: dto.status,
    validacion: {
      estado: aprobado ? 'aprobado' : dto.status,
      tipo: 'servidor',
      detalle: dto.validation_detail || ''
    },
    sincronizacion: {
      perfil: dto.profile_sync_status || '',
      brechas: dto.gap_refresh_status || '',
      detalle: dto.synchronization_detail || ''
    },
    sincronizado: dto.profile_sync_status === 'completed' && dto.gap_refresh_status === 'completed',
    creadoEn: dto.created_at
  }
}
