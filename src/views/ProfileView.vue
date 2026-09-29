<script setup>
import { reactive, ref, watch, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { sectores, sugerenciasDeHabilidades } from '@/data/jobs'
import { validar, sinErrores, required, documento as esDocumento, telefono as esTelefono } from '@/utils/validators'
import BaseInput from '@/components/ui/BaseInput.vue'
import BaseSelect from '@/components/ui/BaseSelect.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import TagInput from '@/components/ui/TagInput.vue'
import CvDocument from '@/components/profile/CvDocument.vue'

const auth = useAuthStore()

const vista = ref('datos') // datos | curriculum
const guardando = ref(false)
const aviso = ref('')
const errores = reactive({})

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

const form = reactive({
  nombre: '', apellido: '', tipoDocumento: 'DNI', documento: '', fechaNacimiento: '',
  telefono: '', ciudad: '', nivelEstudios: '', carrera: '', institucion: '',
  cicloOAnioEgreso: '', sectorObjetivo: '', cargoObjetivo: '', modalidadPreferida: '',
  resumenProfesional: '', habilidades: [], experiencia: [], certificados: []
})

function cargarDesdeUsuario(u) {
  if (!u) return
  Object.keys(form).forEach((k) => {
    const valor = u[k]
    form[k] = Array.isArray(form[k]) ? [...(valor ?? [])] : (valor ?? form[k])
  })
}
cargarDesdeUsuario(auth.usuario)
watch(() => auth.usuario?.id, () => cargarDesdeUsuario(auth.usuario))

const sugerencias = computed(() => sugerenciasDeHabilidades(form.sectorObjetivo))

const agregarExperiencia = () =>
  form.experiencia.push({ puesto: '', empresa: '', periodo: '', detalle: '' })
const quitarExperiencia = (i) => form.experiencia.splice(i, 1)

const agregarCertificado = () => form.certificados.push({ nombre: '', emisor: '', anio: '' })
const quitarCertificado = (i) => form.certificados.splice(i, 1)

async function guardar() {
  Object.keys(errores).forEach((k) => delete errores[k])
  aviso.value = ''

  const nuevos = validar(form, {
    nombre: [(v) => required(v, 'El nombre')],
    apellido: [(v) => required(v, 'El apellido')],
    documento: [(v) => esDocumento(v, form.tipoDocumento)],
    telefono: [esTelefono],
    carrera: [(v) => required(v, 'La carrera')],
    cargoObjetivo: [(v) => required(v, 'El cargo objetivo')]
  })
  Object.assign(errores, nuevos)
  if (!sinErrores(nuevos)) return

  guardando.value = true
  try {
    await auth.actualizar({ ...form })
    aviso.value = 'Cambios guardados'
  } catch (e) {
    aviso.value = e.message
  } finally {
    guardando.value = false
  }
}

const imprimir = () => window.print()
</script>

<template>
  <div class="perfil">
    <div class="perfil__tabs no-print">
      <button :class="{ 'is-activo': vista === 'datos' }" @click="vista = 'datos'">Datos del perfil</button>
      <button :class="{ 'is-activo': vista === 'curriculum' }" @click="vista = 'curriculum'">Mi curriculum</button>
    </div>

    <!-- ---------- Formulario ---------- -->
    <form v-if="vista === 'datos'" class="stack" novalidate @submit.prevent="guardar">
      <p v-if="aviso" class="notice notice--ok">{{ aviso }}</p>

      <section class="panel panel-pad stack">
        <div class="panel-title"><h2>Datos personales</h2></div>
        <div class="dos">
          <BaseInput v-model="form.nombre" label="Nombres" :error="errores.nombre" />
          <BaseInput v-model="form.apellido" label="Apellidos" :error="errores.apellido" />
        </div>
        <div class="dos">
          <BaseSelect v-model="form.tipoDocumento" label="Tipo de documento" :opciones="tiposDocumento" placeholder="Selecciona" />
          <BaseInput v-model="form.documento" label="Numero de documento" :error="errores.documento" />
        </div>
        <div class="dos">
          <BaseInput v-model="form.fechaNacimiento" label="Fecha de nacimiento" type="date" />
          <BaseInput v-model="form.telefono" label="Telefono" :error="errores.telefono" />
        </div>
        <BaseInput v-model="form.ciudad" label="Ciudad" />
      </section>

      <section class="panel panel-pad stack">
        <div class="panel-title"><h2>Formacion academica</h2></div>
        <div class="dos">
          <BaseSelect v-model="form.nivelEstudios" label="Nivel de estudios" :opciones="nivelesEstudios" />
          <BaseInput v-model="form.carrera" label="Carrera o especialidad" :error="errores.carrera" />
        </div>
        <div class="dos">
          <BaseInput v-model="form.institucion" label="Universidad, instituto o colegio" />
          <BaseInput v-model="form.cicloOAnioEgreso" label="Ciclo actual o ano de egreso" />
        </div>
      </section>

      <section class="panel panel-pad stack">
        <div class="panel-title"><h2>Objetivo laboral y habilidades</h2></div>
        <div class="dos">
          <BaseSelect v-model="form.sectorObjetivo" label="Sector en el que quieres trabajar" :opciones="sectores" />
          <BaseInput v-model="form.cargoObjetivo" label="Cargo al que aspiras" :error="errores.cargoObjetivo" />
        </div>
        <BaseSelect v-model="form.modalidadPreferida" label="Modalidad preferida" :opciones="modalidades" />
        <BaseInput
          v-model="form.resumenProfesional" label="Resumen profesional" type="textarea" :filas="4"
          placeholder="Dos o tres lineas sobre quien eres y que buscas."
          ayuda="Este texto abre tu curriculum."
        />
        <TagInput v-model="form.habilidades" label="Habilidades" :sugerencias="sugerencias" />
      </section>

      <section class="panel panel-pad stack">
        <div class="panel-title">
          <h2>Experiencia</h2>
          <BaseButton variante="texto" @click="agregarExperiencia">Agregar experiencia</BaseButton>
        </div>
        <p v-if="!form.experiencia.length" class="small muted">
          Sin experiencia registrada. Los proyectos academicos tambien cuentan.
        </p>
        <div v-for="(e, i) in form.experiencia" :key="i" class="bloque">
          <div class="dos">
            <BaseInput v-model="e.puesto" label="Puesto" />
            <BaseInput v-model="e.empresa" label="Empresa o proyecto" />
          </div>
          <BaseInput v-model="e.periodo" label="Periodo" placeholder="Mar 2025 - Ago 2025" />
          <BaseInput v-model="e.detalle" label="Que hiciste" type="textarea" :filas="2" />
          <BaseButton variante="peligro" @click="quitarExperiencia(i)">Quitar</BaseButton>
        </div>
      </section>

      <section class="panel panel-pad stack">
        <div class="panel-title">
          <h2>Certificados</h2>
          <BaseButton variante="texto" @click="agregarCertificado">Agregar certificado</BaseButton>
        </div>
        <p v-if="!form.certificados.length" class="small muted">
          Sin certificados registrados. Mas adelante podras subir el archivo para validarlo.
        </p>
        <div v-for="(c, i) in form.certificados" :key="i" class="bloque">
          <div class="tres">
            <BaseInput v-model="c.nombre" label="Nombre del certificado" />
            <BaseInput v-model="c.emisor" label="Emisor" />
            <BaseInput v-model="c.anio" label="Ano" />
          </div>
          <BaseButton variante="peligro" @click="quitarCertificado(i)">Quitar</BaseButton>
        </div>
      </section>

      <div class="acciones">
        <BaseButton tipo="submit" :cargando="guardando">Guardar cambios</BaseButton>
      </div>
    </form>

    <!-- ---------- Curriculum ---------- -->
    <div v-else class="cv-vista">
      <div class="cv-vista__acciones no-print">
        <BaseButton variante="secundario" @click="imprimir">Imprimir o guardar en PDF</BaseButton>
        <span class="small muted">Se arma con lo que registraste en tu perfil.</span>
      </div>
      <CvDocument :usuario="{ ...auth.usuario, ...form }" />
    </div>
  </div>
</template>

<style scoped>
.perfil { display: grid; gap: 1rem; max-width: 900px; }

.perfil__tabs { display: flex; gap: 0.25rem; border-bottom: 1px solid var(--line); }
.perfil__tabs button {
  background: none; border: 0; border-bottom: 2px solid transparent;
  padding: 0.5rem 0.75rem; cursor: pointer; font-family: var(--font-body);
  font-size: 0.9375rem; color: var(--slate);
}
.perfil__tabs .is-activo { color: var(--ink); border-bottom-color: var(--bridge); font-weight: 500; }

.dos { display: grid; grid-template-columns: 1fr 1fr; gap: 0.75rem; }
.tres { display: grid; grid-template-columns: 2fr 1.4fr 0.7fr; gap: 0.75rem; }
.bloque {
  display: grid; gap: 0.6rem; justify-items: start;
  border: 1px solid var(--line); border-radius: var(--radius-sm); padding: 0.85rem;
}
.bloque > .dos, .bloque > .tres { width: 100%; }
.acciones { display: flex; justify-content: flex-end; }
.cv-vista { display: grid; gap: 0.75rem; }
.cv-vista__acciones { display: flex; align-items: center; gap: 0.75rem; flex-wrap: wrap; }

@media (max-width: 640px) {
  .dos, .tres { grid-template-columns: 1fr; }
}
</style>
