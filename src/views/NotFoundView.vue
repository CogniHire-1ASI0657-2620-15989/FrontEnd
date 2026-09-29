<script setup>
import { RouterLink } from 'vue-router'
</script>

<template>
  <div class="panel panel-pad vacio">
    <h1>Esta pagina no existe</h1>
    <p class="muted">Revisa la direccion o vuelve al dashboard.</p>
    <RouterLink to="/dashboard">Ir al dashboard</RouterLink>
  </div>
</template>

<style scoped>
.vacio { display: grid; gap: 0.5rem; max-width: 460px; }
</style>
