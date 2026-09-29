<script setup>
import BridgeMark from '@/components/brand/BridgeMark.vue'
</script>

<template>
  <div class="auth">
    <!-- Panel izquierdo: el puente como esquema, no como adorno -->
    <section class="auth__lado" aria-hidden="true">
      <div class="auth__marca"><BridgeMark :tamano="30" color="#8fd3c8" /><span>PathBridge</span></div>

      <svg class="auth__esquema" viewBox="0 0 420 260" fill="none">
        <text x="14" y="30" fill="#7e8fa8" font-size="12" font-family="IBM Plex Sans">Donde estas hoy</text>
        <text x="286" y="30" fill="#7e8fa8" font-size="12" font-family="IBM Plex Sans">El puesto que quieres</text>

        <path d="M10 190h90M320 190h90" stroke="#3b4d68" stroke-width="3" stroke-linecap="round" />
        <path d="M100 190C100 92 150 60 210 60s110 32 110 130" stroke="#4fb3a6" stroke-width="3" stroke-linecap="round" />
        <path d="M130 190v-58M170 190v-86M210 190v-100M250 190v-86M290 190v-58" stroke="#33566a" stroke-width="2" />

        <circle cx="130" cy="132" r="5" fill="#4fb3a6" />
        <circle cx="170" cy="104" r="5" fill="#4fb3a6" />
        <circle cx="210" cy="90" r="5" fill="#c9a227" />
        <circle cx="250" cy="104" r="5" fill="#3b4d68" />
        <circle cx="290" cy="132" r="5" fill="#3b4d68" />

        <text x="108" y="216" fill="#9fb0c6" font-size="11" font-family="IBM Plex Sans">Perfil</text>
        <text x="152" y="216" fill="#9fb0c6" font-size="11" font-family="IBM Plex Sans">Brechas</text>
        <text x="196" y="216" fill="#9fb0c6" font-size="11" font-family="IBM Plex Sans">Ruta</text>
        <text x="232" y="216" fill="#9fb0c6" font-size="11" font-family="IBM Plex Sans">Entrevista</text>
        <text x="300" y="216" fill="#9fb0c6" font-size="11" font-family="IBM Plex Sans">Empleo</text>
      </svg>

      <p class="auth__copy">
        Compara tu perfil con vacantes reales, descubre que te falta aprender y practica antes de postular.
      </p>
    </section>

    <section class="auth__forma">
      <div class="auth__contenido"><slot /></div>
    </section>
  </div>
</template>

<style scoped>
.auth { display: grid; grid-template-columns: minmax(340px, 44%) 1fr; min-height: 100vh; }

.auth__lado {
  position: relative;
  background: var(--ink);
  color: #dbe3ee;
  padding: 2rem 2.25rem;
  display: flex; flex-direction: column; gap: 1.5rem; justify-content: center;
}
.auth__marca {
  display: flex; align-items: center; gap: 0.55rem;
  font-family: var(--font-display); font-size: 1.25rem; color: #fff;
  position: absolute; top: 1.75rem; left: 2.25rem;
}
.auth__esquema { width: 100%; max-width: 420px; height: auto; }
.auth__copy { max-width: 34ch; color: #9fb0c6; font-size: 0.9375rem; margin: 0; }

.auth__forma { display: grid; place-items: center; padding: 2rem 1.5rem; background: var(--canvas); }
.auth__contenido { width: 100%; max-width: 520px; }

@media (max-width: 860px) {
  .auth { grid-template-columns: 1fr; }
  .auth__lado { display: none; }
  .auth__forma { padding: 1.25rem 1rem; align-items: start; }
}
</style>
