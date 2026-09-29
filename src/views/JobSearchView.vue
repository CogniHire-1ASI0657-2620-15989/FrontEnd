<script setup>
import { onMounted, ref, computed } from 'vue'
import { useJobsStore } from '@/stores/jobs'
import { useAuthStore } from '@/stores/auth'
import { sectores } from '@/data/jobs'
import JobCard from '@/components/jobs/JobCard.vue'
import JobDetail from '@/components/jobs/JobDetail.vue'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const jobs = useJobsStore()
const auth = useAuthStore()

const q = ref('')
const ubicacion = ref('')
const modalidad = ref('')
const nivel = ref('')
const sector = ref('')
const soloGuardadas = ref(false)
const seleccionadaId = ref(null)

const modalidades = ['Remoto', 'Hibrido', 'Presencial']
const niveles = ['Practicante', 'Junior', 'Semi senior']

const lista = computed(() =>
  soloGuardadas.value ? jobs.vacantesFavoritas : jobs.vacantesAnalizadas
)
const seleccionada = computed(() => lista.value.find((v) => v.id === seleccionadaId.value) ?? null)

onMounted(async () => {
  await jobs.buscar()
  await jobs.cargarPostulaciones()
})

function buscar() {
  seleccionadaId.value = null
  jobs.buscar({
    q: q.value,
    ubicacion: ubicacion.value,
    modalidad: modalidad.value,
    nivel: nivel.value,
    sector: sector.value
  })
}

function limpiar() {
  q.value = ''
  ubicacion.value = ''
  modalidad.value = ''
  nivel.value = ''
  sector.value = ''
  soloGuardadas.value = false
  seleccionadaId.value = null
  jobs.limpiarFiltros()
}

async function postular(id) {
  const estado = jobs.estadoDe(id)
  const siguiente = estado === 'Postulado' ? 'En proceso' : estado === 'En proceso' ? 'Cerrado' : 'Postulado'
  await jobs.marcarPostulacion(id, siguiente)
}
</script>

<template>
  <div class="empleos">
    <form class="panel panel-pad filtros" @submit.prevent="buscar">
      <BaseInput v-model="q" label="Puesto, empresa o habilidad" placeholder="asistente, enfermeria, ventas" />
      <BaseSelect v-model="sector" label="Sector" :opciones="sectores" placeholder="Todos los sectores" />
      <BaseInput v-model="ubicacion" label="Ubicacion" placeholder="Lima" />
      <BaseSelect v-model="modalidad" label="Modalidad" :opciones="modalidades" placeholder="Todas" />
      <BaseSelect v-model="nivel" label="Nivel" :opciones="niveles" placeholder="Todos" />
      <div class="filtros__acciones">
        <BaseButton tipo="submit" :cargando="jobs.cargando">Buscar</BaseButton>
        <BaseButton variante="secundario" @click="limpiar">Limpiar</BaseButton>
      </div>
    </form>

    <div class="empleos__barra">
      <p class="muted small">
        {{ lista.length }} vacante{{ lista.length === 1 ? '' : 's' }}
        <template v-if="!soloGuardadas"> ordenadas por compatibilidad con tu perfil</template>
      </p>
      <label class="switch small">
        <input v-model="soloGuardadas" type="checkbox" />
        Ver solo mis guardadas
      </label>
    </div>

    <p v-if="jobs.error" class="notice notice--error">{{ jobs.error }}</p>

    <div class="empleos__grid">
      <div class="empleos__lista">
        <p v-if="!jobs.cargando && !lista.length" class="panel panel-pad muted">
          No hay vacantes con esos filtros. Prueba con menos palabras o limpia la busqueda.
        </p>
        <JobCard
          v-for="v in lista"
          :key="v.id"
          :vacante="v"
          :favorita="jobs.favoritos.includes(v.id)"
          :seleccionada="seleccionadaId === v.id"
          @ver="seleccionadaId = v.id"
          @favorito="jobs.alternarFavorito"
        />
      </div>

      <JobDetail
        v-if="seleccionada"
        :vacante="seleccionada"
        :favorita="jobs.favoritos.includes(seleccionada.id)"
        :estado="jobs.estadoDe(seleccionada.id)"
        @favorito="jobs.alternarFavorito"
        @postular="postular"
        @cerrar="seleccionadaId = null"
      />
      <aside v-else class="panel panel-pad pista">
        <h3>Elige una vacante</h3>
        <p class="small muted">
          Al abrir una vacante veras tu porcentaje de compatibilidad, las habilidades que te faltan
          y una ruta de cursos para cerrarlas.
        </p>
        <p v-if="!auth.habilidades.length" class="notice notice--error small">
          Tu perfil aun no tiene habilidades registradas, por eso la compatibilidad sale en cero.
          Agregalas desde Mi perfil.
        </p>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.empleos { display: grid; gap: 1rem; }
.filtros {
  display: grid; gap: 0.75rem;
  grid-template-columns: 1.6fr 1.2fr 1fr 1fr 1fr auto;
  align-items: end;
}
.filtros__acciones { display: flex; gap: 0.5rem; }
.empleos__barra { display: flex; justify-content: space-between; align-items: center; gap: 1rem; flex-wrap: wrap; }
.empleos__barra p { margin: 0; }
.switch { display: inline-flex; align-items: center; gap: 0.4rem; cursor: pointer; }
.empleos__grid { display: grid; grid-template-columns: minmax(0, 1fr) minmax(320px, 400px); gap: 1rem; align-items: start; }
.empleos__lista { display: grid; gap: 0.75rem; }
.pista { position: sticky; top: 5rem; }

@media (max-width: 1100px) {
  .filtros { grid-template-columns: 1fr 1fr; }
  .empleos__grid { grid-template-columns: 1fr; }
  .pista { display: none; }
}
@media (max-width: 560px) { .filtros { grid-template-columns: 1fr; } }
</style>
