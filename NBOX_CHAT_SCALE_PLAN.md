# NBOX Chat Scale Plan

## Proposito

Este documento describe una arquitectura futura para escalar NBOX hacia mensajeria masiva tipo WhatsApp/Telegram.

No representa la arquitectura inicial recomendada. Para las primeras fases, NBOX puede usar Supabase con tablas, RLS y Realtime. Esta arquitectura especializada solo tendria sentido si el chat se convierte en una parte central del producto y el volumen crece de forma considerable.

## Punto De Partida Recomendado

Para una primera version:

- Supabase Auth para usuarios.
- Postgres para conversaciones, participantes y mensajes.
- RLS para proteger acceso a chats.
- Supabase Realtime para mensajes nuevos.
- Broadcast/Presence para estados temporales como `typing` y `online`.
- Edge Functions para eventos del servidor.
- Expo Notifications para push mobile.

Esta base es suficiente para:

- Chats 1 a 1.
- Campanita de notificaciones.
- Mensajes en tiempo real dentro de la app.
- Estados simples de lectura.
- Presencia basica.

## Cuando Evaluar Arquitectura Especializada

Considerar una arquitectura mas avanzada si aparecen varias de estas condiciones:

- Miles de usuarios conectados simultaneamente.
- Chat como funcionalidad principal del producto.
- Grupos grandes con alta actividad.
- Necesidad de entrega muy baja latencia.
- Push notifications criticas.
- Historial de mensajes muy grande.
- Busqueda avanzada dentro de chats.
- Moderacion automatizada.
- Cifrado extremo a extremo.
- Costos altos o limites con Realtime/Postgres.
- Necesidad de infraestructura multi-region.

## Objetivos De Escala

Una arquitectura tipo WhatsApp deberia resolver:

- Entrega confiable de mensajes.
- Baja latencia.
- Orden correcto por conversacion.
- Confirmaciones de envio, entrega y lectura.
- Presencia de usuarios.
- Indicador de escritura.
- Reintentos ante perdida de conexion.
- Sincronizacion entre dispositivos.
- Push notifications.
- Historial eficiente.
- Moderacion y anti-spam.
- Seguridad fuerte por usuario y conversacion.

## Arquitectura Por Capas

### 1. Cliente Web

Tecnologias:

- React.
- TypeScript.
- TanStack Query.
- Supabase Auth.
- WebSocket client propio o SDK del proveedor elegido.
- IndexedDB para cache local opcional.

Responsabilidades:

- Renderizar conversaciones.
- Manejar estado optimista de mensajes.
- Reintentar mensajes pendientes.
- Escuchar eventos en tiempo real.
- Sincronizar mensajes al recuperar conexion.

### 2. Cliente Mobile

Ruta recomendada:

- Expo.
- React Native.
- TypeScript.
- expo-router.
- TanStack Query.
- Supabase Auth.
- Expo Notifications.
- SecureStore para tokens.
- SQLite local para cache offline.
- React Native Reanimated para interacciones.
- React Native Gesture Handler.

Responsabilidades:

- Chat nativo fluido.
- Cache offline de conversaciones recientes.
- Cola local de mensajes pendientes.
- Push notifications.
- Sincronizacion al abrir la app.
- Manejo de archivos, imagenes y camara.

### 3. API / Gateway De Chat

En una escala mayor, el chat no deberia depender solo del frontend escribiendo directo a Postgres.

Tecnologias posibles:

- Node.js con Fastify.
- NestJS si se prefiere una estructura mas opinionada.
- Bun si se prioriza velocidad y simplicidad moderna.
- Go si se necesita alto rendimiento y concurrencia.
- Elixir/Phoenix si el foco principal es tiempo real masivo.

Responsabilidades:

- Validar permisos de envio.
- Aplicar rate limits.
- Normalizar mensajes.
- Publicar eventos a una cola.
- Coordinar confirmaciones de entrega.
- Emitir eventos WebSocket.
- Proteger contra abuso.

Recomendacion pragmatica:

- Empezar con Supabase Edge Functions si el volumen es bajo.
- Migrar a un servicio dedicado cuando el chat se vuelva critico.

### 4. WebSocket / Realtime Service

Opciones:

- Supabase Realtime para MVP y escala moderada.
- Socket.IO para control rapido desde Node.js.
- uWebSockets.js para alto rendimiento.
- Phoenix Channels para tiempo real robusto.
- NATS WebSocket Gateway para arquitecturas distribuidas.
- Ably o Pusher si se prefiere servicio administrado.

Responsabilidades:

- Mantener conexiones activas.
- Suscribir usuarios a conversaciones.
- Enviar nuevos mensajes.
- Enviar typing indicators.
- Enviar presencia.
- Sincronizar estados de lectura.

Decision futura:

- Si el equipo quiere moverse rapido, evaluar Ably/Pusher.
- Si se quiere control total, evaluar Phoenix Channels, Go o Node con uWebSockets.

### 5. Base De Datos Principal

Para la fase inicial:

- Supabase Postgres.

Para escala futura:

- Postgres sigue siendo valido como fuente de verdad.
- Puede complementarse con particionado, indices especializados y replicas.

Tablas base:

- `conversations`
- `conversation_participants`
- `messages`
- `message_receipts`
- `message_reactions`
- `user_presence`
- `push_tokens`
- `notification_events`

Mejoras futuras:

- Particionar `messages` por fecha o por conversacion.
- Usar indices compuestos por `conversation_id`, `created_at`.
- Archivar conversaciones antiguas.
- Separar eventos temporales de datos persistentes.

### 6. Cola De Eventos

Cuando el volumen crece, conviene desacoplar escritura, entrega y notificaciones.

Tecnologias posibles:

