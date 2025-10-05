# 🚀 Guía de Configuración: Google Analytics 4 en Cloudflare Pages

**Estado:** ✅ Código implementado y testeado localmente  
**Acción Requerida:** Configurar variable de entorno en Cloudflare Pages

---

## 📋 Pasos para Activar GA4 en Producción

### **Paso 1: Acceder a Cloudflare Dashboard**

1. Abrir navegador e ir a: **https://dash.cloudflare.com/**
2. Login con tu cuenta de Cloudflare
3. Navegar a: **Pages** (menú lateral izquierdo)
4. Seleccionar proyecto: **2025-ignia-website**

---

### **Paso 2: Configurar Variable de Entorno**

1. Dentro del proyecto, ir a: **Settings** (pestaña superior)
2. Scroll down hasta: **Environment Variables**
3. Click en botón: **Add variable**

**Configuración Production:**
```
Variable name: PUBLIC_GA4_ID
Value: G-Z7PLTQVJBJ
Environment: Production ✅
Encrypt: No (es público, no sensible)
```

4. Click: **Save**

**Opcional - Configuración Preview/Staging:**
```
Variable name: PUBLIC_GA4_ID
Value: G-Z7PLTQVJBJ (mismo ID o diferente para testing)
Environment: Preview ✅
```

5. Click: **Save**

---

### **Paso 3: Deploy (Automático)**

**Opción A: Deploy automático con push**
```bash
git push origin main
```
Cloudflare detectará el nuevo commit y re-deployará automáticamente (~2 min).

**Opción B: Re-deploy manual**
1. En Cloudflare Dashboard → **Deployments**
2. Click en último deployment exitoso
3. Click: **Retry deployment** (fuerza rebuild con nueva variable)

---

### **Paso 4: Verificación Post-Deploy**

**4.1 - Verificar Variable Inyectada:**

```bash
# Ver deployment logs en Cloudflare
# Debe mostrar: PUBLIC_GA4_ID disponible ✅
```

**4.2 - Testing en Producción:**

1. Abrir: **https://ignia.cloud** (o tu dominio)
2. Abrir DevTools (F12 o Cmd+Option+I)

**Chrome DevTools → Network:**
```
- Filter: "gtag"
- Debe aparecer: gtag/js?id=G-Z7PLTQVJBJ
- Status: 200 OK ✅
- Initiator: ~partytown (NO "main") ✅
```

**Chrome DevTools → Console:**
```
Buscar mensajes:
[Partytown] Initialized ✅
[Partytown] Forwarding dataLayer.push ✅
```

**Chrome DevTools → Application → Service Workers:**
```
Debe aparecer: partytown-sw.js (Active) ✅
```

**4.3 - Google Analytics Real-Time:**

1. Ir a: **https://analytics.google.com/**
2. Seleccionar Property: **G-Z7PLTQVJBJ**
3. Reports → **Realtime**
4. Visitar https://ignia.cloud desde otro dispositivo
5. Verificar que aparezca en: **Users by page** ✅

**Debe mostrar:**
- Active users: 1+ ✅
- Page path: / (o la página visitada) ✅
- Country: Tu ubicación ✅

---

### **Paso 5: Lighthouse Audit (Performance)**

**Testing Performance con GA4 activo:**

1. Chrome DevTools → **Lighthouse**
2. Mode: **Navigation (Default)**
3. Device: **Mobile**
4. Categories: **Performance** ✅
5. Click: **Analyze page load**

**Resultados Esperados:**
```
Performance Score: ≥ 90 ✅
├─ First Contentful Paint: < 1.8s ✅
├─ Largest Contentful Paint: < 2.5s ✅
├─ Total Blocking Time: < 200ms ✅
├─ Cumulative Layout Shift: < 0.1 ✅
└─ Speed Index: < 3.4s ✅

Passed audits:
✅ Uses efficient cache policy
✅ Minimizes main-thread work
✅ Avoids enormous network payloads
✅ Serves images with correct aspect ratio
```

**Si el score baja < 85:**
- Verificar que gtag se carga en Worker (Partytown)
- Revisar Network → Timing (debe ser async)
- Verificar Main Thread (debe estar libre)

---

## 🔍 Troubleshooting

### **Problema 1: GA4 no aparece en Network**

