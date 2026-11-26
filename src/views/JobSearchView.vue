<script setup>
import { onMounted, ref } from 'vue'
import { useJobsStore } from '@/stores/jobs'
import { useAuthStore } from '@/stores/auth'
import JobCard from '@/components/jobs/JobCard.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const jobs = useJobsStore()
const auth = useAuthStore()
const q = ref('')
const ubicacion = ref(auth.usuario?.ciudad || '')
const radio = ref(0)
const tamano = ref(10)
const submitted = ref(null)
const saving = ref([])
const error = ref('')

onMounted(async () => {
  jobs.limpiarFiltros()
  try { await jobs.cargarGuardadas() } catch (e) { error.value = e.message }
})

function buscar() {
  submitted.value = {
    q: q.value,
    ubicacion: ubicacion.value,
    radio: radio.value,
    tamano: tamano.value
  }
  jobs.buscar({ ...submitted.value, pagina: 1 })
}

function cambiarPagina(value) {
  jobs.buscar({ ...submitted.value, pagina: value })
}

function limpiar() {
  q.value = ''
  ubicacion.value = ''
  radio.value = 0
  tamano.value = 10
  submitted.value = null
  error.value = ''
  jobs.limpiarFiltros()
}

async function guardar(id) {
  if (saving.value.includes(id)) return
  saving.value.push(id)
  error.value = ''
  try {
    await jobs.guardarVacante(id)
  } catch (e) {
    error.value = e.message
  } finally {
    saving.value = saving.value.filter(value => value !== id)
  }
}
</script>

<template>
  <div class="stack">
    <header class="page-heading">
      <div>
        <span class="eyebrow">ENCUENTRA TU PRÓXIMA OPORTUNIDAD</span>
        <h1>Búsqueda de trabajo</h1>
        <p class="muted">Busca un empleo y guarda las vacantes que te interesen.</p>
      </div>
      <RouterLink to="/dashboard">Ver mis vacantes guardadas →</RouterLink>
    </header>

    <form class="panel panel-pad search-filters" @submit.prevent="buscar">
      <BaseInput v-model="q" label="Puesto, empresa o habilidad" placeholder="Ej. desarrollador, Excel" />
      <BaseInput v-model="ubicacion" label="Ubicación" placeholder="Lima" />
      <label>Radio de búsqueda<select v-model="radio"><option v-for="value in [0, 4, 8, 16, 26, 40, 80]" :key="value" :value="value">{{ value }} km</option></select></label>
      <label>Resultados por página<select v-model="tamano"><option v-for="value in [5, 10, 20]" :key="value" :value="value">{{ value }}</option></select></label>
      <div class="row">
        <BaseButton tipo="submit" :cargando="jobs.cargando">Buscar</BaseButton>
        <BaseButton variante="secundario" @click="limpiar">Limpiar</BaseButton>
      </div>
    </form>

    <p v-if="jobs.error || error" class="notice notice--error" role="alert">{{ jobs.error || error }}</p>
    <section v-if="!jobs.buscado" class="panel empty-state">
      <span class="empty-icon">⌕</span>
      <h2>¿Qué empleo estás buscando?</h2>
      <p>Configura tus filtros y pulsa Buscar para visualizar las vacantes.</p>
    </section>
    <p v-else-if="jobs.cargando" role="status">Buscando oportunidades…</p>
    <template v-else>
      <p v-if="jobs.providerStatus === 'unavailable'" class="notice notice--error" role="status">El proveedor de empleos no está disponible en este momento. Reintenta tu búsqueda más tarde.</p>
      <p v-if="!jobs.error" class="small muted">{{ jobs.total }} vacantes disponibles · Página {{ jobs.pagina }} de {{ Math.max(1, Math.min(3, Math.ceil(jobs.total / jobs.tamano))) }}</p>
      <p v-if="!jobs.resultados.length && !jobs.error && jobs.providerStatus !== 'unavailable'" class="panel panel-pad">No encontramos vacantes con esos filtros.</p>
      <JobCard
        v-for="job in jobs.resultados"
        :key="job.id"
        :vacante="job"
        :favorita="jobs.favoritos.includes(job.id)"
        :guardando="saving.includes(job.id)"
        @favorito="guardar"
      />
      <nav v-if="jobs.total > jobs.tamano" class="row" aria-label="Páginas de empleos">
        <button type="button" class="action-link" :disabled="jobs.pagina <= 1 || jobs.cargando" @click="cambiarPagina(jobs.pagina - 1)">Anterior</button>
        <button type="button" class="action-link" :disabled="jobs.pagina >= 3 || jobs.pagina * jobs.tamano >= jobs.total || jobs.cargando" @click="cambiarPagina(jobs.pagina + 1)">Siguiente</button>
      </nav>
    </template>
  </div>
</template>

