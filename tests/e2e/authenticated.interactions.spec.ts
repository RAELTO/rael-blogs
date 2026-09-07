import { expect, test } from '@playwright/test'
import { openAuthenticatedPage } from './support/app'
import { credentialsFor, projectAuthRole } from './support/auth'

test.beforeEach(({}, testInfo) => {
  const role = projectAuthRole(testInfo.project.metadata)
  test.skip(!credentialsFor(role), `Local credentials are not configured for the ${role} role`)
})

test('@smoke reaction menus work without hover', async ({ page }) => {
  await openAuthenticatedPage(page)
  await expect(page.locator('.spinner')).toBeHidden({ timeout: 15_000 })

  const card = page.locator('.box-card').first()
  await expect(card).toBeVisible()

  const voteTrigger = card.locator('.box-action-trigger').nth(0)
  await voteTrigger.focus()
  await page.keyboard.press('Enter')
  await expect(card.getByRole('menu', { name: 'Vote on this post' })).toBeVisible()

  const reactionTrigger = card.locator('.box-action-trigger').nth(1)
  await reactionTrigger.click()
  await expect(card.getByRole('menu', { name: 'React to this post' })).toBeVisible()
})

test('@mutation poll selection persists after reload and can be restored', async ({ page }, testInfo) => {
  test.skip(process.env.E2E_ALLOW_MUTATIONS !== 'true', 'Remote mutations require an explicit local opt-in')
  test.skip(testInfo.project.name !== 'desktop-1440', 'Run the remote mutation once, not for every viewport')

  await openAuthenticatedPage(page)
  await expect(page.locator('.spinner')).toBeHidden({ timeout: 15_000 })

  const poll = page.locator('.poll-wrap').first()
  await expect(poll).toBeVisible()

  const options = poll.locator('.poll-option')
  expect(await options.count()).toBeGreaterThan(1)

  const initiallySelected = await options.evaluateAll((buttons) =>
    buttons.findIndex((button) => button.getAttribute('aria-pressed') === 'true'),
  )
  const targetIndex = initiallySelected === 0 ? 1 : 0

  await options.nth(targetIndex).click()
  await expect(options.nth(targetIndex)).toHaveAttribute('aria-pressed', 'true')

  await page.reload({ waitUntil: 'domcontentloaded' })
  await expect(page.locator('.spinner')).toBeHidden({ timeout: 15_000 })
  await expect(page.locator('.poll-wrap').first().locator('.poll-option').nth(targetIndex))
    .toHaveAttribute('aria-pressed', 'true')

  const restoredPoll = page.locator('.poll-wrap').first()
  if (initiallySelected >= 0) {
    await restoredPoll.locator('.poll-option').nth(initiallySelected).click()
    await expect(restoredPoll.locator('.poll-option').nth(initiallySelected))
      .toHaveAttribute('aria-pressed', 'true')
  } else {
    await restoredPoll.locator('.poll-option').nth(targetIndex).click()
    await expect(restoredPoll.locator('.poll-option').nth(targetIndex))
      .toHaveAttribute('aria-pressed', 'false')
  }
})
