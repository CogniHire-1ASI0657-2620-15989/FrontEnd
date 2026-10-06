# Cognihire - PathBridge — Frontend (Vite + Vue 3)

Frontend del proyecto PathBridge: login y registro funcionales, perfil con curriculum
generado dentro de la pagina, dashboard y busqueda de trabajo con analisis de brechas.

La plataforma es **multisectorial**: salud, educacion, administracion y finanzas, legal,
logistica, marketing, gastronomia, construccion, diseno, atencion al cliente, recursos
humanos y tecnologia. Cada usuario elige su sector objetivo y las sugerencias de
habilidades y de cursos se adaptan a ese rubro. Los sectores, sus habilidades y el
catalogo de cursos viven en `src/data/jobs.js` y `src/utils/matching.js`: agregar un
rubro nuevo es agregar una entrada, sin tocar componentes.

Funciona al 100% sin backend: mientras `VITE_USE_MOCK=true`, los datos se guardan en
`localStorage` a traves de un backend simulado que imita los endpoints REST que luego
expondra el servidor en Python.

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
│  ├─ ui/                     BaseButton, BaseInput, BaseSelect, TagInput, MatchRing
│  ├─ jobs/                   JobCard, JobDetail
│  └─ profile/CvDocument.vue  Curriculum imprimible
├─ data/jobs.js               Vacantes y habilidades de ejemplo
├─ layouts/                   AuthLayout (login/registro), DashboardLayout (app)
├─ router/index.js            Rutas + guard de autenticacion
├─ services/
│  ├─ http.js                 Cliente fetch hacia el backend en Python
│  ├─ mockBackend.js          Backend simulado sobre localStorage
│  ├─ authService.js          Registro, login, sesion, perfil
│  └─ jobsService.js          Busqueda de vacantes y postulaciones
├─ stores/                    Pinia: auth.js, jobs.js
├─ utils/                     validators.js, format.js, matching.js
└─ views/                     Login, Register, Dashboard, JobSearch, Profile, NotFound
```

## Conectar el backend en Python

1. Copia `.env.example` como `.env` y pon:

```
VITE_USE_MOCK=false
VITE_API_URL=http://localhost:8000/api
```

2. No hay que tocar componentes ni stores: solo `services/` cambia de origen de datos.
   Endpoints que espera el frontend (formato JSON):

| Metodo | Ruta | Body / respuesta |
| --- | --- | --- |
| POST | `/auth/register` | recibe el perfil completo, devuelve `{ token, usuario }` |
| POST | `/auth/login` | `{ email, password }` → `{ token, usuario }` |
| GET | `/auth/me` | devuelve el usuario de la sesion (usa `Authorization: Bearer`) |
| POST | `/auth/logout` | cierra sesion |
| POST | `/auth/forgot-password` | `{ email }` → `{ mensaje }` |
| PUT | `/users/:id` | actualiza el perfil, devuelve el usuario |
| POST | `/jobs/search` | `{ q, sector, ubicacion, modalidad, nivel }` → lista de vacantes |
| GET | `/users/:id/applications` | postulaciones del usuario |
| POST | `/users/:id/applications` | `{ vacanteId, estado }` |

Objeto usuario esperado:

```json
{
  "id": "uuid", "email": "", "nombre": "", "apellido": "",
  "tipoDocumento": "DNI", "documento": "", "fechaNacimiento": "",
  "telefono": "", "ciudad": "", "nivelEstudios": "", "carrera": "",
  "institucion": "", "cicloOAnioEgreso": "", "sectorObjetivo": "", "cargoObjetivo": "",
  "modalidadPreferida": "", "resumenProfesional": "",
  "habilidades": [], "experiencia": [], "certificados": [], "favoritos": []
}
```

Objeto vacante esperado: ver `src/data/jobs.js`.

3. El calculo de compatibilidad vive en `src/utils/matching.js`. Cuando el Gap Analysis
   Service lo haga en Python, basta con que la respuesta traiga el mismo objeto
   `{ match, matchDuras, matchBlandas, cubiertas, faltantes, faltantesDuras }`.

## Notas

- El hash de contrasena del mock es solo didactico; el hasheo real va en el backend.
- El guard de rutas protege `/dashboard`, `/empleos` y `/perfil`.
- El curriculum se imprime o exporta a PDF con el boton de la pestana "Mi curriculum".
