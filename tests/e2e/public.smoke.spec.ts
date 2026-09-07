import { expect, test } from '@playwright/test'

test('@smoke login exposes the essential authentication controls', async ({ page }) => {
  await page.goto('/login', { waitUntil: 'domcontentloaded' })

  await expect(page.locator('.brand-logo')).toBeVisible()
  await expect(page.getByRole('button', { name: 'Sign in', exact: true })).toBeVisible()
  await expect(page.getByRole('button', { name: 'Create account', exact: true })).toBeVisible()
  await expect(page.getByLabel('Email')).toBeEditable()
  await expect(page.getByLabel('Password')).toBeEditable()
  await expect(page.getByRole('button', { name: 'Go to feed' })).toBeEnabled()
})

test('@smoke protected routes preserve the requested destination', async ({ page }) => {
  await page.goto('/contacts', { waitUntil: 'domcontentloaded' })

  await expect(page).toHaveURL(/\/login\?next=%2Fcontacts$/)
  await expect(page.getByRole('button', { name: 'Go to feed' })).toBeVisible()
})

test('@smoke authentication modes remain reachable', async ({ page }) => {
  await page.goto('/login', { waitUntil: 'domcontentloaded' })

  await page.getByRole('button', { name: 'Create account', exact: true }).click()
  await expect(page.getByRole('textbox', { name: 'Name', exact: true })).toBeVisible()
  await expect(page.getByRole('textbox', { name: 'Username', exact: true })).toBeVisible()

  await page.locator('.auth-tabs').getByRole('button', { name: 'Sign in', exact: true }).click()
  await page.getByRole('button', { name: 'Forgot your password?' }).click()
  await expect(page.getByRole('button', { name: 'Send link' })).toBeVisible()
})
