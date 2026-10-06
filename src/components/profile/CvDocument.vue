<script setup>
// Importa la función computed de Vue.
// computed permite crear valores derivados que se actualizan automáticamente
// cuando cambian los datos de los que dependen.
import { computed } from 'vue'
  
// Importa una función auxiliar para obtener el nombre completo del usuario.
import { nombreCompleto } from '@/utils/format'

// Define las propiedades (props) que este componente recibe desde su componente padre.
// En este caso, recibe un objeto llamado "usuario".
// required: true significa que el componente necesita recibir esta propiedad obligatoriamente.
const props = defineProps({ usuario: { type: Object, required: true } })

  
// Crea un valor calculado con los datos de contacto del usuario.
// Se toman email, teléfono y ciudad y se almacenan únicamente los que tengan un valor.
// filter(Boolean) elimina valores vacíos, null, undefined, etc.
const contacto = computed(() =>
  [props.usuario.email, props.usuario.telefono, props.usuario.ciudad].filter(Boolean)
)

// Crea un valor calculado para mostrar el documento del usuario.
// Si existe un documento, muestra el tipo de documento junto con su número.
// Si no existe, devuelve una cadena vacía.
const documento = computed(() =>
  props.usuario.documento ? `${props.usuario.tipoDocumento} ${props.usuario.documento}` : ''
)
</script>

<template>
   <!--
    Contenedor principal del CV.
    Representa visualmente todo el currículum del usuario.
  -->
  <article class="cv">
    <!-- ==================== CABECERA DEL CV ==================== -->
    <!-- Contiene la información principal del usuario -->
    <header class="cv__cab">
      <h1>{{ nombreCompleto(usuario) }}</h1>
      <p class="cv__cargo">
        {{ usuario.cargoObjetivo || 'Cargo objetivo por definir' }}
        <template v-if="usuario.sectorObjetivo"> · {{ usuario.sectorObjetivo }}</template>
      </p>
      <p class="cv__contacto">{{ contacto.join(' · ') }}</p>
      <p v-if="documento" class="cv__contacto">{{ documento }}</p>
    </header>

    <section v-if="usuario.resumenProfesional">
      <h2>Perfil</h2>
      <p>{{ usuario.resumenProfesional }}</p>
    </section>

    <section>
      <h2>Formacion</h2>
      <div class="cv__item">
        <strong>{{ usuario.carrera || 'Carrera por completar' }}</strong>
        <p>
          {{ usuario.institucion }}
          <template v-if="usuario.nivelEstudios"> · {{ usuario.nivelEstudios }}</template>
          <template v-if="usuario.cicloOAnioEgreso"> · {{ usuario.cicloOAnioEgreso }}</template>
        </p>
      </div>
    </section>

    <section v-if="usuario.experiencia?.length">
      <h2>Experiencia</h2>
      <div v-for="(e, i) in usuario.experiencia" :key="i" class="cv__item">
        <strong>{{ e.puesto }}</strong>
        <p>{{ e.empresa }} · {{ e.periodo }}</p>
        <p v-if="e.detalle">{{ e.detalle }}</p>
      </div>
    </section>

    <section v-if="usuario.habilidades?.length">
      <h2>Habilidades</h2>
      <p class="cv__skills">{{ usuario.habilidades.join(' · ') }}</p>
    </section>

    <section v-if="usuario.certificados?.length">
      <h2>Certificados</h2>
      <ul class="cv__lista">
        <li v-for="(c, i) in usuario.certificados" :key="i">
          {{ c.nombre }} — {{ c.emisor }}<template v-if="c.anio"> ({{ c.anio }})</template>
        </li>
      </ul>
    </section>
  </article>
</template>

<style scoped>
.cv {
  background: #fff;
  color: var(--ink);
  padding: 2.25rem 2.5rem;
  border: 1px solid var(--line);
  border-radius: var(--radius);
  max-width: 760px;
}
.cv__cab { border-bottom: 2px solid var(--ink); padding-bottom: 0.9rem; margin-bottom: 1.1rem; }
.cv__cab h1 { font-size: 1.875rem; }
.cv__cargo { font-size: 1rem; color: var(--bridge-dark); margin: 0.15rem 0 0.4rem; }
.cv__contacto { margin: 0; font-size: 0.8125rem; color: var(--slate); }

section { margin-bottom: 1.1rem; }
h2 {
  font-family: var(--font-body);
  font-size: 0.75rem;
  letter-spacing: 0.08em;
  font-weight: 600;
  color: var(--slate);
  margin-bottom: 0.4rem;
  border-bottom: 1px solid var(--line);
  padding-bottom: 0.2rem;
}
.cv__item { margin-bottom: 0.6rem; }
.cv__item p { margin: 0; font-size: 0.875rem; color: var(--ink-soft); }
.cv__skills { font-size: 0.875rem; }
.cv__lista { margin: 0; padding-left: 1.1rem; font-size: 0.875rem; }

@media print {
  .cv { border: 0; padding: 0; max-width: none; }
}
</style>
