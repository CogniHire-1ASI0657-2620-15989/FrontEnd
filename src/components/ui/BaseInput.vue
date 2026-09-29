<script setup>
import { computed, useId } from 'vue'

const props = defineProps({
  modelValue: { type: [String, Number], default: '' },
  label: String,
  type: { type: String, default: 'text' },
  placeholder: String,
  error: String,
  ayuda: String,
  autocomplete: String,
  filas: { type: Number, default: 3 },
  disabled: Boolean
})
defineEmits(['update:modelValue'])

const uid = useId()
const id = computed(() => `campo-${uid}`)
</script>

<template>
  <div class="campo">
    <label v-if="label" :for="id">{{ label }}</label>

    <textarea
      v-if="type === 'textarea'"
      :id="id"
      :value="modelValue"
      :rows="filas"
      :placeholder="placeholder"
      :disabled="disabled"
      :class="{ 'is-error': error }"
      :aria-invalid="!!error"
      @input="$emit('update:modelValue', $event.target.value)"
    ></textarea>

    <input
      v-else
      :id="id"
      :type="type"
      :value="modelValue"
      :placeholder="placeholder"
      :autocomplete="autocomplete"
      :disabled="disabled"
      :class="{ 'is-error': error }"
      :aria-invalid="!!error"
      @input="$emit('update:modelValue', $event.target.value)"
    />

    <p v-if="error" class="campo__error">{{ error }}</p>
    <p v-else-if="ayuda" class="campo__ayuda">{{ ayuda }}</p>
  </div>
</template>

<style scoped>
.campo { display: grid; gap: 0.3rem; }
label { font-size: 0.8125rem; font-weight: 500; color: var(--ink-soft); }
input, textarea {
  font-family: var(--font-body);
  font-size: 0.9375rem;
  color: var(--ink);
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--radius-sm);
  padding: 0.5rem 0.7rem;
  width: 100%;
  resize: vertical;
}
input:hover, textarea:hover { border-color: var(--slate-light); }
input:focus, textarea:focus { outline: none; border-color: var(--bridge); box-shadow: 0 0 0 3px var(--bridge-wash); }
.is-error { border-color: var(--alert); }
.is-error:focus { box-shadow: 0 0 0 3px var(--alert-wash); }
.campo__error { margin: 0; font-size: 0.75rem; color: var(--alert); }
.campo__ayuda { margin: 0; font-size: 0.75rem; color: var(--slate); }
</style>
