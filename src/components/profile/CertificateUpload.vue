<script setup>
import { onUnmounted, ref, useId } from 'vue'
import { certificateService } from '@/services/certificateService'
import { USA_MOCK } from '@/services/http'
import { useAuthStore } from '@/stores/auth'

const props = defineProps({
  nombre: { type: String, default: '' },
  courseId: { type: String, default: '' },
  // Solo con el Gateway: ruta y habilidad a las que pertenece el certificado.
  learningPathId: { type: [String, Number], default: '' },
  skillName: { type: String, default: '' },
  disabled: Boolean
})
const emit = defineEmits(['validated', 'busy'])
const auth = useAuthStore()
const inputId = useId()
const file = ref(null)
const nombre = ref('')
const emisor = ref('')
const stage = ref('')
const busy = ref(false)
const error = ref('')
const approved = ref(null)
const syncing = ref(false)
let active = true

// Reintento de sincronizacion (perfil + reporte de brechas) cuando fallo tras aprobarse.
async function resync() {
  if (!approved.value || syncing.value) return
  syncing.value = true
  error.value = ''
  try {
    approved.value = await certificateService.sincronizar(approved.value.id)
    if (active) emit('validated', approved.value)
  } catch (e) {
    error.value = e.message
  } finally {
    syncing.value = false
  }
}

onUnmounted(() => { active = false })

function select(event) {
  file.value = event.target.files?.[0] || null
  approved.value = null
  error.value = ''
}

async function validate() {
  if (busy.value || props.disabled) return
  busy.value = true
  approved.value = null
  error.value = ''
  emit('busy', true)
  try {
    approved.value = await certificateService.validar(auth.usuario.id, file.value, {
      nombre: props.nombre || nombre.value,
      emisor: emisor.value,
      courseId: props.courseId,
      rutaId: props.learningPathId,
      skill: props.skillName
    }, value => { if (active) stage.value = value })
    if (active) emit('validated', approved.value)
  } catch (e) {
    error.value = e.message
  } finally {
    busy.value = false
    if (active) emit('busy', false)
  }
}
</script>

<template>
  <div class="certificate-upload stack">
    <template v-if="!props.nombre">
      <label>Nombre del certificado<input v-model="nombre" :disabled="busy || disabled" placeholder="Nombre del curso o certificado" /></label>
      <label>Institución emisora<input v-model="emisor" :disabled="busy || disabled" placeholder="Institución (opcional)" /></label>
    </template>
    <label v-else-if="!USA_MOCK">Plataforma o institución (opcional)<input v-model="emisor" maxlength="150" :disabled="busy || disabled" placeholder="Ej. Udemy, Coursera" /></label>
    <label :for="inputId">{{ USA_MOCK ? 'Adjuntar certificado PDF (máximo 10 MB)' : 'Adjuntar certificado (PDF, JPG o PNG, máximo 5 MB)' }}</label>
    <input :id="inputId" type="file" :accept="USA_MOCK ? '.pdf,application/pdf' : '.pdf,.jpg,.jpeg,.png,application/pdf,image/jpeg,image/png'" :disabled="busy || disabled" @change="select" />
    <p v-if="file" class="small muted">{{ file.name }} · {{ Math.ceil(file.size / 1024) }} KB</p>
    <div v-if="busy" class="processing" role="status" aria-live="polite">
      <strong>{{ stage }}</strong>
      <div class="indeterminate"></div>
    </div>
    <p v-if="error" class="notice notice--error" role="alert">{{ error }}</p>
    <p v-if="approved" class="notice notice--ok" role="status">
      ✓ {{ USA_MOCK ? 'PDF aprobado en la revisión técnica local' : 'Certificado aprobado' }}
    </p>
    <div v-if="approved && !USA_MOCK && !approved.sincronizado" class="notice notice--error" role="status">
      <p>El certificado se aprobó, pero aún no se actualizó tu perfil o tu reporte de brechas.</p>
      <p class="small">Perfil: {{ approved.sincronizacion.perfil || 'pendiente' }} · Brechas: {{ approved.sincronizacion.brechas || 'pendiente' }}<template v-if="approved.sincronizacion.detalle"> · {{ approved.sincronizacion.detalle }}</template></p>
      <button type="button" class="text-button" :disabled="syncing" @click="resync">{{ syncing ? 'Sincronizando…' : 'Reintentar sincronización' }}</button>
    </div>
    <p class="small muted">{{ USA_MOCK ? 'La revisión local verifica formato, tamaño y estructura básica. No acredita autenticidad ni contenido del certificado.' : 'El documento se enviará al servicio de validación.' }}</p>
    <div class="row">
      <button type="button" class="action-link" :disabled="!file || busy || disabled" @click="validate">
        {{ busy ? 'Validando…' : USA_MOCK ? 'Validar certificado PDF' : 'Subir certificado' }}
      </button>
      <button v-if="approved && USA_MOCK" type="button" class="text-button" :disabled="disabled || busy" @click="emit('validated', approved)">Reintentar guardar evidencia</button>
    </div>
  </div>
</template>
