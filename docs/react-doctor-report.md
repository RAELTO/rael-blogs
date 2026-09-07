# React Doctor Report

Date: 2026-09-06

Tool: `react-doctor@0.1.6`

Command: `npm run doctor`

Project: `nbox`

## Summary

React Doctor score: **90 / 100**

Status: **Great**

Current quality gates:

- React Doctor: 90 issues across 39 of 51 scanned product files.
- ESLint: passing.
- Production build: passing.
- Playwright: 44 of 44 browser, viewport, navigation, interaction, visual, performance, and accessibility checks passing.
- npm audit: 0 known vulnerabilities.

The Playwright test directory is deliberately outside the React Doctor scan. It is non-product test code with framework-required patterns, while ESLint and Playwright still validate it directly.

## Improvements In This Baseline

- Feed engagement reads are aggregated per visible feed instead of issuing reaction, vote, save, and share queries from every card.
- Authenticated feed routes are lazy-loaded, reducing the main entry chunk from 284.84 kB to 254.97 kB (83.05 kB to 78.75 kB gzip) in the current build.
- Contact mutations invalidate the related contacts, requests, status, suggestions, and search caches.
- Supabase query and mutation errors propagate to TanStack Query instead of being silently treated as valid data.
- Responsive navigation covers the same primary destinations across desktop, tablet, and mobile.
- Like/dislike and emoji menus work with touch and keyboard input, not only pointer hover.
- Dialogs have labels, focus containment, Escape handling, and focus restoration.
- Interactive feed, story, composer, contact, and conversation surfaces use semantic controls or keyboard equivalents.
- Inline text previously below 12px was raised to a readable minimum, visible three-dot sequences were replaced with typographic ellipses, and muted text contrast was improved.
- Screenshot captures wait for settled content and mask local account identity blocks.

## Remaining Findings

The remaining 90 diagnostics are primarily maintainability work rather than release blockers:

- 22 large inline-style objects that should move into reusable CSS classes when their screens are next edited.
- 21 unused TypeScript types and 10 unused exports that need intentional API/dead-code review before removal.
- 14 backdrop click-handler warnings across seven dialogs. Every affected dialog already provides a close button, Escape handling, focus trapping, and focus restoration; a future shared backdrop component can remove the duplicated pattern cleanly.
- Four state-heavy components that may benefit from reducers and two large feed/drop components that should be split along stable UI boundaries.
- A small number of effect/state-shape suggestions that should be assessed during focused component refactors.

## Reviewed False Positives

React Doctor does not recognize Supabase Realtime cleanup performed with `supabase.removeChannel(channel)`. The following effects were manually verified to return that cleanup and receive narrow rule overrides in `react-doctor.config.json`:

- `src/components/chat/MessageNotifier.tsx`
- `src/components/notifications/NotifNotifier.tsx`
- `src/features/chat/useMessages.ts`

The override is limited to `react-doctor/effect-needs-cleanup`; all other rules remain active on those files.

## Recommended Next Work

1. Extract a shared accessible dialog/backdrop primitive and migrate the seven remaining modal overlays.
2. Split `BoxCard` and `DropModal` into focused subcomponents without changing their data boundaries.
3. Move repeated inline style groups into named neobrutalist CSS classes.
4. Review unused exports and types against the roadmap before deleting them.
5. Profile the large shared logo/vendor and profile chunks before changing code-splitting boundaries.

React Doctor is a trend indicator, not the sole quality gate. Keep ESLint, the production build, Playwright, Axe, and visual inspection in the release checklist.
