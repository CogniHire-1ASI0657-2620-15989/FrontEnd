<script setup>
import { reactive, ref, computed } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import {
  validar, sinErrores, required, email as esEmail,
  password as esPassword, documento as esDocumento, telefono as esTelefono
} from '@/utils/validators'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import SkillEditor from '@/components/ui/SkillEditor.vue'
import { USA_MOCK } from '@/services/http'
import { segmentos } from '@/services/gatewayAdapters'

const auth = useAuthStore()
const router = useRouter()

const paso = ref(1)
const errorGeneral = ref('')
const errores = reactive({})

const form = reactive({
  // Paso 1 — acceso
  email: '',
  password: '',
  confirmacion: '',
  // Paso 2 — identidad
  nombre: '',
  apellido: '',
  segundoApellido: '',
  segmento: 'trabajador',
  pais: 'Peru',
  tipoDocumento: 'DNI',
  documento: '',
  fechaNacimiento: '',
  telefono: '',
  ciudad: '',
  // Paso 3 — formacion y objetivo
  nivelEstudios: '',
  carrera: '',
  institucion: '',
  habilidades: []
})

const tiposDocumento = [
  { valor: 'DNI', texto: 'DNI' }
]
const nivelesEstudios = [
  'Secundaria completa',
  'Tecnico en curso',
  'Tecnico titulado',
  'Universitario en curso',
  'Bachiller',
  'Titulado',
  'Maestria'
]

const reglasPorPaso = {
  1: {
    email: [(v) => required(v, 'El correo'), esEmail],
    password: [(v) => required(v, 'La contrasena'), esPassword],
    confirmacion: [(v) => (v === form.password ? null : 'Las contrasenas no coinciden')]
  },
  2: {
    nombre: [(v) => required(v, 'El nombre')],
    apellido: [(v) => required(v, USA_MOCK ? 'El apellido' : 'El primer apellido')],
    ...(USA_MOCK ? {} : {
      segundoApellido: [(v) => required(v, 'El segundo apellido')],
      segmento: [(v) => required(v, 'Tu situación')]
    }),
    documento: [(v) => esDocumento(v, form.tipoDocumento)],
    // El Gateway no recibe fecha de nacimiento ni telefono.
    ...(USA_MOCK
      ? {
          fechaNacimiento: [(v) => required(v, 'La fecha de nacimiento')],
          telefono: [esTelefono]
        }
      : {}),
    ciudad: [(v) => required(v, 'La ciudad')]
  },
  3: {
    nivelEstudios: [(v) => required(v, 'El nivel de estudios')],
    carrera: [(v) => required(v, 'La carrera')],
    institucion: [(v) => required(v, 'La institucion')]
  }
}

const titulos = {
  1: 'Crea tu acceso',
  2: 'Tus datos personales',
  3: 'Estudios y habilidades'
}
const bajadas = {
  1: 'Con este correo y contrasena entraras a PathBridge.',
  2: 'Estos datos van en el encabezado de tu curriculum.',
  3: 'Registra tu formación y tus habilidades con su nivel de dominio.'
}

const esUltimo = computed(() => paso.value === 3)

function limpiar() {
  Object.keys(errores).forEach((k) => delete errores[k])
  errorGeneral.value = ''
}

function validarPaso() {
  limpiar()
  const nuevos = validar(form, reglasPorPaso[paso.value])
  Object.assign(errores, nuevos)
  return sinErrores(nuevos)
}

function siguiente() {
  if (!validarPaso()) return
  paso.value += 1
}

function anterior() {
  limpiar()
  paso.value -= 1
}

// Campo del Gateway -> campo del formulario, para marcar errores 422 (cada uno en su paso).
const camposApi = {
  dni: 'documento', first_name: 'nombre', first_last_name: 'apellido',
  second_last_name: 'segundoApellido', email: 'email', password: 'password',
  segment: 'segmento', city: 'ciudad', country: 'pais'
}
const pasoDe = campo => Object.entries(reglasPorPaso).find(([, reglas]) => campo in reglas)?.[0]

async function crearCuenta() {
  if (!validarPaso()) return
  const { confirmacion, ...datos } = form
  datos.pais = datos.pais.trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
  try {
    await auth.registrar({ ...datos })
    router.push('/perfil')
  } catch (e) {
    errorGeneral.value = e.message
    // 422: llevar al primer paso con un campo invalido y marcarlo.
    const invalidos = Object.entries(e.campos || {}).flatMap(([campo, msg]) => camposApi[campo] ? [[camposApi[campo], msg]] : [])
    if (invalidos.length) {
      Object.assign(errores, Object.fromEntries(invalidos))
      const primero = Math.min(...invalidos.map(([campo]) => Number(pasoDe(campo) ?? paso.value)))
      paso.value = primero
    }
  }
}
</script>

