<script setup>
import BridgeMark from '@/components/brand/BridgeMark.vue'
</script>

<template>
  <div class="auth">
    <!-- Panel izquierdo: el puente como esquema, no como adorno -->
    <section class="auth__lado" aria-hidden="true">
      <div class="auth__marca"><BridgeMark :tamano="30" color="#8fd3c8" /><span>PathBridge</span></div>

      <div class="auth__headline"><span>DESCUBRE · APRENDE · CRECE</span><h1>El puente hacia<br>tu próxima<br><em>oportunidad.</em></h1></div>
      <svg class="auth__scene" viewBox="0 0 600 340" role="presentation">
        <defs><linearGradient id="bridge-sky" x2="0" y2="1"><stop stop-color="#15394b"/><stop offset="1" stop-color="#245b63"/></linearGradient></defs>
        <rect width="600" height="340" rx="24" fill="url(#bridge-sky)"/><circle cx="450" cy="85" r="45" fill="#efce8b"/>
        <path d="M0 235L90 140l100 110 90-75 120 90 110-110 90 90v95H0" fill="#214b57"/><path d="M0 280Q150 240 300 285T600 275V340H0" fill="#102f40"/>
        <path d="M20 220Q300 185 580 150" stroke="#b9e7d5" stroke-width="15" fill="none"/><path d="M130 240V90M460 220V55" stroke="#94c9c3" stroke-width="8"/>
        <path d="M30 218Q130 0 295 190Q460-30 575 150M130 90v117m55-60v52m-100-45v58m375-157v110m-65-49v57m125-60v43" stroke="#70b4ad" stroke-width="3" fill="none"/>
        <circle cx="294" cy="156" r="10" fill="#efce8b"/><path d="M294 168v25m0-16-13 10m13-10 12 6m-12 10-9 14m9-14 11 10" stroke="#fff" stroke-width="5" stroke-linecap="round"/>
      </svg>
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
.auth__esquema { display: none; }
.auth__scene { width: 100%; max-width: 600px; filter: drop-shadow(0 20px 24px #071b2860); }
.auth__headline span { font-size: .65rem; letter-spacing: .18em; color: #9bd8c9; }
.auth__headline h1 { font-size: clamp(2.5rem, 3.6vw, 4rem); line-height: 1.08; margin: 1rem 0; }
.auth__headline em { color: #9bd8c9; font-weight: 400; }
.auth__copy { max-width: 34ch; color: #9fb0c6; font-size: 0.9375rem; margin: 0; }

.auth__forma { display: grid; place-items: center; padding: 2rem 1.5rem; background: var(--canvas); }
.auth__contenido { width: 100%; max-width: 520px; }

@media (max-width: 860px) {
  .auth { grid-template-columns: 1fr; }
  .auth__lado { display: none; }
  .auth__forma { padding: 1.25rem 1rem; align-items: start; }
}
</style>
