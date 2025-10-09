# Configuración GitHub OAuth para Cloudflare Pages

## Opción Recomendada: Netlify Identity (GRATIS)

### ¿Por qué Netlify Identity con Cloudflare?

Netlify Identity es un servicio OAuth **independiente** de donde esté tu sitio hosteado. Puedes usar Netlify Identity para autenticación incluso si tu sitio está en Cloudflare Pages, Vercel, AWS, etc.

**Ventajas:**
- ✅ **Gratuito** hasta 1,000 usuarios activos/mes
- ✅ GitHub OAuth configurado automáticamente
- ✅ No requiere backend propio
- ✅ Compatible con Cloudflare Pages
- ✅ Gestión de usuarios en dashboard de Netlify
- ✅ Invite-only (seguridad)

---

## Paso 1: Crear cuenta en Netlify (si no tienes)

1. Ve a https://app.netlify.com/signup
2. Puedes crear cuenta con:
   - GitHub (recomendado)
   - GitLab
   - Bitbucket
   - Email

**NOTA**: NO necesitas desplegar tu sitio en Netlify, solo usar el servicio de Identity.

---

## Paso 2: Crear un sitio "dummy" en Netlify

Netlify Identity requiere estar asociado a un "sitio", pero este sitio puede ser un placeholder vacío.

### Opción A: Conectar tu repo GitHub (más fácil)

1. En Netlify Dashboard → **Add new site** → **Import an existing project**
2. Conecta GitHub → Selecciona `kilowatto/2025-ignia-website`
3. Build settings:
   - Build command: `echo "Dummy site for Identity only"`
   - Publish directory: `.`
4. Click **Deploy site**

**IMPORTANTE**: Este sitio de Netlify NO se usará para producción (tu sitio real está en Cloudflare). Solo lo usamos para habilitar Identity.

### Opción B: Crear sitio manual (sin desplegar)

1. En Netlify Dashboard → **Sites** → **Add new site** → **Deploy manually**
2. Arrastra cualquier carpeta vacía
3. Netlify creará un sitio con dominio random (ej: `random-name-123456.netlify.app`)

---

## Paso 3: Habilitar Identity en Netlify

1. En tu sitio de Netlify → **Settings** → **Identity**
2. Click **Enable Identity**
3. Configurar Registration:
   - **Registration preferences**: `Invite only` (seguridad)
   - **External providers**: Habilitar **GitHub**
4. Configurar Git Gateway:
   - Scroll down → **Services** → **Git Gateway**
   - Click **Enable Git Gateway**
   - Esto permite que Identity haga commits a tu repo

---

## Paso 4: Invitar usuarios (editores del CMS)

1. En Netlify Dashboard → **Identity** → **Invite users**
2. Ingresa emails de los editores que tendrán acceso al CMS
3. Ellos recibirán un email de invitación
4. Al aceptar, podrán hacer login con GitHub en `/admin`

---

## Paso 5: Actualizar config.yml con tu sitio de Netlify

Actualmente tu `public/admin/config.yml` tiene:

```yaml
backend:
  name: test-repo  # ← Cambiar a 'github'
```

Debe quedar:

```yaml
backend:
  name: github
  repo: kilowatto/2025-ignia-website
  branch: main
  base_url: https://api.netlify.com
  auth_endpoint: auth
```

**NO necesitas cambiar nada más**. La URL `https://api.netlify.com` es genérica para todos los usuarios de Netlify Identity.

---

## Paso 6: Actualizar src/pages/admin.astro

Cambia el backend de `test-repo` a `github`:

```javascript
const config = `backend:
  name: github
  repo: kilowatto/2025-ignia-website
  branch: main
  base_url: https://api.netlify.com
  auth_endpoint: auth
  
media_folder: "public/images/cms"
public_folder: "/images/cms"

// ... resto de la config
`;
```

---

## Paso 7: Probar el flujo completo

### En local (dev):

1. `pnpm run dev`
2. Abrir http://localhost:4322/admin
3. Click **Login with Netlify Identity**
4. Autenticarse con GitHub
5. Ver la interfaz del CMS con tus páginas

### En producción (Cloudflare Pages):

