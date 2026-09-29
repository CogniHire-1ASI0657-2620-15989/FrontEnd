<script setup>
import MatchRing from '@/components/ui/MatchRing.vue'
import { hace, sueldo } from '@/utils/format'

defineProps({
  vacante: { type: Object, required: true },
  favorita: Boolean,
  seleccionada: Boolean
})
defineEmits(['ver', 'favorito'])
</script>

<template>
  <article :class="['vacante', { 'is-seleccionada': seleccionada }]" @click="$emit('ver', vacante)">
    <div class="vacante__texto">
      <h3>{{ vacante.titulo }}</h3>
      <p class="muted small">{{ vacante.empresa }} · {{ vacante.ubicacion }} · {{ vacante.modalidad }}</p>
      <p class="muted small">{{ vacante.sector }} · {{ vacante.nivel }}</p>
      <p class="small">{{ sueldo(vacante.sueldoMin, vacante.sueldoMax) }}</p>

      <div class="vacante__skills">
        <span v-for="s in vacante.analisis.faltantes.slice(0, 3)" :key="s" class="chip chip--gap">{{ s }}</span>
        <span v-if="!vacante.analisis.faltantes.length" class="chip chip--have">Cumples todos los requisitos</span>
      </div>

      <p class="muted small">{{ hace(vacante.publicada) }} · {{ vacante.fuente }}</p>
    </div>

    <div class="vacante__lado">
      <MatchRing :valor="vacante.analisis.match" />
      <button
        type="button"
        class="favorito"
        :aria-pressed="favorita"
        :aria-label="favorita ? 'Quitar de guardados' : 'Guardar vacante'"
        @click.stop="$emit('favorito', vacante.id)"
      >
        <svg viewBox="0 0 24 24" width="18" height="18">
          <path d="M6 3h12v18l-6-4.2L6 21V3Z" :fill="favorita ? 'var(--bridge)' : 'none'"
                stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" />
        </svg>
      </button>
    </div>
  </article>
</template>

<style scoped>
.vacante {
  display: flex; gap: 1rem; justify-content: space-between;
  background: var(--surface); border: 1px solid var(--line);
  border-radius: var(--radius); padding: 1rem 1.1rem; cursor: pointer;
}
.vacante:hover { border-color: var(--slate-light); }
.is-seleccionada { border-color: var(--bridge); box-shadow: 0 0 0 3px var(--bridge-wash); }
.vacante__texto { display: grid; gap: 0.3rem; min-width: 0; }
.vacante__texto p { margin: 0; }
.vacante__skills { display: flex; flex-wrap: wrap; gap: 0.3rem; margin: 0.25rem 0; }
.vacante__lado { display: grid; justify-items: center; gap: 0.4rem; flex: none; }
.favorito { background: none; border: 0; cursor: pointer; color: var(--slate); padding: 0.2rem; }
.favorito:hover { color: var(--bridge); }
</style>
