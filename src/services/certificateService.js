import { USA_MOCK, http } from './http'
import { gatewayRoutes } from './gatewayRoutes'
import { normalizarCertificado } from './gatewayAdapters'

const MAX_SIZE = 10 * 1024 * 1024
// El Gateway acepta PDF, JPG/JPEG o PNG de hasta 5 MB.
const MAX_SIZE_API = 5 * 1024 * 1024
const TIPOS_API = ['application/pdf', 'image/jpeg', 'image/png']
const receiptKey = (userId, id) => `pb.pdf-validation.${userId}.${id}`
const pause = () => new Promise(resolve => setTimeout(resolve, 550))

function database() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('pathbridge-evidence', 1)
    request.onupgradeneeded = () => request.result.createObjectStore('pdfs')
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(new Error('No se pudo abrir el almacenamiento de documentos'))
  })
}

async function documentOperation(mode, action) {
  const db = await database()
  try {
    return await new Promise((resolve, reject) => {
      const transaction = db.transaction('pdfs', mode)
      const request = action(transaction.objectStore('pdfs'))
      transaction.oncomplete = () => resolve(request.result)
      transaction.onabort = () => reject(new Error('No se pudo guardar el PDF. Revisa el espacio disponible del navegador.'))
      transaction.onerror = () => reject(new Error('No se pudo acceder al PDF'))
    })
  } finally {
    db.close()
  }
}

export const pdfStorage = {
  put: (key, file) => documentOperation('readwrite', store => store.put(file, key)),
  get: key => documentOperation('readonly', store => store.get(key))
}

export async function validarFormatoPdf(file) {
  if (!file || !/\.pdf$/i.test(file.name) || (file.type && file.type !== 'application/pdf')) {
    throw new Error('Selecciona un documento en formato PDF')
  }
  if (!file.size || file.size > MAX_SIZE) {
    throw new Error('El PDF debe pesar entre 1 byte y 10 MB')
  }
  const header = await file.slice(0, 8).text()
  const trailer = await file.slice(-2048).text()
  if (!/^%PDF-\d\.\d/.test(header) || !trailer.includes('%%EOF')) {
    throw new Error('El archivo no tiene una estructura PDF reconocible o está incompleto')
  }
}

export function validarArchivoCertificado(file) {
  const porExtension = /\.pdf$/i.test(file?.name || '') ? 'application/pdf'
    : /\.jpe?g$/i.test(file?.name || '') ? 'image/jpeg'
    : /\.png$/i.test(file?.name || '') ? 'image/png' : ''
  const tipo = file?.type || porExtension
  if (!file || !TIPOS_API.includes(tipo)) throw new Error('Selecciona un certificado en PDF, JPG o PNG')
  if (!file.size || file.size > MAX_SIZE_API) throw new Error('El archivo debe pesar entre 1 byte y 5 MB')
}

export const certificateService = {
  /**
   * Con el Gateway se sube a POST /certificates (multipart) y el servicio decide si lo aprueba.
   * `rutaId` y `skill` son obligatorios en ese modo: el certificado pertenece a una habilidad de la ruta.
   */
  async validar(userId, file, { nombre, emisor = '', courseId = '', rutaId, skill } = {}, onStage = () => {}) {
    if (!USA_MOCK) {
      onStage('Revisando el archivo…')
      validarArchivoCertificado(file)
      if (!rutaId || !skill) throw new Error('Elige el curso de tu ruta al que corresponde el certificado')
      const body = new FormData()
      body.append('learning_path_id', String(rutaId))
      body.append('skill_name', skill)
      if (emisor.trim()) body.append('provider', emisor.trim().slice(0, 150))
      body.append('file', file)
      onStage('Enviando el documento para su análisis y validación…')
      const certificate = normalizarCertificado(await http.post(gatewayRoutes.certificates, body))
      if (certificate.validacion.estado !== 'aprobado') {
        const detalle = certificate.validacion.detalle
        throw new Error(`El certificado no fue aprobado (estado: ${certificate.estado}).${detalle ? ` ${detalle}` : ''}`)
      }
      return certificate
    }

    onStage('Revisando el archivo PDF…')
    await validarFormatoPdf(file)

    await pause()
    onStage('Analizando la estructura del documento…')
    await pause()
    onStage('Guardando y validando la evidencia…')
    const id = crypto.randomUUID()
    await pdfStorage.put(receiptKey(userId, id), file)
    const certificate = {
      id,
      nombre: nombre?.trim() || file.name.replace(/\.pdf$/i, ''),
      emisor: emisor.trim() || 'Documento adjunto',
      anio: String(new Date().getFullYear()),
      courseId,
      archivo: { id, nombre: file.name, tamano: file.size },
      validacion: { estado: 'aprobado', tipo: 'tecnica-local', fecha: new Date().toISOString() }
    }
    localStorage.setItem(receiptKey(userId, id), JSON.stringify(certificate))
    await pause()
    return certificate
  },

  comprobante(userId, id, courseId) {
    const certificate = JSON.parse(localStorage.getItem(receiptKey(userId, id)) || 'null')
    if (!certificate || certificate.validacion?.estado !== 'aprobado' || (courseId && certificate.courseId !== courseId)) {
      throw new Error('Adjunta y valida un certificado PDF para este curso')
    }
    return certificate
  },

  async listar(learningPathId) {
    const query = learningPathId ? `?learning_path_id=${encodeURIComponent(learningPathId)}` : ''
    return (await http.get(`${gatewayRoutes.certificates}${query}`)).map(normalizarCertificado)
  },

  async obtener(id) {
    return normalizarCertificado(await http.get(gatewayRoutes.certificate(id)))
  },

  /** Reintenta pasar la habilidad al perfil y recalcular el reporte de brechas. */
  async sincronizar(id) {
    return normalizarCertificado(await http.post(gatewayRoutes.certificateSync(id)))
  },

  async documento(userId, id) {
    // El Gateway no expone la descarga del archivo original.
    if (!USA_MOCK) throw new Error('La descarga del archivo no está disponible')
    const file = await pdfStorage.get(receiptKey(userId, id))
    if (!file) throw new Error('Este PDF no está disponible en este navegador')
    return file
  }
}
