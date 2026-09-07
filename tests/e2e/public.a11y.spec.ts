import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'

test('@a11y login has no serious or critical WCAG violations', async ({ page }, testInfo) => {
  await page.goto('/login', { waitUntil: 'domcontentloaded' })
  await expect(page.locator('.auth-card')).toBeVisible()

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze()

  const blocking = results.violations.filter(violation =>
    violation.impact === 'critical' || violation.impact === 'serious',
  )

  await testInfo.attach('axe-login.json', {
    body: Buffer.from(JSON.stringify(results.violations, null, 2)),
    contentType: 'application/json',
  })

  expect(blocking, 'See the attached axe-login.json report').toEqual([])
})
