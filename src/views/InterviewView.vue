<script setup>
import { computed, nextTick, onMounted, ref } from 'vue'
import { useJobsStore } from '@/stores/jobs'
import { interviewService, modosEntrevista } from '@/services/interviewService'

const jobs = useJobsStore()

const sesiones = ref([])
const activa = ref(null)
const vacanteId = ref('')
const modo = ref('mixed')
const texto = ref('')
const cargando = ref(true)
const busy = ref('')
const error = ref('')
const log = ref(null)

const etiquetaModo = valor => modosEntrevista.find(m => m.valor === valor)?.texto.split(' (')[0] ?? valor
const esActiva = computed(() => activa.value?.status === 'active')
const lista = valor => (Array.isArray(valor) ? valor : valor ? [valor] : [])
const puntajes = [
  ['technical_score', 'Técnico'],
  ['behavioral_score', 'Conductual'],
  ['communication_score', 'Comunicación'],
  ['overall_score', 'General']
]

async function bajar() {
  await nextTick()
  if (log.value) log.value.scrollTop = log.value.scrollHeight
}

async function cargar() {
  cargando.value = true
  error.value = ''
  try {
    const [sesionesApi] = await Promise.all([interviewService.listar(), jobs.cargarGuardadas()])
    sesiones.value = sesionesApi
  } catch (e) {
    error.value = e.message
  } finally {
    cargando.value = false
  }
}

onMounted(cargar)

async function abrir(id) {
  if (busy.value) return
  error.value = ''
  try {
    activa.value = await interviewService.consultar(id)
    bajar()
  } catch (e) {
    error.value = e.message
  }
}

function resumir(sesion) {
  const i = sesiones.value.findIndex(s => s.id === sesion.id)
  const resumen = { ...sesiones.value[i], ...sesion, messages: undefined }
  if (i === -1) sesiones.value.unshift(resumen)
  else sesiones.value[i] = resumen
}

function nueva() {
  if (busy.value) return
  activa.value = null
  error.value = ''
}

async function iniciar() {
  if (!vacanteId.value || busy.value) return
  busy.value = 'start'
  error.value = ''
  try {
    activa.value = await interviewService.iniciar(vacanteId.value, modo.value)
    resumir(activa.value)
    bajar()
  } catch (e) {
    error.value = e.message
  } finally {
    busy.value = ''
  }
}

async function enviar() {
  if (!texto.value.trim() || busy.value || !esActiva.value) return
  const respuesta = texto.value
  busy.value = 'answer'
  error.value = ''
  texto.value = ''
  try {
    activa.value = await interviewService.responder(activa.value.id, respuesta)
    resumir(activa.value)
    bajar()
  } catch (e) {
    error.value = e.message
    texto.value = respuesta
  } finally {
    busy.value = ''
  }
}

async function finalizar() {
  if (busy.value || !esActiva.value) return
  busy.value = 'complete'
  error.value = ''
  try {
    activa.value = await interviewService.finalizar(activa.value.id)
    resumir(activa.value)
    bajar()
  } catch (e) {
    error.value = e.message
  } finally {
    busy.value = ''
  }
}
</script>

