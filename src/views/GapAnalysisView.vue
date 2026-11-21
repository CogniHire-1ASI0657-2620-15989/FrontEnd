<script setup>
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useJobsStore } from '@/stores/jobs'
import { useLearningStore } from '@/stores/learning'
import { gapService } from '@/services/gapService'
import { rutaSugerida } from '@/utils/matching'
import { USA_MOCK } from '@/services/http'
import MatchRing from '@/components/ui/MatchRing.vue'

const auth = useAuthStore()
const jobs = useJobsStore()
const learning = useLearningStore()
const route = useRoute()
const router = useRouter()
const selected = ref('')
const result = ref(null)
const loading = ref(true)
const busy = ref(false)
const action = ref('')
const error = ref('')
const notice = ref('')
const stage = ref('')
const job = computed(() => jobs.guardadas.find(v => v.id === selected.value))
const courses = computed(() => rutaSugerida(result.value?.faltantes || []))
const completo = computed(() => result.value?.estado === 'completed')
let version = 0
let timer

onMounted(async () => {
  try {
    await Promise.all([jobs.cargarGuardadas(), jobs.cargarPostulaciones()])
    if (jobs.guardadas.some(v => v.id === route.query.vacante)) selected.value = route.query.vacante
  } catch (e) {
    error.value = e.message
  } finally {
    loading.value = false
  }
})

watch([selected, () => JSON.stringify(auth.habilidades)], () => {
  version++
  clearInterval(timer)
  busy.value = false
  result.value = null
  error.value = ''
  notice.value = ''
})

// Con el Gateway ya puede existir un reporte para la vacante: se muestra sin volver a generarlo.
watch(selected, async id => {
  if (USA_MOCK || !id) return
  const current = version
  try {
    const existente = await gapService.consultar(id)
    if (current === version && selected.value === id) result.value = existente
  } catch (e) {
    if (e.status !== 404 && current === version) error.value = e.message
  }
})

onUnmounted(() => {
  version++
  clearInterval(timer)
})

async function analizar() {
  if (!job.value || busy.value) return
  const current = ++version
  busy.value = true
  error.value = ''
  result.value = null
  stage.value = 'Leyendo los requisitos de la vacante…'
  timer = setInterval(() => {
    stage.value = 'Comparando tus habilidades e identificando brechas…'
  }, 750)

  try {
    const analysis = await gapService.analizar(auth.usuario.id, job.value, auth.habilidades)
    if (current === version) result.value = analysis
  } catch (e) {
    if (current === version) error.value = e.message
  } finally {
    if (current === version) {
      busy.value = false
      clearInterval(timer)
    }
  }
}

async function postular() {
  if (!completo.value || action.value) return
  action.value = 'application'
  error.value = ''
  try {
    await jobs.marcarPostulacion(job.value.id)
    notice.value = 'Postulación registrada en este navegador. Puedes crear tu Learning Path cuando lo desees.'
  } catch (e) {
    error.value = e.message
  } finally {
    action.value = ''
  }
}

async function crearRuta() {
  if (!completo.value || action.value) return
  action.value = 'path'
  error.value = ''
  try {
    await learning.crear(job.value)
    await router.push('/aprendizaje')
  } catch (e) {
    error.value = e.message
  } finally {
    action.value = ''
  }
}
</script>

