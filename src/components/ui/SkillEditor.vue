<script setup>
import { computed, ref } from 'vue'
import { nivelesDominio, normalizarHabilidades } from '@/utils/skills'

const props = defineProps({ modelValue: { type: Array, default: () => [] } })
const emit = defineEmits(['update:modelValue'])
const nombre = ref('')
const nivel = ref('Básico')
const tipo = ref('hard')
const error = ref('')
const skills = computed(() => normalizarHabilidades(props.modelValue))

function agregar() {
  error.value = ''
  const value = nombre.value.trim()
  if (!value) return
  if (skills.value.some(s => s.nombre.toLowerCase() === value.toLowerCase())) {
    error.value = 'Esta habilidad ya está registrada'
    return
  }
  emit('update:modelValue', [...skills.value, { nombre: value, nivel: nivel.value, ...(tipo.value === 'soft' ? { tipo: 'soft' } : {}) }])
  nombre.value = ''
}

function actualizar(index, value) {
  emit('update:modelValue', skills.value.map((s, i) => i === index ? { ...s, nivel: value } : s))
}
</script>

<template>
  <div class="stack">
    <div class="skill-entry skill-entry--nuevo">
      <label>
        Habilidad
        <input v-model="nombre" placeholder="Ej. Excel" maxlength="100" @keydown.enter.prevent="agregar" />
      </label>
      <label>
        Tipo
        <select v-model="tipo" aria-label="Tipo de habilidad">
          <option value="hard">Técnica</option>
          <option value="soft">Blanda</option>
        </select>
      </label>
      <label>
        Dominio
        <select v-model="nivel" aria-label="Dominio">
          <option v-for="value in nivelesDominio" :key="value">{{ value }}</option>
        </select>
      </label>
      <button type="button" class="action-link" @click="agregar">Agregar</button>
    </div>
    <p v-if="error" class="notice notice--error" role="alert">{{ error }}</p>
    <p v-if="!skills.length" class="small muted">Agrega tus habilidades y su nivel de dominio.</p>
    <div v-for="(skill, i) in skills" :key="skill.nombre + skill.tipo" class="skill-entry">
      <strong>{{ skill.nombre }}<span v-if="skill.tipo === 'soft'" class="small muted"> · blanda</span></strong>
      <select :value="skill.nivel" :aria-label="'Nivel de ' + skill.nombre" @change="actualizar(i, $event.target.value)">
        <option v-for="value in nivelesDominio" :key="value">{{ value }}</option>
      </select>
      <button type="button" class="text-button" :aria-label="'Quitar ' + skill.nombre" @click="emit('update:modelValue', skills.filter((_, index) => index !== i))">Quitar</button>
    </div>
  </div>
</template>
