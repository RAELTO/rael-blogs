# NBOX — Neo Brutal Box

Red social de formato corto con estética **neobrutalist**: bordes gruesos, sombras duras, sin gradientes, sin radios. Los usuarios publican **drops** (posts) en 6 formatos distintos, interactúan con votos, reacciones emoji, comentarios y compartidos, y siguen a otros usuarios.

**Demo:** [n-box-dev.vercel.app](https://n-box-dev.vercel.app)

---

## Stack

| Capa | Tecnología |
|------|------------|
| Frontend | React 19, TypeScript, Vite 8 |
| Estilos | Tailwind CSS 4 + sistema de design tokens neobrutalist propio |
| Routing | React Router v7 |
| Estado servidor | TanStack Query v5 |
| Backend / Auth / Storage | Supabase (Postgres 15, Auth, Storage, RLS) |
| Deploy | Vercel |

---

## Funcionalidades

### Público (sin cuenta)
- Feed público con boxes de todos los tipos
- Permalink de box compartible — accesible sin login
- Vista de perfil de usuario
- Búsqueda full-text de boxes

### Autenticado
- Registro con confirmación de correo (8 chars, mayúscula, carácter especial)
- **Drops** en 6 tipos:
  - **Quick** — texto corto
  - **Media** — imagen o video (YouTube/Vimeo)
  - **Poll** — encuesta con hasta 4 opciones
  - **Mood** — texto grande sobre fondo de color
  - **Link** — tarjeta de enlace externo
  - **Thread** — lista numerada de puntos
- **Votos** — like / dislike independientes por box
- **Reacciones emoji** — 5 tipos (❤️ 😆 😮 😢 😠) independientes del voto
- **Comentarios** con filtros: cronológico / recientes / relevantes (por engagement)
- **Votos y reacciones en comentarios**
- **Compartir** — feed interno, WhatsApp, copiar enlace
- **Seguir** usuarios
- **Tags** compartidos entre usuarios (muchos-a-muchos)
- Editar perfil (nombre, username, bio, avatar)
- Eliminar drops propios

### Interfaz
- Responsive: mobile-first con bottom navigation bar en móvil
- 5 paletas de color + modo oscuro (TweakPanel)
- Notificaciones (dropdown + página completa)
- Modales via `ReactDOM.createPortal` para aislamiento de z-index

---

## Requisitos previos

- Node.js 20+
- Cuenta y proyecto en [Supabase](https://supabase.com)
- (Opcional) [Supabase CLI](https://supabase.com/docs/guides/cli) para gestión de migraciones local

---

## Instalación

Este repo incluye una `.npmrc` versionada con `ignore-scripts=true`. Esto bloquea hooks de instalación de dependencias (`preinstall`, `postinstall`, `prepare`, etc.), que son el vector principal de ataques supply-chain como Mini Shai-Hulud.

```bash
git clone <url-del-repositorio>
cd rael-blogs
npm ci
cp .env.example .env
# Editar .env con tus credenciales
```

Si una dependencia nueva necesita scripts de instalación, no habilites scripts globalmente. Primero revisa el cambio de `package.json` / `package-lock.json`, valida la fuente del paquete y ejecuta la instalación en una máquina o contenedor desechable.

### Variables de entorno

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

Encuéntralas en **Supabase → Project Settings → API**.

---

## Base de datos

El esquema completo está versionado en `supabase/migrations/`. Aplicar en orden:

```bash
supabase db push
```

> Reconstruye tablas, RLS, funciones e índices — no los datos ni las imágenes de Storage.

### Migraciones

| Timestamp | Archivo | Contenido |
|-----------|---------|-----------|
| 20260418042702 | `initial_schema` | Tablas core: profiles, tags |
| 20260418042719 | `rls_policies` | Políticas RLS base |
| 20260418042734 | `storage_policies` | Bucket `post-images` + políticas por carpeta |
| 20260418052011 | `seed_categories` | Categorías iniciales (legado) |
| 20260418054543 | `comments_likes_bookmarks` | Tablas de blog (legado, eliminadas en phase1) |
| 20260418191106 | `add_role_and_ban_to_profiles` | `role`, `is_banned` en profiles |
| 20260418191627 | `admin_delete_any_comment` | Política admin comentarios |
| 20260418191926 | `protect_role_and_ban_columns` | Bloquea auto-elevación de rol |
| 20260418212544 | `add_cover_type_to_posts` | Columna cover_type (legado) |
| 20260418230725 | `tags_insert_policy` | Usuarios autenticados crean tags |
| 20260419032936 | `search_posts_fulltext` | RPC search_posts (legado) |
| 20260419035240 | `admin_bypass_post_categories_tags` | Admin bypass tags (legado) |
| 20260507000000 | `admin_post_bypass` | Admin bypass posts (legado) |
| 20260507000001 | `fix_search_posts_security` | search_path en funciones |
| 20260507000002 | `enforce_ban_on_writes` | Ban en todas las writes |
| 20260507100000 | `nbox_phase1_schema` | **NBOX core**: boxes, box_tags, box_reactions, box_saves, box_comments, follows, is_banned(), search_boxes() |
| 20260508100000 | `nbox_social_tables` | **NBOX phase 2**: box_votes, box_shares, comment_votes, comment_reactions + RLS |
| 20260508100001 | `nbox_security_hardening` | Índices en FKs, storage listing fix, revoke search_boxes a anon |

### Storage

- **Bucket:** `post-images` (público)
- **Rutas:**
  - Portadas: `{user_id}/posts/{timestamp}.{ext}`
  - Avatares: `{user_id}/avatar/avatar.{ext}`

---

## Ejecución local

```bash
npm run dev        # http://localhost:5173
npm run build      # Build de producción
npm run preview    # Preview del build
```

---

## Análisis de rendimiento

### Scripts disponibles

| Script | Qué hace |
|--------|----------|
| `npm run analyze` | Build + abre `dist/bundle-report.html` con el treemap interactivo del bundle |
| `npm run perf` | Build + auditoría Lighthouse CI sobre el preview local |
| `npm run doctor` | Escaneo completo de React Doctor con salida detallada |
| `npm run doctor:score` | Score numérico de React Doctor |
| `npm run doctor:diff` | Escanea cambios contra `main` |

### Bundle analysis (`rollup-plugin-visualizer`)

```bash
npm run analyze
```

Genera `dist/bundle-report.html` y lo abre automáticamente en el navegador. Muestra un treemap interactivo con:
- Tamaño real, gzip y brotli de cada módulo
- Qué dependencias pesan más dentro de cada chunk
- Qué páginas lazy-loaded contienen qué código

Útil para detectar dependencias inesperadamente grandes, código duplicado entre chunks o módulos que deberían ser lazy pero no lo son.

### Lighthouse CI (`@lhci/cli`)

```bash
npm run perf
```

Levanta el servidor de preview, corre 2 rondas de Lighthouse sobre `/` y `/login`, y reporta:

| Métrica | Umbral (warn) |
|---------|---------------|
| LCP (Largest Contentful Paint) | < 4 000 ms |
| TBT (Total Blocking Time) | < 400 ms |
| CLS (Cumulative Layout Shift) | < 0.15 |
| FCP (First Contentful Paint) | < 3 000 ms |
| Performance score | ≥ 75 |
| Accessibility score | ≥ 85 |
| Best Practices score | ≥ 90 |
| SEO score | ≥ 80 |

Los umbrales están en modo `warn` — el comando no falla aunque no se cumplan. Ajustar a `error` en `lighthouserc.cjs` cuando haya una baseline estable.

Los resultados se suben automáticamente a [LHCI temporary storage](https://googlechrome.github.io/lighthouse-ci/docs/configuration.html#target) (gratis, disponibles 7 días) y el CLI imprime el enlace al finalizar.

### React DevTools Profiler

Sin instalación. Usar la extensión de navegador [React DevTools](https://react.dev/learn/react-developer-tools):

1. Abrir DevTools → pestaña **Profiler**
2. Grabar mientras se interactúa con el feed, modales o comentarios
3. Identificar componentes que renderizan más de lo necesario o tardan más de ~16 ms

Especialmente útil para detectar re-renders innecesarios en `BoxCard`, `CommentsModal` y `CommentItem` cuando el feed crece.

### `web-vitals` (pendiente)

No instalado aún. Agregar cuando haya un destino real para los datos (Plausible, PostHog, tabla en Supabase):

```bash
npm i --save-exact web-vitals
```

Mide LCP, CLS, INP, FCP y TTFB de usuarios reales en producción.

---

## Estructura del proyecto

```
src/
├── app/
│   └── router.tsx                  # Rutas públicas + RequireAuth wrapper
├── assets/
│   └── icons/                      # SVGs (NboxLogo, etc.)
├── components/
│   ├── auth/
│   │   └── RequireAuth.tsx          # Layout guard — redirige a /login con ?next=
│   ├── feed/
│   │   ├── BoxCard.tsx              # Card principal con votos, reacciones, comentarios, compartir
│   │   ├── CommentsModal.tsx        # Modal de comentarios (portal)
│   │   ├── CommentItem.tsx          # Comentario individual con votos y reacciones
│   │   ├── DropModal.tsx            # Modal creación de drop (6 tipos)
│   │   ├── ReactionsDetailModal.tsx # Detalle de quién reaccionó/votó
│   │   └── ShareModal.tsx           # Compartir: feed / WhatsApp / link
│   ├── layout/
│   │   ├── AppShell.tsx             # Grid 3 columnas
│   │   ├── Header.tsx               # Topbar con notificaciones
│   │   ├── LeftSidebar.tsx          # Nav + perfil
│   │   ├── NotificationsDropdown.tsx# Dropdown de notificaciones (portal)
│   │   └── RightSidebar.tsx         # Trending tags + sugerencias + contactos
│   └── ui/
│       ├── Avatar.tsx
│       ├── ImageUpload.tsx
│       ├── Toast.tsx                # Toast con duración configurable
│       └── TweakPanel.tsx           # Panel de paleta / sombras / modo oscuro
├── data/
│   └── notifications.ts            # Mock de notificaciones
├── features/
│   ├── auth/                        # AuthContext, useSignIn, useSignUp
│   ├── boxes/                       # useBoxes, useBox, useCreateBox, useDeleteBox
│   ├── comments/                    # useComments, useCommentVotes, useCommentReactions
│   ├── follows/                     # useFollows
│   ├── profile/                     # useProfile, useUpdateProfile
│   ├── reactions/                   # useReactions (emoji en boxes)
│   ├── shares/                      # useShares
│   └── votes/                       # useVotes (like/dislike en boxes)
├── lib/
│   ├── sanitize.ts                  # sanitizeText, sanitizeUrl, sanitizeTagName
│   ├── storage.ts                   # uploadCoverImage, uploadAvatarImage (con validación)
│   ├── supabase.ts                  # Cliente Supabase tipado
│   └── videoEmbed.ts                # YouTube/Vimeo URL → embed URL
├── pages/
│   ├── dashboard/
│   │   └── ProfilePage.tsx          # Editar perfil
│   └── public/
│       ├── BoxPage.tsx              # Permalink de box compartida
│       ├── ExplorePage.tsx
│       ├── LoginPage.tsx            # Login + registro + redirect ?next=
│       ├── NotificationsPage.tsx
│       └── TagPage.tsx
├── styles/
│   └── globals.css                  # Design system neobrutalist completo
└── types/
    └── database.ts                  # Tipos Supabase + interfaces de payload
```

---

## Seguridad

- **Instalación endurecida**: `.npmrc` bloquea scripts de dependencias durante `npm ci` / `npm install`
- **Lockfile obligatorio**: usar `npm ci` para instalar exactamente lo versionado en `package-lock.json`
- **RLS** habilitado en todas las tablas: los usuarios solo modifican su propio contenido
- **is_banned()** verificada en cada policy de escritura (boxes, comments, reactions, votes, follows)
- **`(select auth.uid())`** en policies para evitar re-evaluación por fila (auth_rls_initplan)
- **Sanitización de URLs**: `sanitizeUrl()` rechaza cualquier protocolo que no sea `http/https` — bloquea `javascript:` y similares
- **Validación de imágenes** en servidor y cliente: tipo MIME + tamaño máximo, ejecutada dentro de las funciones de subida
- **Storage listing** restringido: el SELECT en `storage.objects` solo permite al dueño ver sus propios archivos; las URLs públicas funcionan independientemente
- **Supabase JS** usa queries parametrizadas — sin riesgo de SQL injection
- La `anon key` es pública por diseño; la seguridad real está en RLS
- Errores de autenticación genéricos para evitar enumeración de usuarios

---

## Roadmap

- [ ] Notificaciones reales (Supabase Realtime)
- [ ] Sistema de menciones (@usuario)
- [ ] Follows funcionales + feed personalizado por following
- [ ] Rate limiting en writes (función Postgres pre-request o Edge Function)
- [ ] Separar `role` e `is_banned` del select público de profiles
- [ ] Chat / mensajes directos (Supabase Realtime en fase inicial)
