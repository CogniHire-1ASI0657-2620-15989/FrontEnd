<script setup>
import { ref, onMounted } from 'vue'
import { useLearningStore } from '@/stores/learning'

const learning = useLearningStore()

const error = ref('')
const busy = ref('')
const ready = ref(false)

onMounted(async () => {
  try {
    await learning.cargar()
  } catch (e) {
    error.value = e.message
  } finally {
    ready.value = true
  }
})

async function complete(c) {
  busy.value = c.id
  error.value = ''

  try {
    await learning.completar(c.id)
  } catch (e) {
    error.value = e.message
  } finally {
    busy.value = ''
  }
}
</script>

<template>
  <div class="stack">
    <header class="page-heading">
      <div>
        <span class="eyebrow">APRENDE CON UN OBJETIVO</span>
        <h1>Tu Learning Path</h1>
        <p class="muted">Cada paso te acerca al puesto que quieres.</p>
      </div>

      <RouterLink to="/empleos">Explorar empleos →</RouterLink>
    </header>

    <p v-if="error" class="notice notice--error" role="alert">
      {{ error }}
    </p>

    <p v-if="!ready">Cargando rutas…</p>

    <section v-else-if="!learning.rutas.length" class="panel empty-state">
      <span class="empty-icon">↗</span>
      <h2>Tu próximo paso empieza con un empleo</h2>
      <p>Postula a una vacante para crear una ruta basada en sus requisitos.</p>

      <RouterLink to="/empleos" class="action-link">
        Buscar un empleo
      </RouterLink>
    </section>

    <template v-else>
      <!-- Selección del empleo objetivo -->
      <label>
        Empleo objetivo
        <select
          :value="learning.seleccion"
          @change="learning.elegir($event.target.value)"
        >
          <option value="">Selecciona una ruta</option>
          <option
            v-for="p in learning.rutas"
            :key="p.id"
            :value="p.id"
          >
            {{ p.titulo }} · {{ p.empresa }}
          </option>
        </select>
      </label>

      <template v-if="learning.activa">
        <!-- Resumen y progreso de la ruta -->
        <section class="panel panel-pad path-hero">
          <span class="eyebrow">TU RUTA PERSONALIZADA</span>
          <h2>{{ learning.activa.titulo }}</h2>
          <p>
            {{ learning.activa.empresa }} ·
            {{ learning.activa.cursos.reduce((n, c) => n + c.horas, 0) }}
            horas estimadas
          </p>
          <strong>{{ learning.progreso(learning.activa) }}% completado</strong>

          <div
            class="meter"
            role="progressbar"
            aria-label="Progreso de aprendizaje"
            :aria-valuenow="learning.progreso(learning.activa)"
            aria-valuemin="0"
            aria-valuemax="100"
          >
            <span
              :style="{ width: learning.progreso(learning.activa) + '%' }"
            ></span>
          </div>
        </section>

        <!-- Cursos de la ruta -->
        <ol class="timeline">
          <li v-for="c in learning.activa.cursos" :key="c.id">
            <span class="timeline-dot">
              {{ c.completado ? '✓' : c.orden }}
            </span>

            <article class="panel course-card">
              <div class="course-art" aria-hidden="true">
                {{ c.skill.slice(0, 2).toUpperCase() }}
              </div>

              <div class="stack">
                <div>
                  <span class="eyebrow">
                    PASO {{ c.orden }} · {{ c.horas }} HORAS
                  </span>
                  <h3>{{ c.titulo }}</h3>
                  <p class="small muted">Habilidad: {{ c.skill }}</p>
                </div>

                <div class="row">
                  <a
                    :href="c.url"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Explorar cursos externos ↗
                  </a>

                  <button
                    class="action-link"
                    :disabled="!!busy"
                    @click="complete(c)"
                  >
                    {{
                      busy === c.id
                        ? 'Guardando…'
                        : c.completado
                          ? 'Sincronizar constancia'
                          : 'Declarar curso completado'
                    }}
                  </button>
                </div>

                <span v-if="c.completado" class="small">
                  ✓ Completado · Constancia disponible en tu CV
                </span>
              </div>
            </article>
          </li>
        </ol>

        <p class="small muted">
          Los enlaces abren catálogos de cursos; las duraciones son estimaciones.
          Las constancias de PathBridge reflejan finalización autodeclarada,
          no acreditaciones del proveedor externo.
        </p>

        <RouterLink to="/perfil">Ver certificados y CV →</RouterLink>
      </template>
    </template>
  </div>
</template>
