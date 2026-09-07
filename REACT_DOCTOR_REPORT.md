# React Doctor Report

**Tool:** react-doctor v0.1.6  
**Score:** 86/100 - Great  
**Diagnostics:** 172 total (3 errors, 169 warnings)  
**Date:** 2026-05-28  

## Latest Run Summary

React Doctor was executed after a no-UI-change cleanup pass. The score improved from **82/100** to **86/100** in this pass, and the total issue count dropped from **196** to **172**.

The project still passes:

- `npm run lint`
- `npm run build`

## Fixed In This Pass

- Added `htmlFor`/`id` associations for auth, password reset, and profile form fields.
- Replaced non-control `<label>` elements in the appearance modal with semantic text containers.
- Replaced an array index key in palette swatches with stable keys.
- Combined `.filter().map()` style chains into single-pass reductions in saved boxes and tag parsing.
- Batched sidebar hover style mutations with `Object.assign`.
- Renamed the unauthenticated interaction toast constant to avoid a React Doctor false positive for client-side secrets.
- Fixed an invalid curly quote in `CheckEmailPage.tsx` that was breaking TypeScript parsing.

## Remaining Issues Not Touched

These were intentionally left unchanged because they either affect visual design, require broader refactors, or are confirmed false positives.

### State and Effects

React Doctor still reports three `effect-needs-cleanup` errors:

- `src/components/notifications/NotifNotifier.tsx`
- `src/components/chat/MessageNotifier.tsx`
- `src/features/chat/useMessages.ts`

Manual review: these effects already return Supabase cleanup functions with `supabase.removeChannel(channel)`, so this is currently treated as a false positive.

### Accessibility

Remaining accessibility warnings are mostly:

- Tiny text in the neobrutalist mono visual system.
- Clickable non-interactive containers that would require semantic refactors.
- `autoFocus` warnings in auth flows.

These were not changed because they may alter the interface or expected interaction behavior.

### Architecture

Remaining architecture warnings include:

- `prefer-useReducer` in large stateful components.
- `no-giant-component` for `BoxCard` and `DropModal`.
- Inline style extraction opportunities.

These are valid but should be handled as dedicated refactors, not as small diagnostic fixes.

### TanStack Query

React Doctor still flags contact mutations as missing invalidation, but the mutations call the shared `invalidateContacts()` helper. This appears to be a static-analysis limitation.

### Dead Code

Some `knip` warnings remain for exported types/utilities. These should be reviewed carefully before removal because several exports represent shared database/domain types.

## Recommendation

Keep the current no-UI cleanup committed separately. The next safe non-visual pass should focus on verified dead exports only. Larger items like `BoxCard`/`DropModal` decomposition and semantic clickable-element refactors should be treated as separate UI-risk work.
