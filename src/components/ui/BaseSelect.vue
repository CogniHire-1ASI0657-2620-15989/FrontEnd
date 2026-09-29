<script setup>
import { computed, useId } from 'vue'

defineProps({
  modelValue: { type: [String, Number], default: '' },
  label: String,
  opciones: { type: Array, default: () => [] }, // [{ valor, texto }] o strings
  placeholder: { type: String, default: 'Selecciona una opcion' },
  error: String,
  disabled: Boolean
})
defineEmits(['update:modelValue'])

const uid = useId()
const id = computed(() => `select-${uid}`)
const normalizar = (o) => (typeof o === 'string' ? { valor: o, texto: o } : o)
</script>

<template>
  <div class="campo">
    <label v-if="label" :for="id">{{ label }}</label>
    <select
      :id="id"
      :value="modelValue"
      :disabled="disabled"
      :class="{ 'is-error': error }"
      @change="$emit('update:modelValue', $event.target.value)"
    >
      <option value="">{{ placeholder }}</option>
      <option v-for="o in opciones.map(normalizar)" :key="o.valor" :value="o.valor">{{ o.texto }}</option>
    </select>
    <p v-if="error" class="campo__error">{{ error }}</p>
  </div>
</template>

<style scoped>
.campo { display: grid; gap: 0.3rem; }
label { font-size: 0.8125rem; font-weight: 500; color: var(--ink-soft); }
select {
  font-family: var(--font-body);
  font-size: 0.9375rem;
  color: var(--ink);
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  padding: 0.5rem 0.7rem;
  width: 100%;
}
select:focus { outline: none; border-color: var(--bridge); box-shadow: 0 0 0 3px var(--bridge-wash); }
.is-error { border-color: var(--alert); }
.campo__error { margin: 0; font-size: 0.75rem; color: var(--alert); }
</style>
