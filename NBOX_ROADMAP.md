# NBOX Roadmap

## Vision

NBOX es la evolucion de este proyecto desde un blog experimental hacia una plataforma social editorial con identidad neobrutalista.

La meta no es copiar una red social existente, sino construir una experiencia modular, fuerte visualmente y preparada para crecer hacia publicaciones, perfiles, interacciones, comunidades, notificaciones y mensajeria.

Concepto base:

> Neo Brutal Box: a brutal social space for posts, people, and messages.

## Principios De Producto

- Mantener el estilo neobrutalista como identidad central, no solo como decoracion.
- Evolucionar por fases, sin intentar construir una red social completa de una sola vez.
- Aprovechar la base actual: posts, perfiles, comentarios, likes, favoritos, auth, storage y Supabase.
- Priorizar una experiencia social/editorial antes de agregar chat.
- Disenar primero los flujos principales y luego adaptar la arquitectura cuando el producto lo necesite.
- Evitar que NBOX se sienta como una red social generica.

## Identidad

Nombre principal: `NBOX`

Variantes visuales posibles:

- `N-Box`
- `N.BOX`
- `[N]BOX`
- `N/BOX`

Significado conceptual:

- `N`: Neo / Neobrutal
- `BOX`: caja, modulo, post, perfil, espacio, mensaje

Frases posibles:

- Neo Brutal Box
- Your brutal inbox for the web.
- Post bold. Chat loud.
- A neo-brutal space for posts and people.
- The social box for loud ideas.

## Fase 0: Base Actual

Estado actual del proyecto:

- Blog/CMS con React, TypeScript, Vite y Supabase.
- Publicaciones con categorias, tags, portada y contenido enriquecido.
- Perfiles de autor.
- Comentarios, likes y favoritos.
- Dashboard privado.
- Autenticacion con Supabase.
- Storage para imagenes.
- RLS y migraciones versionadas.

Antes de crecer demasiado, conviene corregir:

- Orden de migraciones Supabase.
- Policies admin faltantes sobre posts.
- Errores de lint.
- README desactualizado.
- Validacion de variables de entorno.

## Fase 1: Rebranding A NBOX

Objetivo: que el proyecto deje de sentirse como un blog personal y empiece a sentirse como una plataforma social.

Cambios sugeridos:

- Cambiar textos visibles de `Rael's Blogs` a `NBOX`.
- Actualizar metadata, titulo de pagina, favicon/logo y README.
- Definir un pequeno sistema verbal de marca.
- Ajustar navegacion principal:
  - `Feed`
  - `Explore`
  - `My Box`
  - `Saved`
- Renombrar mentalmente el dashboard como espacio personal del usuario.

Resultado esperado:

La app sigue teniendo las mismas funcionalidades, pero ya comunica una direccion de producto mas amplia.

## Fase 2: Vista Principal Tipo Feed Social

Objetivo: redisenar la vista principal para que sea el centro social/editorial de NBOX.

Referencia de direccion:

- Puede tomar inspiracion de Facebook o Instagram.
- Debe conservar el toque neobrutalista.
- No debe parecer una plantilla generica.

Elementos esperados:

- Feed de publicaciones.
- Tarjetas de post mas sociales y escaneables.
- Acciones visibles: like, comentar, guardar, compartir.
- Autor destacado en cada publicacion.
- Filtros o secciones de descubrimiento.
- Estados vacios con personalidad visual.
- Layout responsive bien definido.

Ideas posibles:

- Columna central para el feed.
- Sidebar con categorias, tags, usuarios o actividad.
- Bloque superior para crear/publicar rapido.
- Seccion de destacados o tendencias.

## Fase 3: Perfiles Como "My Box"

Objetivo: convertir los perfiles en espacios personales mas ricos.

Elementos sugeridos:

- Header de perfil con avatar, nombre, usuario y bio.
- Posts del usuario.
- Estadisticas sociales basicas.
- Favoritos o colecciones publicas, si aplica.
- Identidad visual por usuario en el futuro.

