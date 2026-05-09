# Changelog

All notable changes to NBOX will be documented in this file.

This project follows semantic versioning for product milestones:

- `0.x`: active product evolution before a public stable release.
- `1.0.0`: first stable public version.

## [0.1.0] - 2026-05-08

### Added

- Introduced the first NBOX social feed foundation.
- Added the NBOX app shell with header, left sidebar, right sidebar, and notification dropdown.
- Added the core feed experience around Boxes and Drops.
- Added Box cards, composer card, stories rail, feed mode selector, comments modal, reactions detail modal, share modal, and Drop modal.
- Added NBOX branding assets and favicon.
- Added public Box detail, notifications, and not found pages.
- Added feature hooks for boxes, comments, reactions, votes, and shares.
- Added the initial NBOX phase 1 Supabase schema migration.
- Added roadmap updates for the NBOX evolution.

### Changed

- Renamed the package from `rael-blogs` to `nbox`.
- Set the project version to `0.1.0`.
- Reworked the home, profile, login, tag, and layout experience toward the NBOX social product direction.
- Updated the visual system for the new neo-brutalist social interface.

### Removed

- Removed legacy blog/post-specific components, hooks, and pages that no longer match the NBOX phase 1 architecture.
