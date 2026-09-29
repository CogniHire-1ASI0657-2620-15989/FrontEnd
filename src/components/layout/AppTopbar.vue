<script setup>
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import BaseButton from '@/components/ui/BaseButton.vue'

defineEmits(['alternar-menu'])

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

async function salir() {
  await auth.logout()
  router.push({ name: 'login' })
}
</script>

<template>
  <header class="topbar">
    <button class="topbar__menu" type="button" aria-label="Abrir menu" @click="$emit('alternar-menu')">
      <svg viewBox="0 0 24 24" width="20" height="20"><path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" stroke-width="2" stroke-linecap="round" /></svg>
    </button>
    <h2 class="topbar__titulo">{{ route.meta.titulo ?? 'PathBridge' }}</h2>
    <BaseButton variante="secundario" @click="salir">Cerrar sesion</BaseButton>
  </header>
</template>

<style scoped>
.topbar {
  display: flex; align-items: center; gap: 0.75rem;
  padding: 0.85rem 1.5rem;
  background: var(--surface);
  border-bottom: 1px solid var(--line);
  position: sticky; top: 0; z-index: 20;
}
.topbar__titulo { flex: 1; font-size: 1.125rem; }
.topbar__menu {
  display: none; background: none; border: 1px solid var(--line);
  border-radius: var(--radius-sm); padding: 0.35rem; cursor: pointer; color: var(--ink);
}
@media (max-width: 900px) { .topbar__menu { display: inline-flex; } }
</style>
