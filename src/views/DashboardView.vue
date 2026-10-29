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

onMounted(async () => {
  try {
    await Promise.all([
      jobs.cargarPostulaciones(),
      learning.cargar()
    ])
  } catch (e) {
    error.value = e.message
  } finally {
    ready.value = true
  }
})
</script>

<template>
  <div class="stack">
    <header class="page-heading">
      <div>
        <span class="eyebrow">TU ESPACIO PROFESIONAL</span>
        <h1>Hola, {{ auth.usuario?.nombre }}.</h1>
        <p class="muted">Construye el camino hacia tu próxima oportunidad.</p>
      </div>

      <RouterLink class="action-link" to="/perfil">
        Ir a mi perfil ↗
      </RouterLink>
    </header>

    <p v-if="error" class="notice notice--error" role="alert">
      {{ error }}
    </p>

    <!-- Perfil y habilidades -->
    <section class="panel panel-pad profile-overview">
      <span class="profile-monogram">
        {{ auth.usuario?.nombre?.charAt(0) }}
      </span>

      <div>
        <h2>{{ auth.usuario?.nombre }} {{ auth.usuario?.apellido }}</h2>
        <p class="muted">
          {{ auth.usuario?.cargoObjetivo }} · {{ auth.usuario?.ciudad }}
        </p>
        <p class="small">
          {{ auth.usuario?.carrera }} · {{ auth.usuario?.institucion }}
        </p>
        <p v-if="auth.usuario?.resumenProfesional">
          {{ auth.usuario.resumenProfesional }}
        </p>

        <div class="row">
          <span
            v-for="s in auth.habilidades"
            :key="s"
            class="chip chip--have"
          >
            {{ s }}
          </span>

          <RouterLink v-if="!auth.habilidades.length" to="/perfil">
            Añadir habilidades
          </RouterLink>
        </div>
      </div>
    </section>

    <div class="dashboard-columns">
      <!-- Postulaciones -->
      <section class="panel panel-pad stack">
        <div class="panel-title">
          <h2>Trabajos postulados</h2>
          <span class="chip">{{ jobs.postulaciones.length }}</span>
        </div>

        <p v-if="!ready">Cargando…</p>

        <div v-else-if="!jobs.postulaciones.length" class="empty-state">
          <span class="empty-icon">⌕</span>
          <h3>Encuentra tu primera oportunidad</h3>
          <p>Selecciona un empleo para empezar tu ruta.</p>

          <RouterLink to="/empleos" class="action-link">
            Ir al buscador de empleos →
          </RouterLink>
        </div>

        <RouterLink
          v-for="p in jobs.postulaciones"
          :key="p.vacanteId"
          :to="'/empleos/' + p.vacanteId"
          class="application-row"
        >
          <strong>
            {{
              learning.rutas.find(r => r.vacanteId === p.vacanteId)?.titulo
                || 'Ver detalle del empleo'
            }}
          </strong>
          <span class="chip">{{ p.estado }}</span>
        </RouterLink>
      </section>

      <!-- Ruta seleccionada y progreso -->
      <section class="panel panel-pad stack">
        <div class="panel-title">
          <h2>Learning Path</h2>
          <RouterLink to="/aprendizaje">Ver rutas ↗</RouterLink>
        </div>

        <label v-if="learning.rutas.length">
          Selecciona tu empleo o ruta
          <select
            :value="learning.seleccion"
            @change="learning.elegir($event.target.value)"
          >
            <option value="">Seleccionar ruta</option>
            <option
              v-for="p in learning.rutas"
              :key="p.id"
              :value="p.id"
            >
              {{ p.titulo }}
            </option>
          </select>
        </label>

        <div v-if="!learning.activa" class="empty-state">
          <span class="empty-icon">↗</span>
          <h3>Un objetivo, un camino</h3>
          <p>Tu progreso aparecerá cuando selecciones una ruta de aprendizaje.</p>

          <RouterLink :to="learning.rutas.length ? '/aprendizaje' : '/empleos'">
            Elegir mi siguiente paso →
          </RouterLink>
        </div>

        <template v-else>
          <h3>{{ learning.activa.titulo }}</h3>
          <strong>{{ learning.progreso(learning.activa) }}% completado</strong>

          <div class="meter">
            <span
              :style="{ width: learning.progreso(learning.activa) + '%' }"
            ></span>
          </div>

          <p class="small muted">
            {{ learning.activa.cursos.filter(c => c.completado).length }}
            de {{ learning.activa.cursos.length }} cursos
          </p>

          <RouterLink to="/aprendizaje" class="action-link">
            Continuar aprendiendo →
          </RouterLink>
        </template>
      </section>
    </div>
  </div>
</template>
