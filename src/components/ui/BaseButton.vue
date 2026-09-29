<script setup>
defineProps({
  variante: { type: String, default: 'primario' }, // primario | secundario | texto | peligro
  tipo: { type: String, default: 'button' },
  bloque: Boolean,
  cargando: Boolean,
  disabled: Boolean
})
</script>

<template>
  <button
    :type="tipo"
    :class="['btn', `btn--${variante}`, { 'btn--bloque': bloque }]"
    :disabled="disabled || cargando"
  >
    <span v-if="cargando" class="btn__spin" aria-hidden="true"></span>
    <slot />
  </button>
</template>

<style scoped>
.btn {
  font-family: var(--font-body);
  font-size: 0.9375rem;
  font-weight: 500;
  padding: 0.55rem 1.05rem;
  border-radius: var(--radius-sm);
  border: 1px solid transparent;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease;
}
.btn:disabled { opacity: 0.55; cursor: not-allowed; }
.btn--bloque { width: 100%; }

.btn--primario { background: var(--bridge); color: #fff; }
.btn--primario:hover:not(:disabled) { background: var(--bridge-dark); }

.btn--secundario { background: var(--surface); color: var(--ink); border-color: var(--line); }
.btn--secundario:hover:not(:disabled) { border-color: var(--slate-light); }

.btn--texto { background: transparent; color: var(--bridge); padding-inline: 0.25rem; }
.btn--texto:hover:not(:disabled) { text-decoration: underline; }

.btn--peligro { background: var(--surface); color: var(--alert); border-color: #efc7c2; }
.btn--peligro:hover:not(:disabled) { background: var(--alert-wash); }

.btn__spin {
  width: 14px; height: 14px;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: giro 0.7s linear infinite;
}
@keyframes giro { to { transform: rotate(360deg); } }
</style>
