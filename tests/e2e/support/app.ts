import { expect, type Page, type TestInfo } from '@playwright/test'

export async function openAuthenticatedPage(page: Page, path = '/'): Promise<void> {
  await page.goto(path, { waitUntil: 'domcontentloaded' })
  await expect(page, 'The authenticated session should not redirect to login').not.toHaveURL(/\/login(?:\?|$)/)
  await expect(page.locator('.brand-logo')).toBeVisible()
}

export async function captureViewport(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  const sensitiveIdentity = page.locator('.side-link-info, .mobile-menu-profile, [data-e2e-sensitive]')

  await page.screenshot({
    path: testInfo.outputPath(`${name}.png`),
    animations: 'disabled',
    caret: 'hide',
    fullPage: false,
    mask: [sensitiveIdentity],
    maskColor: '#ffd23f',
  })
}

export function hasHorizontalOverflow(page: Page): Promise<boolean> {
  return page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth + 1)
}

export async function openFollowableProfile(page: Page, onlyNotFollowing = false): Promise<boolean> {
  const profilePaths = new Set<string>()

  for (const sourcePath of ['/', '/contacts', '/notifications']) {
    await openAuthenticatedPage(page, sourcePath)
    await page.locator('.spinner').waitFor({ state: 'hidden', timeout: 15_000 }).catch(() => {})
    const paths = await page.locator('a[href^="/profile/"]').evaluateAll(links =>
      links
        .map(link => link.getAttribute('href'))
        .filter((href): href is string => Boolean(href)),
    )
    paths.forEach(path => profilePaths.add(path))
  }

  for (const profilePath of profilePaths) {
    await openAuthenticatedPage(page, profilePath)
    await page.locator('.spinner').waitFor({ state: 'hidden', timeout: 15_000 }).catch(() => {})
    const followButton = page.getByTestId('profile-follow-button')
    if (await followButton.isVisible().catch(() => false)) {
      if (!onlyNotFollowing || await followButton.getAttribute('aria-pressed') === 'false') return true
    }
  }

  return false
}