1. Hacer push de los cambios a GitHub
2. Cloudflare Pages detecta el push y hace rebuild
3. Abrir https://ignia.cloud/admin (cuando esté desplegado)
4. Login con Netlify Identity → GitHub OAuth
5. Editar contenido → Save
6. Decap CMS hace commit a GitHub
7. Cloudflare Pages detecta nuevo commit → rebuild automático
8. Cambios visibles en producción (~2-3 minutos)

---

## Flujo de edición (Producción)

```
Editor abre /admin
    ↓
Login con GitHub (vía Netlify Identity)
    ↓
Edita contenido en el CMS
    ↓
Click "Save" → Decap CMS hace commit a GitHub
    ↓
Cloudflare Pages detecta push
    ↓
Rebuild automático (~2 min)
    ↓
Cambios en producción ✅
```

---

## Costos

- **Netlify Identity**: GRATIS (hasta 1,000 usuarios activos/mes)
- **Cloudflare Pages**: GRATIS (tu hosting actual)
- **GitHub**: GRATIS (tu repo actual)
- **Total**: $0/mes 🎉

---

## Seguridad

### Permisos de GitHub

Netlify Identity + Git Gateway requiere permisos de GitHub para:
- ✅ Leer repositorio (ver archivos)
- ✅ Escribir (hacer commits)
- ✅ NO tiene acceso a otros repos
- ✅ Los commits aparecen con el nombre del editor autenticado

### Control de acceso

- **Invite-only**: Solo usuarios invitados pueden acceder
- **GitHub OAuth**: Valida identidad con cuenta de GitHub real
- **Audit trail**: Todos los commits visibles en GitHub history

---

## Alternativa: GitHub PAT (Solo desarrollo local)

Si solo quieres probar localmente SIN configurar Netlify:

1. GitHub → Settings → Developer settings → Personal access tokens
2. Generate new token (classic)
3. Scopes: `repo` (acceso completo al repo)
4. Copiar token

5. Instalar proxy local:
```bash
pnpm add -D netlify-cms-proxy-server
```

6. Agregar script en `package.json`:
```json
{
  "scripts": {
    "cms-proxy": "netlify-cms-proxy-server"
  }
}
```

7. Actualizar `public/admin/config.yml` (SOLO para local):
```yaml
backend:
  name: git-gateway

local_backend: true
```

8. Ejecutar en terminales separadas:
```bash
# Terminal 1
pnpm run dev

# Terminal 2
pnpm run cms-proxy
```

9. Abrir http://localhost:4322/admin

**⚠️ ADVERTENCIA**: NO usar PAT en producción (inseguro, token expuesto en código).

---

## FAQ

### ¿Necesito mover mi sitio a Netlify?

**NO**. Tu sitio sigue en Cloudflare Pages. Netlify Identity es solo un servicio de autenticación que funciona con cualquier hosting.

### ¿Netlify cobrará después?

Solo si superas 1,000 usuarios activos/mes (muy improbable para un CMS interno). El sitio "dummy" en Netlify es gratis siempre.

### ¿Puedo usar otro proveedor OAuth?

Sí, alternativas:
- **Auth0** (tiene plan gratuito)
- **OAuth GitHub App** (requiere servidor backend propio)
- **Keycloak** (self-hosted)

Pero Netlify Identity es la solución más simple y gratuita.

### ¿Qué pasa si Netlify cae?

Si Netlify tiene downtime, los editores no podrán acceder a `/admin` temporalmente. Pero tu sitio en Cloudflare seguirá funcionando normalmente.

---

## Próximos pasos

1. ✅ Crear cuenta en Netlify
2. ✅ Crear sitio "dummy" (o conectar repo)
3. ✅ Habilitar Identity + Git Gateway
4. ✅ Invitar editores
5. ✅ Actualizar `config.yml` con `backend: github`
6. ✅ Probar login en `/admin`
7. ✅ Hacer primer commit desde el CMS
8. ✅ Verificar rebuild en Cloudflare Pages

---

**Autor**: GitHub Copilot  
**Fecha**: 9 de octubre de 2025  
**Versión**: 2.0.0
