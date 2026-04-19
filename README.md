# Rael's Blogs

CMS de blogs estilo neobrutalism construido con React + TypeScript + Supabase. Permite publicar, categorizar y gestionar artículos desde un dashboard privado, con soporte de comentarios, likes y favoritos.

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | React 18, TypeScript, Vite |
| Estilos | CSS custom properties — sistema neobrutalist propio |
| Routing | React Router v6 |
| Estado servidor | TanStack Query v5 |
| Backend / Auth | Supabase (Postgres + Auth + Storage + RLS) |
| Markdown | react-markdown + remark-gfm |
| Deploy | Vercel |

---

## Funcionalidades

**Público (sin cuenta)**
- Feed paginado con scroll infinito
- Búsqueda full-text en DB (título, extracto, autor, categorías, tags)
- Posts destacados (≥ 100 likes) en sección Destacadas
- Filtro por categoría con chips de colores deterministas
- Detalle de post con renderizado Markdown
- Perfil público de autor
- Contador de likes visible
- Comentarios públicos con filtro por nombre de autor

**Autenticado**
- Registro con confirmación de correo y validación de contraseña (8 chars, mayúscula, carácter especial)
- Inicio / cierre de sesión con dialog de confirmación neobrutalist
- Crear, editar y eliminar posts propios
- Estados: borrador / publicado
- Cover image por post con gestión de conflictos (imagen vs placeholder generativo)
- Editar perfil (nombre, usuario, bio, avatar)
- Dar like a posts y guardar en favoritos
- Comentar en posts y borrar comentarios propios

**Admin**
- Editar o eliminar cualquier post
- Eliminar cualquier comentario
- Gestión de usuarios (ban / rol) desde panel de admin
- Bypass de RLS en categorías y tags de posts ajenos

---

## Requisitos previos

- Node.js 18+
- Una cuenta y proyecto en [Supabase](https://supabase.com) (plan Free es suficiente)

---

## Instalación

```bash
# 1. Clonar el repositorio
git clone <url-del-repositorio>
cd rael-blogs

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp example.env .env
# Editar .env con tus credenciales de Supabase
```

### Variables de entorno

```env
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key_aqui
```

Encuéntralas en Supabase → Project Settings → API.

---

## Configuración de Supabase

### 1. Base de datos

El esquema completo está versionado en `supabase/migrations/`. Si el proyecto Supabase es eliminado por inactividad, se puede recrear la estructura vacía con:

```bash
supabase db push
```

> Esto restaura tablas, RLS y funciones — no los datos ni las imágenes del Storage.

Migraciones en orden:

| Versión | Migración | Contenido |
|---------|-----------|-----------|
| 20260418042702 | `initial_schema` | Tablas core: profiles, posts, categories, tags, post_categories, post_tags |
| 20260418042719 | `rls_policies` | Políticas RLS base en todas las tablas |
| 20260418042734 | `storage_policies` | Bucket `post-images` público + políticas por carpeta de usuario |
| 20260418052011 | `seed_categories` | 6 categorías iniciales |
| 20260418054543 | `comments_likes_bookmarks` | Tablas: comments, post_likes, post_bookmarks |
| 20260418191106 | `add_role_and_ban_to_profiles` | Columnas `role` e `is_banned` en profiles |
| 20260418191627 | `admin_delete_any_comment` | Política admin para eliminar cualquier comentario |
| 20260418191926 | `protect_role_and_ban_columns` | Bloquea auto-elevación de rol + política admin ban |
| 20260418212544 | `add_cover_type_to_posts` | Columna `cover_type` (gif/video/image/code) |
| 20260418230725 | `tags_insert_policy` | Usuarios autenticados pueden crear tags |
| 20260419032936 | `search_posts_fulltext` | Función RPC `search_posts` con DISTINCT JOIN |
| 20260419035240 | `admin_bypass_post_categories_tags` | Admin puede modificar categorías/tags de posts ajenos |

### 2. Storage

- Bucket: `post-images` (público)
- Rutas: `{user_id}/posts/{timestamp}.{ext}` para portadas · `{user_id}/avatar/avatar.{ext}` para avatares

### 3. Autenticación

En Supabase → Authentication → URL Configuration:
- **Site URL**: `http://localhost:5173` en desarrollo, o tu dominio en producción
- La confirmación de correo está **activada** — el usuario recibe un email al registrarse

---

## Ejecución local

```bash
npm run dev
```

Abre `http://localhost:5173`.

```bash
# Build de producción
npm run build

# Preview del build
npm run preview
```

---

## Estructura del proyecto

```
src/
├── app/
│   └── router.tsx               # Rutas públicas y protegidas (lazy loading en dashboard)
├── components/
│   ├── auth/                    # ProtectedRoute
│   ├── layout/                  # Header (con nav móvil), Footer, AppLayout
│   ├── posts/                   # PostCard, PostEditor, CommentSection, LikeButton, BookmarkButton
│   └── ui/                      # Avatar, Chip, Icon (SVG outline), ImageUpload, Toast, TweakPanel
├── features/
│   ├── auth/                    # AuthContext, useSignIn, useSignUp
│   ├── categories/              # useCategories
│   ├── interactions/            # useComments, useLikes, useBookmarks
│   ├── posts/                   # usePosts, usePost, useMyPosts, usePostMutations, usePostsByAuthor...
│   └── profile/                 # useProfile, useUpdateProfile
├── lib/
│   ├── sanitize.ts              # sanitizeText, parseTagNames
│   ├── storage.ts               # uploadCoverImage, uploadAvatarImage, validateImage
│   ├── supabase.ts              # Cliente Supabase tipado
│   └── utils.ts                 # slugify, formatDate, readTime, getInitials
├── pages/
│   ├── dashboard/               # DashboardPage, NewPostPage, EditPostPage, ProfilePage, BookmarksPage
│   └── public/                  # HomePage, PostPage, LoginPage, CategoriesPage, CategoryPage, TagPage, AuthorPage
├── styles/
│   └── globals.css              # Sistema de diseño neobrutalism completo (5 paletas + modo oscuro)
└── types/
    └── database.ts              # Tipos generados desde Supabase
```

---

## Seguridad

- **RLS** en todas las tablas: los usuarios solo pueden modificar su propio contenido
- **Sanitización** de todos los inputs antes de persistir (`sanitize.ts`)
- **Zod** valida formularios en el frontend antes de llamar a Supabase
- **react-markdown** bloquea elementos peligrosos (`script`, `iframe`, `form`, etc.)
- Supabase JS usa queries parametrizadas — sin riesgo de SQL injection
- La `anon key` es pública por diseño; la seguridad real está en las políticas RLS
- Errores de autenticación son genéricos para evitar enumeración de usuarios
- Imágenes validadas por tipo (JPG/PNG/WebP/GIF) y tamaño antes de subirse

---

## TweakPanel

Panel flotante (esquina inferior derecha) para ajustar el diseño en tiempo real:

- **5 paletas de color**: Magenta (default), Miami, Toxic, Sunset, Dark
- **Tipografía**: cambia la fuente de display entre opciones
- **Sombras**: ajusta el offset de las sombras neobrutalist
- **Grid**: activa/desactiva el grid de fondo del hero

Los cambios se aplican vía CSS custom properties sin recargar la página.

---

## Licencia

Proyecto universitario — uso académico.
