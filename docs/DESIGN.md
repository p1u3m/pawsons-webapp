# Pawsons design system

A warm paper look: cream cards standing on solid "ledges", soft house colours,
doodle patterns, and almost no motion. Tokens live in `src/app/globals.css`
(`@theme` and `:root`); this file says how to use them. Where the two
disagree, `globals.css` wins.

## Principles

- **Paper, not glass.** Flat colour, solid ledge shadows, no blur or gradients
  on surfaces. Depth comes from the ledge under a card or button.
- **One of each.** One content width, one button behaviour, one transition
  speed, one pattern strength, one radius scale. Reuse before inventing.
- **Quiet.** The site is nearly static. See Motion.
- **Thai copy, English names.** Visible copy is Thai; character, house and
  product names stay English (`lang="en"`).

## Layout

- `wrap` (utility in `globals.css`) is the page column: `min(1040px, 100% - 40px)`,
  `100% - 20px` at ≤360px. The navbar matches it. Narrower pages cap it with
  `max-w-*` (results 720px, room 600px). Do not set page widths any other way.
- Breakpoints: `md` 768px is the main split. Extras: `xs` 480px (`max-xs`),
  `split` 861px (two-column heroes), `tiny` ≤360px. Any other breakpoint is
  written in rem (`max-[62.5rem]`).

## Colour

| Role | Tokens |
| --- | --- |
| Surface | `bg-paper` (page), `bg-cream` (cards), `bg-paper-soft` |
| Text | `text-ink`, `text-ink-soft`, `text-ink-muted`, `text-ink-faint` |
| Lines | `border-line`, `border-line-strong` |
| Brand | `bg-sun` + `text-gold-ink`, `text-green`, `bg-navy` |
| Houses | tints `bg-clover`, `bg-lavender`, `bg-forget`, `bg-dandelion`; per-house `--house`, `--house-ink`, `--band` set by `houseVars()` |

## Shape

Radius scale (`rounded-*`): `tile` 14px for pictures and inner tiles,
`card-sm` 22px for regular cards, `card` 28px for large cards, `panel` 36px
for big panels. Pills and circles use `rounded-full`. New values are arbitrary
only for deliberate shapes (the cream arch is `rounded-[48%_48%_16px_16px]`).

## Ledges and shadows

Cream cards and buttons stand on a solid band: `shadow-ledge` (4px + 8px) and
`shadow-ledge-sm` (3px + 5px), built from `--color-ledge` and `--color-ledge-2`.
Variants for coloured buttons: `--color-ledge-sun`, `-warm`, `-navy`, `-ink`,
`-lilac`. Soft elevation: `shadow-soft`, `shadow-card`, `shadow-float`.

## Buttons

- Every button-like control uses the `press` utility: the ledge rises 2px on
  hover and keyboard focus, sinks when pressed. Tune it with `--depth`,
  `--ledge` and `--ledge-2`; never write the hover/active shadow by hand.
- Components: `pillButton({ variant })` (`primary`, `secondary`, `gradient`,
  `ledge`, `sign`), `signButton` (yellow), `roundButton`, `ChipLink`, and the
  shop's `shopButton` / `shopPillButton`.
- The wave-art `sign` pill has no box-shadow to grow, so it just lifts.

## Patterns and bands

`band`, `band-wave-top`, `band-pattern` paint a wavy house-coloured band with a
doodle tile from `public/patterns/`. Tile strength is the single
`--pattern-opacity` in `:root` (0.6); do not override it per page.

## Typography

Fredoka (headings and body, via `next/font`), Itim and LINE Seed (Thai).
Write sizes as `text-[14px]`; named sizes also set line-height and the site
relies on the inherited one. Headings use tight tracking (`-0.02em`).

## Motion

Simple and clean. Short (160ms), ease-out state changes only: colour, shadow
and a small lift on hover, focus and press. `--default-transition-duration`
and `--default-transition-timing-function` in `@theme` are the only timing;
base rules in `globals.css` apply them to links, buttons and form fields.
No bounces, springs, parallax, loops, scroll reveals or smooth scrolling.
Under `prefers-reduced-motion` every transition is instant.

The one choreographed animation is the homepage character swap
(`hero-chibis.tsx`, GSAP). It selects `data-chibi`, preloads the next set,
cleans up on unmount and drops the movement (keeps the fade) under reduced
motion.

## Admin

`/admin` uses the neutral shadcn theme (`.admin-theme`), not this system.
