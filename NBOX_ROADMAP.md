# NBOX Roadmap

## Vision

NBOX (Neo Brutal Box) es una plataforma social con identidad neobrutalista fuerte. No es un blog ni una red social generica: es una experiencia modular, visual y directa donde las publicaciones se llaman Boxes y publicar se llama Drop.

> Neo Brutal Box: a brutal social space for posts, people, and messages.

**Stack:** React 19 · TypeScript · Vite 8 · Tailwind CSS 4 · Supabase · TanStack Query v5 · React Router v7 · Lucide React · Zod · React Hook Form

---

## Estado actual — Mayo 2026

> El roadmap original quedó desactualizado. Este documento refleja el estado real del proyecto.

---

## ✅ COMPLETADO

### Infraestructura
- [x] RLS correcto en todas las tablas; policies admin; `is_banned` enforced en DB
- [x] Supply-chain security: `.npmrc` con `min-release-age=7`
- [x] Auth completo: sign in / sign up / password recovery / email confirmation
- [x] Rutas protegidas (`RequireAuth`), redirect `?next=`
- [x] Validación de env vars en `supabase.ts`
- [x] Migraciones ordenadas en `supabase/migrations/`

### Layout y shell
- [x] AppShell 3 columnas (LeftSidebar | content | RightSidebar)
- [x] LeftSidebar: profile snippet, nav links, contacts list (tablet), sign out con confirm
- [x] RightSidebar: trending tags, suggested contacts, presence indicators
- [x] Header: brand NBOX, search global, notificaciones dropdown, avatar, Drop button
- [x] Mobile bottom bar (≤820px): Home / Explore / Drop / Notifs / Yo
- [x] `/yo` MenuPage: acceso rápido a Saved, Contacts, Groups (stub)
- [x] Responsive full (mobile ≤600 / tablet ≤960 / desktop >960)

### Drops (boxes)
- [x] 6 tipos: Quick · Media · Poll · Mood · Link · Thread
- [x] DropModal: selector de tipo + formulario por tipo
- [x] ComposerCard en feed
- [x] ModeSelector: For You | Following | Fresh | Loud
- [x] BoxCard: head (avatar, nombre, @user, tiempo, admin badge, menú), body por tipo, tags, stats, actions
- [x] Votos (like/dislike) separados de reacciones emoji
- [x] Reacciones emoji: ❤️ 😆 😮 😢 😠 (popover)
- [x] Comentarios (CRUD, con votos y reacciones propios)
- [x] Share modal: share to feed, copy link, WhatsApp
- [x] Save / unsave (toggle desde el menú del card)
- [x] Delete propio drop (con confirm dialog)
- [x] Delete admin de cualquier drop/comentario
- [x] StoriesRail decorativo (sin backend)

### Interacciones unificadas
- [x] ActivityModal unificado: tabs All / Likes / Reactions, admin badge, usado en BoxCard y comments
- [x] CommentItem: reacciones emoji sin like/dislike (esos van inline), confirm en delete
- [x] ConfirmDialog global (`useConfirm`) — cubre delete box, delete comment, unsave, remove contact, sign out

### Saved
- [x] SavedPage: sidebar (desktop), mobile layout con back + tabs filtro + collections stub
- [x] SavedCard: thumbnail, To collection, Share, menú 3-dots (Remove from saved)
- [x] SavedPostModal: compact box preview, comentarios, votos/reacciones al drop, activity count

### Contacts
- [x] Contact requests: send, accept, decline, cancel
- [x] Contacts list con presencia online/offline
- [x] ContactsPage: tabs Received / Sent / Suggestions / All contacts
- [x] Suggested contacts (basado en follows mutuos)
- [x] Chat directo desde contacto (FloatingChatPanel)

### Inbox / Chat
- [x] InboxPage: lista de conversaciones + thread activo
- [x] Mensajes realtime (Supabase Realtime)
- [x] FloatingChatPanel: hasta 3 ventanas simultáneas ancladas a la derecha
- [x] MessageNotifier: notif de nuevo mensaje en cualquier página

### Notifications
- [x] Triggers Postgres generan notificaciones (box_reactions, box_votes, box_comments, follows, contact_requests, box_shares)
- [x] NotificationsPage con filtros (All / Unread / Contacts / Reactions / Votes / Comments / Shares)
- [x] NotificationsDropdown en header
- [x] NotifNotifier: badge realtime en cualquier página

### Profiles
- [x] UserProfilePage pública: avatar, display name, @username, bio, boxes del usuario
- [x] ProfilePage propia (`/my-box`): editar avatar, nombre, username, bio
- [x] Admin badge visible en perfil y en feed

