<script setup>
import BaseButton from '@/components/ui/BaseButton.vue'
import { sueldo, hace } from '@/utils/format'

defineProps({
  vacante: { type: Object, required: true },
  favorita: Boolean,
  guardando: Boolean
})
defineEmits(['favorito'])
</script>

<template>
  <article class="panel panel-pad stack">
    <header>
      <h1>{{ vacante.titulo }}</h1>
      <p class="muted">{{ vacante.empresa }} · {{ vacante.ubicacion }}</p>
      <p v-if="vacante.tipoEmpleo || vacante.modalidad" class="small muted">{{ vacante.tipoEmpleo || vacante.modalidad }}</p>
      <p v-if="vacante.sector || vacante.nivel" class="small muted">{{ vacante.sector }} · {{ vacante.nivel }}</p>
      <p>{{ vacante.salario || sueldo(vacante.sueldoMin, vacante.sueldoMax) }} · {{ hace(vacante.publicada) }}</p>
    </header>

    <section class="stack">
      <h2>Sobre el puesto</h2>
      <p>{{ vacante.descripcion }}</p>
      <h3 v-if="vacante.responsabilidades?.length">Responsabilidades</h3>
      <ul v-if="vacante.responsabilidades?.length">
        <li v-for="item in vacante.responsabilidades" :key="item">{{ item }}</li>
      </ul>
    </section>

    <section v-if="vacante.hardSkills?.length || vacante.softSkills?.length" class="stack">
      <h2>Requisitos del puesto</h2>
      <h3>Conocimientos técnicos</h3>
      <div class="row">
        <span v-for="skill in vacante.hardSkills" :key="skill" class="chip">{{ skill }}</span>
      </div>
      <h3>Habilidades personales</h3>
      <div class="row">
        <span v-for="skill in vacante.softSkills" :key="skill" class="chip">{{ skill }}</span>
      </div>
    </section>

    <footer>
      <BaseButton :disabled="favorita" :cargando="guardando" @click="$emit('favorito', vacante.id)">
        {{ favorita ? '✓ Vacante guardada' : 'Guardar vacante' }}
      </BaseButton>
    </footer>
    <p v-if="vacante.urlExterna" class="small muted">Fuente: <a :href="vacante.urlExterna" target="_blank" rel="noopener noreferrer">Consultar publicación original ↗</a></p>
  </article>
</template>

