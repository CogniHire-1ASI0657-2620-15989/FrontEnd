<script setup>
import { ref } from 'vue'
import { certificateService } from '@/services/certificateService'
import { useAuthStore } from '@/stores/auth'

const props = defineProps({ certificate: { type: Object, required: true } })
const auth = useAuthStore()
const busy = ref(false)
const error = ref('')

async function descargar() {
  busy.value = true
  error.value = ''
  try {
    const file = await certificateService.documento(auth.usuario.id, props.certificate.id)
    const url = URL.createObjectURL(file)
    const link = document.createElement('a')
    link.href = url
    link.download = props.certificate.archivo?.nombre || 'certificado.pdf'
    document.body.appendChild(link)
    link.click()
    link.remove()
    setTimeout(() => URL.revokeObjectURL(url), 5000)
  } catch (e) {
    error.value = e.message
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div>
    <button type="button" class="text-button" :disabled="busy" @click="descargar">{{ busy ? 'Preparando PDF…' : 'Descargar PDF adjunto' }}</button>
    <p v-if="error" class="notice notice--error" role="alert">{{ error }}</p>
  </div>
</template>
