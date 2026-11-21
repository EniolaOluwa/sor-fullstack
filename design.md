# Sound of Revival — Design System

Design language for the Baze University Chapel event companion app ("Sound of Revival",
Thanksgiving Service concert). This document is the single source of truth for visual
design. Implementation tokens live in `src/styles/tokens.css` and must mirror this file.
**No raw color, size, or timing values belong anywhere else in the codebase.**

---

## 1. Brand foundation

The identity is derived from the event flyer: a deep navy wordmark, gold script, burgundy
and red accents, over a warm amber/cream glow with piano and harp motifs.

### 1.1 Palette

| Token | Hex | Role |
| --- | --- | --- |
| `--color-navy-900` | `#0B1B45` | Display surface background, deep contrast |
| `--color-navy-800` | `#12275A` | Primary brand navy (wordmark, headings) |
| `--color-navy-700` | `#1B3A7A` | Primary hover, gradient partner |
| `--color-royal-600` | `#2A5BD7` | Links, informational highlights |
| `--color-gold-600` | `#A8861D` | Deep gold (borders, pressed states) |
| `--color-gold-500` | `#C9A227` | Primary accent (script wordmark, current state, focus) |
| `--color-gold-400` | `#E3C558` | Highlight gold, small text on dark |
| `--color-burgundy-700` | `#7B1E3B` | Secondary accent (ceremony, "Thanksgiving" tone) |
| `--color-red-600` | `#C1272D` | Urgent accent (times, dates, alerts) |
| `--color-cream-50` | `#FBF6EA` | Audience page background |
| `--color-cream-100` | `#F7F1E4` | Admin page background, card tint |
| `--color-amber-200` | `#F6D9A0` | Glow / wash on display surface |
| `--color-ink-900` | `#1A1610` | Body text on light surfaces |
| `--color-ink-500` | `#6B6355` | Muted text on light surfaces |

Semantic aliases (used in components, never the raw scale):

| Token | Maps to | Role |
| --- | --- | --- |
| `--color-bg` | cream-50 / navy-900 (per surface) | Page background |
| `--color-surface` | white / navy-800 | Cards, panels |
| `--color-text` | ink-900 / cream-50 | Primary text |
| `--color-text-muted` | ink-500 / gold-400 | Secondary text |
| `--color-accent` | gold-500 | Highlight, current state |
| `--color-primary` | navy-800 | Primary actions |
| `--color-danger` | red-600 | Destructive, live warnings |
| `--color-success` | `#2E7D4F` | Confirmed states |

### 1.2 Contrast rules

- Navy 800 on cream 50, and cream 50 on navy 800: AA+ at all sizes — the default pairing.
- Gold 500 on navy 900: AA for large text only; use gold 400 for small text on dark.
- **Never** place white text on gold — pair gold backgrounds with navy 900 text.
- Burgundy 700 and red 600 are for accents on cream/white; do not stack them.

### 1.3 Gradients & glow

- `--gradient-hero`: radial amber glow fading to cream — audience hero and display idle.
- `--gradient-navy`: navy 800 → navy 700 — primary buttons and admin headers.
- `--glow-gold`: soft gold outer glow — current program item, projected QR frame.

---

## 2. Typography

| Role | Family | Usage |
| --- | --- | --- |
| Display | **Playfair Display** (serif) | Event titles, section headings, projection headlines |
| Script | **Great Vibes** | Event wordmark ("Sound of Revival") only — never UI or body |
| UI / body | **Geist Sans** (already wired via `next/font`) | All interface text, audience reading text |
| Mono | **Geist Mono** | Slugs, QR codes, IDs, admin metadata |

Loaded with `next/font/google` where not already present; script font is preloaded only on
the audience hero and display idle screens.

### 2.1 Type scale (audience & admin)

| Token | Size / line-height | Use |
| --- | --- | --- |
| `--text-xs` | 0.75rem / 1.4 | Metadata, badges |
| `--text-sm` | 0.875rem / 1.5 | Labels, table cells |
| `--text-base` | 1rem / 1.6 | Body |
| `--text-lg` | 1.125rem / 1.6 | Lead paragraphs |
| `--text-xl` | 1.25rem / 1.4 | Card titles |
| `--text-2xl` | 1.5rem / 1.3 | Section headings |
| `--text-3xl` | 1.875rem / 1.2 | Page titles |
| `--text-5xl` | 3rem / 1.1 | Hero titles |

### 2.2 Projection scale (display surface)

Fluid with `clamp()`, tested at 1080p and 4K. Minimums are non-negotiable — the back row
must read every word.

| Token | Value | Use |
| --- | --- | --- |
| `--display-title` | `clamp(3rem, 8vw, 9rem)` | Idle wordmark, section announcements |
| `--display-heading` | `clamp(2rem, 5vw, 5rem)` | Program item titles, song titles |
| `--display-body` | `clamp(1.5rem, 3vw, 3rem)` | Program descriptions |
| `--display-lyric` | `clamp(2rem, 4.5vw, 4.5rem)` | Song lyrics |
| `--display-meta` | `clamp(1.25rem, 2vw, 2rem)` | QR captions, footers |

Letter-spacing: display headings `-0.01em`; small caps labels `0.08em` uppercase.

---

## 3. Tokens

### 3.1 Spacing — 4px base

`--space-1: 4px` · `2: 8` · `3: 12` · `4: 16` · `5: 20` · `6: 24` · `8: 32` · `10: 40`
· `12: 48` · `16: 64` · `20: 80` · `24: 96`

