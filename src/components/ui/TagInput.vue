<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  modelValue: { type: Array, default: () => [] },
  label: String,
  sugerencias: { type: Array, default: () => [] },
  placeholder: { type: String, default: 'Escribe y presiona Enter' }
})
const emit = defineEmits(['update:modelValue'])

const texto = ref('')

const disponibles = computed(() => {
  const t = texto.value.trim().toLowerCase()
  return props.sugerencias
    .filter((s) => !props.modelValue.some((m) => m.toLowerCase() === s.toLowerCase()))
    .filter((s) => (t ? s.toLowerCase().includes(t) : true))
    .slice(0, 8)
})

function agregar(valor) {
  const v = String(valor).trim()
  if (!v) return
  if (props.modelValue.some((m) => m.toLowerCase() === v.toLowerCase())) {
    texto.value = ''
    return
  }
  emit('update:modelValue', [...props.modelValue, v])
  texto.value = ''
}

function quitar(valor) {
  emit('update:modelValue', props.modelValue.filter((m) => m !== valor))
}

function retroceso() {
  if (!texto.value && props.modelValue.length) quitar(props.modelValue[props.modelValue.length - 1])
}
</script>

<template>
  <div class="tags">
    <label v-if="label">{{ label }}</label>

    <div class="tags__caja">
      <span v-for="t in modelValue" :key="t" class="chip chip--have">
        {{ t }}
        <button type="button" class="chip__x" :aria-label="`Quitar ${t}`" @click="quitar(t)">&times;</button>
      </span>
      <input
        v-model="texto"
        :placeholder="modelValue.length ? '' : placeholder"
        @keydown.enter.prevent="agregar(texto)"
        @keydown.delete="retroceso"
      />
    </div>

    <div v-if="disponibles.length" class="tags__sugerencias">
      <button v-for="s in disponibles" :key="s" type="button" class="chip" @click="agregar(s)">+ {{ s }}</button>
    </div>
  </div>
</template>

<style scoped>
.tags { display: grid; gap: 0.4rem; }
label { font-size: 0.8125rem; font-weight: 500; color: var(--ink-soft); }
.tags__caja {
  display: flex; flex-wrap: wrap; gap: 0.35rem; align-items: center;
  border: 1px solid var(--line); background: var(--surface);
  border-radius: var(--radius-sm); padding: 0.4rem 0.5rem; min-height: 42px;
}
.tags__caja:focus-within { border-color: var(--bridge); box-shadow: 0 0 0 3px var(--bridge-wash); }
.tags__caja input {
  flex: 1; min-width: 140px; border: 0; outline: none;
  font-family: var(--font-body); font-size: 0.9375rem; background: transparent; color: var(--ink);
}
.chip__x { border: 0; background: none; cursor: pointer; color: inherit; font-size: 1rem; line-height: 1; padding: 0; }
.tags__sugerencias { display: flex; flex-wrap: wrap; gap: 0.3rem; }
.tags__sugerencias .chip { cursor: pointer; }
.tags__sugerencias .chip:hover { border-color: var(--bridge); color: var(--bridge-dark); }
</style>
