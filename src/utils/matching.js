/**
 * Motor de compatibilidad (version cliente).
 * Cuando exista el Gap Analysis Service en Python, este calculo se reemplaza
 * por la respuesta del backend; la forma del resultado se mantiene igual.
 */

const normalizar = (s) => String(s).trim().toLowerCase()

export function analizarVacante(vacante, habilidadesUsuario = []) {
  const mias = habilidadesUsuario.map(normalizar)
  const tiene = (req) => mias.some((m) => m === normalizar(req) || m.includes(normalizar(req)) || normalizar(req).includes(m))

  const duras = vacante.hardSkills ?? []
  const blandas = vacante.softSkills ?? []

  const cubiertasDuras = duras.filter(tiene)
  const cubiertasBlandas = blandas.filter(tiene)

  const pct = (cubiertas, total) => (total.length ? Math.round((cubiertas.length / total.length) * 100) : 100)

  const matchDuras = pct(cubiertasDuras, duras)
  const matchBlandas = pct(cubiertasBlandas, blandas)

  return {
    match: Math.round(matchDuras * 0.75 + matchBlandas * 0.25),
    matchDuras,
    matchBlandas,
    cubiertas: [...cubiertasDuras, ...cubiertasBlandas],
    faltantes: [...duras.filter((s) => !tiene(s)), ...blandas.filter((s) => !tiene(s))],
    faltantesDuras: duras.filter((s) => !tiene(s))
  }
}

/** Cursos sugeridos para cada brecha (mock del Learning Pathway Service). */
export function rutaSugerida(faltantes = []) {
  // Catalogo referencial multisectorial. Cualquier habilidad fuera de la lista
  // cae en un curso generico, asi la app sirve para cualquier rubro.
  const catalogo = {
    // Administracion y finanzas
    excel: { titulo: 'Excel intermedio para el trabajo', proveedor: 'Crehana', horas: 12 },
    sap: { titulo: 'SAP para usuarios finales', proveedor: 'Udemy', horas: 16 },
    'contabilidad general': { titulo: 'Contabilidad general aplicada', proveedor: 'Coursera', horas: 20 },
    sunat: { titulo: 'Declaraciones mensuales ante SUNAT', proveedor: 'Crehana', horas: 8 },
    'analisis financiero': { titulo: 'Analisis financiero para no financieros', proveedor: 'Coursera', horas: 14 },
    'power bi': { titulo: 'Power BI desde cero', proveedor: 'Coursera', horas: 9 },
    // Recursos humanos
    'reclutamiento y seleccion': { titulo: 'Reclutamiento y seleccion por competencias', proveedor: 'Crehana', horas: 10 },
    'entrevista por competencias': { titulo: 'Entrevistas por competencias', proveedor: 'Udemy', horas: 6 },
    planillas: { titulo: 'Planillas y legislacion laboral peruana', proveedor: 'Crehana', horas: 12 },
    // Salud
    bioseguridad: { titulo: 'Bioseguridad en atencion asistencial', proveedor: 'Coursera', horas: 6 },
    'primeros auxilios': { titulo: 'Primeros auxilios y soporte basico', proveedor: 'Cruz Roja', horas: 8 },
    // Educacion
    'planificacion curricular': { titulo: 'Planificacion curricular por competencias', proveedor: 'Coursera', horas: 14 },
    'aulas virtuales': { titulo: 'Herramientas para aulas virtuales', proveedor: 'Crehana', horas: 6 },
    // Marketing y ventas
    'google analytics': { titulo: 'Google Analytics 4 desde cero', proveedor: 'Google Skillshop', horas: 8 },
    seo: { titulo: 'SEO para principiantes', proveedor: 'Crehana', horas: 10 },
    'google ads': { titulo: 'Campanas con Google Ads', proveedor: 'Google Skillshop', horas: 9 },
    crm: { titulo: 'Gestion de clientes con CRM', proveedor: 'Udemy', horas: 7 },
    // Diseno
    illustrator: { titulo: 'Illustrator para piezas de marca', proveedor: 'Domestika', horas: 12 },
    photoshop: { titulo: 'Photoshop aplicado a campanas', proveedor: 'Domestika', horas: 12 },
    figma: { titulo: 'Figma para diseno digital', proveedor: 'Crehana', horas: 10 },
    // Ingenieria y construccion
    autocad: { titulo: 'AutoCAD 2D y 3D', proveedor: 'Udemy', horas: 20 },
    revit: { titulo: 'Revit para proyectos de edificacion', proveedor: 'Udemy', horas: 24 },
    metrados: { titulo: 'Metrados y presupuestos de obra', proveedor: 'Crehana', horas: 16 },
    // Logistica
    'gestion de inventarios': { titulo: 'Gestion de inventarios y almacenes', proveedor: 'Coursera', horas: 12 },
    'mejora continua': { titulo: 'Lean y mejora continua', proveedor: 'Coursera', horas: 14 },
    // Legal
    'redaccion de contratos': { titulo: 'Redaccion de contratos civiles y mercantiles', proveedor: 'Udemy', horas: 12 },
    'derecho laboral': { titulo: 'Derecho laboral peruano actualizado', proveedor: 'Crehana', horas: 14 },
    // Gastronomia y turismo
    ingles: { titulo: 'Ingles para atencion al publico', proveedor: 'Coursera', horas: 30 },
    'bpm y sanidad': { titulo: 'Buenas practicas de manipulacion de alimentos', proveedor: 'Crehana', horas: 6 },
    // Tecnologia
    docker: { titulo: 'Docker desde cero', proveedor: 'Platzi', horas: 8 },
    aws: { titulo: 'AWS Cloud Practitioner', proveedor: 'Udemy', horas: 16 },
    'ci/cd': { titulo: 'CI/CD con GitHub Actions', proveedor: 'Platzi', horas: 6 },
    sql: { titulo: 'SQL para analisis de datos', proveedor: 'Coursera', horas: 10 },
    vue: { titulo: 'Vue 3 con Composition API', proveedor: 'Udemy', horas: 12 },
    python: { titulo: 'Python intermedio', proveedor: 'Platzi', horas: 15 },
    // Habilidades blandas
    comunicacion: { titulo: 'Comunicacion efectiva en el trabajo', proveedor: 'Coursera', horas: 6 },
    liderazgo: { titulo: 'Liderazgo de equipos', proveedor: 'Coursera', horas: 10 },
    negociacion: { titulo: 'Tecnicas de negociacion', proveedor: 'Crehana', horas: 8 }
  }

  return faltantes.map((skill) => {
    const base = catalogo[skill.toLowerCase()]
    return {
      skill,
      titulo: base?.titulo ?? `Fundamentos de ${skill}`,
      proveedor: base?.proveedor ?? 'Coursera',
      horas: base?.horas ?? 10,
      url: `https://www.google.com/search?q=curso+${encodeURIComponent(skill)}`
    }
  })
}
