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
