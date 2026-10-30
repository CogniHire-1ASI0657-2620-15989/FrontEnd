/** Frontend-only identity demo. Does not query RENIEC or verify legal identity. */
export const identityService = {
  async validar({ documento, nombre, apellido, consentimiento }) {
    if (!consentimiento) throw new Error('Autoriza el tratamiento de tus datos para continuar')
    if (!/^\d{8}$/.test(documento)) throw new Error('El DNI debe tener exactamente 8 dígitos')
    if (!nombre.trim() || !apellido.trim()) throw new Error('Ingresa tus nombres y apellidos')
    await new Promise(resolve => setTimeout(resolve, 600))
    const users = JSON.parse(localStorage.getItem('pb.users') || '[]')
    if (users.some(u => u.tipoDocumento === 'DNI' && u.documento === documento)) throw new Error('Este DNI ya tiene una cuenta en este navegador')
    return { documento, nombre: nombre.trim(), apellido: apellido.trim(), estado: 'simulado', fecha: new Date().toISOString() }
  }
}
