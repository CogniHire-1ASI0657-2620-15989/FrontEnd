<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { jobsService } from '@/services/jobsService'
import { useJobsStore } from '@/stores/jobs'
import { useAuthStore } from '@/stores/auth'
import { useLearningStore } from '@/stores/learning'
import { analizarVacante } from '@/utils/matching'
import JobDetail from '@/components/jobs/JobDetail.vue'

const route = useRoute()
const router = useRouter()
const jobs = useJobsStore()
const auth = useAuthStore()
const learning = useLearningStore()

const job = ref(null)
const error = ref('')
const busy = ref(false)
const stage = ref('')

onMounted(async () => {
  try {
    const v = await jobsService.detalle(route.params.id)

    if (!v) {
      throw new Error('Vacante no encontrada')
    }

    job.value = {
      ...v,
      analisis: analizarVacante(v, auth.habilidades)
    }

    await jobs.cargarPostulaciones()
  } catch (e) {
    error.value = e.message
  }
})

async function apply() {
  if (busy.value) return

  busy.value = true
  error.value = ''
  stage.value = 'Analizando los requisitos del puesto…'

  const timer = setInterval(() => {
    stage.value = 'Creando cursos y organizando tu ruta de aprendizaje…'
  }, 1000)

  try {
    await jobs.marcarPostulacion(job.value.id, 'Postulado')
    await learning.crear(job.value)
    await router.push('/aprendizaje')
  } catch (e) {
    error.value = e.message
  } finally {
    clearInterval(timer)
    busy.value = false
  }
}
</script>

<template>
  <div class="stack">
    <RouterLink to="/empleos">← Volver a empleos</RouterLink>

    <p v-if="error" class="notice notice--error" role="alert">
      {{ error }}
    </p>

    <div
      v-if="busy"
      class="panel empty-state"
      role="status"
      aria-live="polite"
    >
      <span class="empty-icon">✦</span>
      <h2>{{ stage }}</h2>
      <p>Preparando tu siguiente paso profesional.</p>
      <div class="indeterminate"></div>
    </div>

    <JobDetail
      v-else-if="job"
      :vacante="job"
      :favorita="jobs.favoritos.includes(job.id)"
      :estado="jobs.estadoDe(job.id)"
      @favorito="jobs.alternarFavorito"
      @postular="apply"
      @cerrar="router.push('/empleos')"
    />

    <p v-else-if="!error">Cargando vacante…</p>
  </div>
</template>
