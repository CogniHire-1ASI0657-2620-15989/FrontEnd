<script setup>
import { computed } from 'vue'
import MatchRing from '@/components/ui/MatchRing.vue'
import BaseButton from '@/components/ui/BaseButton.vue'
import { rutaSugerida } from '@/utils/matching'
import { sueldo, hace } from '@/utils/format'

const props = defineProps({
  vacante: { type: Object, required: true },
  favorita: Boolean,
  estado: { type: String, default: null }
})
defineEmits(['favorito', 'postular', 'cerrar'])

const ruta = computed(() => rutaSugerida(props.vacante.analisis.faltantesDuras))
</script>

<template>
  <aside class="detalle panel">
    <header class="detalle__cab">
      <div>
        <h2>{{ vacante.titulo }}</h2>
        <p class="muted small">{{ vacante.empresa }} · {{ vacante.ubicacion }} · {{ vacante.modalidad }}</p>
        <p class="small muted">{{ vacante.sector }} · {{ vacante.nivel }}</p>
        <p class="small muted">{{ sueldo(vacante.sueldoMin, vacante.sueldoMax) }} · {{ hace(vacante.publicada) }}</p>
      </div>
      <button class="cerrar" type="button" aria-label="Cerrar detalle" @click="$emit('cerrar')">&times;</button>
    </header>

    <section class="detalle__match">
      <MatchRing :valor="vacante.analisis.match" :tamano="72" />
      <div class="detalle__barras">
        <div>
          <p class="small">Habilidades tecnicas · {{ vacante.analisis.matchDuras }}%</p>
          <div class="meter"><span :style="{ width: vacante.analisis.matchDuras + '%' }"></span></div>
        </div>
        <div>
          <p class="small">Habilidades blandas · {{ vacante.analisis.matchBlandas }}%</p>
          <div class="meter"><span :style="{ width: vacante.analisis.matchBlandas + '%' }"></span></div>
        </div>
      </div>
    </section>

    <section>
      <h3>Lo que ya cumples</h3>
      <div class="lista-chips">
        <span v-for="s in vacante.analisis.cubiertas" :key="s" class="chip chip--have">{{ s }}</span>
        <p v-if="!vacante.analisis.cubiertas.length" class="small muted">
          Agrega habilidades en tu perfil para ver tu compatibilidad real.
        </p>
      </div>
    </section>

    <section>
      <h3>Lo que te falta</h3>
      <div class="lista-chips">
        <span v-for="s in vacante.analisis.faltantes" :key="s" class="chip chip--gap">{{ s }}</span>
        <p v-if="!vacante.analisis.faltantes.length" class="small muted">Nada pendiente para esta vacante.</p>
      </div>
    </section>

    <section v-if="ruta.length">
      <h3>Ruta sugerida para cerrar la brecha</h3>
      <ul class="ruta">
        <li v-for="c in ruta" :key="c.skill">
          <div>
            <strong>{{ c.titulo }}</strong>
            <p class="small muted">{{ c.proveedor }} · {{ c.horas }} horas · cubre {{ c.skill }}</p>
          </div>
          <a :href="c.url" target="_blank" rel="noopener" class="small">Ver curso</a>
        </li>
      </ul>
    </section>

    <section>
      <h3>Sobre el puesto</h3>
      <p class="small">{{ vacante.descripcion }}</p>
      <ul class="responsabilidades">
        <li v-for="r in vacante.responsabilidades" :key="r" class="small">{{ r }}</li>
      </ul>
    </section>

    <footer class="detalle__pie">
      <BaseButton @click="$emit('postular', vacante.id)">
        {{ estado ? 'Actualizar estado' : 'Marcar como postulado' }}
      </BaseButton>
      <BaseButton variante="secundario" @click="$emit('favorito', vacante.id)">
        {{ favorita ? 'Quitar de guardados' : 'Guardar vacante' }}
      </BaseButton>
      <span v-if="estado" class="chip chip--have">{{ estado }}</span>
    </footer>
  </aside>
</template>

<style scoped>
.detalle { padding: 1.25rem; display: grid; gap: 1.1rem; align-content: start; position: sticky; top: 5rem; }
.detalle__cab { display: flex; justify-content: space-between; gap: 0.75rem; }
.detalle__cab p { margin: 0.2rem 0 0; }
.cerrar { border: 0; background: none; font-size: 1.5rem; line-height: 1; cursor: pointer; color: var(--slate); }
.detalle__match { display: flex; gap: 1rem; align-items: center; }
.detalle__barras { flex: 1; display: grid; gap: 0.5rem; }
.detalle__barras p { margin: 0 0 0.2rem; }
h3 { margin-bottom: 0.4rem; }
.lista-chips { display: flex; flex-wrap: wrap; gap: 0.3rem; }
.ruta { list-style: none; margin: 0; padding: 0; display: grid; gap: 0.5rem; }
.ruta li {
  display: flex; justify-content: space-between; align-items: center; gap: 0.75rem;
  border: 1px solid var(--line); border-radius: var(--radius-sm); padding: 0.5rem 0.65rem;
}
.ruta p { margin: 0; }
.responsabilidades { margin: 0.5rem 0 0; padding-left: 1.1rem; color: var(--ink-soft); }
.detalle__pie { display: flex; flex-wrap: wrap; gap: 0.5rem; align-items: center; }
</style>
