<script setup>
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { USA_MOCK } from '@/services/http'
import { certificateService } from '@/services/certificateService'
import { normalizarHabilidades } from '@/utils/skills'
import { validar, sinErrores, required, telefono as esTelefono, password as esPassword } from '@/utils/validators'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import SkillEditor from '@/components/ui/SkillEditor.vue'
import CertificateUpload from '@/components/profile/CertificateUpload.vue'
import CertificateDownload from '@/components/profile/CertificateDownload.vue'
import CvDocument from '@/components/profile/CvDocument.vue'

const auth = useAuthStore()
const vista = ref('datos')
const guardando = ref(false)
const uploading = ref(false)
const savingCertificate = ref(false)
const aviso = ref('')
const error = ref('')
const errores = reactive({})
const nivelesEstudios = [
  'Secundaria completa', 'Tecnico en curso', 'Tecnico titulado',
  'Universitario en curso', 'Bachiller', 'Titulado', 'Maestria'
]

const form = reactive({
  nombre: '', apellido: '', fechaNacimiento: '', telefono: '', ciudad: '',
  nivelEstudios: '', carrera: '', institucion: '', resumenProfesional: '',
  habilidades: [], experiencia: []
})

function cargarDesdeUsuario(user) {
  if (!user) return
  Object.keys(form).forEach(key => {
    const value = user[key]
    form[key] = Array.isArray(form[key])
      ? JSON.parse(JSON.stringify(value || []))
      : value || ''
  })
  form.habilidades = normalizarHabilidades(user.habilidades)
}

// Certificate uploads must not discard unsaved profile edits.
watch(() => auth.usuario?.id, () => cargarDesdeUsuario(auth.usuario), { immediate: true })

// Con el Gateway los certificados viven en el servidor (GET /certificates).
const certificadosApi = ref([])
const certificados = computed(() => (USA_MOCK ? auth.usuario?.certificados || [] : certificadosApi.value))
const agregarExperiencia = () => form.experiencia.push(
  USA_MOCK
    ? { puesto: '', empresa: '', periodo: '', detalle: '' }
    : { puesto: '', empresa: '', inicio: '', fin: '' }
)

async function cargarCertificados() {
  if (USA_MOCK) return
  try { certificadosApi.value = await certificateService.listar() }
  catch (e) { error.value = e.message }
}

onMounted(() => {
  if (auth.avisoInicial) {
    error.value = auth.avisoInicial
    auth.avisoInicial = ''
  }
  cargarCertificados()
})

const clave = reactive({ actual: '', nueva: '', confirmacion: '' })
const cambiandoClave = ref(false)
async function cambiarClave() {
  error.value = ''
  aviso.value = ''
  const problema = required(clave.actual, 'La contrasena actual') || esPassword(clave.nueva)
    || (clave.nueva === clave.confirmacion ? null : 'Las contrasenas no coinciden')
  if (problema) { error.value = problema; return }
  cambiandoClave.value = true
  try {
    await auth.cambiarPassword(clave.actual, clave.nueva)
    Object.assign(clave, { actual: '', nueva: '', confirmacion: '' })
    aviso.value = 'Contraseña actualizada'
  } catch (e) {
    error.value = e.message
  } finally {
    cambiandoClave.value = false
  }
}

async function guardar() {
  error.value = ''
  aviso.value = ''
  Object.keys(errores).forEach(key => delete errores[key])
  const nuevos = validar(form, USA_MOCK
    ? {
        nombre: [value => required(value, 'El nombre')],
        apellido: [value => required(value, 'El apellido')],
        telefono: [esTelefono],
        carrera: [value => required(value, 'La carrera')]
      }
    : {})
  Object.assign(errores, nuevos)
  if (!sinErrores(nuevos)) return

  guardando.value = true
  try {
    await auth.actualizar(JSON.parse(JSON.stringify({
      ...form,
      habilidades: normalizarHabilidades(form.habilidades)
    })))
    if (!USA_MOCK) cargarDesdeUsuario(auth.usuario)
    aviso.value = 'Cambios guardados'
  } catch (e) {
    error.value = e.message
  } finally {
    guardando.value = false
  }
}

