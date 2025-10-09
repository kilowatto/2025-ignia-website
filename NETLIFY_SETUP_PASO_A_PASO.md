# 🎯 Guía PASO A PASO: Configurar Netlify Identity para Decap CMS

**Objetivo**: Configurar autenticación GitHub para que puedas editar contenido desde `/admin` y hacer commits automáticos a tu repositorio.

**Tiempo estimado**: 15-20 minutos

---

## 📋 ANTES DE EMPEZAR

### ¿Qué necesitas?

- ✅ Cuenta de GitHub (la que ya tienes)
- ✅ Acceso al repositorio `kilowatto/2025-ignia-website`
- ✅ Un navegador web
- ✅ 15 minutos de tu tiempo

### ¿Qué vamos a lograr?

Al terminar esta guía:
1. Tendrás un sitio "dummy" en Netlify (solo para autenticación)
2. Netlify Identity configurado con GitHub OAuth
3. Podrás hacer login en `/admin` con tu cuenta de GitHub
4. Los cambios en el CMS harán commits automáticos a tu repo
5. Cloudflare Pages detectará los commits y hará rebuild automático

**IMPORTANTE**: Tu sitio de producción seguirá en Cloudflare Pages. Netlify solo se usa para la autenticación.

---

## 🚀 PARTE 1: CREAR CUENTA EN NETLIFY (5 minutos)

### Paso 1.1: Ir a Netlify

1. Abre tu navegador
2. Ve a: **https://app.netlify.com/signup**

### Paso 1.2: Elegir método de registro

Verás una pantalla que dice "**Sign up for Netlify**" con 4 opciones:

```
┌─────────────────────────────────────────┐
│      Sign up for Netlify                │
│                                         │
│  [ GitHub ]   ← ELIGE ESTA OPCIÓN      │
│  [ GitLab ]                             │
│  [ Bitbucket ]                          │
│  [ Email ]                              │
└─────────────────────────────────────────┘
```

**Acción**: Click en el botón **GitHub** (es la primera opción, tiene el icono de Octocat)

### Paso 1.3: Autorizar Netlify en GitHub

GitHub te mostrará una pantalla que dice:

```
┌─────────────────────────────────────────┐
│  Authorize Netlify                      │
│                                         │
│  Netlify by Netlify wants to access    │
│  your kilowatto account                 │
│                                         │
│  Permissions:                           │
│  ✓ Read access to code                 │
│  ✓ Read access to metadata             │
│  ✓ Read and write access to            │
│    administration, code, commit         │
│    statuses, deployments...             │
│                                         │
│  [ Authorize netlify ]  [Cancel]        │
└─────────────────────────────────────────┘
```

**Acción**: 
1. Lee los permisos (son normales para un servicio de deploy)
2. Click en el botón verde **"Authorize netlify"**

### Paso 1.4: Confirmar email (si te lo pide)

Si GitHub te pide confirmar tu email:
1. Ve a tu correo
2. Busca email de GitHub
3. Click en el link de confirmación
4. Regresa a la pestaña de Netlify

### Paso 1.5: ¡Cuenta creada! 🎉

Verás el **Dashboard de Netlify** que dice:

```
┌─────────────────────────────────────────┐
│  Welcome to Netlify                     │
│                                         │
│  [ Add new site ▼ ]                    │
│                                         │
│  Team overview                          │
│  ┌──────────────────┐                  │
│  │ Sites       0    │                  │
│  │ Team members 1   │                  │
│  └──────────────────┘                  │
└─────────────────────────────────────────┘
```

**¡Perfecto!** Ya tienes cuenta en Netlify.

---

## 🏗️ PARTE 2: CREAR SITIO "DUMMY" EN NETLIFY (3 minutos)

**¿Por qué necesitamos un sitio?** Netlify Identity requiere estar asociado a un sitio, pero NO vamos a desplegar tu web aquí (eso sigue en Cloudflare).

### Paso 2.1: Click en "Add new site"

En el Dashboard de Netlify:

**Acción**: 
1. Click en el botón **"Add new site"** (esquina superior derecha)
2. Se abre un menú desplegable

```
┌─────────────────────────────────────────┐
│  Add new site ▼                         │
│  ┌──────────────────────────────┐       │
│  │ Import an existing project   │ ← ELIGE ESTA │
│  │ Start from a template        │       │
│  │ Deploy manually              │       │
│  └──────────────────────────────┘       │
└─────────────────────────────────────────┘
```

**Acción**: Click en **"Import an existing project"**

