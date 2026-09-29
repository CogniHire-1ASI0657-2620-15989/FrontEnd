<script setup>
import { reactive, ref, computed } from 'vue'
import { useRouter, RouterLink } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { sectores, sugerenciasDeHabilidades } from '@/data/jobs'
import {
  validar, sinErrores, required, email as esEmail,
  password as esPassword, documento as esDocumento, telefono as esTelefono
} from '@/utils/validators'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import TagInput from '@/components/ui/TagInput.vue'

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
  tipoDocumento: 'DNI',
  documento: '',
  fechaNacimiento: '',
  telefono: '',
  ciudad: '',
  // Paso 3 — formacion y objetivo
  nivelEstudios: '',
  carrera: '',
  institucion: '',
  cicloOAnioEgreso: '',
  sectorObjetivo: '',
  cargoObjetivo: '',
  modalidadPreferida: '',
  habilidades: []
})

const tiposDocumento = [
  { valor: 'DNI', texto: 'DNI' },
  { valor: 'CE', texto: 'Carne de extranjeria' },
  { valor: 'PAS', texto: 'Pasaporte' }
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
const modalidades = ['Remoto', 'Hibrido', 'Presencial']

const reglasPorPaso = {
  1: {
    email: [(v) => required(v, 'El correo'), esEmail],
    password: [(v) => required(v, 'La contrasena'), esPassword],
    confirmacion: [(v) => (v === form.password ? null : 'Las contrasenas no coinciden')]
  },
  2: {
    nombre: [(v) => required(v, 'El nombre')],
    apellido: [(v) => required(v, 'El apellido')],
    documento: [(v) => esDocumento(v, form.tipoDocumento)],
    fechaNacimiento: [(v) => required(v, 'La fecha de nacimiento')],
    telefono: [esTelefono],
    ciudad: [(v) => required(v, 'La ciudad')]
  },
  3: {
    nivelEstudios: [(v) => required(v, 'El nivel de estudios')],
    carrera: [(v) => required(v, 'La carrera')],
    institucion: [(v) => required(v, 'La institucion')],
    sectorObjetivo: [(v) => required(v, 'El sector')],
    cargoObjetivo: [(v) => required(v, 'El cargo objetivo')]
  }
}

const titulos = {
  1: 'Crea tu acceso',
  2: 'Tus datos personales',
  3: 'Estudios y objetivo laboral'
}
const bajadas = {
  1: 'Con este correo y contrasena entraras a PathBridge.',
  2: 'Estos datos van en el encabezado de tu curriculum.',
  3: 'Elige tu sector y tu cargo objetivo: con eso calculamos tu compatibilidad con cada vacante.'
}

const esUltimo = computed(() => paso.value === 3)
const sugerencias = computed(() => sugerenciasDeHabilidades(form.sectorObjetivo))

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
  if (validarPaso()) paso.value += 1
}

function anterior() {
  limpiar()
  paso.value -= 1
}

async function crearCuenta() {
  if (!validarPaso()) return
  const { confirmacion, ...datos } = form
  try {
    await auth.registrar({ ...datos })
    router.push('/perfil')
  } catch (e) {
    errorGeneral.value = e.message
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
                     ayuda="Minimo 8 caracteres, con letras y numeros" :error="errores.password" />
          <BaseInput v-model="form.confirmacion" label="Repite la contrasena" type="password"
                     autocomplete="new-password" :error="errores.confirmacion" />
        </div>
      </template>

      <!-- Paso 2 -->
      <template v-else-if="paso === 2">
        <div class="dos">
          <BaseInput v-model="form.nombre" label="Nombres" :error="errores.nombre" />
          <BaseInput v-model="form.apellido" label="Apellidos" :error="errores.apellido" />
        </div>
        <div class="dos">
          <BaseSelect v-model="form.tipoDocumento" label="Tipo de documento" :opciones="tiposDocumento"
                      placeholder="Selecciona" />
          <BaseInput v-model="form.documento" label="Numero de documento"
                     :ayuda="form.tipoDocumento === 'DNI' ? '8 digitos' : 'Entre 6 y 12 caracteres'"
                     :error="errores.documento" />
        </div>
        <div class="dos">
          <BaseInput v-model="form.fechaNacimiento" label="Fecha de nacimiento" type="date"
                     :error="errores.fechaNacimiento" />
          <BaseInput v-model="form.telefono" label="Telefono (opcional)" placeholder="999 999 999"
                     :error="errores.telefono" />
        </div>
        <BaseInput v-model="form.ciudad" label="Ciudad donde vives" placeholder="Lima" :error="errores.ciudad" />
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
          <BaseInput v-model="form.cicloOAnioEgreso" label="Ciclo actual o ano de egreso" placeholder="8vo ciclo" />
        </div>
        <div class="dos">
          <BaseSelect v-model="form.sectorObjetivo" label="Sector en el que quieres trabajar"
                      :opciones="sectores" :error="errores.sectorObjetivo" />
          <BaseInput v-model="form.cargoObjetivo" label="Cargo al que aspiras"
                     placeholder="Asistente contable, practicante de enfermeria..."
                     :error="errores.cargoObjetivo" />
        </div>
        <BaseSelect v-model="form.modalidadPreferida" label="Modalidad preferida" :opciones="modalidades" />
        <TagInput v-model="form.habilidades" label="Habilidades que ya manejas"
                  :sugerencias="sugerencias"
                  :placeholder="form.sectorObjetivo ? 'Escribe y presiona Enter' : 'Elige tu sector para ver sugerencias'" />
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
