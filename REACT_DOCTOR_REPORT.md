# React Doctor — Reporte de análisis

**Herramienta:** react-doctor v0.1.6  
**Score:** 71/100 — "Needs work"  
**Diagnósticos:** 347 total (3 errores · 344 warnings)  
**Fecha:** 2026-05-27

---

## Resumen por categoría

| Categoría | Count |
|-----------|-------|
| Accessibility | 142 |
| Architecture | 111 |
| Dead Code | 41 |
| Performance | 27 |
| State & Effects | 13 |
| Correctness | 8 |
| TanStack Query | 4 |
| Security | 1 |

---

## 🔴 ERRORES — Arreglar ahora (3)

### `effect-needs-cleanup` — Subscription leaks

Tres `useEffect` suscriben a canales Supabase Realtime pero nunca retornan cleanup. La suscripción se acumula en cada re-render y persiste tras el unmount → memory leak real.

**Archivos afectados:**
- `src/features/chat/useMessages.ts:24`
- `src/components/notifications/NotifNotifier.tsx:14`
- `src/components/chat/MessageNotifier.tsx:23`

**Fix:** Cada `useEffect` debe retornar la función de cleanup:
```ts
useEffect(() => {
  const channel = supabase.channel(...).subscribe()
  return () => { supabase.removeChannel(channel) }
}, [...deps])
```

---

## 🟠 ALTA PRIORIDAD — Correctness y datos

### `no-array-index-as-key` — Keys inestables (8 ocurrencias)

Usar el índice del array como `key` en React rompe la reconciliación cuando la lista se reordena o filtra.

**Archivos:**
- `src/components/feed/SavedPostModal.tsx:129,137` — items de poll y thread
- `src/components/feed/DropModal.tsx:409,456` — opciones de poll y thread
- `src/components/feed/BoxCard.tsx:100,121` — contenido de poll y thread
- `src/components/feed/ActivityModal.tsx:108` — lista de actividad

**Fix:** Usar texto único como key donde no hay ID:
```tsx
// Mal
{options.map((opt, index) => <span key={index}>{opt.text}</span>)}
// Bien
{options.map((opt) => <span key={opt.text}>{opt.text}</span>)}
```

---

### `query-mutation-missing-invalidation` — Mutaciones sin invalidar cache (4)

Cuatro mutaciones en `useContactMutations.ts` no llaman `queryClient.invalidateQueries` tras ejecutarse. La UI puede mostrar datos stale después de aceptar/rechazar/cancelar solicitudes.

**Archivo:** `src/features/contacts/useContactMutations.ts:15,29,45,74`

**Fix:** Agregar `onSuccess` con invalidación en cada `useMutation`:
```ts
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: ['contact-requests', userId] })
  queryClient.invalidateQueries({ queryKey: ['contacts', userId] })
}
```

---

## 🏗 ARCHITECTURE — Diagnóstico completo (111 warnings)

### `no-inline-exhaustive-style` — Inline styles masivos (73 ocurrencias) ⚠️ Mayor problema

El problema más frecuente del proyecto. Objetos `style={{ }}` con 8–17 propiedades inline en lugar de clases CSS. Impacto:
- Nueva referencia de objeto en cada render → potenciales re-renders innecesarios
- Imposible de sobreescribir desde CSS (especificidad inline gana siempre)
- Dificulta theming, responsive, dark mode
- Código ilegible en componentes ya largos

**Archivos con mayor concentración:**

