import { expect, test } from '@playwright/test'

test('@perf login stays within the local navigation budget', async ({ page }) => {
  const failedRequests: string[] = []
  page.on('requestfailed', request => failedRequests.push(request.url()))

  await page.goto('/login', { waitUntil: 'networkidle' })

  const timing = await page.evaluate(() => {
    const navigation = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming
    return {
      domInteractive: navigation.domInteractive,
      loadComplete: navigation.loadEventEnd,
    }
  })

  expect(failedRequests, 'The initial screen should not contain failed requests').toEqual([])
  expect(timing.domInteractive).toBeLessThan(3_000)
  expect(timing.loadComplete).toBeLessThan(5_000)
})
