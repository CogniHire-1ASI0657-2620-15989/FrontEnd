<script setup>
import { onMounted, ref } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useJobsStore } from '@/stores/jobs'
import { useLearningStore } from '@/stores/learning'

const auth = useAuthStore()
const jobs = useJobsStore()
const learning = useLearningStore()
const error = ref('')
const ready = ref(false)

async function cargar() {
  ready.value = false
  error.value = ''
  try {
    await Promise.all([
      jobs.cargarGuardadas(),
      jobs.cargarPostulaciones(),
      learning.cargar()
    ])
  } catch (e) {
    error.value = e.message
  } finally {
    ready.value = true
  }
}

onMounted(cargar)
</script>

<template>
  <div class="stack">
    <header class="page-heading">
      <div>
        <span class="eyebrow">TU ESPACIO PROFESIONAL</span>
        <h1>Hola, {{ auth.usuario?.nombre?.split(' ')[0] }}.</h1>
        <p class="muted">Tus oportunidades guardadas y tu desarrollo profesional, en un solo lugar.</p>
      </div>
      <RouterLink class="action-link" to="/perfil">Ir a mi perfil ↗</RouterLink>
    </header>

    <p v-if="error" class="notice notice--error" role="alert">
      {{ error }}
      <button type="button" class="text-button" @click="cargar">Reintentar</button>
    </p>

    <section class="panel panel-pad profile-overview">
      <span class="profile-monogram">{{ auth.usuario?.nombre?.charAt(0) }}</span>
      <div>
        <h2>{{ auth.usuario?.nombre }} {{ auth.usuario?.apellido }}</h2>
        <p class="muted">{{ auth.usuario?.ciudad }}</p>
        <p class="small">{{ auth.usuario?.carrera }} · {{ auth.usuario?.institucion }}</p>
        <p v-if="auth.usuario?.resumenProfesional">{{ auth.usuario.resumenProfesional }}</p>
        <div class="row">
          <span v-for="skill in auth.habilidades" :key="skill.nombre" class="chip chip--have">
            {{ skill.nombre }} · {{ skill.nivel }}
          </span>
          <RouterLink v-if="!auth.habilidades.length" to="/perfil">Añadir habilidades</RouterLink>
        </div>
      </div>
    </section>

    <section class="panel panel-pad stack">
      <div class="panel-title">
        <h2>Vacantes guardadas</h2>
        <RouterLink to="/empleos">Buscar más empleos →</RouterLink>
      </div>
      <p v-if="!ready" role="status">Cargando vacantes…</p>
      <div v-else-if="!jobs.guardadas.length" class="empty-state">
        <h3>Guarda tu primera oportunidad</h3>
        <p>Realiza una búsqueda y guarda las vacantes que te interesen.</p>
        <RouterLink to="/empleos" class="action-link">Ir al buscador</RouterLink>
      </div>
      <article v-for="job in jobs.guardadas" :key="job.id" class="application-row">
        <div>
          <RouterLink :to="'/empleos/' + job.id"><strong>{{ job.titulo }}</strong></RouterLink>
          <p class="small muted">{{ job.empresa }} · {{ job.ubicacion }}</p>
        </div>
        <RouterLink :to="{ path: '/brechas', query: { vacante: job.id } }">Analizar brechas →</RouterLink>
      </article>
    </section>

    <div class="dashboard-columns">
      <section class="panel panel-pad stack">
        <div class="panel-title">
          <h2>Trabajos postulados</h2>
          <span class="chip">{{ jobs.postulaciones.length }}</span>
        </div>
        <p v-if="!jobs.postulaciones.length" class="muted">
          Analiza una vacante guardada y registra tu postulación desde la sección de brechas.
        </p>
        <RouterLink
          v-for="application in jobs.postulaciones"
          :key="application.vacanteId"
          :to="{ path: '/brechas', query: { vacante: application.vacanteId } }"
          class="application-row"
        >
          <strong>
            {{
              jobs.guardadas.find(job => job.id === application.vacanteId)?.titulo
                || learning.rutas.find(path => path.vacanteId === application.vacanteId)?.titulo
                || 'Consultar vacante'
            }}
          </strong>
          <span class="chip">{{ application.estado }}</span>
        </RouterLink>
      </section>

      <section class="panel panel-pad stack">
        <div class="panel-title">
          <h2>Learning Path</h2>
          <RouterLink to="/aprendizaje">Ver rutas ↗</RouterLink>
        </div>

        <label v-if="learning.rutas.length">
          Selecciona una ruta
          <select :value="learning.seleccion" @change="learning.elegir($event.target.value)">
            <option value="">Seleccionar ruta</option>
            <option v-for="path in learning.rutas" :key="path.id" :value="path.id">{{ path.titulo }}</option>
          </select>
        </label>

        <div v-if="!learning.activa" class="empty-state">
          <h3>Un objetivo, un camino</h3>
          <p>Crea una ruta desde Análisis de brechas y selecciónala para ver tu progreso.</p>
          <RouterLink to="/brechas">Ver mis brechas →</RouterLink>
        </div>

        <template v-else>
          <h3>{{ learning.activa.titulo }}</h3>
          <strong>{{ learning.progreso(learning.activa) }}% completado</strong>
          <div class="meter">
            <span :style="{ width: learning.progreso(learning.activa) + '%' }"></span>
          </div>
          <p class="small muted">
            {{ learning.activa.cursos.filter(course => course.completado).length }}
            de {{ learning.activa.cursos.length }} cursos
          </p>
          <RouterLink to="/aprendizaje" class="action-link">Continuar aprendiendo →</RouterLink>
        </template>
      </section>
    </div>
  </div>
</template>

