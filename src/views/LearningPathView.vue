<script setup>
import { ref, onMounted } from 'vue'
import { useLearningStore } from '@/stores/learning'
import CertificateUpload from '@/components/profile/CertificateUpload.vue'
import { USA_MOCK } from '@/services/http'

const learning = useLearningStore()

const error = ref('')
const busy = ref('')
const ready = ref(false)
const selectedCourse = ref('')
const uploading = ref(false)
const notice = ref('')

async function cargar() {
  ready.value = false
  error.value = ''
  try {
    await learning.cargar()
  } catch (e) {
    error.value = e.message
  } finally {
    ready.value = true
  }
}

onMounted(cargar)

// Con el Gateway: marcar un video visto y subir certificados son acciones independientes.
async function marcarVisto(c) {
  busy.value = c.id
  error.value = ''
  try {
    await learning.marcarVisto(c.id)
  } catch (e) {
    error.value = e.message
  } finally {
    busy.value = ''
  }
}

async function certificadoAprobado() {
  notice.value = ''
  try {
    await learning.certificadoAprobado()
    notice.value = '✓ Certificado aprobado. Actualizamos tu perfil y tu reporte de brechas.'
  } catch (e) {
    error.value = e.message
  }
}

async function complete(c, certificate) {
  busy.value = c.id
  error.value = ''

  try {
    await learning.completar(c.id, certificate)
    selectedCourse.value = ''
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
      <button type="button" class="text-button" @click="cargar">Reintentar</button>
    </p>
    <p v-if="notice" class="notice notice--ok" role="status">{{ notice }}</p>

    <p v-if="!ready">Cargando rutas…</p>

    <section v-else-if="!learning.rutas.length" class="panel empty-state">
      <span class="empty-icon">↗</span>
      <h2>Tu próximo paso empieza con un empleo</h2>
      <p>Guarda una vacante y analiza sus brechas para crear tu ruta.</p>

      <RouterLink to="/brechas" class="action-link">
        Analizar mis brechas
      </RouterLink>
    </section>

    <template v-else>
      <!-- Selección del empleo objetivo -->
      <label>
        Empleo objetivo
        <select
          :value="learning.seleccion"
          :disabled="uploading || !!busy"
          @change="learning.elegir($event.target.value); selectedCourse = ''"
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
          <p v-if="USA_MOCK">
            {{ learning.activa.empresa }} ·
            {{ learning.activa.cursos.reduce((n, c) => n + c.horas, 0) }}
            horas estimadas
          </p>
          <p v-else>
            {{ [learning.activa.empresa, learning.activa.cursos.length + (learning.activa.cursos.length === 1 ? ' video' : ' videos')].filter(Boolean).join(' · ') }}
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
              <img v-if="c.miniatura" class="course-thumb" :src="c.miniatura" alt="" loading="lazy">
              <div v-else class="course-art" aria-hidden="true">
                {{ c.skill.slice(0, 2).toUpperCase() }}
              </div>

              <div class="stack">
                <div>
                  <span class="eyebrow">
                    PASO {{ c.orden }}<template v-if="c.horas"> · {{ c.horas }} HORAS</template>
                  </span>
                  <h3>{{ c.titulo }}</h3>
                  <p class="small muted">Habilidad: {{ c.skill }}<template v-if="c.canal"> · {{ c.canal }}</template></p>
                </div>

                <div v-if="!USA_MOCK" class="row">
                  <a v-if="c.url" :href="c.url" target="_blank" rel="noopener noreferrer">Ver video en YouTube ↗</a>
                  <button
                    class="action-link"
                    :disabled="!!busy || uploading || c.completado"
                    @click="marcarVisto(c)"
                  >
                    {{ busy === c.id ? 'Guardando…' : c.completado ? '✓ Video visto' : 'Marcar como visto' }}
                  </button>
                  <button
                    class="text-button"
                    :disabled="!!busy || uploading"
                    @click="selectedCourse = selectedCourse === c.id ? '' : c.id"
                  >
                    Subir certificado
                  </button>
                </div>

                <CertificateUpload
                  v-if="!USA_MOCK && selectedCourse === c.id"
                  :nombre="c.titulo"
                  :learning-path-id="learning.activa.id"
                  :skill-name="c.skill"
                  @busy="uploading = $event"
                  @validated="certificadoAprobado"
                />

                <div v-if="USA_MOCK" class="row">
                  <a
                    :href="c.url"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Explorar cursos externos ↗
                  </a>

                  <button
                    class="action-link"
                    :disabled="!!busy || uploading"
                    @click="selectedCourse = selectedCourse === c.id ? '' : c.id"
                  >
                    {{
                      busy === c.id
                        ? 'Guardando…'
                        : c.certificateId
                          ? 'Actualizar evidencia PDF'
                          : 'Declarar curso completado'
                    }}
                  </button>
                </div>

                <CertificateUpload
                  v-if="USA_MOCK && selectedCourse === c.id"
                  :nombre="c.titulo"
                  :course-id="c.id"
                  :disabled="!!busy"
                  @busy="uploading = $event"
                  @validated="certificate => complete(c, certificate)"
                />

                <span v-if="USA_MOCK && c.completado && c.certificateId" class="notice notice--ok">
                  ✓ PDF validado · Evidencia registrada en tu perfil
                </span>
                <span v-else-if="USA_MOCK && c.completado" class="small muted">Finalización anterior sin PDF. Adjunta evidencia para validarla.</span>
              </div>
            </article>
          </li>
        </ol>

        <p v-if="USA_MOCK" class="small muted">
          Los enlaces abren catálogos de cursos; las duraciones son estimaciones.
          Para completar un curso debes adjuntar su certificado en PDF.
        </p>
        <p v-else class="small muted">
          Los videos se proponen según las brechas de tu reporte. Si completas un curso externo,
          sube su certificado para sumar la habilidad a tu perfil.
        </p>

        <RouterLink to="/perfil">Ver certificados y CV →</RouterLink>
      </template>
    </template>
  </div>
</template>
