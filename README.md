# Pawsons

A mobile-first character webapp: personality quiz, 16 characters in four houses, editorial contents, and a merch shop with Stripe checkout. Admins manage contents and the shop catalog.

**Stack:** Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · shadcn/ui on Base UI · Phosphor icons · GSAP · Supabase (auth, database, storage) · Stripe Checkout · Playwright.

## Run locally

```sh
npm install
cp .env.local.example .env.local   # then fill in the values
npm run dev
```

Open http://localhost:3000. The site still renders without Supabase configured; auth, contents, and the shop need it.

| Script | Purpose |
| --- | --- |
| `npm run build` / `npm run start` | Production build and server |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Playwright tests (Microsoft Edge, server running on port 3000) |
| `npm run audit` | Lighthouse audit of `/` into `test-results/lighthouse.json` |
| `npm run format` | Prettier |

## Routes

- `/` home · `/quiz` → `/results/[type]` → `/share/[type]` (1080×1920 story card PNG)
- `/characters`, `/characters/[type]` · `/houses`, `/houses/[house]`
- `/contents`, `/contents/[id]` — articles stored in Supabase
- `/shop`, `/shop/[slug]`, `/shop/order-result` — catalog, cart drawer, Stripe checkout
- `/shop/orders`, `/shop/orders/[id]` — signed-in customer order history, shipping status and tracking number
- `/room`, `/letters` — signed-in profile room and coming-soon letters (Letters is listed in the account menus for signed-in users only)
- `/admin`, `/admin/contents`, `/admin/shop`, `/admin/members` (member list and roles), `/admin/discounts` (shop discount codes) — admin only (`profiles.role = 'admin'`, enforced in `src/proxy.ts`)
- `/api/stripe/shop-checkout`, `/api/stripe/shop-webhook`, `/api/stripe/shop-order-status`, `/auth/callback`

## Layout

```
src/app/            routes, styled with Tailwind utilities; globals.css holds the design tokens
src/components/     feature components; ui/ holds shadcn primitives
src/lib/data.ts     static characters, houses, quiz questions and scoring
src/lib/supabase/   browser/server clients, content/profile queries, adminRpc (service-role admin member functions)
src/lib/shop/       catalog, prices, orders (status, carriers, tracking), order confirmation (service-role client)
src/lib/stripe/     Stripe client guarded by STRIPE_MODE
supabase/migrations SQL migrations
tests/              Playwright specs
```

Quiz results are playful content, not a validated personality assessment.