Nombre conceptual:

- `My Box`: perfil propio.
- `User Box`: perfil publico.

## Fase 4: Interaccion Social Ampliada

Objetivo: aumentar la sensacion de red social sin saltar todavia a chat.

Features posibles:

- Seguir usuarios.
- Feed basado en usuarios seguidos.
- Notificaciones basicas.
- Menciones.
- Respuestas a comentarios.
- Reacciones alternativas o contadores mas visibles.

Prioridad recomendada:

1. Seguir usuarios.
2. Feed de usuarios seguidos.
3. Notificaciones.
4. Respuestas a comentarios.

## Fase 5: Exploracion Y Comunidades

Objetivo: que NBOX tenga espacios de descubrimiento mas alla del feed principal.

Features posibles:

- Pagina `Explore`.
- Tendencias por tags.
- Categorias como espacios editoriales.
- Colecciones o boxes tematicos.
- Busqueda mas potente.

Ideas de naming:

- `Boxes`: espacios, colecciones o comunidades.
- `Drop Box`: crear una publicacion.
- `Brutal Box`: publicacion destacada.

## Fase 6: Notificaciones

Objetivo: preparar la app para actividad social continua.

Eventos posibles:

- Like recibido.
- Comentario recibido.
- Nuevo seguidor.
- Mencion.
- Respuesta a comentario.
- Publicacion guardada, si se decide mostrar.

Notas tecnicas:

- Supabase Realtime puede ser util mas adelante.
- Primero se puede implementar una tabla de notificaciones simple.
- No bloquear el avance del feed por esta fase.

## Fase 7: Chat / Inbox

Objetivo: agregar mensajeria privada cuando la base social ya tenga suficiente sentido.

No empezar por aqui.

Features posibles:

- Conversaciones 1 a 1.
- Lista de chats.
- Mensajes en tiempo real.
- Estados de lectura.
- Adjuntos ligeros.

Naming:

- `Inbox`
- `NBOX Chat`

Notas tecnicas:

- Supabase Realtime puede soportar una primera version.
- Requiere diseno cuidadoso de RLS.
- Requiere tablas separadas para conversaciones, participantes y mensajes.

## Orden Recomendado

1. Corregir base tecnica critica.
2. Rebranding a NBOX.
3. Redisenar home como feed social.
4. Mejorar perfiles.
5. Agregar seguidores.
6. Crear feed personalizado.
7. Agregar notificaciones.
8. Explorar comunidades o boxes.
9. Implementar chat.

## Pendientes De Diseno

- Vista principal tipo Facebook/Instagram con estilo NBOX.
- Tarjeta de publicacion.
- Header/nav principal.
- Perfil propio `My Box`.
- Perfil publico.
- Vista de exploracion.
- Vista de favoritos/guardados.
- Vista futura de notificaciones.
- Vista futura de inbox/chat.

## Notas De Arquitectura

La estructura actual puede mantenerse inicialmente:

- `features/posts`: feed, publicaciones y mutaciones.
- `features/profile`: perfiles y datos del usuario.
- `features/interactions`: likes, comentarios y favoritos.
- `pages/public`: vistas publicas y feed.
- `pages/dashboard`: espacio privado del usuario.

Cuando el proyecto crezca, considerar nuevas areas:

- `features/follows`
- `features/notifications`
- `features/messages`
- `features/explore`
- `features/communities`

## Criterio De Evolucion

Una feature debe agregarse cuando:

- Refuerza la identidad social/editorial de NBOX.
- Aprovecha la base existente.
- Tiene un flujo visual claro.
- No obliga a reescribir partes grandes sin necesidad.
- Puede verificarse con Supabase, build y lint.

NBOX debe crecer como producto por capas: primero identidad y feed, luego perfiles e interaccion, despues notificaciones y finalmente chat.
