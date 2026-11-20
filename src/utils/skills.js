export const nivelesDominio = ['Básico', 'Intermedio', 'Avanzado']

// Keep existing accounts readable after migrating from string skills.
// `tipo: 'soft'` marca una habilidad blanda; las tecnicas (hard) no llevan campo.
export function normalizarHabilidades(skills = []) {
  const seen = new Set()
  return skills.flatMap(skill => {
    const nombre = (typeof skill === 'string' ? skill : skill?.nombre || '').trim()
    const soft = skill?.tipo === 'soft'
    const key = `${soft ? 'soft' : 'hard'}:${nombre.toLocaleLowerCase()}`
    if (!nombre || seen.has(key)) return []
    seen.add(key)
    return [{
      nombre,
      nivel: nivelesDominio.includes(skill?.nivel) ? skill.nivel : 'Básico',
      ...(soft ? { tipo: 'soft' } : {})
    }]
  })
}

const sinAcentos = text => String(text ?? '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

/** Nivel de la UI -> texto libre que guarda el Gateway (ej. "avanzado"). */
export const nivelParaApi = nivel => sinAcentos(nivel)

/** Texto libre del Gateway ("avanzado", "alto", "B2") -> nivel de la UI. */
export function nivelDesdeApi(nivel) {
  const valor = sinAcentos(nivel)
  if (/avanz|alto|expert|c1|c2|senior/.test(valor)) return 'Avanzado'
  if (/inter|medio|b1|b2/.test(valor)) return 'Intermedio'
  return 'Básico'
}
