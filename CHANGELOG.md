# Changelog

## 0.3.1 — 2026-07-23

### Fixed
- `.menu__item--active .menu__badge` — the translucent white fill washed out
  on light pastel gradients. The active badge now keeps the same solid
  `--primary` / `--on-primary` pill as inactive items and gains a 2px
  `--on-gradient` ring that separates it from the gradient in any theme.
  The compact rail's dot swaps its `--surface-1` ring for the same
  `--on-gradient` ring when its item is active.
- `.timeline__item--muted` no longer greys out `timeline__title` — a greyed
  title read as disabled and dropped below body-text contrast. Muting now
  de-emphasises the decoration only (grey dot/count via `--_c`) and lightens
  the title's weight (700 → 600); the sub line is muted everywhere anyway.

## 0.3.0 — 2026-07-17

### Added
- `.menu--compact` — icons-only rail variant of the menu: item labels hide,
  section headings collapse into thin dividers, the badge shrinks to a
  notification dot pinned to the icon corner. Same markup as the full menu,
  so a sidebar toggles between the two with one class.
- Pure-CSS tooltips for compact menu items via `data-tip="…"` on
  `.menu__item` (rendered with the theme's `--tip-bg` / `--tip-text` tokens,
  shown on hover/focus).
- Docs: "Compact rail" section in `docs/menu.html`; README coverage for the
  compact variant and `data-tip`.

### Changed
- `.menu__badge` now uses a solid `--primary` fill with `--on-primary` text
  in both layouts (was a translucent neutral pill), so the full menu and the
  compact rail read as one system.

### Fixed
- `.menu__item` is now `position: relative` — the compact badge and tooltip
  anchor to their item instead of the nearest positioned ancestor (the host
  sidebar).

## 0.2.0 — 2026-07-17

### Added
- New components: `.menu`, `.stat` (with `--row`, `__body`, `__icon--plain`),
  `.ring`, `.timeline` (with `--row`; `--now` accent = primary).
- Two-colour brand gradients: `--gradient` built from `--primary` +
  `--secondary`; `.btn--gradient`, `.badge--gradient`, `--on-gradient` token.

## 0.1.0 — 2026-07-02

- Initial release: framework-agnostic, themeable CSS component library
  (SCSS source, glass / flat / neu skins, optional JS behaviour layer).
