<script setup>
import { RouterLink, useRoute } from 'vue-router'
import { computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import BridgeMark from '@/components/brand/BridgeMark.vue'
import { iniciales, nombreCompleto } from '@/utils/format'

defineProps({ abierto: Boolean })
const emit = defineEmits(['cerrar'])

const auth = useAuthStore()
const route = useRoute()

const enlaces = [
  { to: '/perfil', texto: 'Mi perfil', icono: 'M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8Zm0 2c-4 0-7 2.2-7 5v1h14v-1c0-2.8-3-5-7-5Z' },
  { to: '/dashboard', texto: 'Dashboard', icono: 'M4 13h6V4H4v9Zm0 7h6v-5H4v5Zm10 0h6v-9h-6v9Zm0-16v5h6V4h-6Z' },
  { to: '/empleos', texto: 'Busqueda de trabajo', icono: 'M10 4a6 6 0 1 0 3.5 10.9l4.3 4.3 1.4-1.4-4.3-4.3A6 6 0 0 0 10 4Zm0 2a4 4 0 1 1 0 8 4 4 0 0 1 0-8Z' }
]

const activo = (to) => route.path.startsWith(to)
const progreso = computed(() => auth.perfilCompleto)
</script>

<template>
  <aside :class="['sidebar', { 'sidebar--abierto': abierto }]">
    <RouterLink to="/dashboard" class="sidebar__marca" @click="emit('cerrar')">
      <BridgeMark :tamano="28" color="var(--bridge)" />
      <span>PathBridge</span>
    </RouterLink>

    <nav class="sidebar__nav">
      <RouterLink
        v-for="e in enlaces"
        :key="e.to"
        :to="e.to"
        :class="['sidebar__link', { 'is-activo': activo(e.to) }]"
        @click="emit('cerrar')"
      >
        <svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true"><path :d="e.icono" fill="currentColor" /></svg>
        {{ e.texto }}
      </RouterLink>
    </nav>

    <div class="sidebar__progreso">
      <p class="small muted">Perfil completo al {{ progreso }}%</p>
      <div class="meter"><span :style="{ width: progreso + '%' }"></span></div>
      <RouterLink v-if="progreso < 100" to="/perfil" class="small" @click="emit('cerrar')">Completar perfil</RouterLink>
    </div>

    <div class="sidebar__usuario">
      <span class="avatar">{{ iniciales(auth.usuario?.nombre, auth.usuario?.apellido) }}</span>
      <div class="sidebar__datos">
        <strong>{{ nombreCompleto(auth.usuario) }}</strong>
        <span class="small muted">{{ auth.usuario?.cargoObjetivo || 'Sin cargo objetivo' }}</span>
      </div>
    </div>
  </aside>
</template>

<style scoped>
.sidebar {
  width: var(--sidebar-w);
  background: var(--ink);
  color: #dbe3ee;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  padding: 1.25rem 1rem;
  position: fixed;
  inset: 0 auto 0 0;
  z-index: 40;
}

.sidebar__marca {
  display: flex; align-items: center; gap: 0.55rem;
  color: #fff; text-decoration: none;
  font-family: var(--font-display); font-size: 1.1875rem; font-weight: 600;
  padding: 0.25rem;
}

.sidebar__nav { display: grid; gap: 0.15rem; }
.sidebar__link {
  display: flex; align-items: center; gap: 0.6rem;
  padding: 0.55rem 0.65rem;
  border-radius: var(--radius-sm);
  color: #b9c6d8; text-decoration: none; font-size: 0.9375rem;
  border-left: 2px solid transparent;
}
.sidebar__link:hover { background: rgba(255, 255, 255, 0.06); color: #fff; }
.sidebar__link.is-activo { background: rgba(255, 255, 255, 0.1); color: #fff; border-left-color: #4fb3a6; }

.sidebar__progreso { margin-top: auto; display: grid; gap: 0.4rem; }
.sidebar__progreso .muted { color: #9fb0c6; }
.sidebar__progreso .meter { background: rgba(255, 255, 255, 0.12); border-color: rgba(255, 255, 255, 0.16); }
.sidebar__progreso .meter > span { background: #4fb3a6; }
.sidebar__progreso a { color: #8fd3c8; }

.sidebar__usuario {
  display: flex; align-items: center; gap: 0.6rem;
  border-top: 1px solid rgba(255, 255, 255, 0.12);
  padding-top: 0.9rem;
}
.avatar {
  width: 36px; height: 36px; flex: none;
  display: grid; place-items: center;
  border-radius: 50%; background: #2a3a52; color: #fff;
  font-size: 0.8125rem; font-weight: 600;
}
.sidebar__datos { display: grid; min-width: 0; }
.sidebar__datos strong { font-size: 0.875rem; color: #fff; }
.sidebar__datos span, .sidebar__datos strong { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.sidebar__datos .muted { color: #9fb0c6; }

@media (max-width: 900px) {
  .sidebar { transform: translateX(-100%); transition: transform 0.2s ease; box-shadow: 0 0 40px rgba(0,0,0,.4); }
  .sidebar--abierto { transform: translateX(0); }
}
</style>
