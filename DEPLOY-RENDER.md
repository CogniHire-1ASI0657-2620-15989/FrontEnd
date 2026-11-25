# Primer despliegue en Render con Docker

## Archivos que debes subir a Git

Copia `Dockerfile`, `.dockerignore`, `nginx.conf`, `render.yaml` y este documento
a la raíz de tu repositorio, junto a `package.json`. Sube también los cambios
pendientes de la aplicación. No incluyas `dist`, `node_modules` ni `.env`.

Commit sugerido:

```text
build(deploy): add Docker and Render deployment configuration
```

## Crear el servicio manualmente

1. Abre https://dashboard.render.com/ y selecciona **New > Web Service**.
2. Conecta GitHub y selecciona el repositorio de tu frontend.
3. Selecciona la rama que contiene estos archivos.
4. Configura:

| Campo | Valor |
| --- | --- |
| Name | `pathbridge-frontend` o un nombre disponible |
| Language / Runtime | `Docker` |
| Root Directory | Vacío si package.json está en la raíz del repositorio |
| Dockerfile Path | `./Dockerfile` |
| Docker Build Context | `.` |
| Docker Command | Vacío: se usa el CMD del Dockerfile |
| Instance Type | Free, si está disponible en tu cuenta |
| Health Check Path | `/healthz` |

5. Añade las variables de entorno:

```text
VITE_USE_MOCK=false
VITE_API_URL=https://<url-publica-del-gateway>/api/v1
```

`VITE_API_URL` es la URL pública del API Gateway (la entrega infraestructura), terminada en
`/api/v1`. Añade la URL de este frontend (`https://<nombre>.onrender.com`) a `CORS_ORIGINS`
del Gateway; sin eso el navegador bloqueará las llamadas. Las variables `VITE_*` se
incrustan al compilar: tras cambiarlas hay que volver a desplegar.

6. Pulsa **Deploy Web Service / Create Web Service** y revisa los logs.
7. Cuando termine, abre la URL `https://<nombre>.onrender.com` que muestre Render.

Render ejecuta la compilación del Dockerfile. No agregues un Build Command de npm
ni un Publish Directory: esos campos corresponden a otras modalidades.

Si el frontend está en una subcarpeta del repositorio, usa esa carpeta como Root
Directory; Dockerfile, nginx.conf y package.json deben estar juntos dentro de ella.

## Alternativa: Blueprint

En lugar de crear el Web Service manualmente, puedes seleccionar **New > Blueprint**,
conectar el repositorio y revisar la configuración de `render.yaml` antes de aplicarla.
Usa uno de los dos métodos para evitar crear servicios duplicados.

## Comprobar el resultado

- `/healthz` debe mostrar `ok`.
- Abre `/ingresar`, crea una cuenta y prueba el buscador.
- Abre `/aprendizaje` con sesión iniciada y recarga la página. Nginx debe servir
  la aplicación sin devolver un 404.
- Postula, completa un curso y revisa su constancia en el perfil.

El primer despliegue funciona sin backend. Los usuarios y el progreso se guardan
por navegador y por origen; las cuentas creadas en localhost no aparecen en la URL
de Render. DNI y chat siguen siendo simulados.

## Probar Docker localmente (opcional)

Con Docker Desktop iniciado, ejecuta desde la raíz:

```bash
docker build -t pathbridge-frontend .
docker run --rm -p 8080:10000 pathbridge-frontend
```

Abre http://localhost:8080. El contenedor escucha en `PORT`, con valor predeterminado
10000. La plantilla de Nginx se procesa al iniciar el contenedor.

## Conectar el backend más adelante

Para Job Search y Gap Analysis, la base real debe ser
`VITE_API_URL=https://<gateway>/api/v1`. Antes de activar `VITE_USE_MOCK=false`
en toda la app, completa los adaptadores pendientes de Identity, Learning Pathway,
certificados y asistente descritos en BACKEND-CONTRACT.md.
Después vuelve a construir y desplegar la imagen. Las variables VITE se integran al
JavaScript al compilar; cambiar solo las variables del contenedor en ejecución no
actualiza el frontend. `/api/v1` es un valor inicial para el mock, no un proxy al backend.
El backend debe permitir el origen del frontend mediante CORS.

## Referencias

- https://render.com/docs/docker
- https://render.com/docs/web-services
- https://render.com/docs/blueprint-spec