### Paso 2.2: Conectar con GitHub

Verás una pantalla que dice "**Import an existing project**":

```
┌─────────────────────────────────────────┐
│  Connect to Git provider                │
│                                         │
│  ┌────────────┐  ┌────────────┐        │
│  │  GitHub    │  │  GitLab    │        │
│  └────────────┘  └────────────┘        │
│  ┌────────────┐  ┌────────────┐        │
│  │ Bitbucket  │  │   Azure    │        │
│  └────────────┘  └────────────┘        │
└─────────────────────────────────────────┘
```

**Acción**: Click en **"GitHub"**

### Paso 2.3: Autorizar acceso a repositorios (si te lo pide)

Si GitHub te muestra una pantalla de permisos:

```
┌─────────────────────────────────────────┐
│  Install Netlify                        │
│                                         │
│  Select which repositories Netlify      │
│  can access:                            │
│                                         │
│  ○ All repositories                     │
│  ● Only select repositories ← ELIGE    │
│                                         │
│  Select repositories:                   │
│  [▼ kilowatto/2025-ignia-website]      │
│                                         │
│  [ Install ]                            │
└─────────────────────────────────────────┘
```

**Acción**:
1. Selecciona **"Only select repositories"**
2. En el dropdown, busca y selecciona: **`kilowatto/2025-ignia-website`**
3. Click en **"Install"** (botón verde)

**NOTA**: Si ya tienes Netlify instalado en GitHub, saltará este paso.

### Paso 2.4: Seleccionar tu repositorio

Verás una lista de tus repositorios:

```
┌─────────────────────────────────────────┐
│  Pick a repository                      │
│                                         │
│  Search repos...                        │
│  ┌──────────────────────────────────┐   │
│  │ kilowatto / 2025-ignia-website   │ ← │
│  └──────────────────────────────────┘   │
│                                         │
└─────────────────────────────────────────┘
```

**Acción**: Click en **`kilowatto/2025-ignia-website`**

### Paso 2.5: Configurar build settings

Verás una pantalla con configuración de build:

```
┌─────────────────────────────────────────┐
│  Site settings for kilowatto/2025-...   │
│                                         │
│  Branch to deploy:                      │
│  [main              ▼]                  │
│                                         │
│  Build command:                         │
│  [pnpm run build                    ]   │
│                                         │
│  Publish directory:                     │
│  [dist                              ]   │
│                                         │
│  [ Show advanced ▼ ]                    │
│                                         │
│  [ Deploy site ]                        │
└─────────────────────────────────────────┘
```

**Acción**: 
1. **Branch to deploy**: Dejar en `main`
2. **Build command**: Cambiar a: `echo "CMS Auth Only"`
3. **Publish directory**: Dejar en `dist`
4. Click en **"Deploy site"**

**¿Por qué `echo "CMS Auth Only"`?** Porque NO queremos que Netlify haga build real (eso es trabajo de Cloudflare). Solo queremos el servicio de autenticación.

### Paso 2.6: Esperar deploy (30 segundos)

Verás una pantalla que dice "**Site deploy in progress**":

```
┌─────────────────────────────────────────┐
│  Production: main@HEAD                  │
│                                         │
│  ⏳ Building...                         │
│                                         │
│  Site deploy in progress                │
│  Started: just now                      │
└─────────────────────────────────────────┘
```

**Espera 20-30 segundos**. La barra de progreso se completará.

### Paso 2.7: ¡Sitio creado! 🎉

Verás el dashboard del sitio con un nombre random:

```
┌─────────────────────────────────────────┐
│  random-name-a1b2c3.netlify.app         │
│                                         │
│  Production deploys                     │
│  ✓ Published                            │
│                                         │
│  [ Site settings ]  [ Domain settings ] │
└─────────────────────────────────────────┘
```

**IMPORTANTE**: Anota o copia el nombre del sitio (ej: `random-name-a1b2c3.netlify.app`). Lo necesitarás después.

---

## 🔐 PARTE 3: HABILITAR NETLIFY IDENTITY (5 minutos)

Ahora vamos a habilitar el servicio de autenticación.

### Paso 3.1: Ir a Settings → Identity

En el dashboard del sitio:

```
┌─────────────────────────────────────────┐
│  random-name-a1b2c3.netlify.app         │
│                                         │
│  Tabs:                                  │
│  [ Deploys ] [ Site settings ] ...      │
│                                         │
└─────────────────────────────────────────┘
```

