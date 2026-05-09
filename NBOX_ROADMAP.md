# NBOX Roadmap

## Vision

NBOX (Neo Brutal Box) es una plataforma social con identidad neobrutalista fuerte. No es un blog ni una red social generica: es una experiencia modular, visual y directa donde las publicaciones se llaman Boxes y publicar se llama Drop.

> Neo Brutal Box: a brutal social space for posts, people, and messages.

---

## Identidad

**Nombre:** NBOX | **Variantes graficas:** N-Box / N.BOX / [N]BOX
**Significado:** Neo + Brutal + Box (caja, modulo, post, perfil, mensaje)
**Dominio considerado:** n-box.app

**Vocabulario:**

| Termino | Significado |
|---|---|
| Box | Publicacion / post |
| Drop | Acto de publicar ("dropear") |
| Quick Drop | Box de texto corto |
| Media Box | Box con imagen o video |
| Poll Box | Box de encuesta |
| Mood Box | Box con fondo de color grande |
| Link Box | Box con URL y preview |
| Thread Box | Box de hilo numerado |
| My Box | Perfil propio |
| NBOX / Inbox | Mensajeria privada |
| Loud | Contenido con alta actividad |
| Fresh Drops | Publicaciones nuevas |
| Pinned Box | Box destacada en perfil |
| Box Collections | Guardados organizados |
| Bold/Loud/Fire/Sharp/Save | Tipos de reaccion (reemplazan al like) |

---

## Principios

- Neobrutalismo como identidad, no decoracion.
- Crecer por fases sin sobredisenar.
- Sin categorias (organizacion por tags y follows).
- Feed primero, chat despues.
- Mobile-responsive desde el inicio.

---

## Diseno (sistema compartido con el prototipo)

**Fuentes:** Archivo Black (display) + Space Grotesk (body) + Space Mono (mono)
**Fondo:** `#f5f0e6` (beige) con dot-grid 22px
**Bordes:** `3px solid #111`
**Sombras:** hard offset (4-10px negro, sin blur)
**Border-radius:** 0 (cero redondeo)
**Hover:** translate(-2px, -2px) + shadow mas grande
**Active:** translate(+2px, +2px) + shadow colapsada

**Paletas** (via `data-palette`):
- `coral` (default): rojo / amarillo / cyan
- `electric`: magenta / cyan / amarillo
- `lime`: lima / magenta / cyan
- `dusk`: purpura / naranja / cyan
- `dark`: fondo negro, acentos sobre oscuro

**Modos de sombra** (via `data-shadow`):
- `low` | `medium` (default) | `high`

**Animacion gif-shake:** el cuadrado color-shift que evoca pixel art.
Usos: auth decorativo, empty states, story "crear", 404.

---

## Estructura DB actual → NBOX

| Tabla actual | Destino | Accion |
|---|---|---|
| `profiles` | `profiles` | Conservar + followers_count / following_count |
| `posts` | `boxes` | Renombrar + type + mood_color + payload JSONB |
| `categories` | — | Eliminar (concepto blog) |
| `post_categories` | — | Eliminar |
| `tags` | `tags` | Conservar |
| `post_tags` | `box_tags` | Renombrar |
| `post_likes` | `box_reactions` | Reemplazar con reaction_type (bold/loud/fire/sharp/save) |
| `post_bookmarks` | `box_saves` | Renombrar |
| `comments` | `box_comments` | Renombrar |
| — | `follows` | Nueva: follower_id + following_id |

---

## Arquitectura de carpetas objetivo

```
src/
├── app/          router + providers
├── components/
│   ├── layout/   AppShell, Header, LeftSidebar, RightSidebar, MobileBar
│   └── ui/       Avatar, Chip, Icon, Toast, TweakPanel, BoxCard...
├── features/
│   ├── auth/     AuthContext, hooks
│   ├── boxes/    useBoxes, useBox, useCreateBox, useFeed...
│   ├── reactions/ useReactions
│   ├── comments/ useComments
│   ├── follows/  useFollows
│   ├── profile/  useProfile
│   ├── explore/  useExplore, useTrending
│   └── admin/    useAdminActions
├── pages/
│   ├── HomeFeedPage
│   ├── ExplorePage
│   ├── BoxPage (single box)
│   ├── ProfilePage (publica + propia)
│   ├── NotificationsPage
│   ├── InboxPage
│   └── AuthPage
└── lib/          supabase, storage, sanitize, utils
```

---

## FASE 0: Base tecnica — COMPLETADA

- [x] RLS correcto en todas las tablas
- [x] Policies admin para posts (update/delete)
- [x] search_path seguro en funciones security definer
- [x] is_banned enforced a nivel DB en 6 policies
- [x] 0 errores de lint (ESLint)
- [x] Validacion de env vars en supabase.ts
- [x] Migraciones ordenadas correctamente

---

## FASE 1: Home Feed — EN CURSO

**Objetivo:** Vista principal funcional conectada a Supabase. Fin del blog, inicio de la red social.

### DB
- [ ] Migrar posts → boxes (type, mood_color, payload JSONB)
- [ ] Eliminar categories y post_categories
- [ ] Crear follows table
- [ ] Reemplazar post_likes por box_reactions (con reaction_type)
- [ ] Renombrar post_bookmarks → box_saves, post_tags → box_tags, comments → box_comments
- [ ] Aplicar las 3 migraciones pendientes a Supabase