<template>
  <div class="chat-workspace panel">
    <aside class="chat-history">
      <span class="eyebrow">SIMULADOR DE ENTREVISTAS</span>
      <button class="action-link" :disabled="!!busy" @click="nueva">＋ Nueva entrevista</button>

      <p v-if="cargando" class="small muted" role="status">Cargando…</p>
      <div v-for="s in sesiones" :key="s.id" class="chat-history-row">
        <button :disabled="!!busy" :class="{ selected: activa?.id === s.id }" @click="abrir(s.id)">
          {{ s.job_title }} · {{ etiquetaModo(s.mode) }}{{ s.status === 'completed' ? ' ✓' : '' }}
        </button>
      </div>
      <p class="small muted">Cada sesión tiene hasta 6 preguntas y termina con una evaluación.</p>
    </aside>

    <section class="chat-main">
      <p v-if="error" class="notice notice--error" role="alert">
        {{ error }}
        <button v-if="!activa" type="button" class="text-button" @click="cargar">Reintentar</button>
      </p>

      <!-- Nueva entrevista -->
      <div v-if="!activa" class="chat-welcome stack">
        <span class="empty-icon">✦</span>
        <h1>Practica tu próxima entrevista</h1>
        <p>Elige una vacante guardada. Usaremos tu perfil, tu reporte de brechas y tu ruta de aprendizaje como contexto.</p>

        <p v-if="!cargando && !jobs.guardadas.length" class="notice">
          Primero guarda una vacante. <RouterLink to="/empleos">Buscar empleos →</RouterLink>
        </p>
        <template v-else>
          <label class="small">
            Vacante guardada
            <select v-model="vacanteId" :disabled="!!busy">
              <option value="">Selecciona una vacante</option>
              <option v-for="job in jobs.guardadas" :key="job.id" :value="job.id">{{ job.titulo }} · {{ job.empresa }}</option>
            </select>
          </label>
          <label class="small">
            Tipo de entrevista
            <select v-model="modo" :disabled="!!busy">
              <option v-for="m in modosEntrevista" :key="m.valor" :value="m.valor">{{ m.texto }}</option>
            </select>
          </label>
          <div class="row">
            <button class="action-link" :disabled="!vacanteId || !!busy" @click="iniciar">
              {{ busy === 'start' ? 'Preparando la primera pregunta…' : 'Comenzar entrevista' }}
            </button>
          </div>
        </template>
      </div>

      <!-- Sesión -->
      <template v-else>
        <header class="chat-toolbar">
          <div>
            <h2>{{ activa.job_title }}</h2>
            <span class="small muted">
              {{ etiquetaModo(activa.mode) }} · Pregunta {{ activa.question_count }} de {{ activa.max_questions }}
              · {{ esActiva ? 'En curso' : 'Finalizada' }}
            </span>
          </div>
          <button v-if="esActiva" class="action-link" :disabled="!!busy" @click="finalizar">
            {{ busy === 'complete' ? 'Evaluando…' : 'Finalizar y evaluar' }}
          </button>
        </header>

        <div ref="log" class="chat-messages" role="log" aria-live="polite">
          <article v-for="m in activa.messages" :key="m.id" :class="['chat-message', m.speaker === 'coach' ? 'assistant' : 'user']">
            <strong class="small">{{ m.speaker === 'coach' ? '✦ Entrevistador' : 'Tú' }}</strong>
            <p>{{ m.content }}</p>
          </article>
          <p v-if="busy === 'answer'" role="status">✦ Preparando la siguiente pregunta…</p>

          <section v-if="activa.report" class="panel panel-pad stack">
            <h2>Tu evaluación</h2>
            <div v-for="[campo, etiqueta] in puntajes" :key="campo" v-show="activa.report[campo] != null">
              <p class="small">{{ etiqueta }}: <strong>{{ activa.report[campo] }}</strong></p>
              <div class="meter" role="progressbar" :aria-label="etiqueta" :aria-valuenow="activa.report[campo]" aria-valuemin="0" aria-valuemax="100">
                <span :style="{ width: Math.min(100, Math.max(0, Number(activa.report[campo]) || 0)) + '%' }"></span>
              </div>
            </div>
            <template v-for="[campo, titulo] in [['strengths', 'Fortalezas'], ['improvement_areas', 'Áreas de mejora'], ['recommendations', 'Recomendaciones']]" :key="campo">
              <div v-if="lista(activa.report[campo]).length">
                <h3>{{ titulo }}</h3>
                <ul><li v-for="(item, i) in lista(activa.report[campo])" :key="i">{{ item }}</li></ul>
              </div>
            </template>
          </section>
        </div>

        <form v-if="esActiva" class="chat-composer" @submit.prevent="enviar">
          <textarea
            v-model="texto"
            aria-label="Tu respuesta"
            rows="3"
            maxlength="10000"
            placeholder="Escribe tu respuesta…"
            :disabled="!!busy"
            @keydown.enter.exact.prevent="enviar"
          ></textarea>
          <button class="action-link" :disabled="!!busy || !texto.trim()">Responder ↑</button>
        </form>
      </template>
    </section>
  </div>
</template>