**Acción**:
1. Click en la pestaña **"Site settings"** (arriba)
2. En el menú lateral izquierdo, busca la sección **"Identity"**
3. Click en **"Identity"**

### Paso 3.2: Habilitar Identity

Verás una pantalla que dice:

```
┌─────────────────────────────────────────┐
│  Identity                               │
│                                         │
│  ┌────────────────────────────────┐    │
│  │  Identity is a service that     │    │
│  │  adds user management to your   │    │
│  │  site.                          │    │
│  │                                 │    │
│  │  [ Enable Identity ]            │    │
│  └────────────────────────────────┘    │
└─────────────────────────────────────────┘
```

**Acción**: Click en el botón **"Enable Identity"**

**Espera 5 segundos**. La página se recargará.

### Paso 3.3: Configurar Registration Preferences

Ahora verás las opciones de Identity. Busca la sección **"Registration preferences"**:

```
┌─────────────────────────────────────────┐
│  Registration preferences               │
│                                         │
│  Who can sign up?                       │
│  ○ Open                                 │
│  ● Invite only  ← DEBE ESTAR SELECCIONADO │
│                                         │
│  [ Edit settings ]                      │
└─────────────────────────────────────────┘
```

**Acción**:
1. Click en **"Edit settings"**
2. Verás un modal con opciones de registro
3. Selecciona **"Invite only"** (más seguro)
4. Click en **"Save"**

**¿Por qué "Invite only"?** Para que solo las personas que TÚ invites puedan acceder al CMS. Más seguro.

### Paso 3.4: Habilitar GitHub como proveedor externo

En la misma página de Identity, busca la sección **"External providers"**:

```
┌─────────────────────────────────────────┐
│  External providers                     │
│                                         │
│  Add providers like Google, GitHub,     │
│  GitLab, and Bitbucket.                 │
│                                         │
│  [ Add provider ]                       │
└─────────────────────────────────────────┘
```

**Acción**:
1. Click en **"Add provider"**
2. Verás una lista de opciones:

```
┌─────────────────────────────────────────┐
│  Select provider                        │
│                                         │
│  ○ Google                               │
│  ○ GitHub        ← SELECCIONA ESTA     │
│  ○ GitLab                               │
│  ○ Bitbucket                            │
│                                         │
│  [ Continue ]                           │
└─────────────────────────────────────────┘
```

3. Selecciona **"GitHub"**
4. Click en **"Continue"**

### Paso 3.5: Usar GitHub OAuth App de Netlify

Verás una pantalla con dos opciones:

```
┌─────────────────────────────────────────┐
│  Configure GitHub provider              │
│                                         │
│  Use Netlify's GitHub OAuth App         │
│  ● Use default configuration ← ELIGE   │
│  ○ Use custom configuration             │
│                                         │
│  [ Enable ]                             │
└─────────────────────────────────────────┘
```

**Acción**:
1. Deja seleccionado **"Use default configuration"**
2. Click en **"Enable"**

**¡IMPORTANTE!** Esta opción usa la app OAuth de Netlify (no necesitas crear nada en GitHub).

### Paso 3.6: Verificar que GitHub está habilitado

Verás en la lista de proveedores:

```
┌─────────────────────────────────────────┐
│  External providers                     │
│                                         │
│  ✓ GitHub (enabled)                     │
│                                         │
└─────────────────────────────────────────┘
```

**¡Perfecto!** GitHub OAuth está configurado.

---

## 🌉 PARTE 4: HABILITAR GIT GATEWAY (2 minutos)

Git Gateway permite que Netlify Identity haga commits a tu repositorio de GitHub.

### Paso 4.1: Ir a Services → Git Gateway

En la misma página de Identity, **scroll hacia abajo** hasta encontrar la sección **"Services"**:

```
┌─────────────────────────────────────────┐
│  Services                               │
│                                         │
│  Git Gateway                            │
│  Allow users to edit content in your   │
│  GitHub repository.                     │
│                                         │
│  Status: Not installed                  │
│                                         │
│  [ Enable Git Gateway ]                 │
└─────────────────────────────────────────┘
```

**Acción**: Click en **"Enable Git Gateway"**

### Paso 4.2: Autorizar acceso al repositorio

GitHub te mostrará una pantalla:

```
┌─────────────────────────────────────────┐
│  Authorize Netlify to access            │
│  kilowatto/2025-ignia-website           │
│                                         │
│  This will allow Netlify to:            │
│  ✓ Read repository code                │
│  ✓ Create commits                       │
│  ✓ Push to branches                     │
│                                         │
│  [ Authorize ]  [ Cancel ]              │
└─────────────────────────────────────────┘
```