| Componente | Ocurrencias | Líneas problemáticas |
|-----------|------------|----------------------|
| `src/components/feed/DropModal.tsx` | 14 | :157, :167, :197, :229, :284, :314, :327, :343, :388, :434, :486, :544, :560 |
| `src/components/feed/CommentsModal.tsx` | 7 | :102, :117, :128, :144, :191, :208, :230 |
| `src/pages/dashboard/InboxPage.tsx` | 6 | :52, :72, :147, :188, :239, :327 |
| `src/components/feed/CommentItem.tsx` | 5 | :148, :163, :193, :210, :225 |
| `src/components/feed/ActivityModal.tsx` | 5 | :48, :52, :81, :125, :130 |
| `src/components/feed/SavedPostModal.tsx` | 5 | :229, :238, :248, :253, :270 |
| `src/components/layout/NotificationsDropdown.tsx` | 4 | :48, :143, :161, :186 |
| `src/pages/public/NotificationsPage.tsx` | 4 | :63, :96, :156, :182 |
| `src/components/feed/ShareModal.tsx` | 5 | :109, :131, :143, :181, :193 |
| `src/components/ui/AdminBadge.tsx` | 1 | :3 — 13 propiedades (candidato prioritario) |
| `src/components/ui/ConfirmDialog.tsx` | 1 | :24 — 8 propiedades |
| Otros | ~16 | `LoginPage`, `BoxPage`, `ContactsPage`, `ProfilePage`, `CheckEmailPage`, `ResetPasswordPage`, `UserProfilePage`, `MobileSearchOverlay`, `FloatingChatPanel`, `AppearanceModal`, `router.tsx` |

**Enfoque de migración:** Mover a clases en `globals.css` usando el sistema de naming ya establecido en el proyecto (`.saved-card`, `.box-head`, etc.). No usar Tailwind utilities — el proyecto ya usa CSS custom con variables.

```tsx
// Antes
<div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 16px',
  fontFamily: 'var(--font-mono)', fontSize: 11, fontWeight: 800, ... }}>

// Después
<div className="admin-badge">   {/* clase en globals.css */}
```

---

### `no-z-index-9999` — Z-index sin escala definida (10 ocurrencias)

El stacking context existe y funciona, pero los valores son ad-hoc y difíciles de razonar:

| Valor | Componente | Archivo |
|-------|-----------|---------|
| 200 | SavedCard dropdown menu | `src/pages/dashboard/SavedPage.tsx:99` |
| 300 | DropModal overlay | `src/components/feed/DropModal.tsx:158` |
| 9000 | ShareModal, NotificationsDropdown, AppearanceModal, CommentsModal | varios |
| 9999 | ConfirmDialog | `src/components/ui/ConfirmDialog.tsx:25` |
| 10100 | CommentItem reaction popover | `src/components/feed/CommentItem.tsx:211` |
| 10200 | ActivityModal | `src/components/feed/ActivityModal.tsx:48` |
| 10300 | SavedPostModal reaction popover | `src/components/feed/SavedPostModal.tsx:253` |

**Fix:** Definir una escala en variables CSS y usarla en todos los componentes:

```css
/* En globals.css */
:root {
  --z-dropdown:   100;
  --z-sticky:     200;
  --z-modal:      300;
  --z-overlay:    400;   /* modal overlay */
  --z-popover:    500;   /* popovers sobre modal */
  --z-toast:      600;
  --z-confirm:    700;
}
```

```tsx
// En componentes
style={{ zIndex: 'var(--z-modal)' }}
```

---

### `no-giant-component` — Componentes demasiado grandes (3)

| Componente | Líneas reales | Archivo |
|-----------|--------------|---------|
| `DropModal` | **536** | `src/components/feed/DropModal.tsx` |
| `RichEditor` | **374** | `src/components/ui/RichEditor.tsx` (no usado — candidato a eliminar) |
| `BoxCard` | **331** | `src/components/feed/BoxCard.tsx` |

**DropModal (536 líneas):** Un `switch` implícito sobre `boxType` que renderiza formularios completamente distintos. Extraer:
```
DropModal/
  DropModal.tsx          — shell: tipo selector + header + submit
  forms/QuickForm.tsx    — texto libre
  forms/MediaForm.tsx    — imagen/video
  forms/PollForm.tsx     — opciones
  forms/MoodForm.tsx     — color picker
  forms/LinkForm.tsx     — URL preview
  forms/ThreadForm.tsx   — items numerados
```

**BoxCard (331 líneas):** Mezcla rendering, hover state, modales y menú de opciones. Extraer:
```
BoxCard.tsx              — orquestador
BoxContent.tsx           — renderiza según box.type
BoxActions.tsx           — like, react, comment, share
BoxMenu.tsx              — menú 3-dots (save, notif, delete)
```