<template>
  <div class="panel panel-pad tarjeta">
    <header class="cab">
      <div>
        <h1>{{ titulos[paso] }}</h1>
        <p class="muted">{{ bajadas[paso] }}</p>
      </div>
      <span class="small muted">Paso {{ paso }} de 3</span>
    </header>

    <div class="meter"><span :style="{ width: (paso / 3) * 100 + '%' }"></span></div>

    <form class="stack" novalidate @submit.prevent="esUltimo ? crearCuenta() : siguiente()">
      <p v-if="errorGeneral" class="notice notice--error">{{ errorGeneral }}</p>

      <!-- Paso 1 -->
      <template v-if="paso === 1">
        <BaseInput v-model="form.email" label="Correo electronico" type="email" autocomplete="email"
                   placeholder="tucorreo@ejemplo.com" :error="errores.email" />
        <div class="dos">
          <BaseInput v-model="form.password" label="Contrasena" type="password" autocomplete="new-password"
           ayuda="Minimo 8 caracteres, con mayuscula, numero y simbolo (ej. Abc1234!)" :error="errores.password" />
          <BaseInput v-model="form.confirmacion" label="Repite la contrasena" type="password"
                     autocomplete="new-password" :error="errores.confirmacion" />
        </div>
      </template>

      <!-- Paso 2 -->
      <template v-else-if="paso === 2">
        <div class="dos">
          <BaseInput v-model="form.nombre" label="Nombres" :error="errores.nombre" />
          <BaseInput v-model="form.apellido" :label="USA_MOCK ? 'Apellidos' : 'Primer apellido'" :error="errores.apellido" />
        </div>
        <BaseInput v-if="!USA_MOCK" v-model="form.segundoApellido" label="Segundo apellido" :error="errores.segundoApellido" />
        <div class="dos">
          <BaseSelect v-model="form.tipoDocumento" label="Tipo de documento" :opciones="tiposDocumento"
                      placeholder="Selecciona" />
          <BaseInput v-model="form.documento" label="Numero de documento"
                     :ayuda="form.tipoDocumento === 'DNI' ? '8 digitos' : 'Entre 6 y 12 caracteres'"
                     :error="errores.documento" />
        </div>
        <div v-if="USA_MOCK" class="dos">
          <BaseInput v-model="form.fechaNacimiento" label="Fecha de nacimiento" type="date"
                     :error="errores.fechaNacimiento" />
          <BaseInput v-model="form.telefono" label="Telefono (opcional)" placeholder="999 999 999"
                     :error="errores.telefono" />
        </div>
        <div class="dos">
          <BaseInput v-model="form.ciudad" label="Ciudad donde vives" placeholder="Lima" :error="errores.ciudad" />
          <BaseInput v-if="!USA_MOCK" v-model="form.pais" label="País" placeholder="Perú" :error="errores.pais" />
        </div>
        <BaseSelect v-if="!USA_MOCK" v-model="form.segmento" label="¿Cuál describe mejor tu situación?"
                    :opciones="segmentos" :error="errores.segmento" />
      </template>

      <!-- Paso 3 -->
      <template v-else>
        <div class="dos">
          <BaseSelect v-model="form.nivelEstudios" label="Nivel de estudios" :opciones="nivelesEstudios"
                      :error="errores.nivelEstudios" />
          <BaseInput v-model="form.carrera" label="Carrera o especialidad"
                     placeholder="Enfermeria, Contabilidad, Educacion primaria..."
                     :error="errores.carrera" />
        </div>
        <div class="dos">
          <BaseInput v-model="form.institucion" label="Universidad, instituto o colegio"
                     placeholder="Nombre de la institucion" :error="errores.institucion" />
        </div>
        <SkillEditor v-model="form.habilidades" />
      </template>

      <div class="acciones">
        <BaseButton v-if="paso > 1" variante="secundario" @click="anterior">Volver</BaseButton>
        <BaseButton tipo="submit" :cargando="auth.cargando">
          {{ esUltimo ? 'Crear cuenta' : 'Continuar' }}
        </BaseButton>
      </div>
    </form>

    <p class="pie muted">
      Ya tienes cuenta?
      <RouterLink to="/ingresar">Ingresar</RouterLink>
    </p>
  </div>
</template>

<style scoped>
.tarjeta { display: grid; gap: 1rem; }
.cab { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; }
.cab h1 { font-size: 1.625rem; }
.cab p { margin: 0.25rem 0 0; }
.dos { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
.acciones { display: flex; justify-content: flex-end; gap: 0.5rem; }
.pie { margin: 0; font-size: 0.875rem; }
@media (max-width: 560px) { .dos { grid-template-columns: 1fr; } }
</style>