**Acción**: Click en **"Authorize"**

### Paso 4.3: Verificar Git Gateway habilitado

Verás:

```
┌─────────────────────────────────────────┐
│  Services                               │
│                                         │
│  Git Gateway                            │
│  Status: ✓ Active                       │
│                                         │
│  Repository: kilowatto/2025-ignia-...   │
└─────────────────────────────────────────┘
```

**¡Excelente!** Git Gateway está activo.

---

## 👥 PARTE 5: INVITAR USUARIOS (3 minutos)

Ahora vamos a invitarte a TI MISMO como primer usuario del CMS.

### Paso 5.1: Ir a Identity → Invite users

En el dashboard del sitio:

**Acción**:
1. Click en la pestaña **"Identity"** (arriba, junto a "Site settings")
2. Verás una pantalla vacía que dice:

```
┌─────────────────────────────────────────┐
│  Identity                               │
│                                         │
│  Users (0)                              │
│                                         │
│  No users yet                           │
│                                         │
│  [ Invite users ]                       │
└─────────────────────────────────────────┘
```

3. Click en **"Invite users"**

### Paso 5.2: Ingresar tu email

Verás un modal:

```
┌─────────────────────────────────────────┐
│  Invite users                           │
│                                         │
│  Enter email addresses, one per line    │
│  ┌──────────────────────────────────┐   │
│  │ tu-email@ejemplo.com             │   │
│  │                                  │   │
│  └──────────────────────────────────┘   │
│                                         │
│  [ Send ]  [ Cancel ]                   │
└─────────────────────────────────────────┘
```

**Acción**:
1. Escribe TU email (el mismo que usas en GitHub)
2. Click en **"Send"**

### Paso 5.3: Revisar tu correo

**Acción**:
1. Ve a tu correo electrónico
2. Busca un email de **"Netlify Identity"** con asunto: "You've been invited to join..."
3. Ábrelo

Verás un email que dice:

```
┌─────────────────────────────────────────┐
│  You've been invited to join            │
│  random-name-a1b2c3.netlify.app         │
│                                         │
│  You have been invited to create an     │
│  account. Follow this link to accept:   │
│                                         │
│  [ Accept the invite ]                  │
└─────────────────────────────────────────┘
```

4. Click en **"Accept the invite"**

### Paso 5.4: Completar registro

Se abrirá una página de Netlify que dice:

```
┌─────────────────────────────────────────┐
│  Complete your signup                   │
│                                         │
│  Password:                              │
│  [................................]     │
│                                         │
│  [ Sign up ]                            │
│                                         │
│  Or continue with:                      │
│  [ Continue with GitHub ]  ← USA ESTA  │
└─────────────────────────────────────────┘
```

**Acción**: 
1. **NO ingreses una contraseña**
2. En su lugar, click en **"Continue with GitHub"** (abajo)

### Paso 5.5: Autorizar con GitHub

GitHub te pedirá autorización:

```
┌─────────────────────────────────────────┐
│  Authorize Netlify Identity             │
│                                         │
│  This will allow Netlify Identity to:   │
│  ✓ Verify your GitHub identity          │
│                                         │
│  [ Authorize ]                          │
└─────────────────────────────────────────┘
```

**Acción**: Click en **"Authorize"**

### Paso 5.6: ¡Usuario creado! 🎉

Verás una pantalla que confirma:

```
┌─────────────────────────────────────────┐
│  ✓ Success!                             │
│                                         │
│  You're now logged in                   │
└─────────────────────────────────────────┘
```

**Regresa al dashboard de Netlify** y verás:

```
┌─────────────────────────────────────────┐
│  Identity                               │
│                                         │
│  Users (1)                              │
│                                         │
│  ┌────────────────────────────────────┐ │
│  │ tu-email@ejemplo.com               │ │
│  │ Provider: GitHub                   │ │
│  │ Status: Confirmed                  │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

**¡Perfecto!** Ya tienes tu primer usuario configurado.

---

## 🔧 PARTE 6: ACTUALIZAR CONFIG.YML (2 minutos)

Ahora debemos actualizar el archivo de configuración de Decap CMS en tu proyecto.

### Paso 6.1: Abrir Visual Studio Code

**Acción**: Abre VS Code en tu proyecto `new-website-ignia`

### Paso 6.2: Editar public/admin/config.yml

**Acción**:
1. En VS Code, abre el archivo: **`public/admin/config.yml`**
2. Busca las primeras líneas que dicen:

```yaml
backend:
  name: github
  repo: kilowatto/2025-ignia-website
  branch: main
  base_url: https://api.netlify.com
  auth_endpoint: auth
