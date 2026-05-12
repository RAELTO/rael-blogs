# TODO — Migrate UI text to English

All user-facing strings must be in English (see CLAUDE.md → Language rule).
Below is the full inventory of Spanish strings still present in the codebase.

> **NBOX decorators are exempt:** `▒ loading...` · `▸ Section` · `✦`

---

## src/components/feed/ComposerCard.tsx
- `"¡DROP PUBLICADO!"` → `"DROP PUBLISHED!"`
- `"Error al publicar. Inténtalo de nuevo."` → `"Failed to publish. Please try again."`
- `"¿Qué vas a dropear, {name}?"` → `"What are you dropping, {name}?"`
- `"Cancelar"` → `"Cancel"`
- `"Foto"` → `"Photo"`
- `"Encuesta"` → `"Poll"`

## src/pages/public/LoginPage.tsx
- `"Introduce correo y contraseña para entrar."` → `"Enter your email and password to sign in."`
- `"El nombre es obligatorio."` → `"Name is required."`
- `"El nombre de usuario es obligatorio."` → `"Username is required."`
- `"La contraseña no cumple los requisitos de seguridad."` → `"Password doesn't meet security requirements."`
- `"Bienvenido de vuelta"` → `"Welcome back"`
- `"Iniciar sesión"` → `"Sign in"`
- `"Crear cuenta"` → `"Create account"`
- `"Nombre"` → `"Name"`
- `"Usuario"` → `"Username"`
- `"Correo"` → `"Email"`
- `"Contraseña"` → `"Password"`
- `"¿Olvidaste tu contraseña?"` → `"Forgot your password?"`
- `"8 caracteres mínimo"` → `"8 characters minimum"`
- `"Una mayúscula"` → `"One uppercase letter"`
- `"Un carácter especial (!@#$…)"` → `"One special character (!@#$…)"`
- `"Entrar al feed"` → `"Go to feed"`
- `"¿Nuevo por aquí?"` → `"New here?"`
- `"¿Ya tienes cuenta?"` → `"Already have an account?"`
- `"Regístrate"` → `"Sign up"`
- `"Inicia sesión"` → `"Sign in"`
- `"Revisa tu correo"` → `"Check your email"`
- `"Si existe una cuenta con ese correo, te enviaremos un enlace…"` → `"If an account exists with that email, we'll send you a reset link."`
- `"Volver al inicio de sesión"` → `"Back to sign in"`
- `"Recuperar contraseña"` → `"Reset password"`
- placeholder `"tu@correo.com"` → `"you@email.com"`

## src/pages/dashboard/ProfilePage.tsx
- `"Mínimo 2 caracteres"` → `"Minimum 2 characters"`
- `"Máximo 100 caracteres"` → `"Maximum 100 characters"`
- `"Mínimo 3 caracteres"` → `"Minimum 3 characters"`
- `"Máximo 30 caracteres"` → `"Maximum 30 characters"`
- `"Solo letras minúsculas, números y guión bajo"` → `"Lowercase letters, numbers and underscores only"`
- `"Máximo 500 caracteres"` → `"Maximum 500 characters"`
- `"Perfil actualizado ✓"` → `"Profile updated ✓"`
- `"Error inesperado"` → `"Unexpected error"`
- `"▒ cargando perfil..."` → `"▒ loading profile..."`
- `"Apariencia"` → `"Appearance"`
- `"Paleta de color y sombras"` → `"Color palette and shadows"`
- `"Personalizar"` → `"Customize"`
- `"Nombre público"` → `"Display name"`
- placeholder `"Tu nombre"` → `"Your name"`
- placeholder `"tu_usuario"` → `"your_username"`
- `"Bio"` → `"Bio"` ✓ (already English)
- placeholder `"Cuéntale al mundo quién eres…"` → `"Tell the world who you are…"`
- `"▒ guardando..."` → `"▒ saving..."`
- `"✓ Guardar"` → `"✓ Save"`
- `"Avatar"` → `"Avatar"` ✓
- `"Correo"` → `"Email"`
- `"My Box"` ✓