### Explore / Search
- [x] Búsqueda global de boxes y personas
- [x] SearchPeopleResults con botón Add contact / Message
- [x] TagPage: feed de boxes por tag
- [x] RightSidebar: trending tags dinámicos

### Admin
- [x] Rol admin (`profiles.role = 'admin'`)
- [x] AdminBadge en todas las superficies
- [x] Policies DB: admin puede borrar cualquier box y comentario
- [x] `useIsAdmin` hook en frontend

---

## 🔶 PARCIALMENTE COMPLETADO

### Perfil de usuario
- [x] Ver boxes propias en perfil público
- [ ] Estadísticas (boxes count, followers, following) — columnas en DB planificadas, no expuestas en UI
- [ ] Follow / Unfollow desde perfil ajeno — DB `follows` existe, falta botón en `UserProfilePage`
- [ ] Tabs en perfil: Boxes | Media | Saves | About
- [ ] Pinned box en perfil
- [ ] Sección "About" con links y fecha de unión

### Inbox
- [ ] Búsqueda de conversaciones (input existe, no está conectado)
- [ ] Indicador de mensaje leído / no leído en lista de conversaciones
- [ ] Adjuntos, emojis, llamadas — stubs "coming soon"

### Notificaciones
- [ ] Marcar como leído (individual y "mark all read")
- [ ] Menciones `@usuario` en boxes y comentarios

### Saved
- [ ] Collections backend — tabla + UI completa (actualmente "coming soon")

### Poll Box
- [ ] Votación interactiva en poll (barra de % + acción de votar) — el tipo existe, la interacción es visual stub

---

## 🔲 PENDIENTE

### English migration (TODO.md)
- [ ] ~15 archivos con strings en español — inventario completo en `TODO.md`
- Prioridad alta: `LoginPage`, `ComposerCard`, `DropModal`, `BoxCard`, `LeftSidebar`
- Prioridad media: `CommentsModal`, `ShareModal`, `NotificationsPage`, `ContactsPage`
- Prioridad baja: `ProfilePage`, `CheckEmailPage`, `ResetPasswordPage`

### Follows
- [ ] Botón Follow / Unfollow en `UserProfilePage`
- [ ] Feed "Following" (ya existe el modo en ModeSelector pero requiere datos reales)
- [ ] Followers / Following count expuestos en perfil

### Admin panel
- [ ] Página `/admin` protegida por rol
- [ ] Listar usuarios + ban/unban
- [ ] Ver reportes
- [ ] Métricas básicas (boxes/día, usuarios activos)

### Moderación
- [ ] Reportar box o usuario
- [ ] Bloquear / ocultar usuario

### Features sociales
- [ ] Post notifications ("Turn on notifications" en menú box — actualmente "coming soon")
- [ ] Nested comments (responder a un comentario) — actualmente flat
- [ ] Pinned comment por el autor
- [ ] Compartir drop directamente a un contacto (DM)

### Groups (Fase futura)
- [ ] Tabla `groups`, `group_members`, `group_boxes`
- [ ] GroupPage: feed de boxes del grupo
- [ ] Invitar contactos a un grupo

### Stories (Fase futura)
- [ ] Backend: tabla `stories`, expiración 24h
- [ ] StoriesRail funcional (actualmente decorativo)
- [ ] Vista fullscreen con timer

### Memories (Fase futura)
- [ ] "On this day" desde boxes antiguas del usuario

---

## Próximos pasos sugeridos (orden de impacto)

1. **English migration** — Bloquea lanzamiento público; inventario en `TODO.md`
2. **Follow / Unfollow en UserProfilePage** — Core social feature ausente
3. **Poll voting interactivo** — Los polls se crean pero no se puede votar
4. **Mark notifications as read** — UX básica pendiente
5. **Followers/Following count en perfil** — Dato ya en DB (`follows`), falta en UI
6. **Saved Collections backend** — Arquitectura de tabla simple, impacto alto en Saved UX
7. **Admin panel** — Necesario antes del lanzamiento real

---

## Notas técnicas

- Auth: email/password via Supabase (sin OAuth por ahora)
- Imágenes: Supabase Storage, bucket `post-images`
- Notificaciones: solo via triggers Postgres `SECURITY DEFINER` — nunca desde el cliente
- Rutas: `/yo` (MenuPage mobile), `/saves`, `/contacts`, `/nbox`, `/my-box`, `/profile/:username`, `/box/:id`
- z-index stack: modal overlay = 10000, popovers sobre modal = 10100+, ActivityModal = 10200
- Mobile bar: `≤820px`; saved sidebar oculto: `≤1260px`
- `overflow-x: hidden` solo en `html`, nunca en `body` (rompe `position: sticky`)