```

3. **Verifica que todo esté exactamente así** (sin cambios necesarios)

**NOTA**: Si tiene `name: test-repo`, cámbialo a `name: github`

### Paso 6.3: Editar src/pages/admin.astro

**Acción**:
1. Abre el archivo: **`src/pages/admin.astro`**
2. Busca la línea que dice:

```javascript
const config = `backend:
  name: test-repo  // ← CAMBIAR ESTA LÍNEA
```

3. Cambia `name: test-repo` por:

```javascript
const config = `backend:
  name: github
  repo: kilowatto/2025-ignia-website
  branch: main
  base_url: https://api.netlify.com
  auth_endpoint: auth
```

4. Guarda el archivo (**Ctrl+S** o **Cmd+S**)

---

## ✅ PARTE 7: PROBAR EL CMS (3 minutos)

¡Momento de la verdad! Vamos a probar que todo funcione.

### Paso 7.1: Iniciar servidor dev

**Acción**:
1. Abre la terminal en VS Code
2. Si el servidor dev no está corriendo, ejecuta:

```bash
pnpm run dev
```

3. Espera a que diga:

```
astro v5.14.1 ready in XXXms
┃ Local    http://localhost:4322/
```

### Paso 7.2: Abrir /admin

**Acción**:
1. Abre tu navegador
2. Ve a: **http://localhost:4322/admin**

Verás la página del CMS que dice:

```
┌─────────────────────────────────────────┐
│  Loading CMS...                         │
│  Configurando autenticación GitHub...   │
│                                         │
│  ← Volver a Home                        │
└─────────────────────────────────────────┘
```

**Espera 2-3 segundos** a que cargue Decap CMS.

### Paso 7.3: Login con Netlify Identity

Verás la interfaz de Decap CMS con un botón de login:

```
┌─────────────────────────────────────────┐
│         Decap CMS                       │
│                                         │
│  [ Login with Netlify Identity ]        │
└─────────────────────────────────────────┘
```

**Acción**: Click en **"Login with Netlify Identity"**

### Paso 7.4: Autenticar con GitHub

Se abrirá una ventana popup de Netlify Identity:

```
┌─────────────────────────────────────────┐
│  Log in with                            │
│                                         │
│  [ Continue with GitHub ]               │
│                                         │
│  Or                                     │
│                                         │
│  Email: [.........................]     │
│  Password: [.....................]     │
│  [ Log in ]                             │
└─────────────────────────────────────────┘
```

**Acción**: Click en **"Continue with GitHub"**

### Paso 7.5: ¡Dentro del CMS! 🎉

Si todo salió bien, verás la interfaz del CMS:

```
┌─────────────────────────────────────────┐
│  Content  Media  Workflow               │
│                                         │
│  Collections:                           │
│  📄 Páginas (1)                         │
│                                         │
│  Quick links:                           │
│  - home (en, es, fr)                    │
└─────────────────────────────────────────┘
```

**¡ÉXITO!** Estás dentro del CMS.

---

## 🎨 PARTE 8: HACER TU PRIMER CAMBIO (5 minutos)

Vamos a probar editando algo.

### Paso 8.1: Abrir la página Home

**Acción**:
1. En el CMS, click en **"📄 Páginas"** (en el menú lateral)
2. Verás 3 versiones de "home":
   - `en/home` (English)
   - `es/home` (Español)
   - `fr/home` (Français)
3. Click en **`en/home`**

### Paso 8.2: Editar el Hero Title

Verás un formulario con todos los campos:

```
┌─────────────────────────────────────────┐
│  home (en)                              │
│                                         │
│  Slug:                                  │
│  [home                              ]   │
│                                         │
│  Título SEO:                            │
│  [Ignia Cloud - Enterprise Cloud... ]   │
│                                         │
│  🎯 Hero                                │
│  Título Principal:                      │
│  [Your Cloud, Your Rules            ]   │
│     ↑                                   │
│   EDITA AQUÍ                            │
└─────────────────────────────────────────┘
```

**Acción**:
1. Busca el campo **"🎯 Hero → Título Principal"**
2. Cambia el texto a: **"Your Cloud, Your Rules - TESTING CMS"**
3. Click en **"Save"** (arriba a la derecha)

### Paso 8.3: Publicar el cambio

Verás un modal que dice:

```
┌─────────────────────────────────────────┐
│  Publish entry                          │
│                                         │
│  Commit message:                        │
│  [Update Pages "home"               ]   │
│                                         │
│  [ Publish now ]  [ Cancel ]            │
└─────────────────────────────────────────┘
```

**Acción**:
1. Puedes editar el mensaje de commit si quieres
2. Click en **"Publish now"**

### Paso 8.4: ¡Commit hecho! 🚀

Verás una confirmación:

```
┌─────────────────────────────────────────┐
│  ✓ Entry saved                          │
│                                         │
│  Published to GitHub                    │
└─────────────────────────────────────────┘
```

**¡Felicitaciones!** Acabas de hacer tu primer commit desde el CMS.

### Paso 8.5: Verificar en GitHub

**Acción**:
1. Abre GitHub en tu navegador
2. Ve a: **https://github.com/kilowatto/2025-ignia-website/commits/main**
3. Verás un commit reciente que dice: **"Update Pages "home""**
4. El commit fue hecho por tu usuario de GitHub

**¡ÉXITO TOTAL!** El CMS está funcionando y haciendo commits reales.

---

## 🚀 PARTE 9: DESPLEGAR EN CLOUDFLARE (automático)

Como hiciste un commit, Cloudflare Pages detectará el cambio automáticamente.

### Paso 9.1: Verificar build en Cloudflare

**Acción**:
1. Ve a tu dashboard de Cloudflare Pages
2. Busca tu proyecto `2025-ignia-website`
3. Verás un nuevo deployment "In progress"

```
┌─────────────────────────────────────────┐
│  Latest deployments                     │
│                                         │
│  ⏳ Building... (just now)              │
│  Commit: Update Pages "home"            │
└─────────────────────────────────────────┘
```

4. Espera 2-3 minutos

### Paso 9.2: ¡Deploy completo! ✅

Verás:

```
┌─────────────────────────────────────────┐
│  Latest deployments                     │
│                                         │
│  ✓ Success (2 min ago)                  │
│  Commit: Update Pages "home"            │
│                                         │
│  [ Visit site ]                         │
└─────────────────────────────────────────┘
```

**Acción**: Click en **"Visit site"** y verás tu cambio en producción.

---

## 🎉 ¡COMPLETADO!

**Has configurado exitosamente:**

✅ Cuenta en Netlify  
✅ Sitio "dummy" para autenticación  
✅ Netlify Identity con GitHub OAuth  
✅ Git Gateway para commits  
✅ Usuario invitado y confirmado  
✅ Configuración actualizada en tu proyecto  
✅ Primer cambio desde el CMS  
✅ Commit a GitHub  
✅ Deploy automático en Cloudflare  

---

## 📝 RESUMEN DEL FLUJO

Ahora cada vez que edites contenido:

1. Abres **https://ignia.cloud/admin** (o `localhost:4322/admin`)
2. Haces login con GitHub (una sola vez, se recuerda)
3. Editas contenido en el CMS
4. Click en "Save" → "Publish now"
5. Decap CMS hace commit a GitHub
6. Cloudflare Pages detecta el push
7. Rebuild automático en ~2 minutos
8. Cambios visibles en producción

**Sin tocar código, sin terminal, sin Git commands** ✨

---

## 🆘 SOLUCIÓN DE PROBLEMAS

### Error: "Failed to load config.yml"

**Solución**:
1. Verifica que `public/admin/config.yml` existe
2. Verifica que `src/pages/admin.astro` tiene `backend: name: github`

### Error: "Failed to authenticate"

**Solución**:
1. Verifica que Git Gateway esté habilitado en Netlify
2. Verifica que el provider GitHub esté habilitado
3. Reintenta el login

### Error: "Can't commit to repository"

**Solución**:
1. Verifica que autorizaste Netlify en GitHub
2. Ve a GitHub → Settings → Applications → Netlify
3. Asegúrate de que tiene permisos de escritura

### No veo la opción "Continue with GitHub"

**Solución**:
1. Ve a Netlify → Site → Identity → External providers
2. Verifica que GitHub esté habilitado
3. Deshabilita y vuelve a habilitar

---

**¿Tienes dudas?** Pregúntame en cualquier paso y te guío.

**Autor**: GitHub Copilot  
**Fecha**: 9 de octubre de 2025  
**Versión**: 3.0.0