**Síntomas:**
- No se ve request a `gtag/js` en Network tab
- Real-Time no muestra usuarios

**Solución:**
```bash
# 1. Verificar variable en Cloudflare
Dashboard → Settings → Environment Variables
PUBLIC_GA4_ID = G-Z7PLTQVJBJ ✅

# 2. Verificar deployment log
Dashboard → Deployments → Ver último deploy
Buscar: "PUBLIC_GA4_ID" en output

# 3. Hard refresh en browser
Cmd+Shift+R (Mac) o Ctrl+Shift+R (Windows)
```

---

### **Problema 2: Scripts se cargan pero no en Partytown**

**Síntomas:**
- gtag.js aparece en Network
- Initiator: "main" (NO "~partytown")
- Performance score baja < 80

**Solución:**
```bash
# 1. Verificar que Partytown esté activo
DevTools → Application → Service Workers
Debe mostrar: partytown-sw.js

# 2. Verificar scripts en HTML
DevTools → Elements → Buscar "partytown"
<script type="text/partytown" ...> ✅

# 3. Rebuild si es necesario
Cloudflare Dashboard → Deployments → Retry
```

---

### **Problema 3: Real-Time no muestra datos**

**Síntomas:**
- Scripts se cargan correctamente
- Partytown activo
- Pero GA no recibe datos

**Solución:**
```bash
# 1. Verificar ID correcto
G-Z7PLTQVJBJ (debe coincidir exactamente)

# 2. Verificar dataLayer en Console
Console: window.dataLayer
Debe mostrar: Array con eventos ✅

# 3. Verificar en Google Analytics
Property Settings → Data Streams
Verificar que G-Z7PLTQVJBJ esté activo

# 4. Esperar 1-2 minutos
Real-Time puede tardar en actualizar
```

---

## 📊 Métricas de Éxito

**Después de configurar, deberías ver:**

✅ **Cloudflare Dashboard:**
- Variable `PUBLIC_GA4_ID` visible en Settings
- Deployment exitoso con variable

✅ **Browser DevTools:**
- gtag.js cargado desde ~partytown
- Service Worker activo
- Console sin errores de Partytown

✅ **Google Analytics:**
- Real-Time muestra usuarios activos
- Page views registrados correctamente
- Country/device detectados

✅ **Lighthouse:**
- Performance score ≥ 90
- LCP < 2.5s
- TBT < 200ms
- Sin warnings de third-party scripts

---

## 🎯 Próximos Pasos (Opcional)

**1. Configurar Goals/Conversions en GA4:**
- Ir a GA4 → Events → Create event
- Definir conversiones (form submit, clicks, etc.)

**2. Conectar Google Tag Manager (GTM):**
- Si prefieres GTM para más control
- Usar variable: `PUBLIC_GTM_ID`
- Gestionar GA4 desde GTM

**3. Agregar más servicios:**
- Facebook Pixel: `PUBLIC_FACEBOOK_PIXEL_ID`
- Hotjar: `PUBLIC_HOTJAR_ID`
- LinkedIn: `PUBLIC_LINKEDIN_PARTNER_ID`

**4. Implementar Cookie Consent:**
- Banner de consentimiento GDPR
- Deshabilitar tracking hasta consentimiento
- Ver: `src/components/CookieConsent.astro` (futuro)

---

## 📚 Recursos

**Documentación del proyecto:**
- `README.md` → Sección "Scripts de Terceros con Partytown"
- `src/components/Analytics.astro` → Implementación completa
- `.env.example` → Todas las variables disponibles

**Documentación externa:**
- [Google Analytics 4 Setup](https://support.google.com/analytics/answer/9304153)
- [Partytown Docs](https://partytown.builder.io/)
- [Cloudflare Pages Env Vars](https://developers.cloudflare.com/pages/configuration/env-vars/)

---

## ✅ Checklist Final

- [ ] Variable `PUBLIC_GA4_ID` configurada en Cloudflare
- [ ] Git push realizado (deploy automático)
- [ ] gtag.js cargado en Network (Partytown)
- [ ] Real-Time muestra usuarios activos
- [ ] Lighthouse Performance ≥ 90
- [ ] Sin errores en Console
- [ ] Service Worker activo

**¡Listo para producción!** 🚀
