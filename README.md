# Rael's Blogs

CMS de blogs estilo neobrutalism construido con React + TypeScript + Supabase. Permite publicar, categorizar y gestionar artículos desde un dashboard privado, con soporte de comentarios, likes y favoritos.

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend | React 19, TypeScript, Vite |
| Estilos | CSS custom (neobrutalism), Tailwind CSS v4 |
| Routing | React Router v7 |
| Estado servidor | TanStack Query v5 |
| Formularios | React Hook Form + Zod |
| Backend / Auth | Supabase (Postgres + Auth + Storage + RLS) |
| Markdown | react-markdown + remark-gfm |

---

## Funcionalidades

**Público (sin cuenta)**
- Feed de posts publicados con búsqueda y filtro por categoría
- Detalle de post con renderizado Markdown
- Perfil público de autor
- Navegación por categorías y tags
- Contador de likes visible

**Autenticado**
- Registro con confirmación de correo
- Inicio / cierre de sesión
- Crear, editar, eliminar posts propios
- Estados: borrador / publicado / archivado
- Imagen destacada por post (máx. 1 MB)
- Avatar de perfil (máx. 500 KB)
- Editar perfil (nombre, usuario, bio)
- Dar like a posts
- Guardar posts en favoritos
- Comentar en posts y borrar comentarios propios

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

Migraciones aplicadas en Supabase → SQL Editor (en orden):

| Migración | Contenido |
|-----------|-----------|
| `initial_schema` | Tablas: profiles, posts, categories, tags, post_categories, post_tags + triggers updated_at + auto-creación de perfil |
| `rls_policies` | Políticas RLS en todas las tablas |
| `storage_policies` | Bucket `post-images` con políticas por ruta de usuario |
| `seed_categories` | 6 categorías iniciales |
| `comments_likes_bookmarks` | Tablas: comments, post_likes, post_bookmarks + RLS |

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

## Paletas de color

El panel flotante (botón esquina inferior derecha) permite cambiar entre 5 paletas en tiempo real:

| Paleta | Acento principal |
|--------|-----------------|
| Magenta (default) | Coral `#ff5a5f` |
| Miami | Rosa neón `#ff4dd2` |
| Toxic | Lima `#a6ff00` |
| Sunset | Rojo `#ff5e5b` |
| Dark | Modo oscuro |

---

## Licencia

Proyecto universitario — uso académico.