### UI / Componentes
- [ ] AppShell: header tabs centrados + grid 3 cols (280 | 1fr | 320) + mobile bar
- [ ] Header: Brand NBOX + search + tabs iconos (Home/Explore/Notifs) + avatar + Drop btn
- [ ] LeftSidebar: profile snippet + nav links
- [ ] RightSidebar: trending tags + suggested users + contacts
- [ ] MobileBottomBar: 5 tabs (Home/Explore/Drop/Notifs/Yo)
- [ ] StoriesRail: rail decorativo 6 stories (grid 9:14, colores sistema, sin backend)
- [ ] ComposerCard: avatar + input + botones Quick/Media/Poll/Mood/Link
- [ ] ModeSelector: For You | Following | Fresh | Loud
- [ ] BoxCard: tarjeta box con head (avatar+nombre+meta+menu), body, tags, stats, actions
- [ ] Reacciones en BoxCard: Bold/Loud/Fire/Sharp/Save (popover al hover)
- [ ] AuthPage: rediseno NBOX con gif-shake decorativo
- [ ] TweakPanel: renombrar paletas a coral/electric/lime/dusk/dark, shadow low/medium/high

### Features
- [ ] Feed "For You": todas las boxes ordenadas por recientes
- [ ] Feed "Fresh": ultimas boxes
- [ ] Feed "Loud": boxes con mas reacciones
- [ ] Feed "Following": boxes de usuarios que sigo (requiere follows)
- [ ] Quick Drop: crear box de texto desde ComposerCard
- [ ] Remover todo lo de blog: categorias, tags academicos, hero de blog, dashboard de posts

---

## FASE 2: Box individual + Compositor completo

**Objetivo:** Ver una box completa y crear cualquier tipo de box.

- [ ] BoxPage: vista individual + comentarios expandidos + header de autor
- [ ] DropModal: selector de tipo + formulario por tipo
- [ ] Media Box: subir imagen o URL de video
- [ ] Mood Box: 5 colores de fondo + texto grande con Archivo Black
- [ ] Link Box: pegar URL → preview con titulo + host + thumbnail
- [ ] Poll Box: opciones + barra de votos en tiempo real
- [ ] Thread Box: items numerados
- [ ] Comentarios anidados: responder a un comentario
- [ ] Comentario fijado por autor

---

## FASE 3: My Box (Perfil)

**Objetivo:** Perfil propio como espacio personal rico.

- [ ] ProfilePage publica: portada (patron diagonal) + avatar lg + nombre + @user + bio
- [ ] Stats: boxes, followers, following
- [ ] Tabs: Boxes | Media | Saved | About
- [ ] Pinned Box en el perfil
- [ ] Editar perfil: avatar, portada, bio, color de acento, frase corta
- [ ] Seguir / Dejar de seguir usuario
- [ ] ProfilePage propia = My Box (con editar disponible)

---

## FASE 4: Explore

**Objetivo:** Descubrir contenido y usuarios mas alla del feed.

- [ ] ExplorePage: grid de boxes destacadas (patron de colores nth-child)
- [ ] Tags populares con conteo de boxes
- [ ] Usuarios activos / sugeridos
- [ ] Busqueda de boxes por texto
- [ ] Tag page: su propio feed de boxes
- [ ] Trending: Loud This Week

---

## FASE 5: Notificaciones

**Objetivo:** Centro de actividad con badge y filtros.

- [ ] Tabla `notifications` en DB
- [ ] NotificationsPage: feed con filtros (todo / no leido / reacciones / comentarios / follows)
- [ ] Badge en header y mobile bar
- [ ] Marcar leido (individual y todo)
- [ ] Tipos: reaccion, comentario, respuesta, follow, mencion, sistema
- [ ] Menciones @usuario en boxes y comentarios

---

## FASE 6: NBOX Inbox (Chat)

**Objetivo:** Mensajeria privada 1 a 1 con Supabase Realtime.

- [ ] Tablas: conversations, conversation_participants, messages
- [ ] InboxPage: lista de hilos + thread activo (estilo WhatsApp)
- [ ] Floating chat windows: hasta 3 simultaneos, anclados a la derecha
- [ ] Mensajes en tiempo real (Supabase Realtime)
- [ ] Estados: enviado / leido
- [ ] Mobile: pantalla fullscreen de chat

Ver NBOX_CHAT_SCALE_PLAN.md para arquitectura futura de escala.

---

## FASE 7: Admin + Moderacion

**Objetivo:** Panel de control para el administrador.

- [ ] Panel admin accesible solo a rol "admin"
- [ ] Listar y banear usuarios
- [ ] Eliminar cualquier box o comentario
- [ ] Ver reportes de usuarios
- [ ] Reportar box o usuario (lado usuario)
- [ ] Bloquear / ocultar usuario

---

## FASE 9: Stories (opcional, post-chat)

- [ ] Story: caja temporal 24h con fondo y texto
- [ ] StoriesRail funcional (backend)
- [ ] Ver story en modo fullscreen con timer
- [ ] Reacciones rapidas a stories

---

## Notas tecnicas

- Stack: React 19 + TypeScript + Vite 8 + Tailwind CSS 4 + Supabase + TanStack Query v5 + RHF + Zod
- Auth: email/password via Supabase (sin OAuth por ahora)
- Imagenes: Supabase Storage, bucket `post-images`
- Mobile futuro: primero PWA, luego Expo si el producto lo justifica
- El usuario admin (elias-toro@outlook.com) se preserva en todos los resets de DB
