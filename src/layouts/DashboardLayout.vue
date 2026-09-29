<script setup>
import { ref } from 'vue'
import AppSidebar from '@/components/layout/AppSidebar.vue'
import AppTopbar from '@/components/layout/AppTopbar.vue'

const menuAbierto = ref(false)
</script>

<template>
  <div class="shell">
    <AppSidebar :abierto="menuAbierto" @cerrar="menuAbierto = false" />
    <div v-if="menuAbierto" class="shell__velo" @click="menuAbierto = false"></div>
    <div class="shell__cuerpo">
      <AppTopbar @alternar-menu="menuAbierto = !menuAbierto" />
      <main class="shell__main"><slot /></main>
    </div>
  </div>
</template>

<style scoped>
.shell { min-height: 100%; }
.shell__cuerpo { margin-left: var(--sidebar-w); min-height: 100vh; display: flex; flex-direction: column; }
.shell__main { padding: 1.5rem; flex: 1; }
.shell__velo { position: fixed; inset: 0; background: rgba(15, 27, 45, 0.45); z-index: 30; }

@media (max-width: 900px) {
  .shell__cuerpo { margin-left: 0; }
  .shell__main { padding: 1rem; }
}
</style>
