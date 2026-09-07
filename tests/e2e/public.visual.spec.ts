import { expect, test } from '@playwright/test'
import { captureViewport, hasHorizontalOverflow } from './support/app'

test('@visual login fits the desktop viewport', async ({ page }, testInfo) => {
  await page.goto('/login', { waitUntil: 'domcontentloaded' })
  await expect(page.locator('.auth-card')).toBeVisible()
  expect(await hasHorizontalOverflow(page), 'The login page should not scroll horizontally').toBe(false)
  await captureViewport(page, testInfo, 'login')
})
