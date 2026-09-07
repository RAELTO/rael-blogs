import path from 'node:path'
import { loadEnv } from 'vite'

export type AuthRole = 'admin' | 'user' | 'demo'

interface Credentials {
  email: string
  password: string
}

const env = { ...loadEnv('e2e', process.cwd(), ''), ...process.env }

const roleKeys: Record<AuthRole, readonly [string, string]> = {
  admin: ['E2E_ADMIN_EMAIL', 'E2E_ADMIN_PASSWORD'],
  user: ['E2E_USER_EMAIL', 'E2E_USER_PASSWORD'],
  demo: ['E2E_DEMO_EMAIL', 'E2E_DEMO_PASSWORD'],
}

export function credentialsFor(role: AuthRole): Credentials | null {
  const [emailKey, passwordKey] = roleKeys[role]
  const email = env[emailKey]?.trim()
  const password = env[passwordKey]

  return email && password ? { email, password } : null
}

export function authStatePath(role: AuthRole): string {
  return path.join(process.cwd(), '.tmp', 'playwright', 'auth', `${role}.json`)
}

export function projectAuthRole(metadata: Record<string, unknown>): AuthRole {
  const role = metadata.authRole
  if (role === 'admin' || role === 'user' || role === 'demo') return role
  return 'demo'
}
