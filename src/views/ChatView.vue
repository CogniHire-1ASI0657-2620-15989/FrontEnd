<script setup>
import { ref, computed, onMounted, nextTick } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useJobsStore } from '@/stores/jobs'
import { chatService } from '@/services/chatService'
import { USA_MOCK } from '@/services/http'

const auth = useAuthStore()
const jobsStore = useJobsStore()
const key = 'pb.chats.' + auth.usuario.id

const chats = ref([])
const selected = ref('')
const text = ref('')
const busy = ref(false)
const error = ref('')
const log = ref(null)

const active = computed(() =>
  chats.value.find(c => c.id === selected.value)
)

const options = computed(() =>
  jobsStore.guardadas.map(job => ({ id: job.id, label: job.titulo }))
)

function save() {
  localStorage.setItem(key, JSON.stringify(chats.value))
}

function create() {
  if (busy.value) return

  const c = {
    id: crypto.randomUUID(),
    titulo: 'Nueva conversación',
    modo: 'empleo',
    contextoId: '',
    mensajes: []
  }

  chats.value.unshift(c)
  selected.value = c.id
  save()
}

function remove(id) {
  if (busy.value) return

  chats.value = chats.value.filter(c => c.id !== id)
  selected.value = chats.value[0]?.id || ''

  if (!active.value) create()
  save()
}

async function scroll() {
  await nextTick()

  if (log.value) {
    log.value.scrollTop = log.value.scrollHeight
  }
}

onMounted(async () => {
  try {
    chats.value = (JSON.parse(localStorage.getItem(key)) || []).filter(c => c.modo !== 'curso')
  } catch {
    chats.value = []
  }

  selected.value = chats.value[0]?.id || ''
  if (!active.value) create()

  try {
    await jobsStore.cargarGuardadas()
  } catch (e) {
    error.value = e.message
  }
})

async function send() {
  if (!text.value.trim() || busy.value || !active.value) return

  const c = active.value
  const prompt = text.value.trim()

  c.mensajes.push({ rol: 'user', contenido: prompt })

  if (c.mensajes.length === 1) {
    c.titulo = prompt.slice(0, 45)
  }

  text.value = ''
  busy.value = true
  error.value = ''
  save()
  scroll()

  try {
    const reply = await chatService.send(auth.usuario.id, {
      conversacionId: c.id,
      modo: 'empleo',
      contextoId: c.contextoId,
      contexto: options.value.find(o => o.id === c.contextoId)?.label || '',
      mensajes: c.mensajes
    })

    c.mensajes.push({ rol: 'assistant', contenido: reply.contenido })
  } catch (e) {
    error.value = e.message
    text.value = prompt
    c.mensajes.pop()
  } finally {
    busy.value = false
    save()
    scroll()
  }
}
</script>

<template>
  <div class="chat-workspace panel">
    <aside class="chat-history">
      <span class="eyebrow">TU ASISTENTE PROFESIONAL</span>

      <button class="action-link" :disabled="busy" @click="create">
        ＋ Nueva conversación
      </button>

      <div v-for="c in chats" :key="c.id" class="chat-history-row">
        <button
          :disabled="busy"
          :class="{ selected: selected === c.id }"
          @click="selected = c.id"
        >
          {{ c.titulo }}
        </button>
        <button
          :disabled="busy"
          aria-label="Eliminar conversación"
          @click="remove(c.id)"
        >
          ×
        </button>
      </div>

      <p class="small muted">
        Historial guardado en este navegador para tu cuenta.
      </p>
    </aside>

    <section v-if="active" class="chat-main">
      <header class="chat-toolbar">
        <div>
          <h2>PathBridge Assistant ✦</h2>
          <span class="small muted">
            {{
              USA_MOCK
                ? 'Demostración · Respuestas simuladas'
                : 'Asistente conectado'
            }}
          </span>
        </div>

        <p class="small muted">Orientación laboral, búsqueda de empleo, CV y entrevistas.</p>

        <label class="small">
          Vacante guardada de referencia
          <select
            v-model="active.contextoId"
            :disabled="busy"
            @change="save"
          >
            <option value="">Orientación general de empleos</option>
            <option v-for="o in options" :key="o.id" :value="o.id">
              {{ o.label }}
            </option>
          </select>
        </label>
        <RouterLink to="/empleos">Buscar y guardar más empleos →</RouterLink>
      </header>

      <div ref="log" class="chat-messages" role="log" aria-live="polite">
        <div v-if="!active.mensajes.length" class="chat-welcome">
          <span class="empty-icon">✦</span>
          <h1>¿Cuál es tu siguiente paso?</h1>
          <p>
            Encuentra oportunidades, mejora tu CV y prepara tu próxima entrevista.
          </p>

          <div class="row">
            <button @click="text = 'Ayúdame a preparar mi entrevista'">
              Preparar una entrevista ↗
            </button>
            <button @click="text = 'Ayúdame a mejorar mi CV para buscar empleo'">
              Mejorar mi CV ↗
            </button>
          </div>
        </div>

        <article
          v-for="(m, i) in active.mensajes"
          :key="i"
          :class="['chat-message', m.rol]"
        >
          <strong class="small">
            {{ m.rol === 'user' ? 'Tú' : '✦ PathBridge' }}
          </strong>
          <p>{{ m.contenido }}</p>
        </article>

        <p v-if="busy" role="status">✦ Preparando una respuesta…</p>
      </div>

      <p v-if="error" class="notice notice--error" role="alert">
        {{ error }}
      </p>

      <form class="chat-composer" @submit.prevent="send">
        <textarea
          v-model="text"
          aria-label="Tu mensaje"
          rows="2"
          maxlength="4000"
          placeholder="Escribe tu pregunta…"
          :disabled="busy"
          @keydown.enter.exact.prevent="send"
        ></textarea>
        <button class="action-link" :disabled="busy || !text.trim()">
          Enviar ↑
        </button>
      </form>
    </section>
  </div>
</template>