## src/components/feed/DropModal.tsx
- `"NUEVO DROP"` → `"NEW DROP"`
- `"Cerrar"` → `"Close"` (title)
- `"Tipo de Box"` → `"Box type"`
- `"¿Cuál es el mood?"` → `"What's the mood?"`
- `"Título del hilo…"` → `"Thread title…"`
- `"Pregunta de la encuesta…"` → `"Poll question…"`
- `"¿Qué quieres dropear?"` → `"What do you want to drop?"`
- `"Tipo de medio"` → `"Media type"`
- `"Imagen"` → `"Image"`
- `"Video"` → `"Video"` ✓
- `"Sube tu imagen"` → `"Upload your image"`
- `"URL no reconocida — soportamos YouTube y Vimeo."` → `"Unrecognized URL — we support YouTube and Vimeo."`
- `"Color del mood"` → `"Mood color"`
- `"Opciones"` → `"Options"`
- placeholder `"Opción {i+1}"` → `"Option {i+1}"`
- `"Añadir opción"` → `"Add option"`
- `"Escribe algo antes de dropear."` → `"Write something before dropping."`
- `"Sube una imagen primero."` → `"Upload an image first."`
- `"URL de YouTube o Vimeo no válida."` → `"Invalid YouTube or Vimeo URL."`
- `"Escribe el mood."` → `"Write the mood."`
- `"Necesitas al menos 2 opciones."` → `"You need at least 2 options."`
- `"¿Cuál eliges?"` → `"Which do you pick?"`
- `"Agrega al menos un punto."` → `"Add at least one item."`
- `"URL no válida. Solo se permiten URLs http/https."` → `"Invalid URL. Only http/https URLs are allowed."`
- `"URL no válida."` → `"Invalid URL."`
- `"Hilo"` → `"Thread"`
- placeholder `"Punto {i+1}"` → `"Item {i+1}"`
- `"Añadir punto"` → `"Add item"`
- `"Tags"` ✓
- placeholder `"#freshdrops #design"` ✓
- `"Cancelar"` → `"Cancel"`
- `"▒ publicando…"` → `"▒ dropping…"`
- `"¡DROP PUBLICADO! ✦"` → `"DROP PUBLISHED! ✦"`
- `"Error al publicar. Inténtalo de nuevo."` → `"Failed to publish. Please try again."`
- `"Quitar"` → `"Remove"`

## src/components/feed/BoxCard.tsx
- `"Me encanta"` → `"Love it"`
- `"Haha"` ✓
- `"Wow"` ✓
- `"Sad"` ✓
- `"Angry"` ✓
- `"¡Inicia sesión para interactuar con este drop! 🔐"` → `"Sign in to interact with this drop! 🔐"`
- `"Ver reacciones"` → `"View reactions"` (title)
- `"comentarios · {n} compartidos"` → `"comments · {n} shares"`
- `"{n} votos · toca para votar"` → `"{n} votes · tap to vote"`
- `"Comentar"` → `"Comment"`
- `"Compartir"` → `"Share"`
- `"Eliminar"` → `"Delete"`

## src/components/feed/CommentsModal.tsx
- `"COMENTARIOS · {n}"` → `"COMMENTS · {n}"`
- `"Ordenar:"` → `"Sort:"`
- `"Cronológico"` → `"Oldest"`
- `"Recientes"` → `"Newest"`
- `"Relevantes"` → `"Top"`
- `"Limpiar filtro"` → `"Clear filter"` (title)
- `"▒ cargando comentarios..."` → `"▒ loading comments..."`
- `"Sin comentarios aún"` → `"No comments yet"`
- `"Sé el primero en comentar."` → `"Be the first to comment."`
- placeholder `"Comentar como {name}…"` → `"Comment as {name}…"`
- placeholder `"Inicia sesión para comentar…"` → `"Sign in to comment…"`
- `"Inicia sesión"` (link) → `"Sign in"`
- `"para participar en la conversación"` → `"to join the conversation"`
- `"Me gusta"` → `"Like"`