---

### `design-no-three-period-ellipsis` — `...` tipográfico (16 ocurrencias)

Usar tres puntos `...` en texto JSX en lugar del carácter tipográfico `…`. Fix mecánico, bajo riesgo.

**Archivos:** `BoxPage.tsx:52`, `HomePage.tsx:92`, `TagPage.tsx:66`, `ResetPasswordPage.tsx:93`, `SearchPeopleResults.tsx:119`, `RequireAuth.tsx:11`, `InboxPage.tsx:260`, `router.tsx:23`, `CommentsModal.tsx:156`, `ActivityModal.tsx:102`, `UserProfilePage.tsx:37,96`, `SavedPostModal.tsx:277`, `SavedPage.tsx:205`, `ProfilePage.tsx:71`

> Nota: el decorador NBOX `▒ loading...` es intencional — **no cambiar**.

---

### `no-react19-deprecated-apis` — `useContext` → `use()` (5 archivos)

React 19 introduce `use(Context)` como reemplazo de `useContext`. Permite leer contexto condicionalmente dentro de hooks, ramas y loops.

**Archivos:**
- `src/features/chat/FloatingChatContext.tsx`
- `src/features/presence/RealtimePresenceContext.ts`
- `src/components/ui/Toast.tsx`
- `src/components/ui/ConfirmContext.ts`
- `src/features/auth/AuthContext.tsx`

**Fix:**
```ts
// Antes
import { useContext } from 'react'
const ctx = useContext(MyContext)
// Después
import { use } from 'react'
const ctx = use(MyContext)
```

---

### `no-giant-component` — Componentes demasiado grandes (3)

| Componente | Líneas | Archivo |
|-----------|--------|---------|
| `RichEditor` | 374 | `src/components/ui/RichEditor.tsx` |
| `DropModal` | ~430 | `src/components/feed/DropModal.tsx` |
| `BoxCard` | ~400 | `src/components/feed/BoxCard.tsx` |

**Recomendación:**
- `DropModal`: extraer cada tipo de box a su propio sub-componente (`QuickForm`, `MediaForm`, `PollForm`, etc.)
- `BoxCard`: extraer `BoxContent`, `BoxActions`, `BoxMenu` como componentes separados
- `RichEditor`: no está siendo usado actualmente (ver Dead Code) — candidato a eliminar

---

### `prefer-useReducer` — Múltiples `useState` relacionados (4 componentes)

Componentes con 5+ `useState` que gestionan estado interrelacionado deberían usar `useReducer`.

**Archivos:**
- `src/pages/public/ResetPasswordPage.tsx:8` — 5 estados de formulario
- `src/pages/public/LoginPage.tsx:12` — múltiples estados de auth
- `src/components/feed/DropModal.tsx:44` — estados del compositor
- `src/components/feed/BoxCard.tsx:162` — estados de interacción

---

### `no-cascading-set-state` — Múltiples setState en un useEffect (2)

3 llamadas `setState` secuenciales dentro de un solo `useEffect` → múltiples re-renders. Consolidar con `useReducer`.

**Archivos:**
- `src/pages/public/ResetPasswordPage.tsx:26`
- `src/features/auth/AuthContext.tsx:18`

---

### `no-derived-useState` — Estado derivado de prop (1)

`useState` inicializado desde la prop `initialType` en `DropModal`. Si la prop cambia, el estado no se actualiza.

**Archivo:** `src/components/feed/DropModal.tsx:50`

**Fix:** Calcular directamente en render en vez de almacenar en estado, o usar `useEffect` para sincronizar si el prop puede cambiar.

---

### `no-effect-event-handler` — useEffect simulando handler (1)

Un `useEffect` en `ProfilePage` hace trabajo que debería estar en un event handler directamente.

**Archivo:** `src/pages/dashboard/ProfilePage.tsx:40`

---

### `prefer-use-effect-event` — Callback leído dentro de addEventListener (2)

