<script setup>
import { hace, sueldo } from '@/utils/format'

defineProps({
  vacante: { type: Object, required: true },
  favorita: Boolean,
  guardando: Boolean
})
defineEmits(['favorito'])
</script>

<template>
  <article class="panel panel-pad stack">
    <div>
      <h3>
        <RouterLink :to="'/empleos/' + vacante.id">{{ vacante.titulo }}</RouterLink>
      </h3>
      <p class="small muted">{{ vacante.empresa }} · {{ vacante.ubicacion }}<template v-if="vacante.tipoEmpleo || vacante.modalidad"> · {{ vacante.tipoEmpleo || vacante.modalidad }}</template></p>
      <p class="small">{{ vacante.salario || sueldo(vacante.sueldoMin, vacante.sueldoMax) }}</p>
    </div>
    <div class="row">
      <span v-for="skill in vacante.hardSkills" :key="skill" class="chip">{{ skill }}</span>
    </div>
    <div class="page-heading">
      <span class="small muted">{{ hace(vacante.publicada) }} · {{ vacante.fuente }}</span>
      <button type="button" class="action-link" :disabled="favorita || guardando" @click="$emit('favorito', vacante.id)">
        {{ favorita ? '✓ Vacante guardada' : guardando ? 'Guardando…' : 'Guardar vacante' }}
      </button>
    </div>
  </article>
</template>