## src/components/feed/CommentItem.tsx
- `"Eliminar"` → `"Delete"` (title)
- `"Reaccionar"` → `"React"` (title)

## src/pages/public/CheckEmailPage.tsx
- `"Revisa tu correo"` → `"Check your email"`
- `"Te enviamos un enlace de confirmación a:"` → `"We sent a confirmation link to:"`
- `"Abre el correo y pulsa \"Confirm your mail\"."` → `"Open the email and click \"Confirm your mail\"."`
- `"Esta pestaña se actualizará automáticamente."` → `"This tab will update automatically."`
- `"✓ Correo reenviado"` → `"✓ Email resent"`
- `"▒ enviando..."` → `"▒ sending..."`
- `"Reenviar correo"` → `"Resend email"`
- `"Bienvenido — cuenta confirmada"` → `"Welcome — account confirmed"`

## src/pages/public/ResetPasswordPage.tsx
- `"La contraseña no cumple los requisitos de seguridad."` → `"Password doesn't meet security requirements."`
- `"Las contraseñas no coinciden."` → `"Passwords don't match."`
- `"Contraseña actualizada. Inicia sesión de nuevo."` → `"Password updated. Please sign in again."`
- `"Enlace inválido"` → `"Invalid link"`
- `"El enlace de recuperación ha expirado o ya fue utilizado. Solicita uno nuevo."` → `"The recovery link has expired or was already used. Request a new one."`
- `"Volver al inicio de sesión"` → `"Back to sign in"`
- `"▒ verificando enlace..."` → `"▒ verifying link..."`
- `"Nueva contraseña"` → `"New password"`
- placeholder `"Contraseña nueva"` → `"New password"`
- `"Confirmar contraseña"` → `"Confirm password"`
- `"✓ Actualizar contraseña"` → `"✓ Update password"`

## src/components/feed/ShareModal.tsx
- `"COMPARTIR"` → `"SHARE"`
- `"Inicia sesión para compartir."` → `"Sign in to share."`
- `"¡Compartido en tu feed! ✦"` → `"Shared to your feed! ✦"`
- `"Error al compartir."` → `"Failed to share."`
- `"Compartir en Feed"` → `"Share to Feed"`
- `"Comparte este drop con un comentario"` → `"Share this drop with a comment"`
- `"WhatsApp"` ✓
- `"Envía el enlace por WhatsApp"` → `"Send the link via WhatsApp"`
- `"¡Enlace copiado!"` → `"Link copied!"`
- `"Copiar enlace"` → `"Copy link"`
- `"Enviar a contacto"` → `"Send to contact"`
- `"Envía directamente a un amigo"` → `"Send directly to a friend"`
- `"Compartir a grupo"` → `"Share to group"`
- `"Comparte en un grupo al que perteneces"` → `"Share to a group you belong to"`
- placeholder `"Añade un comentario… (opcional)"` → `"Add a comment… (optional)"`
- `"↗ Compartió un drop"` → use Lucide icon instead of `↗`
- `"{label}: próximamente"` → `"{label}: coming soon"`

## src/components/layout/Header.tsx
- placeholder `"Buscar en NBOX"` → `"Search NBOX"`
- aria-label `"Buscar"` → `"Search"`
- `"Notificaciones"` → `"Notifications"` (title)
- `"Apariencia"` → `"Appearance"` (title)
- `"Drop"` ✓
- `"Mi Perfil"` → `"My Profile"` (title)
- `"Entrar"` → `"Sign in"`

