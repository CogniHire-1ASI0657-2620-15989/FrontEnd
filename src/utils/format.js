export const iniciales = (nombre = '', apellido = '') =>
  `${nombre.charAt(0)}${apellido.charAt(0)}`.toUpperCase() || 'PB'

export const nombreCompleto = (u) => (u ? `${u.nombre} ${u.apellido}`.trim() : '')

export function fechaCorta(iso) {
  if (!iso) return ''
  return new Date(iso).toLocaleDateString('es-PE', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function hace(iso) {
  const dias = Math.floor((Date.now() - new Date(iso).getTime()) / 86400000)
  if (dias <= 0) return 'Publicado hoy'
  if (dias === 1) return 'Publicado ayer'
  return `Publicado hace ${dias} dias`
}

export const sueldo = (min, max) =>
  min && max ? `S/ ${min.toLocaleString('es-PE')} - ${max.toLocaleString('es-PE')}` : 'Sueldo no publicado'
