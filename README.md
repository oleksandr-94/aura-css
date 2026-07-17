# Aura

A framework-agnostic, themeable, skinnable CSS component library authored in SCSS.
Works in any project — plain HTML, React/Vue/Svelte, or alongside Tailwind — via a
single stylesheet. Theming and surface style ("skin") are decoupled from markup, so the
same components can be glass in one app and flat in another, on different palettes.

> **Status:** early foundation. Complete theming/skin/token system + a growing component
> set (button, card, stat, ring, timeline, menu, inputs, overlays, and more). More
> components are being added on top of this base.

---

## Quick start

```bash
# from aura/
npm install     # sass + postcss + esbuild toolchain (dev only)
npm run build   # → dist/ : CSS (expanded + min, per skin) + JS bundles + types
```

Include the stylesheet and set a theme on the root element:

```html
<html data-theme="aura-dark">
  <head>
    <link rel="stylesheet" href="dist/aura.css" />
  </head>
  <body>
    <button class="btn">Primary</button>
    <div class="card"><h3 class="card__title">Hello</h3></div>
  </body>
</html>
```

No build in your consuming project? Just ship the compiled `dist/aura.css`.

---

## The three config levers

Everything adapts through `src/_config.scss`. Override with Sass configuration:

```scss
@use "aura/src/index" with (
  $prefix: 'au-',     // namespace all classes → .au-btn (default: none)
  $skin:   flat,      // surface treatment: glass | flat | neu
  $themes: ( ... )    // your colour palettes (see Theming)
);
```

| Lever | What it controls | Default |
|-------|------------------|---------|
| `$prefix` | Class-name namespace (avoid collisions with other libs) | `''` |
| `$skin` | Surface look — glass / flat / neu | `glass` |
| `$themes` | Colour palettes, swapped at runtime via `data-theme` | dark + light |

---

## Theming

