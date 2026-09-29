<script setup>
defineProps({ tamano: { type: Number, default: 26 }, color: { type: String, default: 'currentColor' } })
</script>

<template>
  <!-- Marca: dos orillas y un tramo de puente entre ellas -->
  <svg :width="tamano" :height="tamano" viewBox="0 0 32 32" fill="none" aria-hidden="true">
    <path d="M2 23h6M24 23h6" :stroke="color" stroke-width="2.4" stroke-linecap="round" />
    <path d="M8 23c0-7 3.6-11 8-11s8 4 8 11" :stroke="color" stroke-width="2.4" stroke-linecap="round" />
    <path d="M12 23v-6M16 23v-9M20 23v-6" :stroke="color" stroke-width="1.6" stroke-linecap="round" opacity=".7" />
    <circle cx="16" cy="8" r="2.6" :fill="color" />
  </svg>
</template>
