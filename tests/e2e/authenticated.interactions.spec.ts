import { expect, test } from '@playwright/test'
import { openAuthenticatedPage, openFollowableProfile } from './support/app'
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

test('@smoke contacts expose follow controls at every viewport', async ({ page }, testInfo) => {
  await openAuthenticatedPage(page, '/contacts')
  const isMobile = (testInfo.project.use.viewport?.width ?? 0) <= 600

  if (isMobile) {
    await page.getByRole('button', { name: 'Your contacts' }).click()
    const contactRows = page.locator('.contacts-mobile-friend-row')
    test.skip(await contactRows.count() === 0, 'This test user has no contacts')
    await contactRows.first().getByRole('button', { name: 'Options' }).click()
    await expect(page.getByTestId('contact-sheet-follow-button')).toBeVisible()
    return
  }

  await page.locator('.contacts-side-panel').getByRole('button', { name: /^All/ }).click()
  const followButtons = page.getByTestId('contact-follow-button')
  test.skip(await followButtons.count() === 0, 'This test user has no contacts')
  await expect(followButtons.first()).toBeVisible()
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

test('@mutation follow state persists after reload and is restored', async ({ page }, testInfo) => {
  test.skip(process.env.E2E_ALLOW_MUTATIONS !== 'true', 'Remote mutations require an explicit local opt-in')
  test.skip(testInfo.project.name !== 'desktop-1440', 'Run the remote mutation once, not for every viewport')

  const foundProfile = await openFollowableProfile(page, true)
  test.skip(!foundProfile, 'No visible unfollowed profile is currently available to this test user')

  const followButton = page.getByTestId('profile-follow-button')
  await expect(followButton).toBeEnabled()
  await expect(followButton).toHaveAttribute('aria-pressed', 'false')

  await followButton.click()
  await expect(followButton).toHaveAttribute('aria-pressed', 'true')
  await expect(page.locator('.toast')).toContainText('Following')
  await expect(followButton).toBeEnabled()
  await expect(followButton).toHaveAttribute('aria-pressed', 'true')

  await page.reload({ waitUntil: 'domcontentloaded' })
  await expect(page.getByTestId('profile-follow-button')).toHaveAttribute('aria-pressed', 'true')

  await page.getByTestId('profile-follow-button').click()
  await expect(page.locator('.toast')).toContainText('Unfollowed')
  await expect(page.getByTestId('profile-follow-button')).toBeEnabled()
  await expect(page.getByTestId('profile-follow-button')).toHaveAttribute('aria-pressed', 'false')
})
