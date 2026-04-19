/**
 * Elimina caracteres de control y recorta espacios.
 * Usado en todos los campos de texto antes de persistir.
 */
export function sanitizeText(value: string): string {
  return value
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '') // control chars
    .trim()
}

/**
 * Limpia un nombre de tag: sin HTML, sin caracteres especiales salvo guiones.
 */
export function sanitizeTagName(value: string): string {
  return sanitizeText(value)
    .replace(/[<>"'`]/g, '')
    .replace(/\s+/g, ' ')
    .slice(0, 50)
}

/**
 * Limpia y divide la lista de tags ingresada por el usuario.
 */
export function parseTagNames(raw: string): string[] {
  return raw
    .split(',')
    .map(t => sanitizeTagName(t.replace(/^#/, '')))
    .filter(t => t.length > 0 && t.length <= 50)
    .slice(0, 10) // máximo 10 tags por post
}