### 3.2 Radii

`--radius-sm: 6px` · `--radius-md: 10px` · `--radius-lg: 16px` · `--radius-xl: 24px`
· `--radius-pill: 999px`

### 3.3 Shadows

- `--shadow-card`: `0 1px 2px rgb(11 27 69 / 0.06), 0 4px 12px rgb(11 27 69 / 0.08)`
- `--shadow-lifted`: `0 8px 30px rgb(11 27 69 / 0.16)`
- `--shadow-glow-gold`: `0 0 0 3px rgb(201 162 39 / 0.35), 0 0 24px rgb(201 162 39 / 0.25)`

### 3.4 Motion

- Durations: `--dur-fast: 150ms` · `--dur-base: 200ms` · `--dur-slow: 300ms`
- Easing: `--ease-standard: cubic-bezier(0.2, 0, 0, 1)`; exit fades use `--ease-exit`.
- Only the display surface animates meaningfully (crossfade between modes).
  All motion respects `prefers-reduced-motion: reduce` by collapsing to opacity-only.

### 3.5 Z-index

`--z-base: 0` · `--z-sticky: 10` · `--z-overlay: 100` · `--z-toast: 1000`

---

## 4. Surfaces

### 4.1 Audience (phones, anonymous)

- Background cream 50, text ink 900; max content width `640px`, centered.
- Hero: flyer-inspired composition — navy wordmark, gold script event name, date/venue meta
  in red 600 / navy 800; `--gradient-hero` wash behind.
- Reading-first: lyrics and program text use `--text-lg`+; tap targets ≥ 44px.
- Quiet chrome: no app bar noise; sticky mini-header only when scrolled (program, lyrics).

### 4.2 Admin (desktop-first, dense)

- Background cream 100; surface white cards on `--shadow-card`.
- Max content width `1200px`; 12-column grid, sidebar nav on ≥ 1024px.
- Utilitarian density: `--text-sm` for tables, `--text-base` for forms.
- Every destructive action requires a confirm step; every mutation shows pending state.
- Live controls (set current item, project post/song) are visually gold-accented and
  always visible from the dashboard.

### 4.3 Display / projection (16:9 fullscreen)

- Navy 900 background with `--gradient-hero` glow and subtle harp/piano motif (optional,
  decorative only, ≥ 8% opacity behind content).
- 5% safe-area padding on all sides; nothing critical within the outer 5%.
- No interactive chrome, no scrollbars; one mode on screen at a time:
  `idle` · `program` · `post` · `song` · `qr`.
- Mode transitions crossfade `--dur-slow`; text never animates word-by-word.
- QR codes on display: minimum 30vh square, gold frame (`--glow-gold`), caption in
  `--display-meta`.

---

## 5. Components

| Component | Spec summary |
| --- | --- |
| `Button` | Variants: primary (navy gradient, cream text), secondary (outline navy), ghost, danger (red). Sizes sm/md/lg. Focus: 2px gold ring, 2px offset. |
| `Card` | White surface, `--radius-lg`, `--shadow-card`, `--space-6` padding. Optional gold top rule for event-branded cards. |
| `Badge` | Pill, uppercase `--text-xs`, letterspaced. Tones: neutral, gold, burgundy, red, success. |
| `ProgramItem` | Three states. **Upcoming**: navy 800 title, muted meta. **Current**: gold left rule 4px, `--glow-gold`, bold title, "Now" badge. **Done**: muted text, check icon, 70% opacity. State is conveyed by icon + label, never color alone. |
| `SongCard` | Title, key/author meta, small QR thumbnail, "Sing along" affordance. |
| `LyricBlock` | Verse/chorus/bridge sections. Chorus indented with gold left rule and label. Line spacing 1.8 on audience, 1.6 on display. |
| `PostCard` | Media frame at 4:5 (gallery) or 16:9 (projection), object-fit cover, caption below, event wordmark footer. One component serves both surfaces via `variant` prop. |
| `QrCard` | White card, QR at ≥ 256px, song title, "Scan to sing along". Print variant: pure black on white, no shadows. |
| `Field` | Label above, input `--radius-md`, navy 800 focus ring. Error text red 600 with icon. |
| `EmptyState` | Centered, display-serif headline, muted body, single action. Used by all list pages. |
| `Table` | Admin only. Sticky header, zebra tint cream 100, row actions right-aligned. |

---

## 6. Accessibility

- WCAG AA minimum everywhere; AAA for lyric text on the display surface.
- Focus-visible: 2px gold 500 ring with 2px offset on light; gold 400 on dark.
- State never relies on color alone (program items, form errors, live indicators).
- `prefers-reduced-motion` collapses all transitions to simple opacity.
- Display surface uses no text below `--display-meta`; audience body text ≥ 16px.

---

## 7. Implementation notes

- Tokens live in `src/styles/tokens.css`, imported by `globals.css`; consumed as CSS
  custom properties inside CSS Modules (`*.module.css`, colocated with components).
- Component variants are implemented once (prop-driven), reused across all three
  surfaces — audience, admin, and display — per the DRY architecture in `AGENTS.md`.
- The flyer image itself (`public/`) is the only raster brand asset; all other branding
  is type, tokens, and CSS gradients.
- Print styles (QR sheet, program) are part of the design: no shadows, black on white,
  page-break rules between QR cards.