<template>
  <div class="stack">
    <header class="page-heading">
      <div>
        <span class="eyebrow">CONOCE TU SIGUIENTE PASO</span>
        <h1>Análisis de brechas</h1>
        <p class="muted">Selecciona una vacante guardada y compara sus requisitos con tu perfil.</p>
      </div>
      <RouterLink to="/perfil">Actualizar mis habilidades →</RouterLink>
    </header>

    <p v-if="error" class="notice notice--error" role="alert">{{ error }}</p>
    <p v-if="notice" class="notice notice--ok" role="status">{{ notice }}</p>
    <p v-if="loading" role="status">Cargando vacantes guardadas…</p>
    <section v-else-if="!jobs.guardadas.length" class="panel empty-state">
      <h2>Primero guarda una vacante</h2>
      <p>Busca empleos y guarda los que te interesen para iniciar tu análisis.</p>
      <RouterLink to="/empleos" class="action-link">Buscar empleos</RouterLink>
    </section>

    <template v-else>
      <section class="panel panel-pad stack">
        <label>
          Vacante guardada
          <select v-model="selected" :disabled="busy || !!action">
            <option value="">Selecciona una vacante</option>
            <option v-for="v in jobs.guardadas" :key="v.id" :value="v.id">{{ v.titulo }} · {{ v.empresa }}</option>
          </select>
        </label>
        <div class="row">
          <button type="button" class="action-link" :disabled="!job || busy || !!action" @click="analizar">Analizar brechas</button>
          <RouterLink v-if="job" :to="'/empleos/' + job.id">Consultar puesto</RouterLink>
        </div>
      </section>

      <section v-if="busy || action === 'path'" class="panel empty-state" role="status" aria-live="polite">
        <span class="empty-icon">✦</span>
        <h2>{{ action === 'path' ? 'Creando tu Learning Path…' : stage }}</h2>
        <div class="indeterminate"></div>
      </section>

      <template v-if="result && !busy && action !== 'path'">
        <section class="panel panel-pad profile-overview">
          <MatchRing :valor="result.match" />
          <div>
            <h2>{{ job.titulo }}</h2>
            <p>{{ job.empresa }}</p>
            <p class="small muted">Técnicas: {{ result.matchDuras === null ? 'Sin requisitos identificados' : result.matchDuras + '%' }} · Personales: {{ result.matchBlandas === null ? 'Sin requisitos identificados' : result.matchBlandas + '%' }}</p>
            <p v-if="result.motor" class="small muted">Motor de análisis: {{ result.motor === 'groq_llm' ? 'IA (LLM)' : 'Reglas (sin IA)' }}</p>
            <p v-if="result.origen === 'simulado'" class="small muted">Análisis orientativo local por coincidencia de habilidades. Los niveles de dominio se incluyen en tu perfil; los requisitos de ejemplo no especifican un nivel mínimo.</p>
          </div>
        </section>

        <p v-if="!completo" class="notice notice--error" role="status">
          {{ result.estado === 'insufficient_job_data' ? 'El puesto no contiene información suficiente para identificar requisitos. Elige otra vacante o vuelve a analizar cuando su descripción esté disponible.' : 'El informe aún no está completo. Vuelve a ejecutar el análisis antes de postular o crear una ruta.' }}
        </p>

        <div v-if="completo" class="dashboard-columns">
          <section class="panel panel-pad stack">
            <h2>Competencias cumplidas</h2>
            <p v-if="!result.cubiertas.length" class="muted">No se encontraron coincidencias con tus habilidades actuales.</p>
            <span v-for="skill in result.cubiertas" :key="skill" class="chip chip--have">✓ {{ skill }}</span>
          </section>
          <section class="panel panel-pad stack">
            <h2>Competencias por desarrollar</h2>
            <p v-if="!result.faltantes.length" class="muted">No se identificaron brechas para esta vacante.</p>
            <span v-for="skill in result.faltantes" :key="skill" class="chip chip--gap">{{ skill }}</span>
          </section>
        </div>

        <section v-if="USA_MOCK && completo && courses.length" class="panel panel-pad stack">
          <h2>Aprendizaje sugerido para cerrar las brechas</h2>
          <div v-for="course in courses" :key="course.skill" class="application-row">
            <div><strong>{{ course.titulo }}</strong><p class="small muted">{{ course.skill }} · {{ course.horas }} horas estimadas</p></div>
          </div>
        </section>

        <div v-if="completo" class="row">
          <button type="button" class="action-link" :disabled="!!action || !!jobs.estadoDe(job.id)" @click="postular">
            {{ jobs.estadoDe(job.id) ? '✓ Postulación registrada' : action === 'application' ? 'Registrando…' : 'Postular' }}
          </button>
          <button type="button" class="action-link" :disabled="!!action" @click="crearRuta">Crear Learning Path</button>
        </div>
      </template>
    </template>
  </div>
</template>