## src/pages/dashboard/ContactsPage.tsx
- `"quiere agregarte como contacto"` → `"wants to add you as a contact"`
- `"Aceptar"` → `"Accept"`
- `"Rechazar"` → `"Decline"`
- `"✓ Aceptada"` → `"✓ Accepted"`
- `"✕ Rechazada"` → `"✕ Declined"`
- `"Pendiente"` → `"Pending"`
- `"Cancelar solicitud"` → `"Cancel request"` (title)
- `"Solicitud enviada"` → `"Request sent"`
- `"Agregar contacto"` → `"Add contact"`
- `"Mensaje"` → `"Message"`
- `"Eliminar contacto"` → `"Remove contact"` (title)
- `"Solicitudes"` → `"Requests"`
- `"Sugerencias"` → `"Suggestions"`
- `"Todos · {n}"` → `"All · {n}"`
- `"CONTACTOS"` → `"CONTACTS"`
- `"Recibidas"` → `"Received"`
- `"SIN SOLICITUDES"` → `"NO REQUESTS"`
- `"Cuando alguien te pida ser contacto, aparecerá aquí"` → `"When someone sends you a contact request, it'll appear here"`
- `"Enviadas"` → `"Sent"`
- `"Sugerencias para ti"` → `"Suggestions for you"`
- `"NADA POR AHORA"` → `"NOTHING YET"`
- `"Sigue a más usuarios para ver sugerencias relevantes"` → `"Follow more users to see relevant suggestions"`
- `"Todos tus contactos"` → `"All your contacts"`
- `"AÚN SIN CONTACTOS"` → `"NO CONTACTS YET"`
- `"Agrega contactos desde las sugerencias o desde el feed"` → `"Add contacts from suggestions or the feed"`
- toast `"✓ Ahora eres contacto de {name}"` → `"✓ You and {name} are now contacts"`
- toast `"Solicitud de {name} rechazada"` → `"Request from {name} declined"`
- toast `"Solicitud cancelada"` → `"Request cancelled"`
- toast `"Solicitud enviada"` → `"Request sent"`
- toast `"Contacto eliminado"` → `"Contact removed"`

## src/pages/dashboard/InboxPage.tsx
- `"AYER"` → `"YESTERDAY"`
- `"HOY"` → `"TODAY"`
- `"Se el primero en escribir"` → `"Be the first to say something"`
- `"Llamar"` → `"Call"` (title)
- `"Video"` → `"Video"` ✓ (title)
- `"Llamadas proximamente"` → `"Calls coming soon"`
- `"Video proximamente"` → `"Video coming soon"`
- `"Adjuntar"` → `"Attach"` (title)
- `"Adjuntos proximamente"` → `"Attachments coming soon"`
- placeholder `"Mensaje..."` → `"Message..."`
- `"Emoji"` ✓ (title)
- `"Emojis proximamente"` → `"Emojis coming soon"`
- `"▒ Cargando..."` → `"▒ loading..."`
- `"Sin conversaciones."` → `"No conversations."`
- `"Ve a Contactos para iniciar un chat."` → `"Go to Contacts to start a chat."`
- `"Nuevo chat proximamente"` → `"New chat coming soon"`
- placeholder `"Buscar..."` → `"Search..."`
- `"Selecciona una conversacion para empezar"` → `"Select a conversation to get started"`
- `"+ Nuevo"` → use Lucide `Plus` icon + `"New"`

## src/components/layout/NotificationsDropdown.tsx
- `"Notificaciones"` → `"Notifications"`
- `"Ver todo →"` → use Lucide `ArrowRight` icon + `"View all"`
- `"Sin notificaciones"` → `"No notifications"`
- `"VER TODAS LAS NOTIFICACIONES"` → `"VIEW ALL NOTIFICATIONS"`
- `"Aceptar"` → `"Accept"` (title)
- `"Rechazar"` → `"Decline"` (title)
- toast `"✓ {name} es ahora tu contacto"` → `"✓ {name} is now your contact"`
- toast `"Solicitud de {name} rechazada"` → `"Request from {name} declined"`

