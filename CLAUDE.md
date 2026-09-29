@AGENTS.md

# Pawsons — project conventions

See README.md for the stack, routes, and folder layout. Rules below are what keeps the codebase consistent.

## Next.js 16

- Read `node_modules/next/dist/docs/` before using an API you are unsure of; this version differs from older training data.
- `params` / `searchParams` are Promises: `await` them.
- Mutations are Server Actions (`"use server"`: `admin/shop/actions.ts`, `lib/supabase/contents.ts`, `lib/supabase/profile.ts`) that check `isAdmin()` / the user first and finish with `revalidatePath`.

## Styling

Design mood and principles: `docs/DESIGN.md` (historical; tokens in `globals.css` win).

- Tailwind v4 is loaded **without Preflight**. Base styles, tokens (`--paper`, `--ink`, house palettes) and most components are plain CSS classes in `src/app/globals.css`.
- Route-specific styles go in a CSS file beside the route (`shop/shop.css`, `admin/admin.css`, `admin/shop/admin-shop.css`), prefixed by area (`store-*`, `admin-*`, `ashop-*`).
- Use Tailwind utilities for one-off layout tweaks; reuse an existing class before creating a new one. Delete CSS when you delete the markup that used it.
- shadcn primitives live in `src/components/ui/` (style `base-nova`, built on `@base-ui/react`). Add new ones with the shadcn CLI. `cn` comes from the `cn` package via `@/lib/utils`.
- Icons: use `@phosphor-icons/react` for new code. Some older UI (auth menu, account sheet, shop search/filter/no-image) still uses the Material Symbols Rounded font (`<span className="material-symbols-rounded">name</span>`, loaded in `layout.tsx`); migrate those to Phosphor when touched, then drop the font link.
- Fonts: LINE Seed EN/TH are local (`public/fonts`); Varela Round and Itim come from Google Fonts via `layout.tsx`.
- Animation: GSAP, respecting `prefers-reduced-motion` and cleaning up on unmount.

## Components

- `src/components/character-ui.tsx` — shared character/page pieces (`CharacterCard`, `CharacterImage`, `PageIntro`, `BackLink`). Not to be confused with `src/components/ui/` (shadcn).
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