- Redis Streams.
- NATS.
- Kafka.
- RabbitMQ.
- Google Pub/Sub.
- AWS SQS/SNS.

Uso:

- Nuevo mensaje creado.
- Enviar push notification.
- Actualizar contador no leido.
- Emitir evento realtime.
- Procesar moderacion.
- Sincronizar busqueda.

Recomendacion:

- Redis Streams o NATS para una primera arquitectura especializada.
- Kafka solo si el volumen y el equipo justifican la complejidad.

### 7. Cache Y Estado Temporal

Tecnologias:

- Redis.
- Upstash Redis para opcion administrada simple.
- KeyDB como alternativa compatible.

Uso:

- Usuarios online.
- Typing indicators.
- Rate limits.
- Sesiones activas por usuario.
- Contadores temporales.
- Deduplicacion de eventos.

### 8. Busqueda De Mensajes

Opciones:

- Postgres full-text search para MVP.
- Meilisearch para busqueda rapida y simple.
- Typesense como alternativa ligera.
- OpenSearch/Elasticsearch si el volumen es alto.

Recomendacion:

- No implementar busqueda avanzada al inicio.
- Empezar con busqueda por conversacion si el producto lo pide.
- Agregar Meilisearch/Typesense antes de saltar a Elasticsearch.

### 9. Archivos Y Multimedia

Para MVP:

- Supabase Storage.

Para escala:

- Cloudflare R2.
- AWS S3.
- Google Cloud Storage.
- CDN con Cloudflare.

Responsabilidades:

- Imagenes.
- Videos cortos.
- Audios.
- Stickers.
- Avatares.
- Miniaturas.

Notas:

- Guardar metadatos en Postgres.
- Guardar archivos en object storage.
- Generar thumbnails con workers o functions.

### 10. Push Notifications

Web:

- Web Push.
- Service Worker.
- VAPID keys.

Mobile con Expo:

- Expo Notifications.
- Push tokens guardados en Supabase/Postgres.
- Edge Functions o backend dedicado para enviar pushes.

Mobile nativo avanzado:

- Firebase Cloud Messaging para Android.
- Apple Push Notification service para iOS.
- Notifee si se necesita control avanzado en React Native bare workflow.

Recomendacion:

- Para Expo: empezar con Expo Notifications.
- Si la app sale de Expo managed o requiere control fuerte, evaluar FCM/APNs directo.

## Arquitectura Evolutiva Recomendada

### Etapa A: MVP Con Supabase

- Postgres para mensajes.
- RLS estricta.
- Supabase Realtime para inserts.
- Presence para online/typing.
- Expo Notifications para mobile.

### Etapa B: Chat Solido

- Tabla de receipts.
- Estados enviado/entregado/leido.
- Contadores de no leidos.
- Push notifications desde Edge Functions.
- Cache local mobile con SQLite.
- Manejo offline basico.

### Etapa C: Servicio De Chat Dedicado

- API propia para enviar mensajes.
- WebSocket gateway.
- Redis para presencia y rate limits.
- Cola de eventos.
- Supabase/Postgres como fuente de verdad.

### Etapa D: Escala Alta

- Particionado de mensajes.
- Replicas de lectura.
- Servicio de notificaciones separado.
- Object storage con CDN.
- Busqueda externa.
- Observabilidad completa.
- Infra multi-region si aplica.

## Seguridad

Puntos criticos:

- Ningun usuario debe leer conversaciones donde no participa.
- Ningun usuario debe enviar mensajes a conversaciones donde no participa.
- RLS debe proteger las tablas aunque exista backend.
- Rate limiting por usuario/IP/dispositivo.
- Bloqueo de usuarios.
- Reportes y moderacion.
- Auditoria de acciones sensibles.
- Sanitizacion de contenido.
- Validacion de archivos.

Si se implementa cifrado extremo a extremo:

- El servidor no deberia poder leer mensajes.
- La busqueda server-side se complica.
- La recuperacion multi-dispositivo se vuelve mas compleja.
- Requiere diseno criptografico cuidadoso.

No se recomienda cifrado extremo a extremo en el MVP.

## Observabilidad

Tecnologias posibles:

- Sentry para errores frontend/mobile/backend.
- Logtail o Axiom para logs.
- Grafana + Prometheus para metricas.
- OpenTelemetry para trazas.
- Supabase Logs para etapa inicial.

Metricas clave:

- Usuarios conectados.
- Mensajes por segundo.
- Latencia de entrega.
- Fallos de push.
- Reintentos.
- Errores WebSocket.
- Tiempo de sincronizacion.
- Uso de base de datos.

## Stack Futuro Sugerido

Stack controlado y pragmatista:

- Web: React + TypeScript + Vite.
- Mobile: Expo + React Native + TypeScript.
- Auth/base inicial: Supabase.
- DB: Supabase Postgres / Postgres administrado.
- Realtime MVP: Supabase Realtime.
- Backend futuro: Node.js Fastify o Go.
- WebSocket futuro: Socket.IO, uWebSockets.js o Phoenix Channels.
- Cache: Redis / Upstash Redis.
- Cola: NATS o Redis Streams.
- Storage: Supabase Storage al inicio, Cloudflare R2/S3 a escala.
- Push: Expo Notifications, luego FCM/APNs si hace falta.
- Busqueda: Postgres FTS, luego Meilisearch/Typesense.
- Observabilidad: Sentry + Axiom/Logtail.

## Decision Actual Para NBOX

No implementar esta arquitectura todavia.

Primero:

1. Consolidar feed social.
2. Mejorar perfiles.
3. Agregar follows.
4. Agregar notificaciones internas.
5. Implementar chat 1 a 1 con Supabase.
6. Medir uso real.
7. Escalar solo si el producto lo exige.

La arquitectura especializada debe ser una ruta futura, no una carga inicial.
