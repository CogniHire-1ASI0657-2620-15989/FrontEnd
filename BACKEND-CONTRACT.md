# Integración del frontend con el API Gateway

Contrato revisado el 7 de noviembre de 2026 contra las ramas main de:
- [Api-Gateway](https://github.com/CogniHire-1ASI0657-2620-15989/Api-Gateway)
- [Job-Discovery-Service](https://github.com/CogniHire-1ASI0657-2620-15989/Job-Discovery-Service)
- [Gap-Analysis-Service](https://github.com/CogniHire-1ASI0657-2620-15989/Gap-Analysis-Service)

## Alcance de la integración

Con `VITE_USE_MOCK=false` toda la aplicación consume el API Gateway según su guía de
integración: autenticación y perfil, empleos y favoritos, reportes de brechas, rutas de
aprendizaje, certificados y simulador de entrevistas. Con `VITE_USE_MOCK=true` la
aplicación sigue funcionando sin backend, con datos simulados.

Las pruebas (`npm test`) interceptan HTTP y no escriben en servicios desplegados.
Los campos marcados como *supuesto* abajo no están descritos en la guía y deben
confirmarse contra un Gateway real.

## URL y autenticación

VITE_API_URL debe ser la URL pública del Gateway incluyendo /api/v1, sin duplicar
ese prefijo en las rutas. Ejemplo: http://localhost:8080/api/v1.
Los módulos envían Authorization: Bearer <pb.token>. El Gateway valida el JWT y
añade X-User-Id al reenviar; el navegador no envía userId ni cabeceras internas.

El Gateway requiere un JWT con sub numérico positivo, issuer y audience válidos.
Los tokens mock no sirven para llamadas reales. Identity define la respuesta de
login y perfil: su contrato completo debe confirmarse antes de conectar la sesión.

## Rutas verificadas de Job Search y Gap Analysis

| Operación | Método y ruta relativa |
| --- | --- |
| Búsqueda | GET /jobs |
| Detalle | GET /jobs/{job_id} |
| Guardar | POST /jobs/{job_id}/favorite, sin body |
| Quitar guardado | DELETE /jobs/{job_id}/favorite, respuesta 204 |
| Guardados | GET /favorites |
| Generar análisis | POST /gap-reports |
| Consultar por empleo | GET /gap-reports/{job_id} |
| Listar análisis | GET /gap-reports |

Los IDs reales son enteros positivos; la UI los presenta como strings para mantener
coherente la selección de opciones y enlaces. Los IDs jd-xxx del mock no se envían
al servicio real.

Las rutas configurables están en src/services/gatewayRoutes.js y .env.example:
VITE_JOB_SEARCH_PATH=/jobs, VITE_JOB_DETAIL_PATH=/jobs/:id,
VITE_GAP_ANALYSIS_PATH=/gap-reports. También son ARG de Docker.
Los cambios de variables Vite requieren recompilar y desplegar.

Fuentes de rutas:
- [jobs.py del Gateway](https://github.com/CogniHire-1ASI0657-2620-15989/Api-Gateway/blob/main/app/routes/jobs.py)
- [gap_reports.py del Gateway](https://github.com/CogniHire-1ASI0657-2620-15989/Api-Gateway/blob/main/app/routes/gap_reports.py)

## Búsqueda

GET /jobs lleva keywords y location obligatorios (1–200 caracteres), page (1–3),
page_size (1–20) y radius_km (0, 4, 8, 16, 26, 40 u 80). El frontend no busca hasta
que el usuario pulsa Buscar. Los controles anteriores de sector, modalidad y nivel
se retiraron porque el contrato no admite esos filtros.

La respuesta tiene { items, total, page, page_size, provider_status }.
El servicio limita el total a un máximo de tres páginas y puede devolver
provider_status=unavailable con items vacíos: la interfaz lo muestra como proveedor
no disponible, no como ausencia de empleos.

JobResource contiene id, provider, title, company, location, description_snippet,
salary, employment_type, source, external_url y provider_updated_at.
El adaptador gatewayAdapters.js convierte esos nombres a los usados por las vistas.
No inventa requisitos, responsabilidades, sector ni nivel cuando el proveedor no
los devuelve. El salario textual y la fecha ausente se muestran correctamente.
Las URLs externas solo admiten HTTP o HTTPS.

Referencia: [recursos REST de Job Discovery](https://github.com/CogniHire-1ASI0657-2620-15989/Job-Discovery-Service/tree/main/app/interfaces/rest/resources).

## Guardados

En modo real se utiliza GET /favorites con page y page_size=50. Se recorren las
páginas para mostrar todos los guardados en el dashboard, independientemente de la
última búsqueda. POST de guardado devuelve { job, created }; repetirlo no duplica
la selección. Se serializan clics rápidos y se conserva el estado de guardados.
No se actualizan favoritos mediante el antiguo PUT /users/:id.

En mock se mantiene usuario.favoritos en localStorage para conservar las cuentas
existentes. La interfaz ofrece Guardar Vacante; quitar guardados está preparado en
el servicio, sin añadir una acción extra a la búsqueda.

## Gap Analysis

POST /gap-reports envía exclusivamente { job_id: entero }.
El servicio obtiene el usuario del Gateway y consulta sus habilidades en Identity.
No recibe habilidades ni IDs de usuario enviados por el cliente.

GapReportResource incluye id, job_id, job_title, job_description_snippet,
match_percentage, matched_hard_skills, missing_hard_skills, matched_soft_skills,
missing_soft_skills, analysis_source, analysis_status, analysis_engine, created_at
y updated_at. Las habilidades de cada lista tienen { name, skill_type }.

El adaptador conserva el porcentaje global del servidor, combina listas para las
vistas existentes y calcula porcentajes de presentación por tipo usando sus listas.
Un tipo sin requisitos identificados se muestra como tal, no como 100%.
El estado insufficient_job_data no se interpreta como ausencia de brechas y no
habilita Postular ni Crear Learning Path. El fallback de motor rule_based_fallback
se conserva para distinguirlo de groq_llm. El servidor actual analiza por nombre de
habilidad; no compara mínimos de dominio.

Referencias:
- [GapReportResource](https://github.com/CogniHire-1ASI0657-2620-15989/Gap-Analysis-Service/blob/main/app/interfaces/rest/resources/gap_report_resource.py)
- [generación del reporte](https://github.com/CogniHire-1ASI0657-2620-15989/Gap-Analysis-Service/blob/main/app/application/internal/command_services/default_gap_analysis_command_service.py)

## Postulaciones

El Gateway no expone un endpoint de postulaciones. Este registro sigue siendo local,
por usuario y navegador, incluso al usar Job Search real. No se envían solicitudes
a /users/:id/applications. Postular y Crear Learning Path son acciones separadas
y aparecen solo después de completar el análisis de una vacante guardada.

## Autenticación y perfil

| Operación | Ruta |
| --- | --- |
| Registro | POST /auth/register → `{ access_token, user }` |
| Login | POST /auth/login → igual que el registro |
| Recuperar / restablecer | POST /auth/password-recovery · POST /auth/password-reset (204) |
| Perfil | GET /profile/me (también valida la sesión al cargar la app) |
| Actualizar | PUT /profile/me (`professional_summary`, `hard_skills`, `soft_skills`) |
| Contraseña | PUT /profile/me/password |
| Educación | POST /profile/me/education · PUT /profile/me/education/{id} |
| Experiencia | POST /profile/me/experience (solo agregar) |

- El registro pide DNI, nombre, primer y segundo apellido, correo, contraseña, segmento,
  ciudad y país. Estudios y habilidades se guardan justo después con el token nuevo; si
  eso falla, la cuenta queda creada y el perfil muestra un aviso.
- El perfil solo trae `name` completo: la UI lo usa como `nombre` y deja `apellido` vacío.
  Nombre, correo y ciudad no son editables desde el perfil.
- Las habilidades se guardan en `hard_skills` o `soft_skills` según su tipo (Técnica/Blanda).
  El nivel viaja como `basico`, `intermedio` o `avanzado`.
- La UI maneja una sola formación: `nivelEstudios`→`degree`, `carrera`→`field_of_study`,
  `institucion`→`institution`.
- La experiencia ya guardada no se edita ni se elimina (no hay endpoint); las nuevas
  requieren puesto, empresa y mes de inicio y fin (`YYYY-MM`).
- *Supuesto:* `segment` acepta `trabajador` y `estudiante` (la guía solo muestra `trabajador`).
  Las opciones están en `segmentos`, en `src/services/gatewayAdapters.js`.

## Errores y sesión

`src/services/http.js` interpreta `application/problem+json`: `detail` es el mensaje
general y `errors` (422) se expone como `error.campos` por campo. 502 y 503 se marcan
como `reintentable`; 500 muestra un mensaje genérico con el `X-Correlation-ID` como
código de soporte. Un 401 en una ruta protegida limpia el token y lleva a `/ingresar`
(el login fallido no cierra sesión). No se envían `X-User-Id` ni `X-Internal-Api-Key`.

## Rutas de aprendizaje

El Gateway no tiene un listado de rutas: se obtienen consultando
`GET /learning-paths/{job_id}` por cada reporte de brechas (404 = aún sin ruta).

| Operación | Ruta |
| --- | --- |
| Generar | POST /learning-paths `{ job_id }` (requiere reporte previo; YouTube puede dar 503) |
| Marcar video visto | PATCH /learning-paths/{id}/items/{item_id} |
| Avance | GET /learning-paths/{id}/progress (el PATCH ya devuelve `progress_percentage`) |

*Supuesto:* el cuerpo del PATCH es `{ "status": "watched" }`; la guía no lo describe.

## Certificados

POST /certificates (multipart: `learning_path_id`, `skill_name`, `provider?`, `file`) con PDF,
JPG o PNG de hasta 5 MB. Se sube desde el curso de la ruta; el perfil solo lista
(GET /certificates) y la constancia consulta GET /certificates/{id}. Si el certificado se
aprueba pero `profile_sync_status` o `gap_refresh_status` no son `completed`, la UI muestra
el detalle y ofrece POST /certificates/{id}/synchronization. El Gateway no expone la
descarga del archivo original.

## Simulador de entrevistas

El asistente (`/asistente`) es el simulador: POST /interview-sessions (`job_id`, `mode`),
POST …/messages, POST …/complete, GET /interview-sessions y GET …/{id}. La vacante debe
estar guardada en favoritos. El chat simulado solo existe en modo mock.

## Verificación

npm test ejecuta pruebas de flujos mock, tests/gateway-contracts.mjs y
tests/gateway-integration.mjs (auth, perfil, aprendizaje, certificados, entrevistas, errores).
La suite de contratos comprueba métodos, query strings, payload job_id, DTOs, guardados
paginados, JWT Bearer, respuestas 204, proveedor no disponible y errores 401/422.
npm run build verifica la compilación de las vistas.

Todos los endpoints deben validar propiedad en servidor; el almacenamiento y las
comprobaciones locales no sustituyen autorización ni verificación de autenticidad.

