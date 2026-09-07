import fs from 'node:fs/promises'
import path from 'node:path'
import { expect, test as setup } from '@playwright/test'
import { authStatePath, credentialsFor, type AuthRole } from './support/auth'

const roles: AuthRole[] = ['admin', 'user', 'demo']
const emptyStorageState = JSON.stringify({ cookies: [], origins: [] })

for (const role of roles) {
  setup(`authenticate ${role}`, async ({ page }, testInfo) => {
    const statePath = authStatePath(role)
    await fs.mkdir(path.dirname(statePath), { recursive: true })

    const credentials = credentialsFor(role)
    if (!credentials) {
      await fs.writeFile(statePath, emptyStorageState, 'utf8')
      testInfo.annotations.push({
        type: 'configuration',
        description: `Missing local E2E credentials for the ${role} role`,
      })
      return
    }

    await page.goto('/login', { waitUntil: 'domcontentloaded' })
    await page.getByLabel('Email').fill(credentials.email)
    await page.getByLabel('Password').fill(credentials.password)
    await page.getByRole('button', { name: 'Go to feed' }).click()

    await expect(page, `The ${role} account should authenticate successfully`).not.toHaveURL(/\/login(?:\?|$)/)
    await expect(page.locator('.brand-logo')).toBeVisible()
    await page.context().storageState({ path: statePath })
  })
}
