@AGENTS.md

# Pawsons — project conventions

See README.md for the stack, routes, and folder layout. Rules below are what keeps the codebase consistent.

## Next.js 16

- Read `node_modules/next/dist/docs/` before using an API you are unsure of; this version differs from older training data.
- `params` / `searchParams` are Promises: `await` them.
- Mutations are Server Actions (`"use server"`: `admin/shop/actions.ts`, `lib/supabase/contents.ts`, `lib/supabase/profile.ts`) that check `isAdmin()` / the user first and finish with `revalidatePath`.

## Styling

The design system is written up in `DESIGN.md` (tokens in `globals.css` win). Keep it current when you add a token or pattern.

- **Tailwind v4 (with Preflight) is the only styling system.** Style in JSX with utilities. `src/app/globals.css` is the one CSS file and holds only: design tokens (`@theme`), base element styles (`@layer base`), the admin theme swap, and a few `@utility` effects utilities can't express (`wrap`, `band*`, `doodle-bg`, `focus-ink`). Do not add route CSS files or class-name CSS.
- Tokens: `bg-paper`, `bg-cream`, `bg-paper-soft`, `text-ink`, `text-ink-soft`, `text-ink-muted`, `text-ink-faint`, `border-line`, `border-line-strong`, `bg-sun` / `text-sun-ink`, `text-gold-ink`, `bg-navy`, `text-green`, house tints `bg-clover|lavender|forget|dandelion`, `shadow-soft|card|float|ledge|ledge-sm`, radii `rounded-tile|card-sm|card|panel` (14/22/28/36px; pills and circles are `rounded-full`), ledge colours `--color-ledge*`. Use the tokens; arbitrary values are for deliberate one-off shapes.
- Font sizes: use the type scale tokens `text-micro|caption|small|body-sm|body|body-lg|lead|title-sm|title|heading-sm|heading|heading-lg` (11/12/13/14/15/16/18/20/24/28/32/36px). They set no line-height, so the page's inherited one stays; do not use `text-sm` and friends. Fluid headlines keep `clamp()`. A new size token must also be added to the `font-size` group in `src/lib/utils.ts`, or `cn()` will treat it as a colour.
- Breakpoints: `md` (768px) is the main split; extra ones are `xs` (480px, use `max-xs`), `split` (861px, two-column heroes) and `tiny` (≤360px). Write any other breakpoint in rem (`max-[67.5rem]`), because px values sort before the theme's and lose to `max-md`.
- Reuse before writing: `pill-button.tsx` (`pillButton()`, `IconDisc`, `Eyebrow`, `textLink`), `paper-ui.tsx` (`signButton`, `roundButton`, `FriendLink`, `Dot`, page hero), `character-ui.tsx` (`HouseBand`, `houseVars`, `CharacterTile`, `ChipLink`, `DoodleLabel`, `HeroFriends`, `PageIntro`, `BackLink`, `EmptyState`), `profile-ui.ts` (character/house profile pages), `post-card.tsx`, `shop/shop-ui.tsx`. Page width is the `wrap` utility only; a page that starts with a back button uses `page-top` and `BackButton` from `paper-ui.tsx` (icon only, same spot everywhere). Repeated class strings become a component or a constant beside it; `cn()` (tailwind-merge) resolves overrides.
- Class-string constants that server components import must not live in a `"use client"` file (they arrive as client references, not strings).
- shadcn primitives live in `src/components/ui/` (style `base-nova`, built on `@base-ui/react`). Add new ones with the shadcn CLI. `cn` comes from the `cn` package via `@/lib/utils`. `/admin` gets the neutral shadcn theme through `.admin-theme` (tokens in `globals.css`).
- Icons: `@phosphor-icons/react` only.
- Fonts: LINE Seed EN/TH are local (`public/fonts`); Fredoka comes from `next/font` and Itim from Google Fonts via `layout.tsx`.
- Motion: simple and clean. Short (about 150–200ms), ease-out state changes only: colour, shadow and a small lift on hover/focus/press, nothing decorative. No bounces, springs, parallax, infinite loops or scroll reveals. Buttons share the `press` utility in `globals.css` (ledge rises on hover/focus, sinks when pressed); new interactive elements reuse it rather than inventing their own. The one choreographed animation is the homepage character swap (`hero-chibis.tsx`, GSAP: select `data-chibi`, clean up on unmount). Always respect `prefers-reduced-motion` (no movement, fades only).

## Components

- `src/components/character-ui.tsx` — shared character/page pieces (see Styling). Not to be confused with `src/components/ui/` (shadcn).
- Feature folders: `navigation/`, `shop/`. Admin-only components are prefixed `admin-`.
- Copy shown to users is Thai.

## Data and services

- Static content (characters, houses, quiz questions, scoring): `src/lib/data.ts`.
- Supabase: `@/lib/supabase/client` in client components, `@/lib/supabase/server` in server code (both return `null` when env is missing — handle it). The service-role client `@/lib/shop/server-client` is server-only and used just for shop orders/stock.
- Schema changes go through a new file in `supabase/migrations/`; never edit an applied migration. `profiles` and `contents` (plus the `handle_new_user` / `protect_profile_role` triggers and their RLS) predate migrations and are defined in `supabase/setup-profiles-contents.sql` — read it before touching those tables.
- Stripe: always go through `getStripeClient()`, which refuses keys that do not match `STRIPE_MODE`. Prices are read server-side from the catalog, never trusted from the client.
- `/admin/*` is guarded in `src/proxy.ts` by `profiles.role = 'admin'`; admin pages and actions re-check with `isAdmin()`.

## Checks before finishing

```sh
npm run typecheck
npm run build
npm test        # needs a running server on :3000 and Microsoft Edge
```