`onClose` se lee dentro de un `addEventListener` — wrappear con `useEffectEvent` para evitar que el efecto se re-sincronice en cada render del padre.

**Archivos:**
- `src/components/ui/AppearanceModal.tsx:56`
- `src/components/layout/NotificationsDropdown.tsx:125`

---

## 🟡 MEDIA PRIORIDAD — Performance

### `js-batch-dom-css` — Asignaciones inline secuenciales (10 ocurrencias)

Múltiples `element.style.X = ...` seguidos en hover/leave handlers causan reflows innecesarios. Usar `cssText` o clases CSS.

**Archivos:**
- `src/components/layout/LeftSidebar.tsx:158–165` (contact hover en sidebar tablet)
- `src/components/layout/RightSidebar.tsx:176–183` (contact hover en right sidebar)
- `src/pages/dashboard/InboxPage.tsx:82–83`

**Fix:**
```ts
// Mal
el.style.background = 'var(--accent-2)'
el.style.transform = 'translate(-1px, -1px)'
el.style.boxShadow = '3px 3px 0 var(--ink)'
// Bien
el.style.cssText = 'background:var(--accent-2);transform:translate(-1px,-1px);box-shadow:3px 3px 0 var(--ink)'
// O mejor: usar className toggle con CSS hover
```

---

### `js-combine-iterations` — `.filter().map()` doble pasada (8 ocurrencias)

Chains `.filter().map()` iteran el array dos veces. Usar `.reduce()` o `for...of` para una sola pasada.

**Archivos:** `TagPage.tsx`, `Header.tsx`, `DropModal.tsx`, `useBoxSaves.ts`, `BoxCard.tsx`, `sanitize.ts`, `CommentItem.tsx`

---

### `js-tosorted-immutable` — Spread innecesario antes de `.sort()` (2)

`[...array].sort()` crea un nuevo array para evitar la mutación. ES2023 tiene `.toSorted()` que hace esto nativamente.

**Archivos:**
- `src/features/presence/RealtimePresenceProvider.tsx:84`
- `src/features/presence/usePresence.ts:90`

---

### `async-await-in-loop` — await secuencial en loop (1)

`await` dentro de un `for...of` ejecuta las operaciones secuencialmente en vez de en paralelo.

**Archivo:** `src/features/boxes/useBoxes.ts:141`

**Fix:**
```ts
// Mal
for (const item of items) { await doSomething(item) }
// Bien
await Promise.all(items.map(item => doSomething(item)))
```

---

## ♿ BAJA PRIORIDAD — Accessibility (selectivos)

> Nota: muchos warnings de `no-tiny-text` (65) son por texto mono de 10–11px en metadata/chips del diseño neobrutalist. Son intencionales y se listan aquí solo los que merecen revisión.

### Problemas reales de accesibilidad

| Rule | Descripción | Archivo |
|------|-------------|---------|
| `anchor-is-valid` | `<a>` sin `href` | `src/pages/public/LoginPage.tsx:286` |
| `iframe-has-title` | `<iframe>` sin atributo `title` | `src/components/feed/BoxCard.tsx:64` |
| `no-outline-none` | `outline: none` sin alternativa `:focus-visible` | `src/pages/dashboard/InboxPage.tsx:179` |
| `design-no-vague-button-label` | Botones con label "OK" | `src/components/ui/RichEditor.tsx:405,443` |
| `click-events-have-key-events` | 28 `<div>` con `onClick` sin keyboard handler | Varios archivos |

**Para los `<div onClick>` (28 ocurrencias):** Cambiar a `<button>` donde sea posible, o agregar `onKeyDown` + `role="button"` + `tabIndex={0}`.

### `label-has-associated-control` (12 ocurrencias)
Inputs sin `<label>` asociado o con label desconectado. Usar `htmlFor` + `id` o wrappear con `<label>`.

---

## 🗑 DEAD CODE — Limpiar

### Archivos completamente sin uso (candidatos a eliminar)

