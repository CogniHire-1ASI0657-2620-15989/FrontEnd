# PathBridge — Frontend (Vite + Vue 3)

Frontend del proyecto PathBridge: login y registro funcionales, perfil con curriculum
generado dentro de la pagina, dashboard y busqueda de trabajo con analisis de brechas.

La plataforma es **multisectorial**: salud, educacion, administracion y finanzas, legal,
logistica, marketing, gastronomia, construccion, diseno, atencion al cliente, recursos
humanos y tecnologia. El buscador permite filtrar por sector y analizar después
una vacante guardada contra las habilidades del usuario. Los sectores y el
catalogo de cursos viven en `src/data/jobs.js` y `src/utils/matching.js`: agregar un
rubro nuevo es agregar una entrada, sin tocar componentes.

Con `VITE_USE_MOCK=true`, los datos se guardan en `localStorage` y los PDF en
IndexedDB, mediante servicios simulados preparados para conectar el backend.

## Nuevos flujos

- `/empleos` empieza sin resultados: el usuario debe buscar. El detalle muestra solo información del puesto y permite guardar la vacante.
- El dashboard reúne todas las vacantes guardadas, independientemente de la última búsqueda.
- `/brechas` requiere elegir una vacante guardada y lanzar el análisis. Después ofrece Postular y Crear Learning Path como acciones independientes.
- `/aprendizaje` conserva timeline, duración y progreso; completar un curso requiere adjuntar y aprobar un PDF.
- El perfil comparte el cargador de PDF y permite descargar los documentos guardados. La revisión mock es técnica básica, no una acreditación de autenticidad.
- Las habilidades tienen nivel Básico, Intermedio o Avanzado. Los strings antiguos se migran al guardar.
- Se retiraron ciclo, sector objetivo, cargo objetivo, modalidad preferida y el flujo visual de validación DNI.
- `/asistente` mantiene historial y orientación únicamente de empleos, con contexto de vacantes guardadas.
- Con `VITE_USE_MOCK=false`, todos los módulos usan el API Gateway; con `true`, datos simulados.

Contratos REST y límites de los datos simulados: [BACKEND-CONTRACT.md](./BACKEND-CONTRACT.md).

Pruebas de datos y persistencia: `npm test`. En PowerShell con scripts bloqueados, usa `npm.cmd test`, `npm.cmd run build` y `npm.cmd run dev`.

## Como correrlo

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # produccion en /dist
npm run preview  # revisar el build
```

La primera vez no hay usuarios: entra a **Crear cuenta**, completa los 3 pasos y
la app te lleva directo a tu perfil.

## Estructura

```
src/
├─ assets/styles/main.css     Tokens de color, tipografia y utilidades
├─ components/
│  ├─ brand/BridgeMark.vue    Logotipo en SVG
│  ├─ layout/                 AppSidebar, AppTopbar
│  ├─ ui/                     BaseButton, BaseInput, BaseSelect, SkillEditor, MatchRing
│  ├─ jobs/                   JobCard, JobDetail
│  └─ profile/                CV imprimible, carga y descarga de certificados PDF
├─ data/jobs.js               Vacantes y habilidades de ejemplo
├─ layouts/                   AuthLayout (login/registro), DashboardLayout (app)
├─ router/index.js            Rutas + guard de autenticacion
├─ services/
│  ├─ http.js                 Cliente fetch del Gateway (RFC 7807, 401, correlation-id)
│  ├─ mockBackend.js          Backend simulado sobre localStorage
│  ├─ authService.js          Registro, login, sesion, perfil
│  ├─ gatewayRoutes.js        Rutas del Gateway
│  ├─ gatewayAdapters.js      DTO del Gateway ↔ forma que usan las vistas
│  ├─ learningService.js      Rutas de aprendizaje
│  ├─ interviewService.js     Simulador de entrevistas
│  ├─ gapService.js           Analisis de brechas separado de la busqueda
│  ├─ certificateService.js   Evidencias PDF y validacion tecnica local
│  └─ jobsService.js          Busqueda de vacantes y postulaciones
├─ stores/                    Pinia: auth.js, jobs.js, learning.js
├─ utils/                     validators.js, format.js, matching.js
└─ views/                     Login, perfil, dashboard, empleos, brechas, rutas y chat
```

## Conectar con el API Gateway

1. Copia `.env.example` como `.env` (ya trae `VITE_USE_MOCK=false`):

```
VITE_USE_MOCK=false
VITE_API_URL=http://localhost:8080/api/v1
```

2. Agrega el origen del frontend a `CORS_ORIGINS` del Gateway, por ejemplo
   `http://localhost:5173`.
3. `npm run dev`. Con `VITE_USE_MOCK=true` la app funciona sin backend.

Toda la aplicación consume el Gateway (autenticación, perfil, empleos, brechas, rutas de
aprendizaje, certificados y entrevistas). Rutas, DTOs, supuestos y limitaciones:
[BACKEND-CONTRACT.md](./BACKEND-CONTRACT.md). Las postulaciones siguen siendo locales
porque el Gateway no tiene ese endpoint.

## Notas

- El hash de contrasena del mock es solo didactico; el hasheo real va en el backend.
- El guard de rutas protege `/dashboard`, `/empleos` y `/perfil`.
- El curriculum se imprime o exporta a PDF con el boton de la pestana "Mi curriculum".