async function guardarCertificado(certificate) {
  savingCertificate.value = true
  aviso.value = ''
  error.value = ''
  try {
    await auth.agregarCertificado(certificate)
    await cargarCertificados()
    aviso.value = '✓ Certificado validado y guardado en tu perfil'
  } catch (e) {
    error.value = e.message
  } finally {
    savingCertificate.value = false
  }
}

const imprimir = () => window.print()
</script>

<template>
  <div class="profile-page stack">
    <nav class="row no-print" aria-label="Secciones del perfil">
      <button type="button" class="text-button" :aria-pressed="vista === 'datos'" @click="vista = 'datos'">Datos del perfil</button>
      <button type="button" class="text-button" :aria-pressed="vista === 'curriculum'" @click="vista = 'curriculum'">Mi currículum</button>
    </nav>

    <p v-if="error" class="notice notice--error" role="alert">{{ error }}</p>
    <p v-if="aviso" class="notice notice--ok" role="status">{{ aviso }}</p>

    <template v-if="vista === 'datos'">
      <form class="stack" novalidate @submit.prevent="guardar">
        <section class="panel panel-pad stack">
          <h2>Datos personales</h2>
          <template v-if="USA_MOCK">
            <div class="form-columns">
              <BaseInput v-model="form.nombre" label="Nombres" :error="errores.nombre" />
              <BaseInput v-model="form.apellido" label="Apellidos" :error="errores.apellido" />
            </div>
            <p class="small muted">{{ auth.usuario?.tipoDocumento }}: {{ auth.usuario?.documento }}</p>
            <div class="form-columns">
              <BaseInput v-model="form.fechaNacimiento" label="Fecha de nacimiento" type="date" />
              <BaseInput v-model="form.telefono" label="Teléfono" :error="errores.telefono" />
            </div>
            <BaseInput v-model="form.ciudad" label="Ciudad" />
          </template>
          <!-- El Gateway no permite editar nombre, correo ni ciudad desde el perfil. -->
          <dl v-else class="stack small">
            <div><dt class="muted">Nombre</dt><dd>{{ auth.usuario?.nombre }}</dd></div>
            <div><dt class="muted">Correo</dt><dd>{{ auth.usuario?.email }}</dd></div>
            <div v-if="auth.usuario?.ciudad"><dt class="muted">Ubicación</dt><dd>{{ [auth.usuario.ciudad, auth.usuario.pais].filter(Boolean).join(', ') }}</dd></div>
          </dl>
        </section>

        <section class="panel panel-pad stack">
          <h2>Formación académica</h2>
          <div class="form-columns">
            <BaseSelect v-model="form.nivelEstudios" label="Nivel de estudios" :opciones="nivelesEstudios" />
            <BaseInput v-model="form.carrera" label="Carrera o especialidad" :error="errores.carrera" />
          </div>
          <BaseInput v-model="form.institucion" label="Universidad, instituto o colegio" />
        </section>

        <section class="panel panel-pad stack">
          <h2>Perfil profesional y habilidades</h2>
          <BaseInput v-model="form.resumenProfesional" label="Resumen profesional" type="textarea" :filas="4" />
          <SkillEditor v-model="form.habilidades" />
        </section>

        <section class="panel panel-pad stack">
          <div class="panel-title">
            <h2>Experiencia</h2>
            <BaseButton variante="texto" @click="agregarExperiencia">Agregar experiencia</BaseButton>
          </div>
          <p v-if="!form.experiencia.length" class="small muted">Los proyectos académicos también cuentan.</p>
          <p v-if="!USA_MOCK && form.experiencia.some(item => item.guardada)" class="small muted">
            La experiencia ya guardada no se puede editar ni eliminar desde aquí.
          </p>
          <div v-for="(item, i) in form.experiencia" :key="item.id ?? i" class="evidence-card stack">
            <template v-if="!USA_MOCK && item.guardada">
              <h3>{{ item.puesto }}</h3>
              <p class="small muted">{{ item.empresa }} · {{ item.periodo }}</p>
            </template>
            <template v-else>
              <div class="form-columns">
                <BaseInput v-model="item.puesto" label="Puesto" />
                <BaseInput v-model="item.empresa" label="Empresa o proyecto" />
              </div>
              <template v-if="USA_MOCK">
                <BaseInput v-model="item.periodo" label="Periodo" />
                <BaseInput v-model="item.detalle" label="Qué hiciste" type="textarea" :filas="2" />
              </template>
              <div v-else class="form-columns">
                <BaseInput v-model="item.inicio" label="Inicio" type="month" />
                <BaseInput v-model="item.fin" label="Fin" type="month" />
              </div>
              <BaseButton variante="peligro" @click="form.experiencia.splice(i, 1)">Quitar experiencia</BaseButton>
            </template>
          </div>
        </section>

        <div class="row">
          <BaseButton tipo="submit" :cargando="guardando" :disabled="uploading || savingCertificate">Guardar cambios del perfil</BaseButton>
        </div>
      </form>

      <section class="panel panel-pad stack">
        <h2>Certificados y evidencias PDF</h2>
        <CertificateUpload v-if="USA_MOCK" :disabled="guardando || savingCertificate" @busy="uploading = $event" @validated="guardarCertificado" />
        <p v-else class="small muted">
          Los certificados se suben desde tu <RouterLink to="/aprendizaje">Learning Path</RouterLink>, en el curso que corresponde.
        </p>
        <p v-if="savingCertificate" role="status">Guardando certificado en el perfil…</p>
        <p v-if="!certificados.length" class="small muted">Todavía no tienes certificados registrados.</p>

        <article v-for="(certificate, i) in certificados" :key="certificate.id || i" class="evidence-card stack">
          <div>
            <h3>{{ certificate.nombre }}</h3>
            <p class="small muted">{{ certificate.emisor }} · {{ certificate.anio }}</p>
          </div>
          <span v-if="certificate.validacion?.estado === 'aprobado'" class="chip chip--have">
            ✓ {{ certificate.validacion.tipo === 'tecnica-local' ? 'PDF aprobado · revisión técnica local' : 'Documento aprobado' }}
          </span>
          <span v-else-if="certificate.validacion?.tipo === 'servidor'" class="small muted">Estado: {{ certificate.validacion.estado }}<template v-if="certificate.validacion.detalle"> · {{ certificate.validacion.detalle }}</template></span>
          <span v-else class="small muted">Sin evidencia PDF validada</span>
          <CertificateDownload v-if="certificate.archivo" :certificate="certificate" />
          <RouterLink v-else-if="certificate.id" :to="'/certificados/' + encodeURIComponent(certificate.id)">{{ USA_MOCK ? 'Ver constancia anterior →' : 'Ver detalle →' }}</RouterLink>
        </article>
      </section>

      <form class="panel panel-pad stack" novalidate @submit.prevent="cambiarClave">
        <h2>Cambiar contraseña</h2>
        <BaseInput v-model="clave.actual" label="Contrasena actual" type="password" autocomplete="current-password" />
        <div class="form-columns">
          <BaseInput v-model="clave.nueva" label="Contrasena nueva" type="password" autocomplete="new-password" />
          <BaseInput v-model="clave.confirmacion" label="Repite la contrasena nueva" type="password" autocomplete="new-password" />
        </div>
        <div class="row"><BaseButton tipo="submit" :cargando="cambiandoClave">Actualizar contraseña</BaseButton></div>
      </form>
    </template>

    <div v-else class="stack">
      <div class="row no-print">
        <BaseButton variante="secundario" @click="imprimir">Imprimir o guardar en PDF</BaseButton>
      </div>
      <CvDocument :usuario="{ ...auth.usuario, ...form, certificados }" />
    </div>
  </div>
</template>

