# NBOX — Claude Code Instructions

Red social neobrutalist. Stack: **React 19 · TypeScript · Vite 8 · Tailwind CSS 4 · Supabase · TanStack Query v5 · React Router v7 · Lucide React · Zod · React Hook Form**.

---

## Vocabulario del proyecto

| Evitar | Usar |
|--------|------|
| post / artículo | **box** / **drop** |
| publicar | **dropear** |
| amigos | **contactos** |
| likes solamente | **votos** (like/dislike) + **reacciones** (emoji) |

---

## Language

All UI text — labels, buttons, placeholders, headings, error messages, loading states, tooltips, and any other user-facing string — must be written in **English**.

This applies to all new code going forward. Existing Spanish strings are tracked in `TODO.md` for migration.

**NBOX-style decorators** remain as-is regardless of language rule:
- `▒ loading...` — texture on loading states
- `▸ Section` — title/section marker
- `✦` in special labels (`DROP ✦`)

---

## Reglas de código / Code Rules

### Iconos — usar Lucide React, nunca caracteres string

En botones, navegación y cualquier elemento interactivo usar siempre iconos de **Lucide React**, no caracteres unicode o emoji.

```tsx
// ❌ MAL
<button>← Volver</button>
<button>↺ Reenviar</button>
<button>⋮</button>

// ✅ BIEN
import { ArrowLeft, RefreshCw, MoreVertical } from 'lucide-react'
<button><ArrowLeft size={14} strokeWidth={2.5} /> Volver</button>
<button><RefreshCw size={14} strokeWidth={2.5} /> Reenviar</button>
<button><MoreVertical size={18} strokeWidth={2.5} /></button>
```

**Excepción permitida** — decoradores textuales del estilo NBOX:
- `▒ cargando...` — textura en estados de carga
- `▸ Sección` — marcador de título/sección
- `✦` en labels especiales (`DROPEAR ✦`)

### No duplicate components or logic

Before creating a component, hook, or utility, check if an equivalent already exists in the codebase. When the same UI pattern or logic appears in two places, extract it immediately into a single shared source of truth:

- **UI components**: extract to `src/components/ui/` or the relevant feature folder, add props for variation.
- **Data fetching**: extract to a shared hook in `src/features/<feature>/`.
- **Business logic**: extract to a utility function; never copy-paste.

Never duplicate JSX blocks or hook logic between files. If a component is copy-pasted with minor changes, it must be refactored into one parameterized component. The only valid reason for near-identical code to exist in two files is when the domains are genuinely incompatible and no clean abstraction exists — and that case is rare.

### Portales para modales y popovers

Todos los modales, dropdowns y popovers usan `ReactDOM.createPortal(…, document.body)` para aislamiento de z-index. No anidar overlays dentro de componentes con `overflow: hidden`.

### Notificaciones — triggers Postgres, nunca desde frontend

Las notificaciones se generan en triggers `SECURITY DEFINER` en Postgres. El frontend **nunca** inserta directamente en `public.notifications`. Los triggers cubren: `box_reactions`, `box_votes`, `box_comments`, `follows`, `contact_requests`, `box_shares`.

### Migraciones

Siempre crear un archivo `.sql` en `supabase/migrations/` con timestamp `YYYYMMDDHHMMSS_nombre.sql` al aplicar cambios de schema. Aplicar vía MCP (`mcp__supabase__apply_migration`) y también subir el archivo al repo.

### Seguridad

- `sanitizeUrl()` en `src/lib/sanitize.ts` para cualquier URL antes de guardar o renderizar en `href`.
- `validateImage()` en `src/lib/storage.ts` se llama internamente en `uploadCoverImage` y `uploadAvatarImage` — no llamarla de nuevo desde los componentes.
- Nunca insertar en `notifications` desde el cliente — solo los triggers lo hacen.

### Responsive

- Breakpoints: mobile ≤ 600px · tablet ≤ 960px · desktop > 960px.
- Popovers posicionados con `getBoundingClientRect()` deben clamparse al viewport.
- Modales con `padding: 24px` en overlay reducen a `10px` en mobile (clase `comments-modal-overlay`).

---

## Arquitectura de features

```
src/features/<feature>/
  use<Hook>.ts     — queries TanStack Query
  use<Mutation>.ts — mutations (separadas si son muchas)

src/pages/
  public/          — accesibles sin auth (/login, /box/:id, /reset-password)
  dashboard/       — requieren auth (envueltas en RequireAuth)

src/components/
  layout/          — Header, AppShell, LeftSidebar, RightSidebar
  feed/            — BoxCard, CommentsModal, DropModal, etc.
  ui/              — Avatar, Toast, ImageUpload, etc.
```

## DB — tablas principales

| Tabla | Propósito |
|-------|-----------|
| `boxes` | Contenido principal (6 tipos: quick/media/poll/mood/link/thread) |
| `box_votes` | Like / Dislike por box (separado de reacciones) |
| `box_reactions` | Reacciones emoji (loud❤️ fire😆 sharp😮 save😢 angry😠) |
| `box_comments` | Comentarios |
| `box_shares` | Compartidos |
| `contact_requests` | Solicitudes de contacto con estados |
| `contacts` | Contactos aceptados (par ordenado user_a < user_b) |
| `conversations` | Chats 1:1 (solo entre contactos) |
| `messages` | Mensajes de chat con Realtime habilitado |
| `notifications` | Notificaciones reales generadas por triggers |
| `follows` | Follows unidireccionales |

## Auth flow

- Login → `useSignIn`
- Registro → `useSignUp` + `/check-email`
- Recovery → `useSendRecovery` (modo forgot en LoginPage) → `/reset-password` → `useUpdatePassword`
- Rutas protegidas envueltas en `<RequireAuth>` (layout con `<Outlet />`)
- Redirect post-login vía `?next=` param

---

## Deploy

Vercel. Variables de entorno: `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
Demo: https://n-box-dev.vercel.app
