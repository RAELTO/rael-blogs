# React Doctor Report

Date: 2026-05-11  
Tool: `react-doctor@0.1.6`  
Command: `npm run doctor`  
Project: `nbox`

## Summary

React Doctor score: **71 / 100**  
Status: **Needs work**

Baseline checks:

- `npm run lint`: passed
- `npm run build`: passed

React Doctor detected **336 issues across 73 / 86 source files**.

Most findings are maintainability, accessibility, design consistency, or refactor suggestions. The project still builds and passes ESLint, so this should be treated as a quality roadmap rather than an immediate release blocker.

## Highest Priority Findings

### 1. Subscription Cleanup Review

React Doctor reported 3 `react-doctor/effect-needs-cleanup` findings:

- `src/components/chat/MessageNotifier.tsx:23`
- `src/components/notifications/NotifNotifier.tsx:14`
- `src/features/chat/useMessages.ts:24`

These effects use Supabase Realtime `.subscribe(...)`. The current implementation returns `supabase.removeChannel(channel)`, so these may be false positives caused by the tool not recognizing Supabase cleanup patterns.

Recommendation:

- Review each effect manually.
- Keep cleanup explicit.
- If needed, refactor to make the cleanup easier for tools and humans to recognize.
- Do not change behavior unless there is an actual leak.

### 2. Accessibility Issues

React Doctor reported:

- 26 `jsx-a11y/click-events-have-key-events`
- 26 `jsx-a11y/no-static-element-interactions`
- 12 `jsx-a11y/label-has-associated-control`
- 1 `jsx-a11y/anchor-is-valid`
- 1 `jsx-a11y/iframe-has-title`

Recommendation:

- Convert clickable `div`/`span` elements to semantic `button` or `a` elements where possible.
- Add keyboard handlers only when a semantic element is not practical.
- Associate form labels using `htmlFor` + `id`.
- Add a `title` to embedded iframes.
- Fix the invalid anchor in `LoginPage`.

This is the best first improvement area because it improves real usability and usually has low implementation risk.

### 3. Dead Code and Unused API Surface

React Doctor reported:

- 10 unused files via `knip/files`
- 10 unused exports via `knip/exports`
- 20 unused types via `knip/types`

Examples include:

- `src/App.css`
- `src/data/notifications.ts`
- `src/components/auth/AdminOnly.tsx`
- `src/components/auth/ProtectedRoute.tsx`
- `src/components/ui/Chip.tsx`
- `src/components/ui/Icon.tsx`
- `src/components/ui/RichEditor.tsx`
- `src/components/layout/AppLayout.tsx`
- `src/components/layout/Footer.tsx`

Recommendation:

- Verify whether each item is truly unused.
- Delete dead files only after checking routes, lazy imports, planned features, and documentation references.
- Keep intentional placeholders only if they are documented or clearly part of near-term work.

This should be handled before large refactors to reduce noise.

## Medium Priority Findings

### Inline Styles

React Doctor reported 73 `react-doctor/no-inline-exhaustive-style` findings.

Recommendation:

- Do not rewrite every inline style immediately.
- Prioritize repeated components and large UI surfaces:
  - `DropModal`
  - `CommentsModal`
  - `ReactionsDetailModal`
  - `InboxPage`
  - `NotificationsDropdown`
- Move repeated style objects to CSS classes in `globals.css` or component-specific class names.

This is a maintainability improvement, not an urgent bug.

### Tiny Text

React Doctor reported 68 `react-doctor/no-tiny-text` findings.

Recommendation:

- Audit the visual language before blindly increasing all small text.
- Some 10-11px text is part of the neobrutalist/mono label style.
- Prioritize body text, metadata in mobile views, modal content, and interactive labels.
- Keep short uppercase labels small only when readability remains acceptable.

### High z-index Values

React Doctor reported 9 `react-doctor/no-z-index-9999` findings.

Recommendation:

- Define a small z-index scale in CSS variables, for example:
  - `--z-dropdown`
  - `--z-modal`
  - `--z-popover`
  - `--z-toast`
- Replace arbitrary values with the scale over time.
- Avoid changing all modal stacking at once unless screenshots are verified.

## Lower Priority Findings

### Array Iteration Micro-optimizations

React Doctor reported several performance suggestions:

- `.filter().map()` can be combined
- `.map().filter(Boolean)` can use `.flatMap()`
- `array.find()` inside loops can use a `Map`
- `array.sort()[0]` can use min/max logic

Recommendation:

- Fix only where code is hot or frequently executed.
- Prioritize feed, chat, notifications, and large lists.
- Avoid making code harder to read for negligible gains.

### React 19 API Suggestions

React Doctor reported `react-doctor/no-react19-deprecated-apis` for `useContext`.

Recommendation:

- Treat this as optional modernization, not a bug.
- The current `useContext` usage is valid and widely supported.
- Consider `use()` only when there is a clear benefit or when React ecosystem guidance stabilizes around it.

### Component Size and State Shape

React Doctor reported:

- `DropModal` as a large component
- `RichEditor` as a large component
- several components with many `useState` calls

Recommendation:

- Do not split components just to satisfy the metric.
- Refactor when touching those areas for feature work.
- Start with extracting pure subcomponents from `DropModal`, because it is user-facing and high-complexity.

## False Positives / Needs Human Review

### `AUTH_TOAST` Secret Warning

React Doctor flagged:

- `src/components/feed/BoxCard.tsx:180`

Finding: `react-doctor/no-secrets-in-client-code`

Assessment:

- Likely false positive.
- `AUTH_TOAST` is a UI message, not a secret.

Recommendation:

- No security action required.
- If noise becomes a problem, suppress this specific finding with an inline React Doctor disable comment or config rule.

### Supabase Realtime Cleanup

The cleanup findings may be false positives because the code already removes Supabase channels.

Recommendation:

- Review manually.
- If correct, either leave as-is or add suppressions only after confirming no leak.

## Recommended Fix Order

1. Review the 3 Supabase subscription cleanup findings.
2. Fix accessibility issues that affect keyboard users and labels.
3. Remove verified dead files, exports, and types.
4. Add a z-index scale and migrate modal/popover stacking gradually.
5. Refactor repeated inline styles in high-traffic components.
6. Audit tiny text in mobile and modal views.
7. Apply small performance cleanups in hot paths only.
8. Consider large-component refactors when touching those features naturally.

## Commands

Run full report:

```bash
npm run doctor
```

Run score only:

```bash
npm run doctor:score
```

Run diff against `main`:

```bash
npm run doctor:diff
```

## Current Baseline

Use this score as the first baseline:

```text
React Doctor: 71 / 100
ESLint: pass
Build: pass
```

Future changes should try not to reduce the score unless the finding is a known false positive or an intentional design tradeoff.