## src/pages/public/HomePage.tsx
- `"Aún no sigues a nadie"` → `"You're not following anyone yet"`
- `"Sin boxes aún"` → `"No boxes yet"`
- `"Ve a Explore para encontrar gente que dropea boxes interesantes."` → `"Go to Explore to find people dropping interesting boxes."`
- `"Sé el primero en dropear algo brutal."` → `"Be the first to drop something loud."`
- `"Inicia sesión para dropear."` → `"Sign in to drop."`
- `"Stories próximamente"` → `"Stories coming soon"`
- `"▒ cargando boxes..."` → `"▒ loading boxes..."`
- `"⚠ Error al cargar el feed. Intenta de nuevo."` → `"⚠ Failed to load feed. Try again."`
- toast `"Box eliminada."` → `"Box deleted."`
- toast `"Error al eliminar."` → `"Failed to delete."`

## src/components/layout/LeftSidebar.tsx
- `"Mi Perfil"` → `"My Profile"`
- `"Explore"` ✓
- `"NBOX"` ✓
- `"Contactos"` → `"Contacts"`
- `"Grupos"` → `"Groups"`
- `"Grupos próximamente"` → `"Groups coming soon"`
- `"Saved"` ✓
- `"Recuerdos"` → `"Memories"`
- `"Memorias próximamente"` → `"Memories coming soon"`
- `"Apariencia"` → `"Appearance"`
- `"Salir"` → `"Sign out"`
- `"Entrar"` → `"Sign in"`
- `"¿Cerramos la señal?"` → `"Sign out?"`
- `"Estás a punto de cerrar tu sesión…"` → `"You're about to sign out. You'll need to sign in again to post, comment or save boxes."`
- `"Sí, cerrar sesión"` → `"Yes, sign out"`
- `"Quedarme"` → `"Stay"`
- `"Hasta pronto. Keep it loud ✦"` ✓ (mixed, keep as-is or → `"See you soon. Keep it loud ✦"`)

## src/components/ui/AppearanceModal.tsx
- `"Apariencia"` → `"Appearance"`
- `"Paleta"` → `"Palette"`
- `"Sombras"` → `"Shadows"`
- `"Suave"` → `"Soft"`
- `"Normal"` ✓
- `"Brutal"` ✓

## src/components/layout/RightSidebar.tsx
- `"Sin tags aún"` → `"No tags yet"`
- `"Sugerencias"` → `"Suggestions"`
- toast `"Solicitud enviada"` → `"Request sent"`
- `"Agregar contacto"` → `"Add contact"` (title)
- `"Descartar"` → `"Dismiss"` (title)
- `"Contactos"` → `"Contacts"`

## src/components/ui/ConfirmDialog.tsx
- `"confirmación requerida"` → `"confirmation required"`
- `"Confirmar"` → `"Confirm"`
- `"Cancelar"` → `"Cancel"`

## src/pages/public/NotificationsPage.tsx
- `"Todas"` → `"All"`
- `"No Leídas"` → `"Unread"`
- `"Contactos"` → `"Contacts"`
- `"Reacciones"` → `"Reactions"`
- `"Votos"` → `"Votes"`
- `"Comentarios"` → `"Comments"`
- `"Compartidos"` → `"Shares"`
- `"NBOX · NOTIFS"` ✓
- `"{n} sin leer"` → `"{n} unread"`
- `"NUEVO CONTACTO"` → `"NEW CONTACT"`
- `"Sin notificaciones aquí"` → `"No notifications here"`
- toast `"✓ {name} es ahora tu contacto"` → `"✓ {name} is now your contact"`
- toast `"Solicitud de {name} rechazada"` → `"Request from {name} declined"`

## src/features/notifications/useNotifications.ts
- `"reaccionó {emoji} a tu Box"` → `"reacted {emoji} to your Box"`
- `"le dio Like 👍 a tu Box"` → `"liked 👍 your Box"`
- `"le dio Dislike 👎 a tu Box"` → `"disliked 👎 your Box"`
- `"comentó en tu Box"` → `"commented on your Box"`
- `"empezó a seguirte"` → `"started following you"`
- `"quiere agregarte como contacto"` → `"wants to add you as a contact"`
- `"aceptó tu solicitud de contacto ✓"` → `"accepted your contact request ✓"`
- `"compartió tu Box"` → `"shared your Box"`