| Archivo | Nota |
|---------|------|
| `src/App.css` | Estilos del proyecto blog original, ya no se usa |
| `src/data/notifications.ts` | Data estática de notificaciones mock |
| `src/components/auth/AdminOnly.tsx` | Wrapper de admin no usado (reemplazado por `useIsAdmin`) |
| `src/components/auth/ProtectedRoute.tsx` | Reemplazado por `RequireAuth` |
| `src/components/layout/AppLayout.tsx` | Layout del blog original |
| `src/components/layout/Footer.tsx` | Footer del blog original |
| `src/components/ui/Chip.tsx` | Componente no usado en ningún lugar |
| `src/components/ui/Icon.tsx` | Wrapper de iconos, reemplazado por Lucide directo |
| `src/components/ui/RichEditor.tsx` | Editor de texto enriquecido no integrado |
| `lighthouserc.cjs` | Config de lighthouse, no relevante al proyecto actual |

### Exports sin usar (candidatos a remover o usar)

| Export | Archivo |
|--------|---------|
| `updateFavicon` | `src/components/ui/tweaks.ts` |
| `deleteImage` | `src/lib/storage.ts` |
| `useContactStatus` | `src/features/contacts/useContactRequests.ts` |
| `useMarkOneRead` | `src/features/notifications/useNotifications.ts` ⚠️ Pendiente de implementar |
| `slugify`, `readTime`, `formatDate`, `categoryColor` | `src/lib/utils.ts` (legacy blog) |
| `sanitizeTagName`, `parseTagNames` | `src/lib/sanitize.ts` |

### Tipos sin usar (en `src/types/database.ts` y otros)

`Json`, `Tag`, `BoxTag`, `BoxReaction`, `BoxSave`, `BoxComment`, `Follow`, `ContactRequest`, `Contact`, `RequestStatus`, `PollOption` — tipos de DB exportados pero no importados directamente (probablemente usados via inferencia, verificar antes de eliminar).

---

## ⚠️ SEGURIDAD

### `no-secrets-in-client-code` — Falso positivo

**Archivo:** `src/components/feed/BoxCard.tsx:185`  
La constante `AUTH_TOAST` es una cadena de texto (mensaje de toast), no un secreto. **No requiere acción.**

---

## Plan de acción sugerido

### Sprint 1 — Bugs reales ✅ COMPLETADO
1. ~~Corregir los 3 subscription leaks~~ — ya tenían cleanup correcto
2. ✅ Corregir las 8 keys con índice de array (`BoxCard`, `ActivityModal`, `SavedPostModal`, `DropModal` con IDs estables via `crypto.randomUUID()`)
3. ~~Agregar `invalidateQueries` a las 4 mutaciones de `useContactMutations`~~ — ya tenían `invalidateContacts()` correcto
4. ✅ `<iframe>` en BoxCard: agregado `title="Video player"`
5. ✅ `<a>` sin href en LoginPage: corregido con `href="#"` + `e.preventDefault()`

### Sprint 2 — Dead code ✅ COMPLETADO
6. ✅ Eliminados: `App.css`, `AppLayout.tsx`, `Footer.tsx`, `AdminOnly.tsx`, `ProtectedRoute.tsx`, `Chip.tsx`, `Icon.tsx`, `data/notifications.ts`, `lighthouserc.cjs`
7. ✅ Eliminado `RichEditor.tsx`
8. Pendiente: limpiar exports sin uso en `utils.ts` y `sanitize.ts` (legacy blog)

### Sprint 3 — Architecture ✅ COMPLETADO
9. ✅ Escala z-index en CSS variables (`--z-dropdown`, `--z-drop-modal`, `--z-modal`, `--z-confirm`, `--z-popover`, `--z-activity`, `--z-popover-2`) aplicada en 10 componentes
10. ✅ `...` → `…` en UI text (`BoxCard`, `ComposerCard`, `LoginPage`, `ResetPasswordPage`, `ShareModal`, `InboxPage`, `SavedPostModal`, `SavedPage`, `SearchPeopleResults`) — decoradores NBOX intactos
11. ✅ `useContext` → `use()` en 5 archivos de contexto (React 19)
12. Batch DOM sidebars — no cambia comportamiento real (browsers batch 3 assignments sincrónicas); omitido
13. `no-derived-useState` en `DropModal` — pendiente Backlog
14. ✅ `async-await-in-loop` en `useBoxes.ts` → `Promise.all`
15. ✅ `.toSorted()` en `RealtimePresenceProvider` y `usePresence`

