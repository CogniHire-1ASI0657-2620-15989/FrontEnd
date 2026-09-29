<script setup>
import { reactive, ref } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { authService } from '@/services/authService'
import { validar, sinErrores, required, email as esEmail } from '@/utils/validators'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseButton from '@/components/ui/BaseButton.vue'

const auth = useAuthStore()
const router = useRouter()
const route = useRoute()

const form = reactive({ email: '', password: '' })
const errores = reactive({})
const errorGeneral = ref('')
const aviso = ref('')
const recuperando = ref(false)

function limpiarErrores() {
  Object.keys(errores).forEach((k) => delete errores[k])
  errorGeneral.value = ''
  aviso.value = ''
}

async function ingresar() {
  limpiarErrores()
  const nuevos = validar(form, {
    email: [(v) => required(v, 'El correo'), esEmail],
    password: [(v) => required(v, 'La contrasena')]
  })
  Object.assign(errores, nuevos)
  if (!sinErrores(nuevos)) return

  try {
    await auth.login(form.email, form.password)
    router.push(route.query.redirect ?? '/dashboard')
  } catch (e) {
    errorGeneral.value = e.message
  }
}

async function recuperar() {
  limpiarErrores()
  const error = esEmail(form.email)
  if (error) {
    errores.email = 'Escribe tu correo para enviarte el enlace'
    return
  }
  recuperando.value = true
  try {
    const { mensaje } = await authService.recuperarPassword(form.email)
    aviso.value = mensaje
  } catch (e) {
    errorGeneral.value = e.message
  } finally {
    recuperando.value = false
  }
}
</script>

<template>
  <div class="panel panel-pad tarjeta">
    <h1>Ingresa a tu cuenta</h1>
    <p class="muted">Retoma tu ruta donde la dejaste.</p>

    <form class="stack" novalidate @submit.prevent="ingresar">
      <p v-if="errorGeneral" class="notice notice--error">{{ errorGeneral }}</p>
      <p v-if="aviso" class="notice notice--ok">{{ aviso }}</p>

      <BaseInput
        v-model="form.email" label="Correo electronico" type="email"
        placeholder="tucorreo@ejemplo.com" autocomplete="email" :error="errores.email"
      />
      <BaseInput
        v-model="form.password" label="Contrasena" type="password"
        placeholder="········" autocomplete="current-password" :error="errores.password"
      />

      <div class="fila">
        <BaseButton tipo="submit" :cargando="auth.cargando">Ingresar</BaseButton>
        <BaseButton variante="texto" :cargando="recuperando" @click="recuperar">Olvide mi contrasena</BaseButton>
      </div>
    </form>

    <p class="pie muted">
      Todavia no tienes cuenta?
      <RouterLink to="/crear-cuenta">Crear cuenta</RouterLink>
    </p>
  </div>
</template>

<style scoped>
.tarjeta { display: grid; gap: 1rem; }
.tarjeta h1 { font-size: 1.75rem; }
.tarjeta > .muted { margin: -0.75rem 0 0; }
.fila { display: flex; align-items: center; justify-content: space-between; gap: 0.5rem; flex-wrap: wrap; }
.pie { margin: 0; font-size: 0.875rem; }
</style>
