<script setup>
import { computed } from 'vue'

const props = defineProps({
  valor: { type: Number, default: 0 },
  tamano: { type: Number, default: 64 },
  etiqueta: { type: String, default: 'compatibilidad' }
})

const r = 26
const circunferencia = 2 * Math.PI * r
const avance = computed(() => circunferencia * (1 - Math.min(100, Math.max(0, props.valor)) / 100))
const color = computed(() => (props.valor >= 70 ? 'var(--bridge)' : props.valor >= 40 ? 'var(--gap)' : 'var(--alert)'))
</script>

<template>
  <div class="ring" :style="{ width: tamano + 'px' }" role="img" :aria-label="`${valor}% de ${etiqueta}`">
    <svg viewBox="0 0 64 64" :width="tamano" :height="tamano">
      <circle cx="32" cy="32" :r="r" fill="none" stroke="var(--line)" stroke-width="6" />
      <circle
        cx="32" cy="32" :r="r" fill="none" :stroke="color" stroke-width="6" stroke-linecap="round"
        :stroke-dasharray="circunferencia" :stroke-dashoffset="avance" transform="rotate(-90 32 32)"
        style="transition: stroke-dashoffset 0.5s ease"
      />
    </svg>
    <span class="ring__valor" :style="{ color }">{{ valor }}<i>%</i></span>
  </div>
</template>

<style scoped>
.ring { position: relative; display: inline-grid; place-items: center; }
.ring svg { display: block; }
.ring__valor {
  position: absolute; font-family: var(--font-display); font-weight: 600; font-size: 0.9375rem;
}
.ring__valor i { font-style: normal; font-size: 0.625rem; }
</style>
