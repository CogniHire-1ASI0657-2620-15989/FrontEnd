<script setup>
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { USA_MOCK } from '@/services/http'
import { certificateService } from '@/services/certificateService'
import CertificateDownload from '@/components/profile/CertificateDownload.vue'

const auth = useAuthStore()
const route = useRoute()

// Con el Gateway el certificado se consulta en GET /certificates/{id}.
const remoto = ref(null)
const error = ref('')
const cargando = ref(!USA_MOCK)
const sincronizando = ref(false)

onMounted(async () => {
  if (USA_MOCK) return
  try {
    remoto.value = await certificateService.obtener(route.params.id)
  } catch (e) {
    error.value = e.status === 404 ? 'No encontramos este certificado en tu cuenta.' : e.message
  } finally {
    cargando.value = false
  }
})

async function reintentarSincronizacion() {
  sincronizando.value = true
  error.value = ''
  try {
    remoto.value = await certificateService.sincronizar(remoto.value.id)
    await auth.recargar()
  } catch (e) {
    error.value = e.message
  } finally {
    sincronizando.value = false
  }
}

const certificate = computed(() =>
  USA_MOCK ? auth.usuario?.certificados?.find(c => c.id === route.params.id) : remoto.value
)

const print = () => window.print()
</script>

<template>
  <div class="stack">
    <div class="row no-print">
      <RouterLink to="/perfil">← Mi perfil</RouterLink>

      <button
        v-if="USA_MOCK && certificate && !certificate.archivo"
        class="action-link"
        @click="print"
      >
        Imprimir o guardar en PDF
      </button>
    </div>

    <p v-if="error" class="notice notice--error" role="alert">{{ error }}</p>
    <p v-if="cargando" role="status">Cargando certificado…</p>

    <section v-else-if="!USA_MOCK && certificate" class="panel panel-pad stack">
      <h1>{{ certificate.nombre }}</h1>
      <p>{{ certificate.emisor }}<template v-if="certificate.anio"> · {{ certificate.anio }}</template></p>
      <p v-if="certificate.validacion.estado === 'aprobado'" class="notice notice--ok">✓ Certificado aprobado</p>
      <p v-else class="notice notice--error">Estado: {{ certificate.estado }}<template v-if="certificate.validacion.detalle"> · {{ certificate.validacion.detalle }}</template></p>
      <dl class="stack small">
        <div><dt class="muted">Habilidad</dt><dd>{{ certificate.skill }}</dd></div>
        <div v-if="certificate.archivoOriginal"><dt class="muted">Archivo</dt><dd>{{ certificate.archivoOriginal }}</dd></div>
        <div v-if="certificate.nombreDetectado"><dt class="muted">Nombre detectado en el documento</dt><dd>{{ certificate.nombreDetectado }}</dd></div>
        <div><dt class="muted">Actualización del perfil</dt><dd>{{ certificate.sincronizacion.perfil || 'pendiente' }}</dd></div>
        <div><dt class="muted">Actualización del reporte de brechas</dt><dd>{{ certificate.sincronizacion.brechas || 'pendiente' }}</dd></div>
        <div v-if="certificate.sincronizacion.detalle"><dt class="muted">Detalle</dt><dd>{{ certificate.sincronizacion.detalle }}</dd></div>
      </dl>
      <div v-if="certificate.validacion.estado === 'aprobado' && !certificate.sincronizado" class="row">
        <button type="button" class="action-link" :disabled="sincronizando" @click="reintentarSincronizacion">
          {{ sincronizando ? 'Sincronizando…' : 'Reintentar sincronización' }}
        </button>
      </div>
    </section>

    <section v-else-if="certificate?.archivo" class="panel panel-pad stack">
      <h1>{{ certificate.nombre }}</h1>
      <p>{{ certificate.emisor }} · {{ certificate.anio }}</p>
      <p class="notice notice--ok">✓ PDF aprobado{{ certificate.validacion?.tipo === 'tecnica-local' ? ' en revisión técnica local' : '' }}</p>
      <p v-if="certificate.validacion?.tipo === 'tecnica-local'" class="small muted">La revisión técnica no acredita la autenticidad del documento.</p>
      <CertificateDownload :certificate="certificate" />
    </section>

    <article v-else-if="certificate" class="certificate panel">
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

    <p v-else-if="USA_MOCK" class="notice notice--error">
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
