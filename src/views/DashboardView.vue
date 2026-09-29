<script setup>
import { onMounted, computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { useJobsStore } from '@/stores/jobs'
import MatchRing from '@/components/ui/MatchRing.vue'
import JobCard from '@/components/jobs/JobCard.vue'
import { rutaSugerida } from '@/utils/matching'
import { fechaCorta } from '@/utils/format'

const auth = useAuthStore()
const jobs = useJobsStore()

onMounted(async () => {
  await jobs.buscar()
  await jobs.cargarPostulaciones()
})

const mejores = computed(() => jobs.vacantesAnalizadas.slice(0, 3))

/** Brechas mas repetidas entre las vacantes que mejor calzan con el perfil. */
const brechasFrecuentes = computed(() => {
  const conteo = {}
  jobs.vacantesAnalizadas.slice(0, 5).forEach((v) =>
    v.analisis.faltantesDuras.forEach((s) => { conteo[s] = (conteo[s] ?? 0) + 1 })
  )
  return Object.entries(conteo)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([skill, veces]) => ({ skill, veces }))
})

const rutaPrioritaria = computed(() => rutaSugerida(brechasFrecuentes.value.map((b) => b.skill)))

const postulacionesConVacante = computed(() =>
  jobs.postulaciones
    .map((p) => ({ ...p, vacante: jobs.resultados.find((v) => v.id === p.vacanteId) }))
    .filter((p) => p.vacante)
    .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
)
</script>

<template>
  <div class="dash">
    <header class="dash__hola panel panel-pad">
      <div>
        <h1>Hola, {{ auth.usuario?.nombre }}</h1>
        <p class="muted">
          Objetivo: {{ auth.usuario?.cargoObjetivo || 'define tu cargo objetivo en el perfil' }}<template v-if="auth.usuario?.sectorObjetivo"> en {{ auth.usuario.sectorObjetivo }}</template>.
          Hoy hay {{ jobs.resultados.length }} vacantes analizadas contra tu perfil.
        </p>
      </div>
      <MatchRing :valor="jobs.matchPromedio" :tamano="86" etiqueta="compatibilidad promedio" />
    </header>

    <section class="dash__cifras">
      <article class="panel panel-pad cifra">
        <span class="cifra__valor">{{ jobs.matchPromedio }}%</span>
        <span class="small muted">Compatibilidad promedio</span>
      </article>
      <article class="panel panel-pad cifra">
        <span class="cifra__valor">{{ jobs.favoritos.length }}</span>
        <span class="small muted">Vacantes guardadas</span>
      </article>
      <article class="panel panel-pad cifra">
        <span class="cifra__valor">{{ jobs.postulaciones.length }}</span>
        <span class="small muted">Postulaciones registradas</span>
      </article>
      <article class="panel panel-pad cifra">
        <span class="cifra__valor">{{ auth.habilidades.length }}</span>
        <span class="small muted">Habilidades en tu perfil</span>
      </article>
    </section>

    <div class="dash__columnas">
      <section class="stack">
        <div class="panel-title">
          <h2>Vacantes que mejor calzan contigo</h2>
          <RouterLink to="/empleos" class="small">Ver todas</RouterLink>
        </div>
        <JobCard
          v-for="v in mejores"
          :key="v.id"
          :vacante="v"
          :favorita="jobs.favoritos.includes(v.id)"
          @ver="$router.push('/empleos')"
          @favorito="jobs.alternarFavorito"
        />
        <p v-if="!mejores.length" class="panel panel-pad muted">Cargando vacantes...</p>
      </section>

      <div class="stack">
        <section class="panel panel-pad">
          <div class="panel-title"><h2>Tus brechas mas repetidas</h2></div>
          <p v-if="!brechasFrecuentes.length" class="small muted">
            Cuando agregues tu cargo objetivo y tus habilidades veras aqui que te esta frenando.
          </p>
          <ul v-else class="brechas">
            <li v-for="b in brechasFrecuentes" :key="b.skill">
              <span class="chip chip--gap">{{ b.skill }}</span>
              <span class="small muted">aparece en {{ b.veces }} de tus 5 mejores vacantes</span>
            </li>
          </ul>
        </section>

        <section class="panel panel-pad">
          <div class="panel-title"><h2>Ruta sugerida</h2></div>
          <p v-if="!rutaPrioritaria.length" class="small muted">Sin brechas pendientes por ahora.</p>
          <ul v-else class="ruta">
            <li v-for="c in rutaPrioritaria" :key="c.skill">
              <div>
                <strong class="small">{{ c.titulo }}</strong>
                <p class="small muted">{{ c.proveedor }} · {{ c.horas }} horas</p>
              </div>
              <a :href="c.url" target="_blank" rel="noopener" class="small">Ver curso</a>
            </li>
          </ul>
        </section>

        <section class="panel panel-pad">
          <div class="panel-title"><h2>Tus postulaciones</h2></div>
          <p v-if="!postulacionesConVacante.length" class="small muted">
            Todavia no registras postulaciones. Marca una vacante como postulada desde la busqueda.
          </p>
          <ul v-else class="postulaciones">
            <li v-for="p in postulacionesConVacante" :key="p.vacanteId">
              <div>
                <strong class="small">{{ p.vacante.titulo }}</strong>
                <p class="small muted">{{ p.vacante.empresa }} · {{ fechaCorta(p.fecha) }}</p>
              </div>
              <span class="chip">{{ p.estado }}</span>
            </li>
          </ul>
        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dash { display: grid; gap: 1rem; }
.dash__hola { display: flex; justify-content: space-between; align-items: center; gap: 1rem; flex-wrap: wrap; }
.dash__hola p { margin: 0.35rem 0 0; max-width: 60ch; }

.dash__cifras { display: grid; grid-template-columns: repeat(4, 1fr); gap: 1rem; }
.cifra { display: grid; gap: 0.1rem; }
.cifra__valor { font-family: var(--font-display); font-size: 1.75rem; font-weight: 600; }

.dash__columnas { display: grid; grid-template-columns: minmax(0, 1.15fr) minmax(300px, 0.85fr); gap: 1rem; align-items: start; }

.brechas, .ruta, .postulaciones { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.5rem; }
.brechas li { display: flex; align-items: center; gap: 0.5rem; flex-wrap: wrap; }
.ruta li, .postulaciones li {
  display: flex; justify-content: space-between; align-items: center; gap: 0.75rem;
  border: 1px solid var(--line); border-radius: var(--radius-sm); padding: 0.5rem 0.65rem;
}
.ruta p, .postulaciones p { margin: 0; }

@media (max-width: 1100px) {
  .dash__cifras { grid-template-columns: repeat(2, 1fr); }
  .dash__columnas { grid-template-columns: 1fr; }
}
@media (max-width: 520px) { .dash__cifras { grid-template-columns: 1fr; } }
</style>
