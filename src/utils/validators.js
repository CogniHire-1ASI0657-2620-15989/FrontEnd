/**
 * Validaciones de formularios.
 * Devuelven un string con el error o null si el valor es valido.
 */

export const required = (value, campo = 'Este campo') =>
  value === null || value === undefined || String(value).trim() === ''
    ? `${campo} es obligatorio`
    : null

export const email = (value) =>
  /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(String(value).trim()) ? null : 'Escribe un correo valido'

export const password = (value) => {
  const v = String(value)
  if (v.length < 8) return 'La contrasena necesita al menos 8 caracteres'
  if (!/[A-Za-z]/.test(v) || !/[0-9]/.test(v)) return 'Combina letras y numeros'
  return null
}

/** DNI peruano: 8 digitos. Carne de extranjeria / pasaporte: 8 a 12 alfanumericos. */
export const documento = (valor, tipo) => {
  const v = String(valor).trim().toUpperCase()
  if (!v) return 'El numero de documento es obligatorio'
  if (tipo === 'DNI') return /^\d{8}$/.test(v) ? null : 'El DNI debe tener 8 digitos'
  if (tipo === 'CE') return /^[A-Z0-9]{9,12}$/.test(v) ? null : 'El carne de extranjeria tiene entre 9 y 12 caracteres'
  return /^[A-Z0-9]{6,12}$/.test(v) ? null : 'El pasaporte tiene entre 6 y 12 caracteres'
}

export const telefono = (value) => {
  if (!String(value).trim()) return null // opcional
  return /^[0-9+\s()-]{6,15}$/.test(String(value)) ? null : 'Escribe un telefono valido'
}

/** Corre un mapa de reglas { campo: [fn, fn] } sobre un objeto y devuelve { campo: error }. */
export function validar(datos, reglas) {
  const errores = {}
  for (const campo of Object.keys(reglas)) {
    for (const regla of reglas[campo]) {
      const error = regla(datos[campo])
      if (error) {
        errores[campo] = error
        break
      }
    }
  }
  return errores
}

export const sinErrores = (errores) => Object.keys(errores).length === 0
