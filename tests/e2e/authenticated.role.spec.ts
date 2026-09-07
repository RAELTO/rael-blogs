import { expect, test } from '@playwright/test'
import { openAuthenticatedPage } from './support/app'
import { credentialsFor, projectAuthRole } from './support/auth'

test.beforeEach(({}, testInfo) => {
  const role = projectAuthRole(testInfo.project.metadata)
  test.skip(!credentialsFor(role), `Local credentials are not configured for the ${role} role`)
})

test('@smoke each configured role can restore its authenticated session', async ({ page }, testInfo) => {
  const role = projectAuthRole(testInfo.project.metadata)
  await openAuthenticatedPage(page)

  await expect(page.locator('.app-shell')).toBeVisible()
  testInfo.annotations.push({ type: 'role', description: role })
})
