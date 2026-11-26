<script setup>
import { onMounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { jobsService } from '@/services/jobsService'
import { useJobsStore } from '@/stores/jobs'
import JobDetail from '@/components/jobs/JobDetail.vue'

const route = useRoute()
const jobs = useJobsStore()
const job = ref(null)
const error = ref('')
const busy = ref(false)
let version = 0

onMounted(async () => {
  try { await jobs.cargarGuardadas() } catch (e) { error.value = e.message }
})

watch(() => route.params.id, async id => {
  const current = ++version
  job.value = null
  error.value = ''
  try {
    const result = await jobsService.detalle(id)
    if (!result) throw new Error('Vacante no encontrada')
    if (current === version) job.value = result
  } catch (e) {
    if (current === version) error.value = e.message
  }
}, { immediate: true })

async function guardar(id) {
  busy.value = true
  error.value = ''
  try {
    await jobs.guardarVacante(id)
  } catch (e) {
    error.value = e.message
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="stack">
    <RouterLink to="/empleos">← Volver a empleos</RouterLink>
    <p v-if="error" class="notice notice--error" role="alert">{{ error }}</p>
    <JobDetail
      v-if="job"
      :vacante="job"
      :favorita="jobs.favoritos.includes(job.id)"
      :guardando="busy"
      @favorito="guardar"
    />
    <p v-else-if="!error" role="status">Cargando vacante…</p>
  </div>
</template>