### Sprint 4 — Inline styles (refactor progresivo, mayor impacto en score) ✅ COMPLETADO
- ✅ `AdminBadge.tsx` → clase `.admin-badge` en globals.css (13 props → 1 clase)
- ✅ `ConfirmDialog.tsx` → clases `.confirm-overlay/panel/eyebrow/title/message/actions`
- ✅ `ActivityModal.tsx` → clases `.activity-*` (overlay, panel, header, tabs, list, rows, badges)
- ✅ `NotificationsDropdown.tsx` → clases `.notif-dropdown-*` y `.notif-item`
- ✅ `CommentsModal.tsx` → clases `.comments-modal-header/title`, `.comments-sort-bar/label/btn/clear`, `.comments-list/loading/empty-state`, `.comments-composer/wrap/textarea/send`
- ✅ `CommentItem.tsx` → clases `.comment-row/body/bubble/head/author/delete-btn/content/actions/time/vote-btn/react-trigger/label/activity-btn/react-popover/react-btn`
- ✅ `SavedPostModal.tsx` → clases `.saved-vote-btn`, `.saved-react-trigger-btn/popover/option`
- ✅ `ShareModal.tsx` → clases `.share-panel/header/title/option-btn/icon/body/label/desc/chevron/compose-area/textarea/footer/submit`
- ✅ `InboxPage.tsx` → clases `.sq-avatar`, `.inbox-action-btn` (CSS hover — sin JS handlers), `.chat-new-btn/list-loading/list-empty/first-msg/msg-row/input-field/send-btn`, `.presence-dot`, `.chat-empty-state/icon/title/sub`
- ✅ `BoxCard.tsx` → clases `.box-media-wrap/iframe/img`, `.box-link-desc`, `.box-avatar-link`, `.box-stats-emojis/emoji/more/count`; removidos `style={{ position: 'relative' }}` redundantes en `.box-action`
- ✅ `DropModal.tsx` → eliminados `BORDER/SHADOW/FONT_*` constants y `labelStyle/inputStyle/textareaStyle` JS objects; clases `.drop-overlay/panel/header/title/close-btn/body/field-label/input/textarea/type-grid/type-card/media-tabs/tab/preview-wrap/img/remove/dropzone/stripes/label/video-preview/error/mood-colors/swatch/options-col/item-row/remove-btn/thread-remove-btn/add-btn/thread-num/tags-preview/footer/cancel-btn/submit-btn`

### Backlog — Nice to have
- `prefer-useReducer` en `DropModal`, `LoginPage`, `ResetPasswordPage`
- `useEffectEvent` en `AppearanceModal` y `NotificationsDropdown`
- `no-derived-useState` en `DropModal:50` (prop `initialType` → state directo)
- Keyboard accessibility en `<div onClick>` → `<button>` o `role="button"`
- `outline: none` en InboxPage → `:focus-visible`
- Limpiar exports sin uso en `utils.ts` y `sanitize.ts` (legacy blog)

---

## Falsos positivos confirmados

| Rule | Diagnóstico | Razón |
|------|-------------|-------|
| `no-secrets-in-client-code` | `AUTH_TOAST` en BoxCard | Es un string de toast, no un secret |
| `no-tiny-text` (65) | Texto 10–11px en metadata/chips | Intencional: diseño neobrutalist Space Mono |
| `no-wide-letter-spacing` | `letter-spacing: 0.10–0.20em` | Intencional: estilo neobrutalist en labels |
| `design-no-em-dash-in-jsx-text` | Em dash en DropModal | Evaluar — puede ser intencional en UI |

---

*Generado con react-doctor v0.1.6 + análisis manual de falsos positivos*
