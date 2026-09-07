import { expect, test } from '@playwright/test'
import { openAuthenticatedPage } from './support/app'
import { credentialsFor, projectAuthRole } from './support/auth'

test.beforeEach(({}, testInfo) => {
  const role = projectAuthRole(testInfo.project.metadata)
  test.skip(!credentialsFor(role), `Local credentials are not configured for the ${role} role`)
})

test('@smoke protected destinations remain available at every viewport', async ({ page }) => {
  for (const destination of ['/', '/explore', '/contacts', '/notifications', '/nbox', '/saves', '/my-box']) {
    await openAuthenticatedPage(page, destination)
    await expect(page).toHaveURL(new RegExp(`${destination === '/' ? '/$' : `${destination}$`}`))
  }
})

test('@smoke visible navigation works without relying on hover', async ({ page }) => {
  await openAuthenticatedPage(page)

  const mobileNavigation = page.locator('.mobile-bar')
  if (await mobileNavigation.isVisible()) {
    for (const destination of ['/contacts', '/notifications', '/nbox', '/yo']) {
      await mobileNavigation.locator(`a[href="${destination}"]`).click()
      await expect(page).toHaveURL(new RegExp(`${destination}$`))
    }
  } else {
    const desktopNavigation = page.locator('.side-nav')
    await expect(desktopNavigation).toBeVisible()
    for (const destination of ['/explore', '/contacts', '/nbox', '/saves']) {
      await desktopNavigation.locator(`a[href="${destination}"]`).click()
      await expect(page).toHaveURL(new RegExp(`${destination}$`))
    }
  }
})
