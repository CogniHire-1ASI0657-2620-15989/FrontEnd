<script setup>
import { reactive, ref } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { authService } from '@/services/authService'
import { validar, sinErrores, required, password as esPassword } from '@/utils/validators'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const route = useRoute()
const router = useRouter()
const form = reactive({ token: String(route.query.token || ''), password: '', confirmacion: '' })
const errores = reactive({})
const error = ref('')
const cargando = ref(false)

async function restablecer() {
  Object.keys(errores).forEach(k => delete errores[k])
  error.value = ''
  const nuevos = validar(form, {
    // El Gateway exige un token de al menos 20 caracteres.
    token: [v => required(v, 'El código'), v => (String(v).trim().length >= 20 ? null : 'El código de recuperación es más largo')],
    password: [v => required(v, 'La contrasena'), esPassword],
    confirmacion: [v => (v === form.password ? null : 'Las contrasenas no coinciden')]
  })
  Object.assign(errores, nuevos)
  if (!sinErrores(nuevos)) return

  cargando.value = true
  try {
    await authService.restablecerPassword(form.token.trim(), form.password)
    router.push({ name: 'login' })
  } catch (e) {
    error.value = e.message
  } finally {
    cargando.value = false
  }
}
</script>

<template>
  <div class="panel panel-pad tarjeta">
    <h1>Crea una contraseña nueva</h1>
    <p class="muted">Usa el código de recuperación que recibiste.</p>

    <form class="stack" novalidate @submit.prevent="restablecer">
      <p v-if="error" class="notice notice--error" role="alert">{{ error }}</p>
      <BaseInput v-model="form.token" label="Código de recuperación" :error="errores.token" />
      <BaseInput v-model="form.password" label="Contrasena nueva" type="password" autocomplete="new-password"
                 ayuda="Minimo 8 caracteres, con letras y numeros" :error="errores.password" />
      <BaseInput v-model="form.confirmacion" label="Repite la contrasena" type="password"
                 autocomplete="new-password" :error="errores.confirmacion" />
      <BaseButton tipo="submit" :cargando="cargando">Cambiar contraseña</BaseButton>
    </form>

    <p class="pie muted"><RouterLink to="/ingresar">Volver a ingresar</RouterLink></p>
  </div>
</template>

<style scoped>
.tarjeta { display: grid; gap: 1rem; }
.tarjeta h1 { font-size: 1.75rem; }
.tarjeta > .muted { margin: -0.75rem 0 0; }
.pie { margin: 0; font-size: 0.875rem; }
</style>
