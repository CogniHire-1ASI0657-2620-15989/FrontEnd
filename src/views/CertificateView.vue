<script setup>
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const auth = useAuthStore()
const route = useRoute()

const certificate = computed(() =>
  auth.usuario?.certificados?.find(c => c.id === route.params.id)
)

const print = () => window.print()
</script>

<template>
  <div class="stack">
    <div class="row no-print">
      <RouterLink to="/perfil">← Mi perfil</RouterLink>

      <button
        v-if="certificate"
        class="action-link"
        @click="print"
      >
        Imprimir o guardar en PDF
      </button>
    </div>

    <article v-if="certificate" class="certificate panel">
      <span class="eyebrow">PATHBRIDGE · APRENDIZAJE CONTINUO</span>
      <div class="empty-icon">✦</div>

      <h1>Constancia de finalización</h1>
      <p>Se deja constancia de que</p>
      <h2>{{ auth.usuario.nombre }} {{ auth.usuario.apellido }}</h2>

      <p>ha declarado completar el curso</p>
      <h2>{{ certificate.nombre }}</h2>
      <p>{{ certificate.anio }}</p>

      <hr>

      <p class="small muted">
        Finalización autodeclarada. Esta constancia de seguimiento de PathBridge
        no reemplaza una acreditación emitida por el proveedor del curso.
      </p>
      <span class="small muted">Referencia: {{ certificate.id }}</span>
    </article>

    <p v-else class="notice notice--error">
      No encontramos esta constancia en tu cuenta.
    </p>
  </div>
</template>

<style scoped>
.certificate {
  max-width: 950px;
  text-align: center;
  padding: 4rem 3rem;
  border: 6px double #a2cbbd;
  margin: auto;
  width: 100%;
}

.certificate h1 {
  margin: 1rem 0 2rem;
}

.certificate h2 {
  margin: 1rem 0 2rem;
  color: var(--bridge);
}

.certificate hr {
  border: 0;
  border-top: 1px solid var(--line);
  margin: 2rem;
}

.certificate .small {
  overflow-wrap: anywhere;
}

@media (max-width: 600px) {
  .certificate {
    padding: 2rem 1rem;
  }
}

@media print {
  .certificate {
    break-inside: avoid;
    box-shadow: none;
  }
}
</style>
