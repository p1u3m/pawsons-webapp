# Pawsons

A mobile-first character webapp built with Next.js App Router, TypeScript, and GSAP. Uses the supplied artwork and local LINE Seed Sans EN / TH fonts.

## Run locally

```sh
npm install
npm run dev
```

Open http://localhost:3000.

```sh
npm run build
npm run start
npm run typecheck
npx playwright test
```

The browser tests require Microsoft Edge and a running production server on port 3000. They exercise navigation, filtering, quiz answers and back navigation, result generation, PNG download, invalid routes, and responsive layouts.

## Pages

- `/`: Entry with links to all six areas.
- `/quiz`: 12 example questions, three per personality dimension; majority scoring. Answers stay in memory and reset on refresh.
- `/results/[type]`: Result with character, house, and share links.
- `/share/[type]`: 1080 × 1920 PNG Story Card export. Uses the device share sheet when file sharing is available, otherwise downloads the image. Users upload the image to Instagram themselves.
- `/characters`: Search and house filters for the 16 supplied characters.
- `/characters/[type]`: Character details and links to quiz, house, shop, and content.
- `/houses` and `/houses/[house]`: Four houses and their members.
- `/contents` and `/contents/[id]`: 16 example situations; optional `?character=INFP` maintains character context.
- `/shop`: Preview merchandise; optional character filter. No checkout or orders.
- `/letters`: Coming-soon page.

## Content and design

`src/lib/data.ts` contains the character names, example descriptions, provisional house assignments, questions, and situation titles. Names and personality types follow the asset filenames. The house assignments follow the artwork colors and groups; confirm them before final content is published.

`src/app/globals.css` uses the paper background, ink, four house palettes, borders, and radius scale from `DESIGN-pawsons.md`. The requested LINE Seed fonts override Camera Plain in that reference. The design remains light to preserve the specified paper foundation. Supplied illustrations are used in place of generated imagery. GSAP respects reduced-motion settings and cleans up on navigation.

Quiz results are playful sample content, not a validated personality assessment. Character biographies, situation stories, and products are placeholders. Dukdik, Franchise Rosters, Pair Conflicts, Personal Letters, and Stickers/GIFs are reserved for later. There is no backend, payment integration, email sending, analytics, or personal-data storage.

Technical references: [Next.js installation](https://nextjs.org/docs/app/getting-started/installation), [GSAP matchMedia](https://gsap.com/docs/v3/GSAP/gsap.matchMedia/).
