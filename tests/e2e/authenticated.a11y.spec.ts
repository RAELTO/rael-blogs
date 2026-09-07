import AxeBuilder from '@axe-core/playwright'
import { expect, test } from '@playwright/test'
import { openAuthenticatedPage, openFollowableProfile } from './support/app'
import { credentialsFor, projectAuthRole } from './support/auth'

test.beforeEach(({}, testInfo) => {
  const role = projectAuthRole(testInfo.project.metadata)
  test.skip(!credentialsFor(role), `Local credentials are not configured for the ${role} role`)
})

test('@a11y feed has no serious or critical WCAG violations', async ({ page }, testInfo) => {
  await openAuthenticatedPage(page)

  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze()
  const blocking = results.violations.filter(violation =>
    violation.impact === 'critical' || violation.impact === 'serious',
  )

  await testInfo.attach('axe-feed.json', {
    body: Buffer.from(JSON.stringify(results.violations, null, 2)),
    contentType: 'application/json',
  })

  expect(blocking, 'See the attached axe-feed.json report').toEqual([])
})

test('@a11y profile social controls have no serious or critical WCAG violations', async ({ page }, testInfo) => {
  const foundProfile = await openFollowableProfile(page)
  test.skip(!foundProfile, 'No other profile is currently visible to this test user')

  const results = await new AxeBuilder({ page })
    .include('.profile-header-row')
    .include('.profile-social-stats')
    .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
    .analyze()
  const blocking = results.violations.filter(violation =>
    violation.impact === 'critical' || violation.impact === 'serious',
  )

  await testInfo.attach('axe-profile-social.json', {
    body: Buffer.from(JSON.stringify(results.violations, null, 2)),
    contentType: 'application/json',
  })

  expect(blocking, 'See the attached axe-profile-social.json report').toEqual([])
})