Colours follow **[Material 3 color roles](https://m3.material.io/styles/color/roles)**:
every fill colour has a paired `on-*` content colour for guaranteed contrast, and a
subtle `*-container` tint for badges/alerts.

You only define **base colours** — each `on-*` (text-on-colour) is **derived
automatically** by luminance, so "white-on-white" is structurally impossible.

### Token contract

Components reference **only** these CSS variables (never hardcoded colours):

**Accents & status** — each has `--<role>`, `--on-<role>`, `--<role>-container`, `--on-<role>-container`:
`primary`, `secondary`, `accent`, `success`, `warning`, `error`, `info`

**Surfaces & lines**
| Token | Use |
|-------|-----|
| `--surface` | Page background |
| `--surface-1` / `--surface-2` | Card / elevated (modal, popover) |
| `--on-surface` / `--on-surface-muted` | Body text / secondary text |
| `--outline` / `--outline-strong` | Dividers / control borders |
| `--glass-film` / `--glass-film-2` | Frosted film (glass skin only) |
| `--shadow-1` / `--shadow-2` | Elevation |

**Static scales** (theme-independent)
`--radius-sm|md|lg|pill` · `--space-1|2|3|4|6|8` · `--font` · `--fs-xs|sm|md|lg|xl` ·
`--blur` · `--z-dropdown|sticky|modal|toast` ·
`--gradient` (general brand gradient, auto-built from the theme's accents)

### Add a theme

**Quickest:** open `docs/theme-generator.html` — pick accent colours + a base mode, get a
live preview and a ready-to-paste `[data-theme]` block (with `on-*` and containers derived).

Or add an entry to `$themes` — only base colours required:

```scss
$themes: (
  ocean: (
    primary: #0EA5E9, secondary: #6366F1, accent: #22D3EE,
    success: #16A34A, warning: #D97706, error: #DC2626, info: #3B82F6,
    surface: #0b1220, surface-1: #131c2e, surface-2: #1b2740,
    on-surface: #e6edf7, on-surface-muted: rgba(230,237,247,.62),
    outline: rgba(255,255,255,.14), outline-strong: rgba(255,255,255,.24),
    glass-film: rgba(255,255,255,.06), glass-film-2: rgba(255,255,255,.10),
    shadow-1: (0 8px 32px rgba(0,0,0,.4)), shadow-2: (0 16px 44px rgba(0,0,0,.5)),
  ),
);
```

Rebuild, then use it: `<html data-theme="ocean">`. Themes can also be layered per
subtree — nest `data-theme` on any element.

---

## Skins

The **skin** is the surface treatment, independent of colour. Components request their
chrome via three mixins — `surface()` (panels/cards), `field()` (input wells) and
`control()` (filled buttons) — and the active skin renders each. So buttons, inputs and
cards all adapt together.

| Skin | Card (`surface`) | Button (`control`) | Input (`field`) |
|------|------------------|--------------------|-----------------|
| `glass` | Frosted film + blur | Solid + soft glow + gloss | Translucent well + blur |
| `flat` | Solid + border | Solid fill | Solid + border |
| `neu` | Extruded shadows | Extruded, inset on press | Inset well |

Switch at build time with `$skin`. Each skin lives in its own file under `src/skins/`;
adding a new one = new file + one branch in `src/_surface.scss`.

Prebuilt skin outputs: `dist/aura.css` (glass, default), `dist/aura-flat.css`,
`dist/aura-neu.css`.

---

## Components

### Button — `.btn`

Base class renders the **primary** button. Add modifiers to change colour, style, size.

| Class | Effect |
|-------|--------|
| `.btn` | Primary (default) |
| `.btn--secondary` / `.btn--accent` | Accent colours |
| `.btn--success` / `.btn--warning` / `.btn--error` / `.btn--info` | Status colours |
| `.btn--ghost` | Transparent, bordered |
| `.btn--outline` | Outlined; combine with a colour modifier |
| `.btn--gradient` | Two-colour gradient — `--<role>` → `--<role>-2` (brand `--primary → --secondary` by default); combine with a colour modifier (`.btn--gradient.btn--success`) |
| `.btn--sm` / `.btn--lg` | Sizes |
| `.btn--block` | Full width |
| `.btn--disabled` / `[disabled]` | Disabled state |

States handled automatically: `:hover`, `:active`, `:focus-visible`, `:disabled`.

```html
<button class="btn">Primary</button>
<button class="btn btn--secondary">Secondary</button>
<button class="btn btn--error btn--outline">Delete</button>
<button class="btn btn--lg btn--block">Continue</button>
<button class="btn" disabled>Disabled</button>
```

**Gradient tokens (optional, per theme):** `--<role>-2` sets the second gradient stop for a role
(e.g. `primary-2`, `error-2`). Without it the second stop falls back to a darker shade of the
colour, so the gradient stays visible (a tonal light→dark); `--primary` uniquely falls back to
`--secondary`, giving the brand two-tone. `--on-gradient` forces the text colour on gradient fills
only — solid buttons keep their auto on-colour.

### Card — `.card`

Surface container rendered through the active skin (glass/flat/neu).

| Class | Element / effect |
|-------|------------------|
| `.card` | Container (padded, uses `surface()`) |
| `.card__header` / `.card__title` / `.card__body` / `.card__actions` | Header row / heading / text / footer |
| `.card--success` / `--warning` / `--error` / `--info` | Coloured status accent (left bar) |
| `.card--gradient` | Gradient fill; combine with a colour modifier |

```html
<div class="card card--success">
  <div class="card__header">
    <h3 class="card__title">Acme Inc.</h3>
    <span class="badge badge--success">Active</span>
  </div>
  <p class="card__body">Enterprise plan · renews 12 Aug.</p>
</div>

<div class="card card--gradient card--error"> … </div>
```

### Stat — `.stat`

Metric card rendered through the active skin (like `.card`): icon slot + value + label. Colour
variants add a top accent bar and a faint tint from the same colour.

| Class | Element / effect |
|-------|------------------|
| `.stat` | Container (uses `surface()`) |
| `.stat--row` | Horizontal layout — icon left, text block right |
| `.stat__icon` / `.stat__value` / `.stat__label` | Icon chip / big value / caption |
| `.stat__icon--plain` | Transparent slot (sizes to its own content, e.g. a PNG) |
| `.stat__body` | Optional value+label wrapper (keeps them one block in `--row`) |
| `.stat__delta` | Optional trend line (inherits the accent colour) |
| `.stat--primary` / `--success` / `--warning` / `--error` / `--info` … | Accent bar + tint |

The icon chip size is a local token — `--_isize` (default `40px`); set it inline to grow the chip.

```html
<div class="stat stat--success">
  <div class="stat__icon"><svg>…</svg></div>
  <div class="stat__value">98.4%</div>
  <div class="stat__label">Uptime</div>
  <div class="stat__delta">▲ 0.2% vs last week</div>
</div>

<!-- horizontal: icon left, text right -->
<div class="stat stat--row stat--primary">
  <span class="stat__icon" style="--_isize:52px"><svg>…</svg></span>
  <div class="stat__body">
    <div class="stat__value">128</div>
    <div class="stat__label">Words in dictionary</div>
  </div>
</div>
```

### Ring — `.ring`

CSS-only radial progress (conic-gradient + mask, no SVG). Progress is set inline with `--val` (0–100).
The arc is the brand `--gradient` by default; colour variants make it a single accent.

| Class / var | Effect |
|-------------|--------|
| `.ring` + `style="--val:60"` | Ring at 60 % |
| `.ring__label` | Centred label |
| `.ring--sm` / `.ring--lg` | Sizes |
| `.ring--primary` / `--success` / `--warning` / `--error` … | Single-colour arc |

```html
<div class="ring" style="--val:60"><span class="ring__label">60%</span></div>
<div class="ring ring--success ring--lg" style="--val:80"><span class="ring__label">80%</span></div>
```

### Timeline — `.timeline`

Vertical feed of events: a rail with an accent dot per item, `--now` glows, `--muted` dims.

| Class | Element / effect |
|-------|------------------|
| `.timeline` | List with the vertical rail (`::before`) |
| `.timeline--row` | Horizontal items — `time \| body \| count` on one line |
| `.timeline__item` | One event (accent dot); `--now` / `--muted` states |
| `.timeline__time` | Timestamp line |
| `.timeline__body` / `.timeline__title` / `.timeline__sub` | Body wrapper / title / subtitle |
| `.timeline__count` | Trailing count pill |

`--now` is brand-coloured by default; override any item's dot/count colour with an inline `--_c`
(e.g. `style="--_c:var(--success)"`).

```html
<ol class="timeline">
  <li class="timeline__item timeline__item--now">
    <span class="timeline__time">Now · 14:20</span>
    <div class="timeline__body"><span class="timeline__title">Deploy started</span></div>
  </li>
  <li class="timeline__item">
    <span class="timeline__time">13:58</span>
    <div class="timeline__body"><span class="timeline__title">Build passed</span></div>
    <span class="timeline__count">128</span>
  </li>
</ol>
```

### Input — `.input` / `.select` / `.textarea`

Text controls whose "well" is rendered through the `field()` mixin, so they adopt the
active skin (glass / flat / neu). Wrap with `.field` to attach a label and hint.

| Class | Effect |
|-------|--------|
| `.input` / `.select` / `.textarea` | Base controls |
| `.input--sm` / `.input--lg` | Sizes |
| `.input--error` (also `--select`/`--textarea`) | Error state (red border) |
| `.field` | Labelled wrapper (label + control + hint) |
| `.field__label` | Label |
| `.field__hint` / `.field__hint--error` | Helper / error text |

States handled automatically: `:focus-visible` (primary ring), `:disabled`.

```html
<div class="field">
  <label class="field__label" for="email">Email</label>
  <input id="email" class="input" type="email" placeholder="you@studio.dev">
</div>

<div class="field">
  <label class="field__label" for="pw">Password</label>
  <input id="pw" class="input input--error" type="password">
  <span class="field__hint field__hint--error">At least 8 characters.</span>
</div>
```

### Badge — `.badge`

Small status label. Colour variants use soft `*-container` tints with a guaranteed-contrast
content colour.

| Class | Effect |
|-------|--------|
| `.badge` | Base (neutral) |
| `.badge--primary` / `--secondary` / `--accent` | Accent tints |
| `.badge--success` / `--warning` / `--error` / `--info` | Status tints |
| `.badge--outline` | Transparent, bordered |
| `.badge--gradient` | Two-colour gradient fill — `--<role>` → `--<role>-2` (brand `--primary → --secondary` by default); combine with a colour modifier (`.badge--gradient.badge--success`). Text uses `--on-gradient`. |
| `.badge--sm` / `.badge--lg` | Sizes |
| `.badge__dot` | Leading status dot |

```html
<span class="badge badge--success"><i class="badge__dot"></i> Active</span>
<span class="badge badge--error badge--outline">Failed</span>
<span class="badge badge--gradient">Brand</span>
<span class="badge badge--gradient badge--success">Success</span>
```

### Alert — `.alert`

A message panel with an accent bar and icon. Colour variants carry status meaning.

| Class | Effect |
|-------|--------|
| `.alert` | Base (primary) panel |
| `.alert--success` / `--warning` / `--error` / `--info` | Status colours |
| `.alert__icon` | Leading icon |
| `.alert__title` / `.alert__body` | Bold heading / muted description |

```html
<div class="alert alert--error">
  <span class="alert__icon">✕</span>
  <div>
    <div class="alert__title">Payment failed</div>
    <div class="alert__body">Your card was declined.</div>
  </div>
</div>
```

### Switch — `.switch`

A toggle for boolean settings. The track is a skin-aware well; when checked it fills with
the accent colour and shows a white thumb.

| Class | Effect |
|-------|--------|
| `.switch` | Toggle (wraps a checkbox) |
| `.switch__track` / `.switch__thumb` | Track / knob |
| `.switch--success` / `--warning` / `--error` | Checked colour |
| `.switch--sm` / `.switch--lg` | Sizes |

```html
<label class="switch">
  <input type="checkbox" checked>
  <span class="switch__track"></span>
  <span class="switch__thumb"></span>
</label>
```

### Checkbox — `.checkbox` · Radio — `.radio`

Custom controls set directly on the native input. The box/circle is a skin-aware well;
checked fills with the accent colour + white mark. `:indeterminate` (checkbox) shows a dash.

| Class | Effect |
|-------|--------|
| `.checkbox` / `.radio` | On the native input |
| `.checkbox--success` / `--warning` / `--error` | Checked colour |
| `.radio--success` / `--warning` / `--error` | Checked colour |

```html
<input type="checkbox" class="checkbox" checked>
<input type="radio" name="plan" class="radio radio--success" checked>
```

### Select — `.select`

Native `<select>` with a custom chevron. Same sizes (`--sm`/`--lg`) and validation
(`--error`/`--success`) as text inputs.

### Range — `.range` · File — `.file` · Rating — `.rating`

| Class | Effect |
|-------|--------|
| `.range` | Themed slider · `--success`/`--warning`/`--error` · `--sm`/`--lg` |
| `.file` | Styled file input · `.file--ghost` |
| `.rating` | Star rating on radios (CSS-only, submittable) · `--sm`/`--lg` |

```html
<input class="range range--success" type="range" value="80">
<input class="file" type="file">
<div class="rating">
  <input type="radio" name="r" value="5"><label>★</label>
  <input type="radio" name="r" value="4" checked><label>★</label>
  …
</div>
```

**Validation** — add `--error` / `--success` to any control; use `.field__label--required`
(adds `*`) and `.field__hint--error` / `--success` for messages.

### Tabs — `.tabs`

A tab bar with switchable panels. Point each `.tab` at a panel with `data-tab="#id"`; the
JS activates it and toggles panel visibility. Frameworks render active tab + panel from state.

| Class | Effect |
|-------|--------|
| `.tabs` | Container: pill (default) · `--underline` / `--lift` · `--sm` / `--lg` · `--block` |
| `.tab` / `.tab--active` | Tab item / selected |
| `.tab-panel` | Content panel (toggled via `hidden`) |
| `.tab-panels` | Panel container (plain by default; card after `--lift` tabs) |
| `.tab-card` | Wraps `.tabs` + `.tab-panels` into one connected card (no gap) |

```html
<div class="tabs" role="tablist">
  <button class="tab tab--active" data-tab="#p1">Overview</button>
  <button class="tab" data-tab="#p2">Activity</button>
</div>
<div id="p1" class="tab-panel">Overview…</div>
<div id="p2" class="tab-panel" hidden>Activity…</div>
```

### Group — `.group` (alias `.btn-group`)

Joins adjacent controls — buttons **and** form fields — into one segmented unit (square
inner corners, single shared border). Fields grow, buttons stay natural. `.group--block`
for full width.

```html
<!-- button group -->
<div class="group">
  <button class="btn btn--ghost">Day</button>
  <button class="btn btn--ghost">Week</button>
</div>

<!-- input group -->
<div class="group">
  <input class="input" placeholder="Search…">
  <button class="btn">Search</button>
</div>
```

**Radio segmented** — for single-select, `.segmented` uses native radios (CSS-only,
keyboard-accessible, form-submittable); the checked pill is skin-aware.

```html
<div class="segmented" role="radiogroup">
  <label class="segmented__option"><input type="radio" name="v" checked><span>Day</span></label>
  <label class="segmented__option"><input type="radio" name="v"><span>Week</span></label>
</div>
```

### Table — `.table`

Transparent data table (place in a `.card`). `.table--zebra` for stripes, `.table--compact` for tighter rows.

```html
<table class="table table--zebra"> … </table>
```

### Progress — `.progress` · Spinner — `.spinner`

| Class | Effect |
|-------|--------|
| `.progress` / `.progress__bar` | Track / fill (set width inline) |
| `.progress--success` / `--warning` / `--error` | Fill colour |
| `.spinner` | Loading spinner · `--sm` / `--lg` |

```html
<div class="progress"><span class="progress__bar" style="width:72%"></span></div>
<span class="spinner"></span>
```

### Tooltip — `.tooltip`

Pure-CSS tooltip on hover/focus, inverted vs. the theme. `.tooltip--bottom` to flip placement.

```html
<span class="tooltip">
  <button class="btn">Hover me</button>
  <span class="tooltip__text">Helpful hint</span>
</span>
```

---

## Interactive components (Modal, Dropdown)

Stateful components keep their state **in the DOM** as `data-state="open|closed"`; CSS
renders it. Nothing in the contract is tied to the library name.

- **Vanilla** — load the optional behaviour layer; it auto-wires triggers and adds
  scroll-lock, focus-trap, Esc and outside/backdrop close:
  ```html
  <script type="module" src="src/js/interactions.auto.js"></script>
  ```
  Triggers: `data-open="#id"`, `data-close`, `data-toggle`. (Prefix them via
  `configure({ prefix: 'ui' })` → `data-ui-open`.)
- **React / Vue / anything** — no library JS needed. Bind `data-state` to your own state
  and handle clicks your way. Optionally import pure helpers:
  `import { open, close, trapFocus, lockScroll } from './src/js/interactions.js'`.

### Modal — `.modal-overlay` + `.modal`

Mark the overlay `data-overlay` so the JS applies scroll-lock + focus-trap + backdrop-close.

```html
<button class="btn" data-open="#dlg">Open</button>
<div class="modal-overlay" id="dlg" data-state="closed" data-overlay>
  <div class="modal" role="dialog" aria-modal="true">
    <h3 class="modal__title">Title</h3>
    <p class="modal__body">Body…</p>
    <div class="modal__actions"><button class="btn btn--ghost" data-close>Close</button></div>
  </div>
</div>
```

### Dropdown — `.dropdown`

```html
<div class="dropdown" data-state="closed">
  <button class="btn" data-toggle>Menu <span class="dropdown__caret"></span></button>
  <div class="dropdown__menu">
    <a class="dropdown__item" href="#">Profile</a>
    <div class="dropdown__divider"></div>
    <a class="dropdown__item" href="#">Sign out</a>
  </div>
</div>
```

### Avatar — `.avatar`

Image or initials, with `--sm`/`--lg`/`--square`, an `.avatar__status` dot, and an
overlapping `.avatar-group`.

### Accordion — `.accordion`

Built on native `<details>` — zero JS. Add `name="…"` to items to make them exclusive.

```html
<div class="accordion">
  <details class="accordion__item" name="faq" open>
    <summary class="accordion__head">Question</summary>
    <div class="accordion__body">Answer…</div>
  </details>
</div>
```

### Toast — `.toast`

Show imperatively with the JS helper (auto-creates the container, auto-dismisses):

```js
import { toast } from './dist/interactions.mjs';
toast('Changes saved.', { type: 'success', timeout: 4000 });
```

### Pagination — `.pagination`

`.pagination__item` for pages/arrows; `--active` (skin-aware) / `--disabled`.
Variants: `.pagination--joined` (button-group style, shared borders) · `.pagination--sm`.
Use `.pagination__ellipsis` for `…` gaps in long ranges.

### Menu — `.menu`

A vertical navigation **primitive**, not a sidebar: it carries no width, position, or background of its
own, so the same `.menu` drops into a sidebar, drawer, or popover. The active item rides the brand
gradient; hover uses a soft accent tint.

| Class | Element / effect |
|-------|------------------|
| `.menu` | Vertical container (placement-agnostic) |
| `.menu__section` / `.menu__label` | Grouped block / uppercase heading |
| `.menu__item` | Row: icon slot (`> svg`) + label + trailing badge |
| `.menu__item--active` | Current item (gradient fill) |
| `.menu__item--disabled` | Non-interactive |
| `.menu__badge` | Trailing count / badge |

```html
<nav class="menu">
  <a class="menu__item menu__item--active" href="#"><svg>…</svg> <span>Dashboard</span></a>
  <a class="menu__item" href="#"><svg>…</svg> <span>Projects</span><span class="menu__badge">12</span></a>
</nav>
```

---

## Distribution

`npm run build` produces everything into `dist/` — Sass compiles the CSS (expanded +
minified per skin), PostCSS/autoprefixer adds vendor prefixes (targets from the
`browserslist` field), and esbuild bundles the JS.

**CSS** — one file per skin, expanded and minified:

| Skin | Expanded | Minified |
|------|----------|----------|
| glass (default) | `dist/aura.css` | `dist/aura.min.css` |
| flat | `dist/aura-flat.css` | `dist/aura-flat.min.css` |
| neu | `dist/aura-neu.css` | `dist/aura-neu.min.css` |

**JS** (optional behaviour layer):

| File | Use |
|------|-----|
| `dist/interactions.mjs` / `.min.mjs` | ESM — `import { open, toast } from '@oleksandr-94/aura-css'` (frameworks, `<script type=module>`) |
| `dist/interactions.global.min.js` | Minified IIFE — `<script src>` exposes `window.Aura` + auto-wires triggers |
| `dist/interactions.d.ts` | TypeScript types |

The global name is esbuild's `--global-name` flag — rename freely; the DOM contract is
unaffected.

**Package entry points** (`exports`):

```js
import { open, toast } from '@oleksandr-94/aura-css';        // JS (ESM) + types
import '@oleksandr-94/aura-css/css';                          // glass CSS  (also: @oleksandr-94/aura-css/css/min)
import '@oleksandr-94/aura-css/flat';                         // flat skin  (also: @oleksandr-94/aura-css/flat/min)
import '@oleksandr-94/aura-css/neu';                          // neu skin
// SCSS source for custom builds:  @use '@oleksandr-94/aura-css/scss' with ($skin: flat, $prefix: 'ui');
```

---

## Accessibility

- **Reduced motion** — Aura component transitions/animations are neutralised under
  `prefers-reduced-motion: reduce` (in the last cascade layer, so it never touches the
  host app's own motion).
- **Keyboard** — Modal: focus-trap, Esc, focus return. Dropdown: `↑`/`↓`/`Home`/`End`
  over items, Esc, `aria-expanded`, focus return. Tabs: `←`/`→` roving focus.
- **Screen readers** — Toasts announce via an `aria-live="polite"` region (errors use
  `role="alert"`); a `.sr-only` helper is provided for visually-hidden labels.
- **Focus visible** — every interactive component has a `:focus-visible` ring.

## Browser support

Aura targets an **evergreen baseline** (Chrome/Edge 111+, Firefox 113+, Safari 16.4+),
which is required for:

| Feature | Used for | If missing |
|---------|----------|------------|
| `color-mix()` | tints, hovers, neu shadows | no practical polyfill — hard requirement |
| Cascade layers (`@layer`) | override control | hard requirement |
| `backdrop-filter` | **glass skin only** | glass loses blur (film stays); use `flat`/`neu` |

These features are the same generation, so there is no meaningful fallback to add — the
baseline is documented rather than polyfilled. Non-glass skins (`flat`, `neu`) have the
lightest requirements.

---

## Architecture

```
aura/
├── src/                  # library source
│   ├── _config.scss      # the 3 levers: $prefix, $skin, $themes
│   ├── _functions.scss   # auto on-colour (contrast) derivation
│   ├── _tokens.scss      # emits static scales + generates every theme
│   ├── _surface.scss     # skin dispatcher: surface() / field()
│   ├── skins/            # _glass · _flat · _neu
│   ├── base/_reset.scss  # minimal reset in @layer base
│   ├── components/       # _button · _card · _menu · _stat · _ring · _timeline · …
│   ├── _layers.scss      # cascade-layer order
│   └── index.scss        # entry (default = glass)
├── builds/               # build presets (recipes): flat.scss …
├── dist/                 # compiled CSS output
├── demo/                 # live demo page
└── package.json
```

- **Cascade layers** — all Aura CSS lives in `@layer base, components`; your app's own
  unlayered styles always win, so overriding is easy.
- **Coexistence** — set `$prefix` to avoid class clashes with other libraries. With
  Tailwind v4 you can also map Aura's role variables into `@theme` to share one palette.
- **Watch out for aggressive host resets.** Because Aura's rules live in `@layer components`,
  any **unlayered** rule in your app beats them — that's the point, but broad resets can
  clobber components unintentionally. In particular:
  - `* { margin: 0 }` / `* { padding: 0 }` flatten component spacing (`.menu__section`,
    `.menu__badge`, button/badge padding).
  - `a { color: inherit }` recolours link-based components — e.g. the active `.menu__item`
    (which is an `<a>`) loses its on-gradient colour.

  Scope such resets to your own containers, or put your app's styles in their **own
  `@layer` declared after Aura** so the intended layer order is preserved. This matters
  most for link-based components (`menu`, and future `breadcrumbs`).

---

## Testing

Unit tests cover the JS behaviour layer (`interactions.js`) with Vitest + happy-dom:

```bash
npm test          # run once
npm run test:watch
```

Covered: open/close/toggle, `mount()` trigger delegation, `activateTab`, ref-counted
scroll-lock, `toast()` lifecycle, and prefix config.

## Not yet (roadmap)

- Components: `breadcrumbs`, `steps`, `skeleton`, `drawer`, `popover`.
  ✅ Done: `menu`, `stat`, `ring`, `timeline`.
- More prebuilt themes (the token system supports them cheaply).
- Visual-regression tests (Playwright over the docs, per skin × theme) + a11y audit (axe).
- RTL audit · `prefers-color-scheme` auto-theme · per-component CSS imports (tree-shaking).
